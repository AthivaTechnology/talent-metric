import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Appraisal, Response as ResponseModel, Rating, Comment, User, Question, PeerFeedback } from '../models';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APPRAISAL_STATUS,
  USER_ROLES,
  WORKFLOW_TRANSITIONS
} from '../config/constants';
import { Op } from 'sequelize';
import {
  notifyTechLeadOnSubmit,
  notifyManagerOnTechLeadReview,
  notifyDeveloperOnComplete,
  notifyDeveloperOnReturn,
  notifyOnComment
} from '../services/emailService';

/**
 * @desc    Get all appraisals (filtered by role)
 * @route   GET /api/appraisals
 * @access  Private
 */
export const getAllAppraisals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { status, year, page = 1, limit = 10 } = req.query;
    const whereClause: any = {};

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    // Filter by year if provided
    if (year) {
      whereClause.year = parseInt(year as string);
    }

    // Role-based filtering
    if (req.user.role === USER_ROLES.DEVELOPER || req.user.role === USER_ROLES.TESTER) {
      // Developers and testers can only see their own appraisals
      whereClause.userId = req.user.id;
    } else if (req.user.role === USER_ROLES.TECH_LEAD) {
      // Tech leads can see their own appraisal + their team members' appraisals
      const teamMembers = await User.findAll({
        where: { techLeadId: req.user.id },
        attributes: ['id']
      });
      const teamMemberIds = teamMembers.map(member => member.id);
      whereClause.userId = { [Op.in]: [req.user.id, ...teamMemberIds] };
    } else if (req.user.role === USER_ROLES.MANAGER) {
      // Managers can see their own appraisal + their reportees' appraisals
      const reportees = await User.findAll({
        where: { managerId: req.user.id },
        attributes: ['id']
      });
      const reporteeIds = reportees.map(reportee => reportee.id);
      whereClause.userId = { [Op.in]: [req.user.id, ...reporteeIds] };
    }
    // Admins can see all appraisals (no additional filtering)

    const offset = (Number(page) - 1) * Number(limit);

    const { rows: appraisals, count: total } = await Appraisal.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      limit: Number(limit),
      offset,
      order: [['updatedAt', 'DESC']]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: appraisals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all appraisals error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching appraisals'
    });
  }
};

/**
 * @desc    Get single appraisal by ID
 * @route   GET /api/appraisals/:id
 * @access  Private
 */
export const getAppraisalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { id } = req.params;

    const appraisal = await Appraisal.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'techLeadId', 'managerId'],
          include: [
            {
              model: User,
              as: 'techLead',
              attributes: ['id', 'name', 'email']
            },
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: ResponseModel,
          as: 'responses',
          include: [
            {
              model: Question,
              as: 'question',
              attributes: ['id', 'section', 'sectionTitle', 'questionText', 'order']
            }
          ]
        },
        {
          model: Rating,
          as: 'ratings'
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'role']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND
      });
      return;
    }

    // Check access permissions
    const canAccess = await checkAppraisalAccess(req.user, appraisal);
    if (!canAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to access this appraisal'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: appraisal
    });
  } catch (error) {
    console.error('Get appraisal by ID error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching appraisal'
    });
  }
};

/**
 * @desc    Create new appraisal
 * @route   POST /api/appraisals
 * @access  Private
 */
export const createAppraisal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { userId, year, deadline } = req.body;

    // Validate required fields
    if (!userId || !year) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'User ID and year are required'
      });
      return;
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_YEAR
      });
      return;
    }

    // Check if appraisal already exists for this user and year
    const existingAppraisal = await Appraisal.findOne({
      where: { userId, year }
    });

    if (existingAppraisal) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.APPRAISAL_ALREADY_EXISTS
      });
      return;
    }

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
      return;
    }

    // Create appraisal
    const appraisal = await Appraisal.create({
      userId,
      year,
      status: APPRAISAL_STATUS.DRAFT,
      deadline: deadline || null
    });

    // Initialize empty responses for questions applicable to this user's role
    const questions = await Question.findAll({
      where: { applicableRole: user.role }
    });
    const responses = questions.map(question => ({
      appraisalId: appraisal.id,
      questionId: question.id,
      answer: ''
    }));
    await ResponseModel.bulkCreate(responses);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.APPRAISAL_CREATED,
      data: appraisal
    });
  } catch (error) {
    console.error('Create appraisal error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error creating appraisal'
    });
  }
};

