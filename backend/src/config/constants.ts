export const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  TECH_LEAD: 'tech_lead',
  DEVELOPER: 'developer',
  TESTER: 'tester',
  DEVOPS: 'devops'
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
  'communication',
  'testing_skills',
  'test_coverage',
  'technical_leadership',
  'team_management',
  'team_leadership',
  'people_development',
  'strategic_thinking',
  'infrastructure_skills',
  'automation_skills',
  'reliability'
] as const;

export type RatingCategory = typeof RATING_CATEGORIES[number];

export const RATING_LABELS: Record<RatingCategory, string> = {
  technical_skills: 'Technical Skills',
  code_quality: 'Code Quality',
  ownership: 'Ownership',
  problem_solving: 'Problem Solving',
  communication: 'Communication',
  testing_skills: 'Testing Skills',
  test_coverage: 'Test Coverage & Quality',
  technical_leadership: 'Technical Leadership',
  team_management: 'Team Management',
  team_leadership: 'Team Leadership',
  people_development: 'People Development',
  strategic_thinking: 'Strategic Thinking',
  infrastructure_skills: 'Infrastructure Skills',
  automation_skills: 'Automation & CI/CD',
  reliability: 'Reliability & Observability'
};

// Rating categories applicable to each role (5 per role)
export const ROLE_RATING_CATEGORIES: Record<string, RatingCategory[]> = {
  developer: ['technical_skills', 'code_quality', 'ownership', 'problem_solving', 'communication'],
  tester: ['testing_skills', 'test_coverage', 'ownership', 'problem_solving', 'communication'],
  tech_lead: ['technical_leadership', 'team_management', 'ownership', 'problem_solving', 'communication'],
  manager: ['team_leadership', 'people_development', 'strategic_thinking', 'problem_solving', 'communication'],
  devops: ['infrastructure_skills', 'automation_skills', 'reliability', 'problem_solving', 'communication']
};

export interface QuestionSection {
  section: number;
  sectionTitle: string;
  emoji: string;
  questions: string[];
}

