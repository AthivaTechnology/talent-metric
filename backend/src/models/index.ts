import User from './User';
import Appraisal from './Appraisal';
import Question from './Question';
import Response from './Response';
import Rating from './Rating';
import Comment from './Comment';
import PeerFeedback from './PeerFeedback';

// User -> Appraisal (One-to-Many)
User.hasMany(Appraisal, {
  foreignKey: 'userId',
  as: 'appraisals',
  onDelete: 'CASCADE'
});
Appraisal.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User -> Comment (One-to-Many)
User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Appraisal -> Response (One-to-Many)
Appraisal.hasMany(Response, {
  foreignKey: 'appraisalId',
  as: 'responses',
  onDelete: 'CASCADE'
});
Response.belongsTo(Appraisal, {
  foreignKey: 'appraisalId',
  as: 'appraisal'
});

// Appraisal -> Rating (One-to-Many)
Appraisal.hasMany(Rating, {
  foreignKey: 'appraisalId',
  as: 'ratings',
  onDelete: 'CASCADE'
});
Rating.belongsTo(Appraisal, {
  foreignKey: 'appraisalId',
  as: 'appraisal'
});

// Appraisal -> Comment (One-to-Many)
Appraisal.hasMany(Comment, {
  foreignKey: 'appraisalId',
  as: 'comments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Appraisal, {
  foreignKey: 'appraisalId',
  as: 'appraisal'
});

// Question -> Comment (One-to-Many)
Question.hasMany(Comment, {
  foreignKey: 'questionId',
  as: 'questionComments',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question'
});

// Question -> Response (One-to-Many)
Question.hasMany(Response, {
  foreignKey: 'questionId',
  as: 'responses',
  onDelete: 'CASCADE'
});
Response.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question'
});

// Appraisal -> PeerFeedback (One-to-Many)
Appraisal.hasMany(PeerFeedback, {
  foreignKey: 'appraisalId',
  as: 'peerFeedbacks',
  onDelete: 'CASCADE'
});
PeerFeedback.belongsTo(Appraisal, {
  foreignKey: 'appraisalId',
  as: 'appraisal'
});

// User -> PeerFeedback (giver)
User.hasMany(PeerFeedback, {
  foreignKey: 'giverId',
  as: 'givenFeedbacks',
  onDelete: 'CASCADE'
});
PeerFeedback.belongsTo(User, {
  foreignKey: 'giverId',
  as: 'giver'
});

// User -> User (Tech Lead relationship)
User.hasMany(User, {
  foreignKey: 'techLeadId',
  as: 'teamMembers',
  onDelete: 'SET NULL'
});
User.belongsTo(User, {
  foreignKey: 'techLeadId',
  as: 'techLead'
});

// User -> User (Manager relationship)
User.hasMany(User, {
  foreignKey: 'managerId',
  as: 'reportees',
  onDelete: 'SET NULL'
});
User.belongsTo(User, {
  foreignKey: 'managerId',
  as: 'manager'
});

export {
  User,
  Appraisal,
  Question,
  Response,
  Rating,
  Comment,
  PeerFeedback
};

export default {
  User,
  Appraisal,
  Question,
  Response,
  Rating,
  Comment,
  PeerFeedback
};
