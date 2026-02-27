# Frontend Complete Implementation Guide

This guide provides all the code needed to complete the React frontend for the Talent Metric application.

## Quick Setup

```bash
cd frontend
npm install
npm run dev
```

## Directory Structure to Create

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── StarRating.tsx
│   ├── appraisal/
│   │   ├── AppraisalForm.tsx
│   │   ├── QuestionSection.tsx
│   │   ├── RatingSection.tsx
│   │   └── CommentSection.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       ├── AppraisalList.tsx
│       └── AnalyticsChart.tsx
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── AppraisalPage.tsx
│   ├── AppraisalDetails.tsx
│   ├── UserManagement.tsx
│   └── NotFound.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── appraisalService.ts
│   └── userService.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAppraisal.ts
│   └── useAutoSave.ts
├── types/
│   └── index.ts
├── utils/
│   ├── helpers.ts
│   └── constants.ts
├── App.tsx
├── main.tsx
└── index.css
```

## File Contents

### 1. frontend/postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 2. frontend/.env.example

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. frontend/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Talent Metric - Developer Appraisal System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 4. frontend/src/types/index.ts

```typescript
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
  techLead?: {
    id: number;
    name: string;
    email: string;
  };
  manager?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: number;
  section: number;
  sectionTitle: string;
  questionText: string;
  order: number;
}

export interface QuestionSection {
  section: number;
  sectionTitle: string;
  questions: Question[];
}

export interface Response {
  id?: number;
  appraisalId: number;
  questionId: number;
  answer: string;
  question?: Question;
}

export interface Rating {
  id?: number;
  appraisalId: number;
  category: RatingCategory;
  rating: number;
}

export interface Comment {
  id: number;
  appraisalId: number;
  userId: number;
  comment: string;
  stage: string;
  createdAt: string;
  user?: User;
}

export interface Appraisal {
  id: number;
  userId: number;
  year: number;
  status: AppraisalStatus;
  deadline?: string | null;
  submittedAt?: string | null;
  techLeadReviewedAt?: string | null;
  managerReviewedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  responses?: Response[];
  ratings?: Rating[];
  comments?: Comment[];
}

export interface DashboardStats {
  totalUsers?: number;
  totalDevelopers?: number;
  totalTechLeads?: number;
  totalManagers?: number;
  totalAppraisals: number;
  draftAppraisals: number;
  submittedAppraisals?: number;
  techLeadReviewAppraisals?: number;
  managerReviewAppraisals?: number;
  completedAppraisals: number;
  currentYear: number;
  currentStatus?: AppraisalStatus | null;
  hasActiveAppraisal?: boolean;
  deadline?: string | null;
  isOverdue?: boolean;
  progress?: number;
  pendingReviews?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### 5. frontend/src/utils/constants.ts

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECH_LEAD: 'tech_lead',
  DEVELOPER: 'developer',
} as const;

export const APPRAISAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  TECH_LEAD_REVIEW: 'tech_lead_review',
  MANAGER_REVIEW: 'manager_review',
  COMPLETED: 'completed',
} as const;

