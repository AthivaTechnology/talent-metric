import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import User from '../models/User';
import { USER_ROLES, UserRole, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    name: string;
    techLeadId?: number | null;
    managerId?: number | null;
  };
}

/**
 * Middleware to authenticate user via JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'No token provided. Please login.'
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'techLeadId', 'managerId']
    });

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
      return;
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      techLeadId: user.techLeadId,
      managerId: user.managerId
    };

    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

/**
 * Middleware to authorize user based on roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize(USER_ROLES.ADMIN);

/**
 * Middleware to check if user is manager or admin
 */
export const isManagerOrAdmin = authorize(USER_ROLES.MANAGER, USER_ROLES.ADMIN);

/**
 * Middleware to check if user is tech lead, manager, or admin
 */
export const isTechLeadOrAbove = authorize(
  USER_ROLES.TECH_LEAD,
  USER_ROLES.MANAGER,
  USER_ROLES.ADMIN
);

/**
 * Middleware to check if user can access a specific appraisal
 */
export const canAccessAppraisal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
      return;
    }

    const appraisalUserId = parseInt(req.params.userId || req.body.userId);
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Admin can access all appraisals
    if (currentUserRole === USER_ROLES.ADMIN) {
      next();
      return;
    }

    // User can access their own appraisal
    if (appraisalUserId === currentUserId) {
      next();
      return;
    }

    // Tech Lead can access their team members' appraisals
    if (currentUserRole === USER_ROLES.TECH_LEAD) {
      const teamMember = await User.findOne({
        where: {
          id: appraisalUserId,
          techLeadId: currentUserId
        }
      });

      if (teamMember) {
        next();
        return;
      }
    }

    // Manager can access their reportees' appraisals
    if (currentUserRole === USER_ROLES.MANAGER) {
      const reportee = await User.findOne({
        where: {
          id: appraisalUserId,
          managerId: currentUserId
        }
      });

      if (reportee) {
        next();
        return;
      }
    }

    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to access this appraisal'
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error checking appraisal access permissions'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role', 'techLeadId', 'managerId']
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          techLeadId: user.techLeadId,
          managerId: user.managerId
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

export default {
  authenticate,
  authorize,
  isAdmin,
  isManagerOrAdmin,
  isTechLeadOrAbove,
  canAccessAppraisal,
  optionalAuth
};
