import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Appraisal, User, Rating } from '../models';
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES, APPRAISAL_STATUS } from '../config/constants';
import { Op } from 'sequelize';
import sequelize from '../config/database';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const currentYear = new Date().getFullYear();
    const stats: any = {};

    if (req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.HR) {
      // Admin stats - all users
      stats.totalUsers = await User.count();
      stats.totalDevelopers = await User.count({ where: { role: USER_ROLES.DEVELOPER } });
      stats.totalTesters = await User.count({ where: { role: USER_ROLES.TESTER } });
      stats.totalDevOps = await User.count({ where: { role: USER_ROLES.DEVOPS } });
      stats.totalTechLeads = await User.count({ where: { role: USER_ROLES.TECH_LEAD } });
      stats.totalManagers = await User.count({ where: { role: USER_ROLES.MANAGER } });

      stats.totalAppraisals = await Appraisal.count({ where: { year: currentYear } });
      stats.draftAppraisals = await Appraisal.count({
        where: { year: currentYear, status: APPRAISAL_STATUS.DRAFT }
      });
      stats.submittedAppraisals = 0;
      stats.techLeadReviewAppraisals = await Appraisal.count({
        where: { year: currentYear, status: APPRAISAL_STATUS.TECH_LEAD_REVIEW }
      });
      stats.managerReviewAppraisals = await Appraisal.count({
        where: { year: currentYear, status: APPRAISAL_STATUS.MANAGER_REVIEW }
      });
      stats.completedAppraisals = await Appraisal.count({
        where: { year: currentYear, status: APPRAISAL_STATUS.COMPLETED }
      });

      // Appraisals with approaching deadlines (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      stats.approachingDeadlines = await Appraisal.count({
        where: {
          year: currentYear,
          status: { [Op.ne]: APPRAISAL_STATUS.COMPLETED },
          deadline: {
            [Op.between]: [new Date(), sevenDaysFromNow]
          }
        }
      });

      // Overdue appraisals
      stats.overdueAppraisals = await Appraisal.count({
        where: {
          year: currentYear,
          status: { [Op.ne]: APPRAISAL_STATUS.COMPLETED },
          deadline: {
            [Op.lt]: new Date()
          }
        }
      });

    } else if (req.user.role === USER_ROLES.MANAGER) {
      // Manager stats - their reportees
      const reportees = await User.findAll({
        where: { managerId: req.user.id },
        attributes: ['id']
      });
      const reporteeIds = reportees.map(r => r.id);

      stats.totalReportees = reportees.length;
      stats.totalAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: reporteeIds } }
      });
      stats.draftAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: reporteeIds }, status: APPRAISAL_STATUS.DRAFT }
      });
      stats.submittedAppraisals = 0;
      stats.techLeadReviewAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: reporteeIds }, status: APPRAISAL_STATUS.TECH_LEAD_REVIEW }
      });
      stats.managerReviewAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: reporteeIds }, status: APPRAISAL_STATUS.MANAGER_REVIEW }
      });
      stats.completedAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: reporteeIds }, status: APPRAISAL_STATUS.COMPLETED }
      });

      // Pending reviews (waiting for manager)
      stats.pendingReviews = stats.managerReviewAppraisals;

    } else if (req.user.role === USER_ROLES.TECH_LEAD) {
      // Tech Lead stats - their team members
      const teamMembers = await User.findAll({
        where: { techLeadId: req.user.id },
        attributes: ['id']
      });
      const teamMemberIds = teamMembers.map(m => m.id);

      stats.totalTeamMembers = teamMembers.length;
      stats.totalAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: teamMemberIds } }
      });
      stats.draftAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: teamMemberIds }, status: APPRAISAL_STATUS.DRAFT }
      });
      stats.submittedAppraisals = 0;
      stats.techLeadReviewAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: teamMemberIds }, status: APPRAISAL_STATUS.TECH_LEAD_REVIEW }
      });
      stats.completedAppraisals = await Appraisal.count({
        where: { year: currentYear, userId: { [Op.in]: teamMemberIds }, status: APPRAISAL_STATUS.COMPLETED }
      });

      // Pending reviews (waiting for tech lead)
      stats.pendingReviews = stats.submittedAppraisals + stats.techLeadReviewAppraisals;

    } else if (
      req.user.role === USER_ROLES.DEVELOPER ||
      req.user.role === USER_ROLES.TESTER ||
      req.user.role === USER_ROLES.DEVOPS
    ) {
      // Developer/Tester/DevOps stats - their own appraisals
      const myAppraisals = await Appraisal.findAll({
        where: { userId: req.user.id, year: currentYear }
      });

      stats.totalAppraisals = myAppraisals.length;
      stats.currentStatus = myAppraisals.length > 0 ? myAppraisals[0].status : null;
      stats.hasActiveAppraisal = myAppraisals.length > 0;

      if (myAppraisals.length > 0) {
        const appraisal = myAppraisals[0];
        stats.deadline = appraisal.deadline;
        stats.isOverdue = appraisal.deadline && new Date() > appraisal.deadline;
        stats.progress = appraisal.getProgress();
      }
    }

    stats.currentYear = currentYear;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