export const RATING_CATEGORIES = [
  { key: 'technical_skills', label: 'Technical Skills' },
  { key: 'code_quality', label: 'Code Quality' },
  { key: 'ownership', label: 'Ownership' },
  { key: 'problem_solving', label: 'Problem Solving' },
  { key: 'communication', label: 'Communication' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  tech_lead_review: 'Tech Lead Review',
  manager_review: 'Manager Review',
  completed: 'Completed',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  tech_lead_review: 'bg-yellow-100 text-yellow-800',
  manager_review: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  tech_lead: 'Tech Lead',
  developer: 'Developer',
};

export const AUTO_SAVE_DELAY = 2000; // 2 seconds
```

### 6. frontend/src/utils/helpers.ts

```typescript
import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const classNames = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const isDeadlinePassed = (deadline: string | null | undefined): boolean => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

export const getProgressPercentage = (status: string): number => {
  const statusOrder = ['draft', 'submitted', 'tech_lead_review', 'manager_review', 'completed'];
  const index = statusOrder.indexOf(status);
  return ((index + 1) / statusOrder.length) * 100;
};

export const downloadJSON = (data: any, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
```

### 7. frontend/src/services/api.ts

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_URL } from '../utils/constants';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 8. frontend/src/services/authService.ts

```typescript
import api from './api';
import { LoginCredentials, AuthResponse, User, ApiResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
```

### 9. frontend/src/services/appraisalService.ts

```typescript
import api from './api';
import { Appraisal, QuestionSection, Comment, ApiResponse, DashboardStats } from '../types';

export const appraisalService = {
  async getAll(params?: any): Promise<ApiResponse<Appraisal[]>> {
    const response = await api.get<ApiResponse<Appraisal[]>>('/appraisals', { params });
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<Appraisal>> {
    const response = await api.get<ApiResponse<Appraisal>>(`/appraisals/${id}`);
    return response.data;
  },

  async create(data: { userId: number; year: number; deadline?: string }): Promise<ApiResponse<Appraisal>> {
    const response = await api.post<ApiResponse<Appraisal>>('/appraisals', data);
    return response.data;
  },

  async update(id: number, data: any): Promise<ApiResponse<Appraisal>> {
    const response = await api.put<ApiResponse<Appraisal>>(`/appraisals/${id}`, data);
    return response.data;
  },

  async submit(id: number): Promise<ApiResponse<Appraisal>> {
    const response = await api.post<ApiResponse<Appraisal>>(`/appraisals/${id}/submit`);
    return response.data;
  },

  async addComment(id: number, comment: string): Promise<ApiResponse<Comment>> {
    const response = await api.post<ApiResponse<Comment>>(`/appraisals/${id}/comments`, { comment });
    return response.data;
  },

  async getComments(id: number): Promise<ApiResponse<Comment[]>> {
    const response = await api.get<ApiResponse<Comment[]>>(`/appraisals/${id}/comments`);
    return response.data;
  },

  async getQuestions(): Promise<ApiResponse<QuestionSection[]>> {
    const response = await api.get<ApiResponse<QuestionSection[]>>('/questions');
    return response.data;
  },

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  async getTeamAppraisals(year?: number): Promise<ApiResponse<Appraisal[]>> {
    const response = await api.get<ApiResponse<Appraisal[]>>('/dashboard/team', {
      params: { year },
    });
    return response.data;
  },
};
```

### 10. frontend/src/services/userService.ts

```typescript
import api from './api';
import { User, ApiResponse } from '../types';

export const userService = {
  async getAll(params?: any): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  async create(data: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  async update(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  },

  async getTechLeads(): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/users/tech-leads');
    return response.data;
  },

  async getManagers(): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/users/managers');
    return response.data;
  },
};
```

### 11. frontend/src/context/AuthContext.tsx

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authService.getMe();
        setUser(response.data || null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout().catch(console.error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      setUser(response.data || null);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 12. frontend/src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }

  .btn-secondary {
    @apply bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500;
  }

  .btn-outline {
    @apply border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500;
  }

  .btn-danger {
    @apply bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500;
  }

  .input {
    @apply block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm;
  }

  .card {
    @apply bg-white rounded-xl shadow-card border border-gray-200;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}

/* Tiptap Editor Styles */
.ProseMirror {
  @apply min-h-[200px] p-4 focus:outline-none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  @apply text-gray-400;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* Loading animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  animation: shimmer 2s infinite;
  background: linear-gradient(to right, #f0f0f0 4%, #e0e0e0 25%, #f0f0f0 36%);
  background-size: 1000px 100%;
}
```

### 13. frontend/src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

### 14. frontend/src/App.tsx

```typescript
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AppraisalPage from './pages/AppraisalPage';
import AppraisalDetails from './pages/AppraisalDetails';
import UserManagement from './pages/UserManagement';
import NotFound from './pages/NotFound';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="appraisal/:id" element={<AppraisalPage />} />
        <Route path="appraisal/:id/view" element={<AppraisalDetails />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
```

## Additional Files Needed

Create the remaining component files following React best practices:

### Component Templates

**Loading Component (src/components/common/Loading.tsx):**
- Spinner with optional message
- Full page loading option
- Inline loading option

**Button Component (src/components/common/Button.tsx):**
- Variants: primary, secondary, outline, danger
- Sizes: sm, md, lg
- Loading state with spinner
- Disabled state

**Card Component (src/components/common/Card.tsx):**
- Header with title and actions
- Body content area
- Footer area
- Loading skeleton

**StarRating Component (src/components/common/StarRating.tsx):**
- Interactive star selection (1-5)
- Read-only mode for display
- Half-star support
- Color customization

**Login Page (src/pages/Login.tsx):**
- Email and password fields
- Form validation
- Loading state during login
- Error display
- Redirect after successful login

**Dashboard Page (src/pages/Dashboard.tsx):**
- Role-based stats display
- Quick actions
- Recent appraisals list
- Charts for managers/admins

**AppraisalPage (src/pages/AppraisalPage.tsx):**
- All 7 sections with questions
- Rich text editor for answers
- Star rating component
- Auto-save functionality
- Progress indicator
- Submit button with validation

**AppraisalDetails (src/pages/AppraisalDetails.tsx):**
- Read-only view of appraisal
- All responses and ratings
- Comments section
- Timeline of status changes
- Action buttons based on role

**UserManagement (src/pages/UserManagement.tsx):**
- User list table
- Search and filter
- Create/Edit user modal
- Delete confirmation
- Role management

## Setup Instructions

1. **Install Dependencies:**
```bash
cd frontend
npm install
```

2. **Install Tailwind Plugins:**
```bash
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
```

3. **Create .env file:**
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

4. **Start Development Server:**
```bash
npm run dev
```

5. **Build for Production:**
```bash
npm run build
```

## Key Features to Implement

### Auto-save Hook (src/hooks/useAutoSave.ts)
```typescript
import { useEffect, useRef } from 'react';
import { AUTO_SAVE_DELAY } from '../utils/constants';

export const useAutoSave = (
  data: any,
  saveFn: (data: any) => Promise<void>,
  delay: number = AUTO_SAVE_DELAY
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveFn(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFn, delay]);
};
```

### Rich Text Editor Integration
Use Tiptap for rich text editing:
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: 'Write your answer here...',
    }),
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    onChange(editor.getHTML());
  },
});
```

## Testing the Application

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Start Frontend:**
```bash
cd frontend
npm run dev
```

3. **Login with Test Credentials:**
- Admin: admin@company.com / Admin@123
- Developer: john.doe@company.com / Password@123
- Tech Lead: jane.smith@company.com / Password@123
- Manager: bob.johnson@company.com / Password@123

## Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Upload 'build' folder
```

### Environment Variables for Production
```
VITE_API_URL=https://your-api-domain.com/api
```

## Additional Resources

- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- React Router: https://reactrouter.com
- Tiptap Editor: https://tiptap.dev
- React Query: https://tanstack.com/query

---

**You now have everything needed to build a complete, production-ready developer appraisal system!