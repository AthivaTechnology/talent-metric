import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CommentAttributes {
  id: number;
  appraisalId: number;
  userId: number;
  questionId?: number | null;
  comment: string;
  stage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'questionId'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public appraisalId!: number;
  public userId!: number;
  public questionId!: number | null;
  public comment!: string;
  public stage!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to check if comment is from tech lead
  public isFromTechLead(): boolean {
    return this.stage === 'tech_lead_review';
  }

  // Helper method to check if comment is from manager
  public isFromManager(): boolean {
    return this.stage === 'manager_review';
  }

  // Helper method to get word count
  public getWordCount(): number {
    if (!this.comment) return 0;
    return this.comment.trim().split(/\s+/).length;
  }
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    appraisalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'appraisals',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'appraisal_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'user_id'
    },
    comment: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Comment cannot be empty'
        },
        len: {
          args: [10, 10000],
          msg: 'Comment must be between 10 and 10000 characters'
        }
      }
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'questions',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'question_id'
    },
    stage: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [['tech_lead_review', 'manager_review', 'developer_reply', 'returned', 'question_comment']],
          msg: 'Invalid comment stage'
        }
      }
    }
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['appraisal_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['question_id']
      },
      {
        fields: ['stage']
      },
      {
        fields: ['appraisal_id', 'stage']
      }
    ]
  }
);

export default Comment;
