import { Router } from 'express';
import {
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
} from '../controllers/appraisalController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/appraisals
 * @desc    Get all appraisals (filtered by role)
 * @access  Private
 */
router.get('/', authenticate, getAllAppraisals);

/**
 * @route   GET /api/appraisals/:id
 * @desc    Get single appraisal by ID
 * @access  Private
 */
router.get('/:id', authenticate, getAppraisalById);

/**
 * @route   POST /api/appraisals
 * @desc    Create new appraisal
 * @access  Private
 */
router.post('/', authenticate, createAppraisal);

/**
 * @route   PUT /api/appraisals/:id
 * @desc    Update appraisal (auto-save)
 * @access  Private
 */
router.put('/:id', authenticate, updateAppraisal);

/**
 * @route   POST /api/appraisals/:id/submit
 * @desc    Submit appraisal to next stage
 * @access  Private
 */
router.post('/:id/submit', authenticate, submitAppraisal);

/**
 * @route   PUT /api/appraisals/:id/reviewer-ratings
 * @desc    Save tech lead / manager ratings
 * @access  Private (Tech Lead, Manager, Admin)
 */
router.put('/:id/reviewer-ratings', authenticate, saveReviewerRatings);

/**
 * @route   GET /api/appraisals/:id/comments
 * @desc    Get comments for an appraisal
 * @access  Private
 */
router.get('/:id/comments', authenticate, getComments);

/**
 * @route   POST /api/appraisals/:id/comments
 * @desc    Add comment to appraisal
 * @access  Private (Tech Lead, Manager, Admin)
 */
router.post('/:id/comments', authenticate, addComment);

/**
 * @route   PUT /api/appraisals/:id/manager-feedback
 * @desc    Save manager's final feedback
 * @access  Private (Manager, Admin)
 */
router.put('/:id/manager-feedback', authenticate, saveManagerFeedback);

/**
 * @route   POST /api/appraisals/bulk
 * @desc    Bulk create appraisals for all active users
 * @access  Private (Admin)
 */
router.post('/bulk', authenticate, isAdmin, bulkCreateAppraisals);

/**
 * @route   DELETE /api/appraisals/:id
 * @desc    Delete appraisal
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, deleteAppraisal);

export default router;
