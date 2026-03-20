import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';
import { Op } from 'sequelize';
import { sendPasswordResetEmail } from '../services/emailService';

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please provide email and password'
      });
      return;
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'password', 'role', 'techLeadId', 'managerId']
    });

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
      return;
    }

    // Check if user has no password set (invite not accepted yet)
    if (!user.password) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'No password set. Please use your invite link from the appraisal email.'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Return user info and token (exclude password)
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          techLeadId: user.techLeadId,
          managerId: user.managerId
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    // Get full user details
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'techLeadId', 'managerId', 'createdAt'],
      include: [
        {
          model: User,
          as: 'techLead',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In JWT-based auth, logout is typically handled client-side by removing the token
    // This endpoint is just for consistency and can be used for logging purposes
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error logging out'
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please provide current password and new password'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
      return;
    }

    // Get user with password
    const user = await User.findByPk(req.user.id);

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Update password (will be hashed by the model hook)
    user.password = newPassword;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

/**
 * @desc    Verify an invitation token (returns user name/email for the set-password page)
 * @route   GET /api/auth/verify-invite/:token
 * @access  Public
 */
export const verifyInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        invitationToken: token,
        invitationTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invite link is invalid or has expired. Please contact your admin.'
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Verify invite error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error verifying invite'
    });
  }
};

/**
 * @desc    Accept invite — set password and auto-login
 * @route   POST /api/auth/accept-invite
 * @access  Public
 */
export const acceptInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Token and password are required'
      });
      return;
    }

    if (password.length < 6) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    const user = await User.findOne({
      where: {
        invitationToken: token,
        invitationTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invite link is invalid or has expired. Please contact your admin.'
      });
      return;
    }

    user.password = password;
    user.invitationToken = null;
    user.invitationTokenExpiry = null;
    await user.save();

    const jwtToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password set successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          techLeadId: user.techLeadId,
          managerId: user.managerId
        },
        token: jwtToken
      }
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error accepting invite'
    });
  }
};

/**
 * @desc    Request password reset — sends email with reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ where: { email } });

    // Always respond with success to prevent email enumeration
    if (!user) {
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.invitationToken = token;
    user.invitationTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail({ email: user.email, name: user.name, token });

    res.status(HTTP_STATUS.OK).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error processing request' });
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Token and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const user = await User.findOne({
      where: { invitationToken: token, invitationTokenExpiry: { [Op.gt]: new Date() } }
    });

    if (!user) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Reset link is invalid or has expired.' });
      return;
    }

    user.password = password;
    user.invitationToken = null;
    user.invitationTokenExpiry = null;
    await user.save();

    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error resetting password' });
  }
};

export default {
  login,
  getMe,
  logout,
  changePassword,
  verifyInvite,
  acceptInvite
};
