import { Router } from 'express';
import {
  getDashboardStats,
  getTeamAppraisals,
  getTeamAnalytics
} from '../controllers/dashboardController';
import { authenticate, isManagerOrAdmin, isTechLeadOrAbove } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', authenticate, getDashboardStats);

/**
 * @route   GET /api/dashboard/team
 * @desc    Get team appraisals with details
 * @access  Private (Manager, Tech Lead, Admin)
 */
router.get('/team', authenticate, isTechLeadOrAbove, getTeamAppraisals);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get team analytics
 * @access  Private (Manager, Admin)
 */
router.get('/analytics', authenticate, isManagerOrAdmin, getTeamAnalytics);

export default router;
