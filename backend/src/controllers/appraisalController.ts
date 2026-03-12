import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Appraisal, Response as ResponseModel, Rating, Comment, User, Question } from '../models';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APPRAISAL_STATUS,
  USER_ROLES,
  WORKFLOW_TRANSITIONS
} from '../config/constants';
import { Op } from 'sequelize';

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
    const nextStatus = WORKFLOW_TRANSITIONS[currentStatus];

    if (!nextStatus) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Appraisal is already completed'
      });
      return;
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
    } else if (currentStatus === APPRAISAL_STATUS.SUBMITTED || currentStatus === APPRAISAL_STATUS.TECH_LEAD_REVIEW) {
      // Tech lead reviewing
      const user = await User.findByPk(appraisal.userId);
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

      appraisal.managerReviewedAt = new Date();
      appraisal.completedAt = new Date();
    }

    // Update status
    appraisal.status = nextStatus;
    await appraisal.save();

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
    } else if (req.user.role === USER_ROLES.ADMIN) {
      raterRole = appraisal.status === APPRAISAL_STATUS.MANAGER_REVIEW ? 'manager' : 'tech_lead';
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
    const { comment } = req.body;

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
    const { feedback } = req.body;

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
    } else if (req.user.role !== USER_ROLES.ADMIN) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Only managers can provide final feedback' });
      return;
    }

    appraisal.managerFeedback = feedback?.trim() || null;
    await appraisal.save();

    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Feedback saved', data: { managerFeedback: appraisal.managerFeedback } });
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
      where: { role: { [Op.in]: [USER_ROLES.DEVELOPER, USER_ROLES.TESTER, USER_ROLES.TECH_LEAD, USER_ROLES.MANAGER] } }
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

export default {
  getAllAppraisals,
  getAppraisalById,
  createAppraisal,
  updateAppraisal,
  submitAppraisal,
  saveReviewerRatings,
  saveManagerFeedback,
  bulkCreateAppraisals,
  addComment,
  getComments,
  deleteAppraisal
};
