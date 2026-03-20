import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, Appraisal, PeerFeedback } from '../models';
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from '../config/constants';
import { Op } from 'sequelize';

/**
 * @desc    Get all colleagues with their current appraisal + current user's feedback
 * @route   GET /api/peer-feedback/overview
 * @access  Private (any authenticated user)
 */
export const getPeerOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const currentYear = new Date().getFullYear();

    // All active users except self and admins
    const colleagues = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        isActive: true,
        role: { [Op.ne]: USER_ROLES.ADMIN }
      },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']]
    });

    const colleagueIds = colleagues.map((u) => u.id);

    // Current year appraisals for all colleagues (not draft)
    const appraisals = await Appraisal.findAll({
      where: {
        userId: { [Op.in]: colleagueIds },
        year: currentYear,
        status: { [Op.ne]: 'draft' }
      },
      attributes: ['id', 'userId', 'status', 'year']
    });

    const appraisalByUser: Record<number, { id: number; status: string; year: number }> = {};
    appraisals.forEach((a) => {
      appraisalByUser[a.userId] = { id: a.id, status: a.status, year: a.year };
    });

    // Feedbacks already given by current user (for these appraisals)
    const appraisalIds = appraisals.map((a) => a.id);
    const myFeedbacks = appraisalIds.length > 0
      ? await PeerFeedback.findAll({
          where: { appraisalId: { [Op.in]: appraisalIds }, giverId: req.user.id },
          attributes: ['id', 'appraisalId', 'didWell', 'canImprove', 'createdAt', 'updatedAt']
        })
      : [];

    const feedbackByAppraisal: Record<number, typeof myFeedbacks[0]> = {};
    myFeedbacks.forEach((f) => { feedbackByAppraisal[f.appraisalId] = f; });

    const overview = colleagues.map((colleague) => {
      const appraisal = appraisalByUser[colleague.id] ?? null;
      const myFeedback = appraisal ? (feedbackByAppraisal[appraisal.id] ?? null) : null;
      return { user: colleague, appraisal, myFeedback };
    });

    res.status(HTTP_STATUS.OK).json({ success: true, data: overview });
  } catch (error) {
    console.error('Peer overview error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error fetching peer overview' });
  }
};
