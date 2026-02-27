# Talent Metric - Developer Appraisal System

## 📊 Project Overview

A comprehensive full-stack web application for conducting annual developer performance appraisals with a multi-stage review workflow. Built with modern technologies and designed for scalability.

## 🎯 Key Features

### Multi-Role Support
- **Developers**: Self-assessment with 7 comprehensive sections
- **Tech Leads**: Team review and feedback
- **Managers**: Final approval and team analytics
- **Admins**: Complete system management

### Core Functionality
- ✅ **29 Thoughtful Questions** across 7 evaluation sections
- ⭐ **5 Rating Categories** with 1-5 star ratings
- 🔄 **Multi-Stage Workflow**: Draft → Tech Lead → Manager → Complete
- 💾 **Auto-Save**: Changes saved automatically every 2 seconds
- 📝 **Rich Text Editor**: Format responses with bold, lists, and more
- 💬 **Review Comments**: Detailed feedback from reviewers
- 📊 **Analytics Dashboard**: Insights and team performance metrics
- 🔐 **Secure Authentication**: JWT-based auth with role-based access
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8+ with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, Bcrypt
- **Validation**: Express Validator

### Frontend Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query
- **Forms**: React Hook Form
- **Rich Text**: Tiptap Editor
- **Charts**: Recharts
- **Notifications**: React Hot Toast

### Database Schema
```
users
├── id (PK)
├── name
├── email (unique)
├── password (hashed)
├── role (admin/manager/tech_lead/developer)
├── tech_lead_id (FK)
├── manager_id (FK)
└── timestamps

appraisals
├── id (PK)
├── user_id (FK)
├── year
├── status (enum)
├── deadline
├── submitted_at
├── tech_lead_reviewed_at
├── manager_reviewed_at
├── completed_at
└── timestamps

questions
├── id (PK)
├── section (1-7)
├── section_title
├── question_text
├── order
└── timestamps

responses
├── id (PK)
├── appraisal_id (FK)
├── question_id (FK)
├── answer (text)
└── timestamps

ratings
├── id (PK)
├── appraisal_id (FK)
├── category (enum)
├── rating (1-5)
└── timestamps

comments
├── id (PK)
├── appraisal_id (FK)
├── user_id (FK)
├── comment (text)
├── stage
└── timestamps
```

## 📋 Appraisal Sections

### Section 1: Achievements & Impact 🧠
- Top 3 contributions
- Most proud achievement
- Measurable impact
- Challenging tasks
- Task completion rate

### Section 2: Technical Skills 🔧
- New skills learned
- Areas of improvement
- Areas needing growth
- Debugging approach
- Independent problem solving

### Section 3: Code Quality & Engineering Practices 🧼
- Code maintainability
- Handling code reviews
- Refactoring examples
- Engineering practices to improve

### Section 4: Ownership & Responsibility 🚀
- Taking ownership examples
- Handling blockers
- Learning from missed deadlines
- Task estimation

### Section 5: Problem Solving & Learning 🧩
- Problem-solving process
- Hardest bug fixed
- Staying updated with tech
- Recent self-learning

### Section 6: Communication & Teamwork 💬
- Progress communication
- Handling disagreements
- Helping teammates
- Peer feedback

### Section 7: Growth & Future Goals 📈
- Improvement areas (6 months)
- Skills to develop
- Support needed
- Career vision (1 year)

### Self-Rating Categories ⭐
1. Technical Skills
2. Code Quality
3. Ownership
4. Problem Solving
5. Communication

## 🔄 Workflow Process

```
1. DRAFT
   └─> Developer fills out self-assessment
   └─> Auto-save enabled
   └─> Can save and continue later

2. SUBMITTED
   └─> Developer submits to Tech Lead
   └─> No longer editable by Developer

3. TECH_LEAD_REVIEW
   └─> Tech Lead reviews and adds comments
   └─> Tech Lead forwards to Manager

4. MANAGER_REVIEW
   └─> Manager performs final review
   └─> Manager adds final comments
   └─> Manager marks as complete

5. COMPLETED
   └─> Appraisal is finalized
   └─> Available for viewing and reports
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation (5 minutes)

```bash
# 1. Start Database (Docker)
docker-compose up -d

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev

# 3. Setup Frontend (new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Default Credentials
```
Admin:
  Email: admin@company.com
  Password: Admin@123

Developer:
  Email: john.doe@company.com
  Password: Password@123

Tech Lead:
  Email: jane.smith@company.com
  Password: Password@123

Manager:
  Email: bob.johnson@company.com
  Password: Password@123
```