/**
 * @desc    Get team appraisals with details
 * @route   GET /api/dashboard/team
 * @access  Private (Manager, Tech Lead, Admin)
 */
export const getTeamAppraisals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { year = new Date().getFullYear() } = req.query;
    let userIds: number[] = [];

    if (req.user.role === USER_ROLES.MANAGER) {
      const reportees = await User.findAll({
        where: { managerId: req.user.id },
        attributes: ['id']
      });
      userIds = reportees.map(r => r.id);
    } else if (req.user.role === USER_ROLES.TECH_LEAD) {
      const teamMembers = await User.findAll({
        where: { techLeadId: req.user.id },
        attributes: ['id']
      });
      userIds = teamMembers.map(m => m.id);
    } else if (req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.HR) {
      // Admin/HR can see all non-admin users
      const allUsers = await User.findAll({
        where: {
          role: { [Op.in]: [USER_ROLES.DEVELOPER, USER_ROLES.TESTER, USER_ROLES.DEVOPS, USER_ROLES.TECH_LEAD, USER_ROLES.MANAGER] }
        },
        attributes: ['id']
      });
      userIds = allUsers.map(u => u.id);
    } else {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const appraisals = await Appraisal.findAll({
      where: {
        userId: { [Op.in]: userIds },
        year: parseInt(year as string)
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Rating,
          as: 'ratings'
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: appraisals
    });
  } catch (error) {
    console.error('Get team appraisals error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching team appraisals'
    });
  }
};

/**
 * @desc    Get team analytics
 * @route   GET /api/dashboard/analytics
 * @access  Private (Manager, Admin)
 */