/**
 * @desc    Update appraisal (auto-save)
 * @route   PUT /api/appraisals/:id
 * @access  Private
 */
export const updateAppraisal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { id } = req.params;
    const { responses, ratings, deadline } = req.body;

    const appraisal = await Appraisal.findByPk(id);

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND
      });
      return;
    }

    // Check if user can edit this appraisal
    if (appraisal.userId !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You can only edit your own appraisals'
      });
      return;
    }

    // Check if appraisal can be edited (only in DRAFT status)
    if (appraisal.status !== APPRAISAL_STATUS.DRAFT) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.CANNOT_EDIT_SUBMITTED
      });
      return;
    }

    // Update responses if provided
    if (responses && Array.isArray(responses)) {
      for (const response of responses) {
        await ResponseModel.upsert({
          appraisalId: appraisal.id,
          questionId: response.questionId,
          answer: response.answer || ''
        });
      }
    }

    // Update ratings if provided
    if (ratings && Array.isArray(ratings)) {
      for (const rating of ratings) {
        // Validate rating value
        if (rating.rating < 1 || rating.rating > 5) {
          res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_RATING
          });
          return;
        }

        await Rating.upsert({
          appraisalId: appraisal.id,
          category: rating.category,
          rating: rating.rating,
          raterRole: 'self'
        });
      }
    }

    // Update deadline if provided (admin only)
    if (deadline && req.user.role === USER_ROLES.ADMIN) {
      appraisal.deadline = new Date(deadline);
      await appraisal.save();
    }

    // Get updated appraisal with all relations
    const updatedAppraisal = await Appraisal.findByPk(id, {
      include: [
        {
          model: ResponseModel,
          as: 'responses',
          include: [
            {
              model: Question,
              as: 'question'
            }
          ]
        },
        {
          model: Rating,
          as: 'ratings'
        }
      ]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.APPRAISAL_UPDATED,
      data: updatedAppraisal
    });
  } catch (error) {
    console.error('Update appraisal error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error updating appraisal'
    });
  }
};

/**
 * @desc    Submit appraisal to next stage
 * @route   POST /api/appraisals/:id/submit
 * @access  Private
 */
