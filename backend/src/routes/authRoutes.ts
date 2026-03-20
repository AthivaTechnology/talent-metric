import { Router } from 'express';
import { login, getMe, logout, changePassword, verifyInvite, acceptInvite } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, changePassword);

/**
 * @route   GET /api/auth/verify-invite/:token
 * @desc    Verify invitation token
 * @access  Public
 */
router.get('/verify-invite/:token', verifyInvite);

/**
 * @route   POST /api/auth/accept-invite
 * @desc    Accept invite and set password
 * @access  Public
 */
router.post('/accept-invite', acceptInvite);

export default router;
