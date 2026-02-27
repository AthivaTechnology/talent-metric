import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, USER_ROLES } from '../config/constants';
import { Op } from 'sequelize';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const whereClause: any = {};

    // Filter by role if provided
    if (role) {
      whereClause.role = role;
    }

    // Search by name or email
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows: users, count: total } = await User.findAndCountAll({
      where: whereClause,
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
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'role', 'techLeadId', 'managerId', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'techLead',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'reportees',
          attributes: ['id', 'name', 'email', 'role']
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
    console.error('Get user by ID error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, techLeadId, managerId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid email format'
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid role'
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: ERROR_MESSAGES.DUPLICATE_EMAIL
      });
      return;
    }

    // Validate tech lead exists and has correct role
    if (techLeadId) {
      const techLead = await User.findByPk(techLeadId);
      if (!techLead || techLead.role !== USER_ROLES.TECH_LEAD) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid tech lead'
        });
        return;
      }
    }

    // Validate manager exists and has correct role
    if (managerId) {
      const manager = await User.findByPk(managerId);
      if (!manager || manager.role !== USER_ROLES.MANAGER) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid manager'
        });
        return;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      techLeadId: techLeadId || null,
      managerId: managerId || null
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        techLeadId: user.techLeadId,
        managerId: user.managerId
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, techLeadId, managerId, password } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
      return;
    }

    // Validate email if being updated
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid email format'
        });
        return;
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: ERROR_MESSAGES.DUPLICATE_EMAIL
        });
        return;
      }
    }

    // Validate role if being updated
    if (role && !Object.values(USER_ROLES).includes(role)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid role'
      });
      return;
    }

    // Validate password if being updated
    if (password && password.length < 6) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    // Validate tech lead if being updated
    if (techLeadId) {
      const techLead = await User.findByPk(techLeadId);
      if (!techLead || techLead.role !== USER_ROLES.TECH_LEAD) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid tech lead'
        });
        return;
      }
    }

    // Validate manager if being updated
    if (managerId) {
      const manager = await User.findByPk(managerId);
      if (!manager || manager.role !== USER_ROLES.MANAGER) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid manager'
        });
        return;
      }
    }

    // Update user
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password;
    if (techLeadId !== undefined) user.techLeadId = techLeadId || null;
    if (managerId !== undefined) user.managerId = managerId || null;

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_UPDATED,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        techLeadId: user.techLeadId,
        managerId: user.managerId
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
      return;
    }

    // Prevent deleting yourself
    if (req.user && req.user.id === parseInt(id)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'You cannot delete your own account'
      });
      return;
    }

    await user.destroy();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_DELETED
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

/**
 * @desc    Get all tech leads
 * @route   GET /api/users/tech-leads
 * @access  Private/Admin
 */
export const getTechLeads = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const techLeads = await User.findAll({
      where: { role: USER_ROLES.TECH_LEAD },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: techLeads
    });
  } catch (error) {
    console.error('Get tech leads error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching tech leads'
    });
  }
};

/**
 * @desc    Get all managers
 * @route   GET /api/users/managers
 * @access  Private/Admin
 */
export const getManagers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const managers = await User.findAll({
      where: { role: USER_ROLES.MANAGER },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']]
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: managers
    });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error fetching managers'
    });
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getTechLeads,
  getManagers
};
