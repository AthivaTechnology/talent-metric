import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PeerFeedbackAttributes {
  id: number;
  appraisalId: number;
  giverId: number;
  didWell: string;
  canImprove: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PeerFeedbackCreationAttributes extends Optional<PeerFeedbackAttributes, 'id'> {}

class PeerFeedback extends Model<PeerFeedbackAttributes, PeerFeedbackCreationAttributes>
  implements PeerFeedbackAttributes {
  public id!: number;
  public appraisalId!: number;
  public giverId!: number;
  public didWell!: string;
  public canImprove!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PeerFeedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    appraisalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'appraisals', key: 'id' },
      onDelete: 'CASCADE',
      field: 'appraisal_id'
    },
    giverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
      field: 'giver_id'
    },
    didWell: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'did_well',
      validate: {
        notEmpty: { msg: 'Please fill in what they did well' },
        len: { args: [5, 5000], msg: 'Must be between 5 and 5000 characters' }
      }
    },
    canImprove: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'can_improve',
      validate: {
        notEmpty: { msg: 'Please fill in what they can improve' },
        len: { args: [5, 5000], msg: 'Must be between 5 and 5000 characters' }
      }
    }
  },
  {
    sequelize,
    tableName: 'peer_feedbacks',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['appraisal_id'] },
      { fields: ['giver_id'] },
      { unique: true, fields: ['appraisal_id', 'giver_id'] }
    ]
  }
);

export default PeerFeedback;
