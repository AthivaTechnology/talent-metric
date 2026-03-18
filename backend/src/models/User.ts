import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { USER_ROLES, UserRole } from '../config/constants';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string | null;
  role: UserRole;
  techLeadId?: number | null;
  managerId?: number | null;
  isActive: boolean;
  invitationToken?: string | null;
  invitationTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'techLeadId' | 'managerId' | 'isActive' | 'invitationToken' | 'invitationTokenExpiry'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string | null;
  public role!: UserRole;
  public invitationToken!: string | null;
  public invitationTokenExpiry!: Date | null;
  public techLeadId!: number | null;
  public managerId!: number | null;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to compare password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Method to exclude sensitive fields from JSON
  public toJSON(): Partial<UserAttributes> {
    const values = { ...this.get() } as Partial<UserAttributes>;
    delete values.password;
    delete values.invitationToken;
    delete values.invitationTokenExpiry;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_email',
        msg: 'Email already exists'
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'tech_lead', 'developer', 'tester', 'devops'),
      allowNull: false,
      defaultValue: USER_ROLES.DEVELOPER,
      validate: {
        isIn: {
          args: [Object.values(USER_ROLES)],
          msg: 'Invalid role'
        }
      }
    },
    techLeadId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'tech_lead_id'
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'manager_id'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    invitationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'invitation_token'
    },
    invitationTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'invitation_token_expiry'
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;