const DEVELOPER_QUESTIONS: QuestionSection[] = [
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

const TESTER_QUESTIONS: QuestionSection[] = [
  {
    section: 1,
    sectionTitle: 'Achievements & Impact',
    emoji: '🧠',
    questions: [
      'What were your top 3 testing contributions this review period?',
      'Which feature or test suite are you most proud of? Why?',
      'What measurable quality impact did your testing have? (Bugs caught, regression coverage, release confidence, etc.)',
      'Which testing challenge was the hardest? How did you handle it?',
      'Did you complete all planned test activities on time? If not, why?'
    ]
  },
  {
    section: 2,
    sectionTitle: 'Testing Skills & Methodologies',
    emoji: '🔬',
    questions: [
      'What testing methodologies or frameworks did you use or learn this period?',
      'What type of testing (functional, regression, performance, security, etc.) did you improve in the most?',
      'What testing area do you feel least confident in?',
      'How do you approach exploratory testing?',
      'Give an example where your testing caught a critical issue before release.'
    ]
  },
  {
    section: 3,
    sectionTitle: 'Bug Reporting & Documentation',
    emoji: '📋',
    questions: [
      'How do you ensure your bug reports are clear and actionable?',
      'How do you prioritize which bugs to report and escalate?',
      'Have you improved any test documentation or test plans this period? Explain.',
      'What practice do you think you need to improve? (Test coverage, edge cases, automation, reporting, etc.)'
    ]
  },
  {
    section: 4,
    sectionTitle: 'Ownership & Responsibility',
    emoji: '🚀',
    questions: [
      'Give an example where you took ownership of quality beyond your assigned tests.',
      'How do you handle blockers in your testing workflow?',
      'Have you ever missed a testing deadline? What did you learn?',
      'How do you estimate the effort for a testing task?'
    ]
  },
  {
    section: 5,
    sectionTitle: 'Problem Solving & Learning',
    emoji: '🧩',
    questions: [
      'When you find a hard-to-reproduce bug, what steps do you take?',
      'What was the most complex defect you investigated? How did you approach it?',
      'How do you stay updated with new testing tools and techniques?',
      'What testing topic did you self-learn recently?'
    ]
  },
  {
    section: 6,
    sectionTitle: 'Communication & Teamwork',
    emoji: '💬',
    questions: [
      'How do you communicate testing progress and quality risks to the team?',
      'How do you handle disagreements with developers about bug severity?',
      'Have you helped any teammate with testing or quality? Explain.',
      'What feedback have you received from peers regarding your testing work?'
    ]
  },
  {
    section: 7,
    sectionTitle: 'Growth & Future Goals',
    emoji: '📈',
    questions: [
      'What are 3 testing areas you want to improve in the next 6 months?',
      'What testing skills do you want to develop to move to the next level?',
      'What support do you need from the company?',
      'Where do you see yourself as a quality professional in 1 year?'
    ]
  }
];

const TECH_LEAD_QUESTIONS: QuestionSection[] = [
  {
    section: 1,
    sectionTitle: 'Achievements & Leadership Impact',
    emoji: '🧠',
    questions: [
      'What were your top 3 achievements as a tech lead this review period?',
      'Which technical decision or architectural choice are you most proud of? Why?',
      'What measurable impact did your leadership have on the team? (Velocity, quality, team growth, etc.)',
      'What was the biggest technical challenge you faced? How did you resolve it?',
      'Did your team meet its committed deliverables this period? If not, what happened and what did you learn?'
    ]
  },
  {
    section: 2,
    sectionTitle: 'Technical Leadership & Mentorship',
    emoji: '👨‍🏫',
    questions: [
      'How did you contribute to the technical growth of your team members?',
      'Give examples of how you mentored or coached someone on your team.',
      'How do you ensure technical standards and best practices are followed?',
      'What technical skill or area did you help your team improve in most this period?'
    ]
  },
  {
    section: 3,
    sectionTitle: 'Code Review & Architecture',
    emoji: '🏗️',
    questions: [
      'How do you approach code reviews to ensure quality without slowing the team?',
      'Describe a significant architectural decision you made or contributed to this period.',
      'How do you handle technical debt in your team\'s codebase?',
      'What engineering practice improvement have you driven this period?'
    ]
  },
  {
    section: 4,
    sectionTitle: 'Team Management & Delivery',
    emoji: '🚀',
    questions: [
      'How do you handle competing priorities and deadlines for your team?',
      'Give an example of how you unblocked a team member or resolved a team impediment.',
      'How do you track and manage technical risks in your projects?',
      'How do you balance your own technical work with leadership responsibilities?'
    ]
  },
  {
    section: 5,
    sectionTitle: 'Communication & Stakeholder Management',
    emoji: '💬',
    questions: [
      'How do you communicate technical decisions and trade-offs to non-technical stakeholders?',
      'How do you handle disagreements within your team or with other teams?',
      'How do you keep your team aligned with broader product and engineering goals?',
      'What feedback have you received from your team or manager about your leadership?'
    ]
  },
  {
    section: 6,
    sectionTitle: 'Problem Solving & Innovation',
    emoji: '🧩',
    questions: [
      'Describe the most complex technical problem you solved as a tech lead this period.',
      'Have you introduced any new tools, processes, or practices to improve the team\'s workflow?',
      'How do you approach cross-team technical dependencies and integrations?',
      'How do you stay current with technology trends relevant to your team\'s work?'
    ]
  },
  {
    section: 7,
    sectionTitle: 'Growth & Future Goals',
    emoji: '📈',
    questions: [
      'What are 3 areas of technical leadership you want to grow in over the next 6 months?',
      'What skills or knowledge do you want to develop to be a more effective tech lead?',
      'What support do you need from your manager or the organization?',
      'Where do you see yourself as an engineering leader in 1 year?'
    ]
  }
];

const MANAGER_QUESTIONS: QuestionSection[] = [
  {
    section: 1,
    sectionTitle: 'Achievements & Impact',
    emoji: '🧠',
    questions: [
      'What were your top 3 achievements as a manager this review period?',
      'Which team outcome or initiative are you most proud of? Why?',
      'What measurable business or team impact did your management have this period?',
      'What was the biggest challenge you faced as a manager? How did you handle it?',
      'Did your team meet its goals and commitments this period? If not, what happened and what did you learn?'
    ]
  },
  {
    section: 2,
    sectionTitle: 'Team Leadership & People Development',
    emoji: '👥',
    questions: [
      'How did you develop the skills and capabilities of your team members this period?',
      'Give examples of feedback or coaching conversations that had a positive impact.',
      'How do you handle underperformance or team conflicts?',
      'What changes have you made to improve team morale and engagement?'
    ]
  },
  {
    section: 3,
    sectionTitle: 'Strategic Planning & Delivery',
    emoji: '🗺️',
    questions: [
      'How do you align your team\'s goals with the company\'s strategic objectives?',
      'Describe a significant initiative or project you planned and executed this period.',
      'How do you manage competing priorities across your team?',
      'What risks did you identify and mitigate in your team\'s delivery this period?'
    ]
  },
  {
    section: 4,
    sectionTitle: 'Stakeholder Management & Communication',
    emoji: '💬',
    questions: [
      'How do you manage communication with cross-functional stakeholders?',
      'How do you handle conflicting requirements or expectations from different stakeholders?',
      'How do you communicate team progress and challenges upward to senior leadership?',
      'What feedback have you received from your team and peers about your communication?'
    ]
  },
  {
    section: 5,
    sectionTitle: 'Process Improvement & Innovation',
    emoji: '⚙️',
    questions: [
      'What processes or workflows have you improved this period?',
      'How do you foster a culture of innovation and continuous improvement in your team?',
      'Have you introduced any new tools or practices that improved team effectiveness?',
      'How do you measure and track your team\'s performance and health?'
    ]
  },
  {
    section: 6,
    sectionTitle: 'Hiring & Organizational Growth',
    emoji: '🌱',
    questions: [
      'Were you involved in hiring or team expansion this period? Share your approach.',
      'How do you identify and develop high-potential team members?',
      'What steps have you taken to build a diverse and inclusive team environment?',
      'How do you ensure knowledge sharing and avoid key-person dependencies?'
    ]
  },
  {
    section: 7,
    sectionTitle: 'Growth & Future Goals',
    emoji: '📈',
    questions: [
      'What are 3 areas of management and leadership you want to grow in over the next 6 months?',
      'What skills do you want to develop to be a more effective manager?',
      'What support do you need from senior leadership or the organization?',
      'Where do you see yourself as a manager in 1 year?'
    ]
  }
];

const DEVOPS_QUESTIONS: QuestionSection[] = [
  {
    section: 1,
    sectionTitle: 'Achievements & Impact',
    emoji: '🧠',
    questions: [
      'What were your top 3 DevOps/infrastructure contributions this review period?',
      'Which infrastructure improvement or automation are you most proud of? Why?',
      'What measurable impact did your work have? (Uptime, deployment frequency, MTTR, cost savings, etc.)',
      'What was the biggest operational challenge you faced? How did you resolve it?',
      'Did you complete all committed infrastructure or platform tasks on time? If not, why?'
    ]
  },
  {
    section: 2,
    sectionTitle: 'Infrastructure & Cloud Skills',
    emoji: '☁️',
    questions: [
      'What cloud platforms, tools, or infrastructure technologies did you work with or learn this period?',
      'What area of infrastructure (networking, compute, storage, security, etc.) did you improve in most?',
      'What infrastructure area do you feel least confident in?',
      'How do you approach infrastructure-as-code and configuration management?',
      'Give an example where you improved the scalability or reliability of a system.'
    ]
  },
  {
    section: 3,
    sectionTitle: 'CI/CD & Automation',
    emoji: '⚙️',
    questions: [
      'What CI/CD pipelines or automation workflows did you build or improve this period?',
      'How do you ensure deployments are safe, repeatable, and rollback-friendly?',
      'Have you reduced manual toil through automation? Explain.',
      'What engineering practice do you think you need to improve? (Pipeline design, monitoring, security, etc.)'
    ]
  },
  {
    section: 4,
    sectionTitle: 'Reliability & Observability',
    emoji: '📡',
    questions: [
      'How do you ensure the reliability and availability of the systems you manage?',
      'What monitoring, alerting, or observability improvements did you make this period?',
      'Describe an incident you handled. How did you detect, resolve, and post-mortem it?',
      'How do you balance speed of delivery with system stability?'
    ]
  },
  {
    section: 5,
    sectionTitle: 'Problem Solving & Learning',
    emoji: '🧩',
    questions: [
      'When facing a production incident, what steps do you take before escalating?',
      'What was the most complex infrastructure problem you solved? How did you approach it?',
      'How do you stay updated with new DevOps tools and cloud services?',
      'What technology or practice did you self-learn recently?'
    ]
  },
  {
    section: 6,
    sectionTitle: 'Communication & Collaboration',
    emoji: '💬',
    questions: [
      'How do you communicate infrastructure changes and risks to development teams?',
      'How do you handle disagreements about architecture or tooling choices?',
      'Have you helped a teammate with infrastructure or platform issues? Explain.',
      'What feedback have you received from peers or developers about your DevOps support?'
    ]
  },
  {
    section: 7,
    sectionTitle: 'Growth & Future Goals',
    emoji: '📈',
    questions: [
      'What are 3 DevOps or infrastructure areas you want to improve in the next 6 months?',
      'What skills do you want to develop to move to the next level?',
      'What support do you need from the company?',
      'Where do you see yourself as a DevOps/platform engineer in 1 year?'
    ]
  }
];

export const ROLE_QUESTIONS: Record<string, QuestionSection[]> = {
  developer: DEVELOPER_QUESTIONS,
  tester: TESTER_QUESTIONS,
  tech_lead: TECH_LEAD_QUESTIONS,
  manager: MANAGER_QUESTIONS,
  devops: DEVOPS_QUESTIONS
};

// Keep for backwards compatibility
export const QUESTIONS = DEVELOPER_QUESTIONS;

export interface FlatQuestion {
  section: number;
  sectionTitle: string;
  questionText: string;
  order: number;
  applicableRole: string;
}

// All questions across all roles with their applicable role tag
export const ALL_FLAT_QUESTIONS: FlatQuestion[] = Object.entries(ROLE_QUESTIONS).flatMap(
  ([role, sections]) =>
    sections.flatMap((sectionData) =>
      sectionData.questions.map((question, questionIndex) => ({
        section: sectionData.section,
        sectionTitle: sectionData.sectionTitle,
        questionText: question,
        order: questionIndex + 1,
        applicableRole: role
      }))
    )
);

// Workflow progression mapping
export const WORKFLOW_TRANSITIONS: Record<AppraisalStatus, AppraisalStatus | null> = {
  [APPRAISAL_STATUS.DRAFT]: APPRAISAL_STATUS.TECH_LEAD_REVIEW,
  [APPRAISAL_STATUS.SUBMITTED]: APPRAISAL_STATUS.TECH_LEAD_REVIEW, // legacy — auto-migrated to tech_lead_review on startup
  [APPRAISAL_STATUS.TECH_LEAD_REVIEW]: APPRAISAL_STATUS.MANAGER_REVIEW,
  [APPRAISAL_STATUS.MANAGER_REVIEW]: APPRAISAL_STATUS.COMPLETED,
  [APPRAISAL_STATUS.COMPLETED]: null
};

// Role permissions for status changes
export const STATUS_CHANGE_PERMISSIONS: Record<AppraisalStatus, UserRole[]> = {
  [APPRAISAL_STATUS.DRAFT]: [USER_ROLES.DEVELOPER, USER_ROLES.TESTER, USER_ROLES.DEVOPS, USER_ROLES.TECH_LEAD, USER_ROLES.MANAGER],
  [APPRAISAL_STATUS.SUBMITTED]: [USER_ROLES.DEVELOPER, USER_ROLES.TESTER, USER_ROLES.DEVOPS, USER_ROLES.TECH_LEAD, USER_ROLES.MANAGER],
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
