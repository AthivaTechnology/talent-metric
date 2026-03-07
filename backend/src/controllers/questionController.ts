import { Request, Response } from 'express';
import { Question } from '../models';
import { HTTP_STATUS, USER_ROLES } from '../config/constants';

/**
 * @desc    Get all questions grouped by section
 * @route   GET /api/questions
 * @access  Private
 */
export const getAllQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query;

    // Validate role if provided
    const validRoles = Object.values(USER_ROLES).filter(r => r !== 'admin');
    const whereClause: Record<string, string> = {};
    if (role && typeof role === 'string' && validRoles.includes(role as any)) {
      whereClause.applicableRole = role;
    }

    const questions = await Question.findAll({
      where: Object.keys(whereClause).length ? whereClause : undefined,
      order: [
        ['section', 'ASC'],
        ['order', 'ASC']
      ]
    });

    // Group questions by section
    const questionsBySection: any = {};

    questions.forEach(question => {
      if (!questionsBySection[question.section]) {
        questionsBySection[question.section] = {
          section: question.section,
          sectionTitle: question.sectionTitle,
          questions: []
        };
      }

      questionsBySection[question.section].questions.push({
        id: question.id,
        questionText: question.questionText,
        order: question.order
      });
    });

    // Convert to array
    const sectionsArray = Object.values(questionsBySection);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: sectionsArray
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching questions'
    });
  }
};

/**
 * @desc    Get questions by section
 * @route   GET /api/questions/section/:section
 * @access  Private
 */
export const getQuestionsBySection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section } = req.params;

    const questions = await Question.findAll({
      where: { section: parseInt(section) },
      order: [['order', 'ASC']]
    });

    if (questions.length === 0) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'No questions found for this section'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        section: parseInt(section),
        sectionTitle: questions[0].sectionTitle,
        questions
      }
    });
  } catch (error) {
    console.error('Get questions by section error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching questions'
    });
  }
};

/**
 * @desc    Get single question by ID
 * @route   GET /api/questions/:id
 * @access  Private
 */
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id);

    if (!question) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Question not found'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get question by ID error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching question'
    });
  }
};

export default {
  getAllQuestions,
  getQuestionsBySection,
  getQuestionById
};
