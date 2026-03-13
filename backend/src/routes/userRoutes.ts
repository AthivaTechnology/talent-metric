import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTechLeads,
  getManagers,
  deactivateUser,
  activateUser
} from '../controllers/userController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/users/tech-leads
 * @desc    Get all tech leads
 * @access  Private/Admin
 */
router.get('/tech-leads', authenticate, isAdmin, getTechLeads);

/**
 * @route   GET /api/users/managers
 * @desc    Get all managers
 * @access  Private/Admin
 */
router.get('/managers', authenticate, isAdmin, getManagers);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', authenticate, isAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private/Admin
 */
router.get('/:id', authenticate, isAdmin, getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private/Admin
 */
router.post('/', authenticate, isAdmin, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put('/:id', authenticate, isAdmin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, deleteUser);

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user (soft delete)
 * @access  Private/Admin
 */
router.patch('/:id/deactivate', authenticate, isAdmin, deactivateUser);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user
 * @access  Private/Admin
 */
router.patch('/:id/activate', authenticate, isAdmin, activateUser);

export default router;