export const submitAppraisal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { id } = req.params;

    const appraisal = await Appraisal.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: ResponseModel,
          as: 'responses'
        },
        {
          model: Rating,
          as: 'ratings'
        }
      ]
    });

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND
      });
      return;
    }

    // Validate workflow transition
    const currentStatus = appraisal.status;
    let nextStatus = WORKFLOW_TRANSITIONS[currentStatus];

    if (!nextStatus) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Appraisal is already completed'
      });
      return;
    }

    // Fetch the appraisee to check their role for skip logic
    const appraiseeUser = await User.findByPk(appraisal.userId);

    // Tech leads and managers skip the tech_lead_review stage for their own appraisals
    const skipTechLeadReview =
      currentStatus === APPRAISAL_STATUS.SUBMITTED &&
      appraiseeUser &&
      (appraiseeUser.role === USER_ROLES.TECH_LEAD || appraiseeUser.role === USER_ROLES.MANAGER);
    if (skipTechLeadReview) {
      nextStatus = APPRAISAL_STATUS.MANAGER_REVIEW;
    }

    // Check permissions based on current status
    if (currentStatus === APPRAISAL_STATUS.DRAFT) {
      // Only the appraisee can submit their own appraisal
      if (appraisal.userId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'You can only submit your own appraisal'
        });
        return;
      }

      // Validate all responses are filled
      const emptyResponses = (appraisal as any).responses?.filter((r: any) => !r.answer || r.answer.trim().length === 0);
      if (emptyResponses && emptyResponses.length > 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Please answer all questions before submitting'
        });
        return;
      }

      // Validate all role-specific ratings are provided (each role has 5 categories)
      if (!(appraisal as any).ratings || (appraisal as any).ratings.length < 5) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Please provide all self-ratings before submitting'
        });
        return;
      }

      appraisal.submittedAt = new Date();
    } else if (skipTechLeadReview) {
      // Tech lead or manager advancing their own submitted appraisal directly to manager review
      if (appraisal.userId !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'Only the appraisee or an admin can advance this appraisal'
        });
        return;
      }
      appraisal.techLeadReviewedAt = new Date();
    } else if (currentStatus === APPRAISAL_STATUS.SUBMITTED || currentStatus === APPRAISAL_STATUS.TECH_LEAD_REVIEW) {
      // Tech lead reviewing a team member's appraisal
      const user = appraiseeUser;
      if (!user || user.techLeadId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'You can only review appraisals of your team members'
        });
        return;
      }

      appraisal.techLeadReviewedAt = new Date();
    } else if (currentStatus === APPRAISAL_STATUS.MANAGER_REVIEW) {
      // Manager finalizing
      const user = await User.findByPk(appraisal.userId);
      if (!user || user.managerId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'You can only finalize appraisals of your reportees'
        });
        return;
      }

      if (!appraisal.consolidatedRating) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'A consolidated rating is required before marking this appraisal as completed'
        });
        return;
      }

      appraisal.managerReviewedAt = new Date();
      appraisal.completedAt = new Date();
    }

    // Update status
    appraisal.status = nextStatus;
    await appraisal.save();

    // Send email notifications (fire-and-forget)
    const appraisalUser = (appraisal as any).user as User | null;
    if (currentStatus === APPRAISAL_STATUS.DRAFT && appraisalUser?.techLeadId) {
      const techLead = await User.findByPk(appraisalUser.techLeadId, { attributes: ['name', 'email'] });
      if (techLead) {
        notifyTechLeadOnSubmit({
          techLeadEmail: techLead.email,
          techLeadName: techLead.name,
          developerName: appraisalUser.name,
          appraisalId: appraisal.id,
          year: appraisal.year
        });
      }
    } else if (
      (currentStatus === APPRAISAL_STATUS.SUBMITTED || currentStatus === APPRAISAL_STATUS.TECH_LEAD_REVIEW) &&
      appraisalUser?.managerId
    ) {
      const manager = await User.findByPk(appraisalUser.managerId, { attributes: ['name', 'email'] });
      const reviewer = await User.findByPk(req.user!.id, { attributes: ['name'] });
      if (manager) {
        notifyManagerOnTechLeadReview({
          managerEmail: manager.email,
          managerName: manager.name,
          developerName: appraisalUser.name,
          techLeadName: reviewer?.name ?? 'Tech Lead',
          appraisalId: appraisal.id,
          year: appraisal.year
        });
      }
    } else if (currentStatus === APPRAISAL_STATUS.MANAGER_REVIEW && appraisalUser) {
      const manager = await User.findByPk(req.user!.id, { attributes: ['name'] });
      notifyDeveloperOnComplete({
        developerEmail: appraisalUser.email,
        developerName: appraisalUser.name,
        managerName: manager?.name ?? 'Manager',
        appraisalId: appraisal.id,
        year: appraisal.year
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.APPRAISAL_SUBMITTED,
      data: appraisal
    });
  } catch (error) {
    console.error('Submit appraisal error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error submitting appraisal'
    });
  }
};

/**
 * @desc    Save reviewer ratings (tech lead or manager)
 * @route   PUT /api/appraisals/:id/reviewer-ratings
 * @access  Private (Tech Lead, Manager)
 */
export const saveReviewerRatings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const { id } = req.params;
    const { ratings } = req.body;

    if (!ratings || !Array.isArray(ratings) || ratings.length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Ratings are required' });
      return;
    }

    const appraisal = await Appraisal.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND });
      return;
    }

    const appraisalUser = (appraisal as any).user as User | null;

    // Determine raterRole and verify permissions
    let raterRole: 'tech_lead' | 'manager';

    if (req.user.role === USER_ROLES.TECH_LEAD) {
      if (appraisal.status !== APPRAISAL_STATUS.SUBMITTED && appraisal.status !== APPRAISAL_STATUS.TECH_LEAD_REVIEW) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Tech lead can only rate during submitted or tech lead review stage' });
        return;
      }
      if (!appraisalUser || appraisalUser.techLeadId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You can only rate your own team members' });
        return;
      }
      raterRole = 'tech_lead';
    } else if (req.user.role === USER_ROLES.MANAGER) {
      if (appraisal.status !== APPRAISAL_STATUS.MANAGER_REVIEW) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Manager can only rate during manager review stage' });
        return;
      }
      if (!appraisalUser || appraisalUser.managerId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You can only rate your own reportees' });
        return;
      }
      raterRole = 'manager';
    } else {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only tech leads and managers can submit reviewer ratings' });
      return;
    }

    for (const rating of ratings) {
      if (rating.rating < 1 || rating.rating > 5) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: ERROR_MESSAGES.INVALID_RATING });
        return;
      }
      await Rating.upsert({
        appraisalId: appraisal.id,
        category: rating.category,
        rating: rating.rating,
        raterRole
      });
    }

    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Reviewer ratings saved successfully' });
  } catch (error) {
    console.error('Save reviewer ratings error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error saving reviewer ratings' });
  }
};