## 📁 Project Structure

```
talent-metric/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts           # Database configuration
│   │   │   └── constants.ts          # App constants & questions
│   │   ├── models/
│   │   │   ├── index.ts              # Model associations
│   │   │   ├── User.ts               # User model
│   │   │   ├── Appraisal.ts          # Appraisal model
│   │   │   ├── Question.ts           # Question model
│   │   │   ├── Response.ts           # Response model
│   │   │   ├── Rating.ts             # Rating model
│   │   │   └── Comment.ts            # Comment model
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Authentication logic
│   │   │   ├── userController.ts     # User management
│   │   │   ├── appraisalController.ts # Appraisal CRUD
│   │   │   ├── dashboardController.ts # Analytics
│   │   │   └── questionController.ts  # Questions API
│   │   ├── routes/
│   │   │   ├── authRoutes.ts         # Auth endpoints
│   │   │   ├── userRoutes.ts         # User endpoints
│   │   │   ├── appraisalRoutes.ts    # Appraisal endpoints
│   │   │   ├── dashboardRoutes.ts    # Dashboard endpoints
│   │   │   └── questionRoutes.ts     # Question endpoints
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT authentication
│   │   │   └── errorHandler.ts       # Error handling
│   │   ├── services/
│   │   │   └── appraisalService.ts   # Business logic
│   │   ├── utils/
│   │   │   └── jwt.ts                # JWT utilities
│   │   ├── seeders/
│   │   │   └── seed.ts               # Database seeder
│   │   └── server.ts                 # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # Layout components
│   │   │   ├── common/               # Reusable components
│   │   │   ├── appraisal/            # Appraisal components
│   │   │   └── dashboard/            # Dashboard components
│   │   ├── pages/
│   │   │   ├── Login.tsx             # Login page
│   │   │   ├── Dashboard.tsx         # Dashboard page
│   │   │   ├── AppraisalPage.tsx     # Appraisal form
│   │   │   ├── AppraisalDetails.tsx  # View appraisal
│   │   │   ├── UserManagement.tsx    # User admin
│   │   │   └── NotFound.tsx          # 404 page
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Auth context
│   │   ├── services/
│   │   │   ├── api.ts                # Axios instance
│   │   │   ├── authService.ts        # Auth API
│   │   │   ├── appraisalService.ts   # Appraisal API
│   │   │   └── userService.ts        # User API
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            # Auth hook
│   │   │   ├── useAppraisal.ts       # Appraisal hook
│   │   │   └── useAutoSave.ts        # Auto-save hook
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript types
│   │   ├── utils/
│   │   │   ├── helpers.ts            # Helper functions
│   │   │   └── constants.ts          # Constants
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── docker-compose.yml                # Docker MySQL setup
├── README.md                         # Main documentation
├── QUICK_START.md                    # Quick setup guide
├── FRONTEND_COMPLETE_GUIDE.md        # Frontend guide
├── PROJECT_SUMMARY.md                # This file
└── setup.sh                          # Automated setup script
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Granular permissions
- **SQL Injection Prevention**: Sequelize ORM parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: API abuse prevention
- **Helmet.js**: Security headers
- **Environment Variables**: Sensitive data protection

## 📊 API Endpoints Summary

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Users (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/tech-leads` - List tech leads
- `GET /api/users/managers` - List managers

### Appraisals
- `GET /api/appraisals` - List appraisals
- `POST /api/appraisals` - Create appraisal
- `GET /api/appraisals/:id` - Get appraisal
- `PUT /api/appraisals/:id` - Update appraisal
- `POST /api/appraisals/:id/submit` - Submit to next stage
- `GET /api/appraisals/:id/comments` - Get comments
- `POST /api/appraisals/:id/comments` - Add comment
- `DELETE /api/appraisals/:id` - Delete appraisal

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/team` - Get team appraisals
- `GET /api/dashboard/analytics` - Get team analytics

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/section/:section` - Get by section
- `GET /api/questions/:id` - Get single question

## 🎨 UI/UX Features

- **Clean Modern Design**: Tailwind CSS with custom color scheme
- **Responsive Layout**: Mobile-first design approach
- **Loading States**: Skeleton screens and spinners
- **Toast Notifications**: Success, error, and info messages
- **Form Validation**: Real-time validation feedback
- **Progress Indicators**: Visual workflow progress
- **Status Badges**: Color-coded status indicators
- **Rich Text Editing**: Formatting toolbar for answers
- **Star Rating Component**: Interactive 1-5 star selection
- **Dark Mode Ready**: Foundation for dark theme
- **Accessibility**: ARIA labels and keyboard navigation

