export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECH_LEAD: 'tech_lead',
  DEVELOPER: 'developer'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const APPRAISAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  TECH_LEAD_REVIEW: 'tech_lead_review',
  MANAGER_REVIEW: 'manager_review',
  COMPLETED: 'completed'
} as const;

export type AppraisalStatus = typeof APPRAISAL_STATUS[keyof typeof APPRAISAL_STATUS];

export const RATING_CATEGORIES = [
  'technical_skills',
  'code_quality',
  'ownership',
  'problem_solving',
  'communication'
] as const;

export type RatingCategory = typeof RATING_CATEGORIES[number];

export const RATING_LABELS: Record<RatingCategory, string> = {
  technical_skills: 'Technical Skills',
  code_quality: 'Code Quality',
  ownership: 'Ownership',
  problem_solving: 'Problem Solving',
  communication: 'Communication'
};

export interface QuestionSection {
  section: number;
  sectionTitle: string;
  emoji: string;
  questions: string[];
}

export const QUESTIONS: QuestionSection[] = [
  {
    section: 1,
    sectionTitle: 'Achievements & Impact',
    emoji: '🧠',
    questions: [
      'What were your top 3 contributions this review period?',
      'Which feature/task are you most proud of? Why?',
      'What measurable impact did your work have? (Performance, bugs reduced, revenue, UX improvement, etc.)',
      'Which task challenged you the most? How did you handle it?',
      'Did you complete all committed tasks on time? If not, why?'
    ]
  },
  {
    section: 2,
    sectionTitle: 'Technical Skills',
    emoji: '🔧',
    questions: [
      'What new technical skills did you learn during this period?',
      'What technical area did you improve the most?',
      'What technical area do you feel least confident in?',
      'How do you usually debug issues?',
      'Give an example where you solved a technical problem independently.'
    ]
  },
  {
    section: 3,
    sectionTitle: 'Code Quality & Engineering Practices',
    emoji: '🧼',
    questions: [
      'How do you ensure your code is clean and maintainable?',
      'How do you handle code reviews and feedback?',
      'Have you improved any existing code or refactored something? Explain.',
      'What engineering practice do you think you need to improve? (Testing, architecture, naming, performance, etc.)'
    ]
  },
  {
    section: 4,
    sectionTitle: 'Ownership & Responsibility',
    emoji: '🚀',
    questions: [
      'Give an example where you took ownership beyond your assigned task.',
      'How do you handle blockers?',
      'Have you ever missed a deadline? What did you learn?',
      'How do you estimate your tasks?'
    ]
  },
  {
    section: 5,
    sectionTitle: 'Problem Solving & Learning',
    emoji: '🧩',
    questions: [
      'When stuck, what steps do you take before asking for help?',
      'What was the hardest bug you fixed? How did you approach it?',
      'How do you stay updated with new technologies?',
      'What technical topic did you self-learn recently?'
    ]
  },
  {
    section: 6,
    sectionTitle: 'Communication & Teamwork',
    emoji: '💬',
    questions: [
      'How do you communicate progress on tasks?',
      'How do you handle disagreements in code reviews?',
      'Have you helped any teammate? Explain.',
      'What feedback have you received from peers?'
    ]
  },
  {
    section: 7,
    sectionTitle: 'Growth & Future Goals',
    emoji: '📈',
    questions: [
      'What are 3 areas you want to improve in the next 6 months?',
      'What skills do you want to develop to move to the next level?',
      'What support do you need from the company?',
      'Where do you see yourself in 1 year?'
    ]
  }
];

export interface FlatQuestion {
  section: number;
  sectionTitle: string;
  questionText: string;
  order: number;
}

// Flatten questions for database seeding
export const FLAT_QUESTIONS: FlatQuestion[] = QUESTIONS.flatMap((sectionData) =>
  sectionData.questions.map((question, questionIndex) => ({
    section: sectionData.section,
    sectionTitle: sectionData.sectionTitle,
    questionText: question,
    order: questionIndex + 1
  }))
);

// Workflow progression mapping
export const WORKFLOW_TRANSITIONS: Record<AppraisalStatus, AppraisalStatus | null> = {
  [APPRAISAL_STATUS.DRAFT]: APPRAISAL_STATUS.SUBMITTED,
  [APPRAISAL_STATUS.SUBMITTED]: APPRAISAL_STATUS.TECH_LEAD_REVIEW,
  [APPRAISAL_STATUS.TECH_LEAD_REVIEW]: APPRAISAL_STATUS.MANAGER_REVIEW,
  [APPRAISAL_STATUS.MANAGER_REVIEW]: APPRAISAL_STATUS.COMPLETED,
  [APPRAISAL_STATUS.COMPLETED]: null
};

// Role permissions for status changes
export const STATUS_CHANGE_PERMISSIONS: Record<AppraisalStatus, UserRole[]> = {
  [APPRAISAL_STATUS.DRAFT]: [USER_ROLES.DEVELOPER],
  [APPRAISAL_STATUS.SUBMITTED]: [USER_ROLES.DEVELOPER],
  [APPRAISAL_STATUS.TECH_LEAD_REVIEW]: [USER_ROLES.TECH_LEAD],
  [APPRAISAL_STATUS.MANAGER_REVIEW]: [USER_ROLES.MANAGER],
  [APPRAISAL_STATUS.COMPLETED]: [USER_ROLES.MANAGER]
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  APPRAISAL_NOT_FOUND: 'Appraisal not found',
  DUPLICATE_EMAIL: 'Email already exists',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_RATING: 'Rating must be between 1 and 5',
  DEADLINE_PASSED: 'Appraisal deadline has passed',
  ALREADY_SUBMITTED: 'Appraisal already submitted',
  NOT_YOUR_APPRAISAL: 'You can only access your own appraisals',
  CANNOT_EDIT_SUBMITTED: 'Cannot edit submitted appraisal',
  INVALID_YEAR: 'Invalid year provided',
  APPRAISAL_ALREADY_EXISTS: 'Appraisal for this year already exists'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  APPRAISAL_CREATED: 'Appraisal created successfully',
  APPRAISAL_UPDATED: 'Appraisal updated successfully',
  APPRAISAL_SUBMITTED: 'Appraisal submitted successfully',
  COMMENT_ADDED: 'Comment added successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully'
} as const;

// Auto-save interval (milliseconds)
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;
