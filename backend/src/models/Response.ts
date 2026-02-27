import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ResponseAttributes {
  id: number;
  appraisalId: number;
  questionId: number;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ResponseCreationAttributes extends Optional<ResponseAttributes, 'id'> {}

class Response extends Model<ResponseAttributes, ResponseCreationAttributes> implements ResponseAttributes {
  public id!: number;
  public appraisalId!: number;
  public questionId!: number;
  public answer!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to check if response is empty
  public isEmpty(): boolean {
    return !this.answer || this.answer.trim().length === 0;
  }

  // Helper method to get word count
  public getWordCount(): number {
    if (!this.answer) return 0;
    return this.answer.trim().split(/\s+/).length;
  }
}

Response.init(
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
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      },
      onDelete: 'CASCADE',
      field: 'question_id'
    },
    answer: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      defaultValue: ''
    }
  },
  {
    sequelize,
    tableName: 'responses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['appraisal_id', 'question_id'],
        name: 'unique_appraisal_question'
      },
      {
        fields: ['appraisal_id']
      },
      {
        fields: ['question_id']
      }
    ]
  }
);

export default Response;
