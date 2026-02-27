export type UserRole = 'admin' | 'manager' | 'tech_lead' | 'developer';

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
  | 'communication';

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

export interface Rating {
  category: RatingCategory;
  rating: number; // 1-5
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