/**
 * @desc    Add comment to appraisal
 * @route   POST /api/appraisals/:id/comments
 * @access  Private (Tech Lead, Manager, Admin)
 */
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { id } = req.params;
    const { comment, questionId } = req.body;

    if (!comment || comment.trim().length < 10) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Comment must be at least 10 characters'
      });
      return;
    }

    const appraisal = await Appraisal.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND
      });
      return;
    }

    // Per-question comment path: any authenticated user can comment on a specific question
    if (questionId) {
      const parsedQuestionId = parseInt(questionId, 10);
      if (isNaN(parsedQuestionId) || parsedQuestionId <= 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid questionId'
        });
        return;
      }

      const newComment = await Comment.create({
        appraisalId: appraisal.id,
        userId: req.user.id,
        questionId: parsedQuestionId,
        comment: comment.trim(),
        stage: 'question_comment'
      });

      const commentWithUser = await Comment.findByPk(newComment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.COMMENT_ADDED,
        data: commentWithUser
      });
      return;
    }

    // Appraisal-level comment path: existing role-based logic
    // Determine stage based on user role and appraisal status
    let stage = '';
    const user = (appraisal as any).user;

    if (req.user.role === USER_ROLES.TECH_LEAD && user && user.techLeadId === req.user.id) {
      stage = 'tech_lead_review';
    } else if (req.user.role === USER_ROLES.MANAGER && user && user.managerId === req.user.id) {
      stage = 'manager_review';
    } else if (req.user.role === USER_ROLES.ADMIN) {
      stage = appraisal.status === APPRAISAL_STATUS.MANAGER_REVIEW ? 'manager_review' : 'tech_lead_review';
    } else if (
      // Tech leads reviewing their own appraisal as if at manager_review stage
      req.user.role === USER_ROLES.TECH_LEAD && appraisal.userId === req.user.id
    ) {
      stage = 'tech_lead_review';
    } else if (
      req.user.role === USER_ROLES.MANAGER && appraisal.userId === req.user.id
    ) {
      stage = 'manager_review';
    } else if (appraisal.userId === req.user.id) {
      // Developer/Tester/DevOps replying on their own appraisal (only during active review)
      if (appraisal.status === APPRAISAL_STATUS.DRAFT || appraisal.status === APPRAISAL_STATUS.COMPLETED) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: 'You can only reply when your appraisal is under review'
        });
        return;
      }
      stage = 'developer_reply';
    } else {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to comment on this appraisal'
      });
      return;
    }

    const newComment = await Comment.create({
      appraisalId: appraisal.id,
      userId: req.user.id,
      comment: comment.trim(),
      stage
    });

    // Get comment with user details
    const commentWithUser = await Comment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    // Notify the relevant party about the new comment
    const commenter = await User.findByPk(req.user.id, { attributes: ['name'] });
    if (stage === 'developer_reply') {
      // Developer replied — notify their tech lead or manager depending on current status
      const reviewerIds: number[] = [];
      if (user?.techLeadId) reviewerIds.push(user.techLeadId);
      if (user?.managerId && appraisal.status === APPRAISAL_STATUS.MANAGER_REVIEW) reviewerIds.push(user.managerId);
      for (const reviewerId of reviewerIds) {
        const reviewer = await User.findByPk(reviewerId, { attributes: ['name', 'email'] });
        if (reviewer) {
          notifyOnComment({
            recipientEmail: reviewer.email,
            recipientName: reviewer.name,
            commenterName: commenter?.name ?? 'Employee',
            appraisalId: appraisal.id,
            year: appraisal.year,
            stage
          });
        }
      }
    } else {
      // Reviewer commented — notify the appraisee
      const appraisee = await User.findByPk(appraisal.userId, { attributes: ['name', 'email'] });
      if (appraisee) {
        notifyOnComment({
          recipientEmail: appraisee.email,
          recipientName: appraisee.name,
          commenterName: commenter?.name ?? 'Reviewer',
          appraisalId: appraisal.id,
          year: appraisal.year,
          stage
        });
      }
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.COMMENT_ADDED,
      data: commentWithUser
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};