export const getTeamAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    if (
      req.user.role !== USER_ROLES.MANAGER &&
      req.user.role !== USER_ROLES.ADMIN &&
      req.user.role !== USER_ROLES.TECH_LEAD &&
      req.user.role !== USER_ROLES.HR
    ) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    const { year = new Date().getFullYear() } = req.query;
    let userIds: number[] = [];

    if (req.user.role === USER_ROLES.TECH_LEAD) {
      const teamMembers = await User.findAll({
        where: { techLeadId: req.user.id },
        attributes: ['id']
      });
      userIds = teamMembers.map(m => m.id);
    } else if (req.user.role === USER_ROLES.MANAGER) {
      const reportees = await User.findAll({
        where: { managerId: req.user.id },
        attributes: ['id']
      });
      userIds = reportees.map(r => r.id);
    } else {
      const allUsers = await User.findAll({
        where: {
          role: { [Op.in]: [USER_ROLES.DEVELOPER, USER_ROLES.TESTER, USER_ROLES.DEVOPS, USER_ROLES.TECH_LEAD, USER_ROLES.MANAGER] }
        },
        attributes: ['id']
      });
      userIds = allUsers.map(u => u.id);
    }

    // Get all ratings for completed appraisals
    const effectiveUserIds = userIds.length > 0 ? userIds : [-1];
    const appraisals = await Appraisal.findAll({
      where: {
        userId: { [Op.in]: effectiveUserIds },
        year: parseInt(year as string),
        status: APPRAISAL_STATUS.COMPLETED
      },
      include: [
        {
          model: Rating,
          as: 'ratings'
        }
      ]
    });

    // Calculate average ratings by category (dynamic — works for all roles)
    const ratingsByCategory: Record<string, number[]> = {};

    appraisals.forEach(appraisal => {
      if ((appraisal as any).ratings) {
        (appraisal as any).ratings.forEach((rating: any) => {
          if (!ratingsByCategory[rating.category]) {
            ratingsByCategory[rating.category] = [];
          }
          ratingsByCategory[rating.category].push(rating.rating);
        });
      }
    });

    const averageRatings: any = {};
    Object.keys(ratingsByCategory).forEach(category => {
      const ratings = ratingsByCategory[category];
      const sum = ratings.reduce((a: number, b: number) => a + b, 0);
      averageRatings[category] = parseFloat((sum / ratings.length).toFixed(2));
    });

    // Status distribution
    const statusDistribution = await Appraisal.findAll({
      where: {
        userId: { [Op.in]: effectiveUserIds },
        year: parseInt(year as string)
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Rating distribution (1-5 stars)
    const ratingDistribution = await Rating.findAll({
      include: [
        {
          model: Appraisal,
          as: 'appraisal',
          where: {
            userId: { [Op.in]: effectiveUserIds },
            year: parseInt(year as string)
          },
          attributes: []
        }
      ],
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('Rating.id')), 'count']
      ],
      group: ['rating'],
      raw: true
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        averageRatings,
        statusDistribution,
        ratingDistribution,
        totalCompleted: appraisals.length,
        totalTeamMembers: userIds.length
      }
    });
  } catch (error) {
    console.error('Get team analytics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching team analytics'
    });
  }
};

/**
 * @desc    Get year-over-year rating trend
 * @route   GET /api/dashboard/trend
 * @access  Private
 */
export const getTrend = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

    let userIds: number[];

    if (req.user.role === USER_ROLES.DEVELOPER || req.user.role === USER_ROLES.TESTER) {
      userIds = [req.user.id];
    } else if (req.user.role === USER_ROLES.TECH_LEAD) {
      const members = await User.findAll({ where: { techLeadId: req.user.id }, attributes: ['id'] });
      userIds = members.map(m => m.id);
    } else if (req.user.role === USER_ROLES.MANAGER) {
      const reportees = await User.findAll({ where: { managerId: req.user.id }, attributes: ['id'] });
      userIds = reportees.map(r => r.id);
    } else {
      const all = await User.findAll({
        where: { role: { [Op.in]: [USER_ROLES.DEVELOPER, USER_ROLES.TESTER] } },
        attributes: ['id']
      });
      userIds = all.map(u => u.id);
    }

    const trend = await Promise.all(
      years.map(async (year) => {
        const appraisals = await Appraisal.findAll({
          where: { userId: { [Op.in]: userIds }, year, status: APPRAISAL_STATUS.COMPLETED },
          include: [{ model: Rating, as: 'ratings' }]
        });

        const selfRatings = appraisals.flatMap(a =>
          ((a as any).ratings as any[]).filter(r => !r.raterRole || r.raterRole === 'self').map(r => r.rating as number)
        );

        const avgRating = selfRatings.length > 0
          ? parseFloat((selfRatings.reduce((a, b) => a + b, 0) / selfRatings.length).toFixed(2))
          : null;

        return { year, avgRating, completed: appraisals.length };
      })
    );

    res.status(HTTP_STATUS.OK).json({ success: true, data: trend });
  } catch (error) {
    console.error('Get trend error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error fetching trend data' });
  }
};

export default {
  getDashboardStats,
  getTeamAppraisals,
  getTeamAnalytics,
  getTrend
};
