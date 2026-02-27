import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { RATING_CATEGORIES, RatingCategory } from '../config/constants';

interface RatingAttributes {
  id: number;
  appraisalId: number;
  category: RatingCategory;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RatingCreationAttributes extends Optional<RatingAttributes, 'id'> {}

class Rating extends Model<RatingAttributes, RatingCreationAttributes> implements RatingAttributes {
  public id!: number;
  public appraisalId!: number;
  public category!: RatingCategory;
  public rating!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper method to get rating as percentage
  public getPercentage(): number {
    return (this.rating / 5) * 100;
  }

  // Helper method to get rating label
  public getRatingLabel(): string {
    const labels: Record<number, string> = {
      1: 'Needs Improvement',
      2: 'Below Expectations',
      3: 'Meets Expectations',
      4: 'Exceeds Expectations',
      5: 'Outstanding'
    };
    return labels[this.rating] || 'Unknown';
  }
}

Rating.init(
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
    category: {
      type: DataTypes.ENUM(...RATING_CATEGORIES),
      allowNull: false,
      validate: {
        isIn: {
          args: [RATING_CATEGORIES],
          msg: 'Invalid rating category'
        }
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Rating must be at least 1'
        },
        max: {
          args: [5],
          msg: 'Rating must be at most 5'
        },
        isInt: {
          msg: 'Rating must be an integer'
        }
      }
    }
  },
  {
    sequelize,
    tableName: 'ratings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['appraisal_id', 'category'],
        name: 'unique_appraisal_category'
      },
      {
        fields: ['appraisal_id']
      },
      {
        fields: ['category']
      },
      {
        fields: ['rating']
      }
    ]
  }
);

export default Rating;