/**
 * @desc    Get comments for an appraisal
 * @route   GET /api/appraisals/:id/comments
 * @access  Private
 */
export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { id } = req.params;

    const appraisal = await Appraisal.findByPk(id);

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND
      });
      return;
    }

    // Check access permissions
    const canAccess = await checkAppraisalAccess(req.user, appraisal);
    if (!canAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to view comments'
      });
      return;
    }

    const comments = await Comment.findAll({
      where: { appraisalId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
};

/**
 * @desc    Delete appraisal
 * @route   DELETE /api/appraisals/:id
 * @access  Private/Admin
 */
export const deleteAppraisal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appraisal = await Appraisal.findByPk(id);

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND
      });
      return;
    }

    await appraisal.destroy();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Appraisal deleted successfully'
    });
  } catch (error) {
    console.error('Delete appraisal error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error deleting appraisal'
    });
  }
};

// Helper function to check appraisal access
const checkAppraisalAccess = async (
  user: { id: number; role: string },
  appraisal: Appraisal
): Promise<boolean> => {
  // Admin can access all
  if (user.role === USER_ROLES.ADMIN) {
    return true;
  }

  // User can access their own
  if (appraisal.userId === user.id) {
    return true;
  }

  // Get appraisal user
  const appraisalUser = await User.findByPk(appraisal.userId);
  if (!appraisalUser) {
    return false;
  }

  // Tech lead can access their team members
  if (user.role === USER_ROLES.TECH_LEAD && appraisalUser.techLeadId === user.id) {
    return true;
  }

  // Manager can access their reportees
  if (user.role === USER_ROLES.MANAGER && appraisalUser.managerId === user.id) {
    return true;
  }

  return false;
};

/**
 * @desc    Save manager's final feedback on an appraisal
 * @route   PUT /api/appraisals/:id/manager-feedback
 * @access  Private (Manager, Admin)
 */
export const saveManagerFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const { id } = req.params;
    const { feedback, consolidatedRating } = req.body;

    const appraisal = await Appraisal.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND });
      return;
    }

    const appraisalUser = (appraisal as any).user as User | null;

    if (req.user.role === USER_ROLES.MANAGER) {
      if (appraisal.status !== APPRAISAL_STATUS.MANAGER_REVIEW && appraisal.status !== APPRAISAL_STATUS.COMPLETED) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Feedback can only be added during manager review stage' });
        return;
      }
      if (!appraisalUser || appraisalUser.managerId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You can only provide feedback for your own reportees' });
        return;
      }
    } else {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only managers can provide final feedback' });
      return;
    }

    appraisal.managerFeedback = feedback?.trim() || null;

    if (consolidatedRating !== undefined) {
      if (consolidatedRating !== null && (consolidatedRating < 1 || consolidatedRating > 5)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Consolidated rating must be between 1 and 5' });
        return;
      }
      appraisal.consolidatedRating = consolidatedRating ?? null;
    }

    await appraisal.save();

    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Feedback saved', data: { managerFeedback: appraisal.managerFeedback, consolidatedRating: appraisal.consolidatedRating } });
  } catch (error) {
    console.error('Save manager feedback error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error saving feedback' });
  }
};

/**
 * @desc    Bulk create appraisals for all active users
 * @route   POST /api/appraisals/bulk
 * @access  Private (Admin only)
 */
