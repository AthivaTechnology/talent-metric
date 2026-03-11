export type UserRole = 'admin' | 'manager' | 'tech_lead' | 'developer' | 'tester';

export type AppraisalStatus =
  | 'draft'
  | 'submitted'
  | 'tech_lead_review'
  | 'manager_review'
  | 'completed';

export type RatingCategory =
  | 'technical_skills'
  | 'code_quality'
  | 'ownership'
  | 'problem_solving'
  | 'communication'
  | 'testing_skills'
  | 'test_coverage'
  | 'technical_leadership'
  | 'team_management'
  | 'team_leadership'
  | 'people_development'
  | 'strategic_thinking';

export interface RatingCategoryConfig {
  key: RatingCategory;
  label: string;
  desc: string;
}

export const ROLE_RATING_CONFIGS: Record<string, RatingCategoryConfig[]> = {
  developer: [
    { key: 'technical_skills', label: 'Technical Skills', desc: 'Proficiency in relevant technologies' },
    { key: 'code_quality', label: 'Code Quality', desc: 'Clean, maintainable, well-tested code' },
    { key: 'ownership', label: 'Ownership', desc: 'Takes responsibility and drives outcomes' },
    { key: 'problem_solving', label: 'Problem Solving', desc: 'Analytical thinking and creativity' },
    { key: 'communication', label: 'Communication', desc: 'Clear, concise, collaborative communication' }
  ],
  tester: [
    { key: 'testing_skills', label: 'Testing Skills', desc: 'Proficiency in testing methodologies and tools' },
    { key: 'test_coverage', label: 'Test Coverage & Quality', desc: 'Thoroughness and quality of test suites' },
    { key: 'ownership', label: 'Ownership', desc: 'Takes responsibility for product quality' },
    { key: 'problem_solving', label: 'Problem Solving', desc: 'Analytical thinking in defect investigation' },
    { key: 'communication', label: 'Communication', desc: 'Clear bug reporting and team collaboration' }
  ],
  tech_lead: [
    { key: 'technical_leadership', label: 'Technical Leadership', desc: 'Guiding technical direction and standards' },
    { key: 'team_management', label: 'Team Management', desc: 'Enabling team delivery and unblocking' },
    { key: 'ownership', label: 'Ownership', desc: 'Taking responsibility for team outcomes' },
    { key: 'problem_solving', label: 'Problem Solving', desc: 'Solving complex technical and team challenges' },
    { key: 'communication', label: 'Communication', desc: 'Communicating across stakeholders effectively' }
  ],
  manager: [
    { key: 'team_leadership', label: 'Team Leadership', desc: 'Inspiring and developing the team' },
    { key: 'people_development', label: 'People Development', desc: 'Growing team members\' skills and careers' },
    { key: 'strategic_thinking', label: 'Strategic Thinking', desc: 'Planning and aligning with business goals' },
    { key: 'problem_solving', label: 'Problem Solving', desc: 'Resolving conflicts and organizational challenges' },
    { key: 'communication', label: 'Communication', desc: 'Stakeholder management and team communication' }
  ]
};

export function getRatingConfig(role?: string): RatingCategoryConfig[] {
  return ROLE_RATING_CONFIGS[role ?? 'developer'] ?? ROLE_RATING_CONFIGS['developer'];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  techLeadId?: number | null;
  managerId?: number | null;
  techLead?: Pick<User, 'id' | 'name' | 'email'>;
  manager?: Pick<User, 'id' | 'name' | 'email'>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  questionText: string;
  section: string;
  sectionTitle?: string;
  order: number;
}

export interface QuestionSection {
  section: string;
  sectionTitle: string;
  questions: Question[];
}

export interface Response {
  questionId: string | number;
  answer: string;
  question?: Question;
}

export type RaterRole = 'self' | 'tech_lead' | 'manager';

export interface Rating {
  category: RatingCategory;
  rating: number; // 1-5
  raterRole?: RaterRole;
}

export interface Comment {
  id: string;
  appraisalId: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'role'>;
  comment: string;
  createdAt: string;
}

export interface Appraisal {
  id: string;
  userId: string;
  user?: User;
  year: number;
  status: AppraisalStatus;
  deadline?: string;
  responses: Response[];
  ratings: Rating[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  currentYear?: number;
  // admin
  totalUsers?: number;
  totalDevelopers?: number;
  totalTechLeads?: number;
  totalManagers?: number;
  totalAppraisals?: number;
  draftAppraisals?: number;
  submittedAppraisals?: number;
  techLeadReviewAppraisals?: number;
  managerReviewAppraisals?: number;
  completedAppraisals?: number;
  approachingDeadlines?: number;
  overdueAppraisals?: number;
  // manager
  totalReportees?: number;
  pendingReviews?: number;
  // tech_lead
  totalTeamMembers?: number;
  // developer
  hasActiveAppraisal?: boolean;
  currentStatus?: string;
  deadline?: string;
  isOverdue?: boolean;
  progress?: number;
}

export type TeamAppraisal = Appraisal;

export interface AnalyticsData {
  averageRatings: Array<{ category: string; average: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  techLeadId?: number | string;
  managerId?: number | string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  techLeadId?: number | string;
  managerId?: number | string;
}

export interface CreateAppraisalPayload {
  userId: number | string;
  year: number;
  deadline?: string;
}

export interface UpdateAppraisalPayload {
  responses?: Array<{ questionId: string; answer: string }>;
  ratings?: Array<{ category: RatingCategory; rating: number }>;
  deadline?: string;
}