## 📈 Performance Optimizations

- **Code Splitting**: Dynamic imports for routes
- **Lazy Loading**: Components loaded on demand
- **React Query Caching**: Efficient data fetching
- **Auto-save Debouncing**: Prevents excessive API calls
- **Optimistic Updates**: Instant UI feedback
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections
- **Compression**: Gzip response compression

## 🧪 Testing Scenarios

### Developer Flow
1. Login as developer
2. Create new appraisal
3. Fill all 7 sections
4. Add self-ratings
5. Auto-save verification
6. Submit appraisal

### Tech Lead Flow
1. Login as tech lead
2. View team appraisals
3. Open pending review
4. Read responses
5. Add feedback comments
6. Forward to manager

### Manager Flow
1. Login as manager
2. View team dashboard
3. Check analytics
4. Review appraisal
5. Add final comments
6. Complete appraisal

### Admin Flow
1. Login as admin
2. Create new users
3. Assign tech leads/managers
4. View all appraisals
5. Access system statistics

## 🚢 Deployment Options

### Backend Deployment
- **AWS EC2**: Traditional server deployment
- **AWS Elastic Beanstalk**: Managed deployment
- **Heroku**: Quick deployment
- **DigitalOcean**: Droplet deployment
- **Docker**: Containerized deployment

### Frontend Deployment
- **Vercel**: Optimized for React/Vite
- **Netlify**: Easy static deployment
- **AWS S3 + CloudFront**: Scalable CDN
- **GitHub Pages**: Free hosting

### Database Hosting
- **AWS RDS**: Managed MySQL
- **Google Cloud SQL**: Managed database
- **DigitalOcean Managed DB**: Affordable option
- **Self-hosted**: Docker MySQL

## 📚 Documentation Files

1. **README.md** - Main project documentation
2. **QUICK_START.md** - Quick setup guide (this file)
3. **FRONTEND_COMPLETE_GUIDE.md** - Complete frontend implementation
4. **backend/README.md** - Backend API documentation
5. **PROJECT_SUMMARY.md** - Project overview

## 🔧 Development Commands

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run seed     # Seed database
npm run lint     # Lint code
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## 🐛 Common Issues & Solutions

### Database Connection Error
- Check MySQL is running
- Verify .env credentials
- Ensure database exists
- Check port 3306 availability

### Port Already in Use
- Change PORT in .env
- Kill process on port: `lsof -i :5000`

### Module Not Found
- Delete node_modules
- Remove package-lock.json
- Run `npm install`

### CORS Errors
- Check CORS_ORIGIN in backend/.env
- Verify frontend API URL
- Restart both servers

## 🎯 Future Enhancements

- [ ] Email notifications (deadline reminders)
- [ ] PDF export of appraisals
- [ ] Multi-year comparison view
- [ ] Goal setting for next period
- [ ] 360-degree peer feedback
- [ ] AI-powered insights
- [ ] Mobile native apps
- [ ] Integration with HR systems (BambooHR, Workday)
- [ ] Integration with project tools (JIRA, Asana)
- [ ] Advanced analytics and reporting
- [ ] Customizable question templates
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Calendar integration
- [ ] Slack/Teams notifications

## 👥 User Statistics (Seeded Data)

- **Total Users**: 16
  - 1 Admin
  - 2 Managers
  - 3 Tech Leads
  - 10 Developers
- **Total Questions**: 29 (across 7 sections)
- **Rating Categories**: 5

## 🏆 Best Practices Implemented

### Backend
- ✅ TypeScript for type safety
- ✅ Async/await error handling
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ API versioning ready
- ✅ Environment-based configuration
- ✅ Database migrations (Sequelize)
- ✅ Structured logging
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Error middleware
- ✅ Security headers

### Frontend
- ✅ TypeScript strict mode
- ✅ Component composition
- ✅ Custom hooks
- ✅ Context API for state
- ✅ React Query for server state
- ✅ Form validation
- ✅ Error boundaries
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Accessibility (a11y)
- ✅ Responsive design
- ✅ SEO ready

## 📞 Support & Resources

### Documentation
- Main README for overview
- Quick Start for setup
- Frontend Guide for UI implementation
- Backend README for API details

### Community
- GitHub Issues for bug reports
- Discussions for questions
- Pull Requests for contributions

### Tech Stack Documentation
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Express](https://expressjs.com)
- [Sequelize](https://sequelize.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

Built with modern web technologies and best practices for enterprise-level applications.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅

**Happy Appraising! 🚀**