export const bulkCreateAppraisals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    if (req.user.role !== USER_ROLES.ADMIN) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const { year, deadline } = req.body;

    if (!year) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Year is required' });
      return;
    }

    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: ERROR_MESSAGES.INVALID_YEAR });
      return;
    }

    const users = await User.findAll({
      where: { role: { [Op.in]: [USER_ROLES.DEVELOPER, USER_ROLES.TESTER, USER_ROLES.DEVOPS, USER_ROLES.TECH_LEAD, USER_ROLES.MANAGER] } }
    });

    const existingAppraisals = await Appraisal.findAll({
      where: { year, userId: { [Op.in]: users.map(u => u.id) } },
      attributes: ['userId']
    });
    const existingUserIds = new Set(existingAppraisals.map(a => a.userId));

    let created = 0;
    for (const user of users) {
      if (existingUserIds.has(user.id)) continue;

      const appraisal = await Appraisal.create({
        userId: user.id,
        year,
        status: APPRAISAL_STATUS.DRAFT,
        deadline: deadline ? new Date(deadline) : null
      });

      const questions = await Question.findAll({ where: { applicableRole: user.role } });
      if (questions.length > 0) {
        await ResponseModel.bulkCreate(questions.map(q => ({ appraisalId: appraisal.id, questionId: q.id, answer: '' })));
      }
      created++;
    }

    const skipped = users.length - created;
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Created ${created} appraisal${created !== 1 ? 's' : ''}${skipped > 0 ? `, skipped ${skipped} (already exist)` : ''}.`,
      data: { created, skipped }
    });
  } catch (error) {
    console.error('Bulk create appraisals error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error creating appraisals' });
  }
};

/**
 * @desc    Return appraisal to developer for revision
 * @route   POST /api/appraisals/:id/return
 * @access  Private (Tech Lead, Manager, Admin)
 */
export const returnAppraisal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;

    const appraisal = await Appraisal.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND });
      return;
    }

    const appraisalUser = (appraisal as any).user as User | null;

    // Validate who can return and from which status
    const returnableStatuses = [
      APPRAISAL_STATUS.SUBMITTED,
      APPRAISAL_STATUS.TECH_LEAD_REVIEW,
      APPRAISAL_STATUS.MANAGER_REVIEW
    ];

    if (!returnableStatuses.includes(appraisal.status as any)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Cannot return appraisal in "${appraisal.status}" status`
      });
      return;
    }

    if (req.user.role === USER_ROLES.TECH_LEAD) {
      if (!appraisalUser || appraisalUser.techLeadId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You can only return appraisals of your team members' });
        return;
      }
      if (appraisal.status === APPRAISAL_STATUS.MANAGER_REVIEW) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Appraisal is already in manager review' });
        return;
      }
    } else if (req.user.role === USER_ROLES.MANAGER) {
      if (!appraisalUser || appraisalUser.managerId !== req.user.id) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You can only return appraisals of your reportees' });
        return;
      }
    } else if (req.user.role !== USER_ROLES.ADMIN) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    appraisal.status = APPRAISAL_STATUS.DRAFT;
    appraisal.submittedAt = null as any;
    appraisal.techLeadReviewedAt = null as any;
    appraisal.managerReviewedAt = null as any;
    await appraisal.save();

    // Add a system comment with the reason if provided
    if (reason && reason.trim().length >= 10) {
      await Comment.create({
        appraisalId: appraisal.id,
        userId: req.user.id,
        comment: `[Returned for revision] ${reason.trim()}`,
        stage: 'returned'
      });
    }

    // Notify developer
    if (appraisalUser) {
      const reviewer = await User.findByPk(req.user.id, { attributes: ['name'] });
      notifyDeveloperOnReturn({
        developerEmail: appraisalUser.email,
        developerName: appraisalUser.name,
        reviewerName: reviewer?.name ?? 'Reviewer',
        appraisalId: appraisal.id,
        year: appraisal.year,
        reason: reason?.trim()
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Appraisal returned to developer for revision',
      data: appraisal
    });
  } catch (error) {
    console.error('Return appraisal error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error returning appraisal' });
  }
};

/**
 * @desc    Export appraisals as CSV
 * @route   GET /api/appraisals/export
 * @access  Private (Tech Lead, Manager, Admin)
 */
