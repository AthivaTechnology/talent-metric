import User from './User';
import Appraisal from './Appraisal';
import Question from './Question';
import Response from './Response';
import Rating from './Rating';
import Comment from './Comment';

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
  Comment
};

export default {
  User,
  Appraisal,
  Question,
  Response,
  Rating,
  Comment
};
