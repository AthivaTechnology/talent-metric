import { Router } from 'express';
import {
  getDashboardStats,
  getTeamAppraisals,
  getTeamAnalytics,
  getTrend
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

/**
 * @route   GET /api/dashboard/trend
 * @desc    Get year-over-year rating trend
 * @access  Private
 */
router.get('/trend', authenticate, getTrend);

export default router;
