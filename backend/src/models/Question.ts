import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface QuestionAttributes {
  id: number;
  section: number;
  sectionTitle: string;
  questionText: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id'> {}

class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  public id!: number;
  public section!: number;
  public sectionTitle!: string;
  public questionText!: string;
  public order!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    section: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Section must be at least 1'
        },
        max: {
          args: [7],
          msg: 'Section must be at most 7'
        }
      }
    },
    sectionTitle: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'section_title',
      validate: {
        notEmpty: {
          msg: 'Section title cannot be empty'
        }
      }
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'question_text',
      validate: {
        notEmpty: {
          msg: 'Question text cannot be empty'
        }
      }
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Order must be at least 1'
        }
      }
    }
  },
  {
    sequelize,
    tableName: 'questions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['section', 'order'],
        name: 'section_order_index'
      },
      {
        fields: ['section']
      }
    ]
  }
);

export default Question;
