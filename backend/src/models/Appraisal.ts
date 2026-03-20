import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { APPRAISAL_STATUS, AppraisalStatus } from '../config/constants';

interface AppraisalAttributes {
  id: number;
  userId: number;
  year: number;
  status: AppraisalStatus;
  deadline?: Date | null;
  submittedAt?: Date | null;
  techLeadReviewedAt?: Date | null;
  managerReviewedAt?: Date | null;
  completedAt?: Date | null;
  managerFeedback?: string | null;
  consolidatedRating?: number | null;
  aiSummary?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppraisalCreationAttributes
  extends Optional<AppraisalAttributes, 'id' | 'deadline' | 'submittedAt' | 'techLeadReviewedAt' | 'managerReviewedAt' | 'completedAt' | 'managerFeedback' | 'consolidatedRating' | 'aiSummary'> {}

class Appraisal extends Model<AppraisalAttributes, AppraisalCreationAttributes> implements AppraisalAttributes {
  public id!: number;
  public userId!: number;
  public year!: number;
  public status!: AppraisalStatus;
  public deadline!: Date | null;
  public submittedAt!: Date | null;
  public techLeadReviewedAt!: Date | null;
  public managerReviewedAt!: Date | null;
  public completedAt!: Date | null;
  public managerFeedback!: string | null;
  public consolidatedRating!: number | null;
  public aiSummary!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to check if deadline has passed
  public isDeadlinePassed(): boolean {
    if (!this.deadline) return false;
    return new Date() > this.deadline;
  }

  // Helper method to check if appraisal can be edited
  public canBeEdited(): boolean {
    return this.status === APPRAISAL_STATUS.DRAFT;
  }

  // Helper method to get progress percentage
  public getProgress(): number {
    const statusOrder = Object.values(APPRAISAL_STATUS);
    const currentIndex = statusOrder.indexOf(this.status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  }
}

Appraisal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [2000],
          msg: 'Year must be 2000 or later'
        },
        max: {
          args: [2100],
          msg: 'Year must be before 2100'
        }
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(APPRAISAL_STATUS)),
      allowNull: false,
      defaultValue: APPRAISAL_STATUS.DRAFT,
      validate: {
        isIn: {
          args: [Object.values(APPRAISAL_STATUS)],
          msg: 'Invalid status'
        }
      }
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'submitted_at'
    },
    techLeadReviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'tech_lead_reviewed_at'
    },
    managerReviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'manager_reviewed_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at'
    },
    managerFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'manager_feedback'
    },
    consolidatedRating: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'consolidated_rating',
      validate: {
        min: { args: [1], msg: 'Consolidated rating must be at least 1' },
        max: { args: [5], msg: 'Consolidated rating must be at most 5' }
      }
    },
    aiSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'ai_summary'
    }
  },
  {
    sequelize,
    tableName: 'appraisals',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'year'],
        name: 'unique_user_year'
      },
      {
        fields: ['status']
      },
      {
        fields: ['deadline']
      }
    ]
  }
);

export default Appraisal;
