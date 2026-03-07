import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface QuestionAttributes {
  id: number;
  section: number;
  sectionTitle: string;
  questionText: string;
  order: number;
  applicableRole: string;
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
  public applicableRole!: string;

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
    },
    applicableRole: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'developer',
      field: 'applicable_role'
    }
  },
  {
    sequelize,
    tableName: 'questions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['applicable_role', 'section', 'order'],
        name: 'role_section_order_index'
      },
      {
        fields: ['applicable_role']
      }
    ]
  }
);

export default Question;
