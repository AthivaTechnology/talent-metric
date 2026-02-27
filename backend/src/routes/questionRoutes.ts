import { Router } from 'express';
import {
  getAllQuestions,
  getQuestionsBySection,
  getQuestionById
} from '../controllers/questionController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/questions
 * @desc    Get all questions grouped by section
 * @access  Private
 */
router.get('/', authenticate, getAllQuestions);

/**
 * @route   GET /api/questions/section/:section
 * @desc    Get questions by section number
 * @access  Private
 */
router.get('/section/:section', authenticate, getQuestionsBySection);

/**
 * @route   GET /api/questions/:id
 * @desc    Get single question by ID
 * @access  Private
 */
router.get('/:id', authenticate, getQuestionById);

export default router;