export const exportAppraisals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    if (req.user.role === USER_ROLES.DEVELOPER || req.user.role === USER_ROLES.TESTER || req.user.role === USER_ROLES.DEVOPS) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const { year } = req.query;
    const whereClause: any = {};
    if (year) whereClause.year = parseInt(year as string);

    let userIds: number[] | null = null;

    if (req.user.role === USER_ROLES.TECH_LEAD) {
      const teamMembers = await User.findAll({ where: { techLeadId: req.user.id }, attributes: ['id'] });
      userIds = teamMembers.map(m => m.id);
    } else if (req.user.role === USER_ROLES.MANAGER) {
      const reportees = await User.findAll({ where: { managerId: req.user.id }, attributes: ['id'] });
      userIds = reportees.map(r => r.id);
    }

    if (userIds !== null) {
      whereClause.userId = { [Op.in]: userIds };
    }

    const appraisals = await Appraisal.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
        { model: Rating, as: 'ratings' }
      ],
      order: [['year', 'DESC'], ['updatedAt', 'DESC']]
    });

    // Build CSV
    const rows: string[] = [
      'ID,Year,Employee,Email,Role,Status,Deadline,Avg Self Rating,Submitted At,Completed At'
    ];

    appraisals.forEach(appraisal => {
      const user = (appraisal as any).user;
      const ratings = ((appraisal as any).ratings as any[]).filter(r => !r.raterRole || r.raterRole === 'self');
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length).toFixed(2)
        : '';

      const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      rows.push([
        appraisal.id,
        appraisal.year,
        escape(user?.name ?? ''),
        escape(user?.email ?? ''),
        escape(user?.role ?? ''),
        appraisal.status,
        appraisal.deadline ? new Date(appraisal.deadline).toISOString().split('T')[0] : '',
        avgRating,
        appraisal.submittedAt ? new Date(appraisal.submittedAt).toISOString().split('T')[0] : '',
        appraisal.completedAt ? new Date(appraisal.completedAt).toISOString().split('T')[0] : ''
      ].join(','));
    });

    const csv = rows.join('\n');
    const filename = `appraisals_${year || 'all'}_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HTTP_STATUS.OK).send(csv);
  } catch (error) {
    console.error('Export appraisals error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error exporting appraisals' });
  }
};

/**
 * @desc    Get peer feedbacks for an appraisal
 * @route   GET /api/appraisals/:id/peer-feedback
 * @access  Private (Manager, Admin)
 */
export const getPeerFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    if (req.user.role !== USER_ROLES.MANAGER && req.user.role !== USER_ROLES.ADMIN) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only managers can view peer feedback' });
      return;
    }

    const appraisal = await Appraisal.findByPk(req.params.id);
    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND });
      return;
    }

    const feedbacks = await PeerFeedback.findAll({
      where: { appraisalId: appraisal.id },
      include: [{ model: User, as: 'giver', attributes: ['id', 'name', 'role'] }],
      order: [['createdAt', 'ASC']]
    });

    res.status(HTTP_STATUS.OK).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Get peer feedback error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error fetching peer feedback' });
  }
};

/**
 * @desc    Add peer feedback for an appraisal
 * @route   POST /api/appraisals/:id/peer-feedback
 * @access  Private (any user except the appraisee)
 */
export const addPeerFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const appraisal = await Appraisal.findByPk(req.params.id);
    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND });
      return;
    }

    if (appraisal.userId === req.user.id) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You cannot give peer feedback on your own appraisal' });
      return;
    }

    const { didWell, canImprove } = req.body;

    if (!didWell || didWell.trim().length < 5) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: '"What they did well" must be at least 5 characters' });
      return;
    }
    if (!canImprove || canImprove.trim().length < 5) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: '"What they can improve" must be at least 5 characters' });
      return;
    }

    const existing = await PeerFeedback.findOne({ where: { appraisalId: appraisal.id, giverId: req.user.id } });
    if (existing) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'You have already submitted peer feedback for this appraisal' });
      return;
    }

    const feedback = await PeerFeedback.create({
      appraisalId: appraisal.id,
      giverId: req.user.id,
      didWell: didWell.trim(),
      canImprove: canImprove.trim()
    });

    const feedbackWithGiver = await PeerFeedback.findByPk(feedback.id, {
      include: [{ model: User, as: 'giver', attributes: ['id', 'name', 'role'] }]
    });

    res.status(HTTP_STATUS.CREATED).json({ success: true, message: 'Peer feedback submitted', data: feedbackWithGiver });
  } catch (error) {
    console.error('Add peer feedback error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error submitting peer feedback' });
  }
};

/**
 * @desc    Update own peer feedback
 * @route   PUT /api/appraisals/:id/peer-feedback/:feedbackId
 * @access  Private (giver only)
 */
export const updatePeerFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const feedback = await PeerFeedback.findByPk(req.params.feedbackId);
    if (!feedback) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Peer feedback not found' });
      return;
    }

    if (feedback.giverId !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You can only edit your own feedback' });
      return;
    }

    const { didWell, canImprove } = req.body;

    if (!didWell || didWell.trim().length < 5) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: '"What they did well" must be at least 5 characters' });
      return;
    }
    if (!canImprove || canImprove.trim().length < 5) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: '"What they can improve" must be at least 5 characters' });
      return;
    }

    await feedback.update({ didWell: didWell.trim(), canImprove: canImprove.trim() });

    const updated = await PeerFeedback.findByPk(feedback.id, {
      include: [{ model: User, as: 'giver', attributes: ['id', 'name', 'role'] }]
    });

    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Peer feedback updated', data: updated });
  } catch (error) {
    console.error('Update peer feedback error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error updating peer feedback' });
  }
};

/**
 * @desc    Delete peer feedback
 * @route   DELETE /api/appraisals/:id/peer-feedback/:feedbackId
 * @access  Private (giver or admin)
 */
export const deletePeerFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const feedback = await PeerFeedback.findByPk(req.params.feedbackId);
    if (!feedback) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Peer feedback not found' });
      return;
    }

    if (feedback.giverId !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'You can only delete your own feedback' });
      return;
    }

    await feedback.destroy();
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Peer feedback deleted' });
  } catch (error) {
    console.error('Delete peer feedback error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error deleting peer feedback' });
  }
};

/**
 * @desc    Generate AI summary of self-assessment answers
 * @route   POST /api/appraisals/:id/summary
 * @access  Private (Tech Lead, Manager, Admin)
 */
export const generateSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    // Only reviewers can generate
    if (req.user.role === USER_ROLES.DEVELOPER || req.user.role === USER_ROLES.TESTER) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only reviewers can generate summaries' });
      return;
    }

    const appraisal = await Appraisal.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'role']
        },
        {
          model: ResponseModel,
          as: 'responses',
          include: [{ model: Question, as: 'question', attributes: ['id', 'questionText', 'section', 'sectionTitle'] }]
        }
      ]
    });

    if (!appraisal) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: ERROR_MESSAGES.APPRAISAL_NOT_FOUND });
      return;
    }

    // Return cached unless force=true
    const force = req.query.force === 'true';
    if (appraisal.aiSummary && !force) {
      res.status(HTTP_STATUS.OK).json({ success: true, data: appraisal.aiSummary });
      return;
    }

    const responses = (appraisal as any).responses ?? [];
    if (responses.length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'No answers to summarise' });
      return;
    }

    // Group responses by section
    const sections: Record<string, { title: string; qas: Array<{ q: string; a: string }> }> = {};
    for (const r of responses) {
      const q = r.question;
      if (!q) continue;
      const key = q.section ?? 'general';
      if (!sections[key]) sections[key] = { title: q.sectionTitle ?? key, qas: [] };
      const plainAnswer = (r.answer ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (plainAnswer) sections[key].qas.push({ q: q.questionText, a: plainAnswer });
    }

    const assessmentText = Object.values(sections)
      .filter((s) => s.qas.length > 0)
      .map((s) => {
        const lines = s.qas.map((qa) => `Q: ${qa.q}\nA: ${qa.a}`).join('\n\n');
        return `Section: ${s.title}\n${lines}`;
      })
      .join('\n\n---\n\n');

    const appraiseeUser = (appraisal as any).user;
    const prompt = `You are reviewing a self-assessment for ${appraiseeUser?.name ?? 'an employee'} (${appraiseeUser?.role ?? 'unknown role'}), ${appraisal.year} appraisal.\nSummarise their answers in 4 short paragraphs:\n1. Key achievements & impact\n2. Technical/professional strengths\n3. Areas for growth\n4. Overall impression\nKeep it factual, concise, and under 250 words.\n\n--- Self-Assessment ---\n${assessmentText}`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }]
    });

    const summaryBlock = message.content.find((b) => b.type === 'text');
    const summary = summaryBlock?.type === 'text' ? summaryBlock.text.trim() : '';

    appraisal.aiSummary = summary;
    await appraisal.save();

    res.status(HTTP_STATUS.OK).json({ success: true, data: summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error generating summary' });
  }
};

export default {
  getAllAppraisals,
  getAppraisalById,
  createAppraisal,
  updateAppraisal,
  submitAppraisal,
  saveReviewerRatings,
  saveManagerFeedback,
  bulkCreateAppraisals,
  returnAppraisal,
  exportAppraisals,
  addComment,
  getComments,
  deleteAppraisal,
  getPeerFeedback,
  addPeerFeedback,
  updatePeerFeedback,
  deletePeerFeedback,
  generateSummary
};
