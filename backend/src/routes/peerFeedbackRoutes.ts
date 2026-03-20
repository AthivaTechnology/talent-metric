import { Router } from 'express';
import { getPeerOverview } from '../controllers/peerFeedbackController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/peer-feedback/overview
 * @desc    Get all colleagues with appraisal + current user's feedback status
 * @access  Private
 */
router.get('/overview', authenticate, getPeerOverview);

export default router;
