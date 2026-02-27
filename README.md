# Developer Appraisal System

A comprehensive full-stack application for conducting annual developer appraisals with multi-stage review workflow.

## Features

- 🔐 **Role-based access control** (Admin, Manager, Tech Lead, Developer)
- 📝 **Self-assessment** with 7 sections covering achievements, technical skills, code quality, ownership, problem-solving, communication, and growth
- ⭐ **5 rating categories** (1-5 stars): Technical Skills, Code Quality, Ownership, Problem Solving, Communication
- 🔄 **Multi-stage workflow**: Developer fills → Tech Lead reviews → Manager finalizes
- 💾 **Auto-save functionality** with draft support
- 📅 **Deadline management** and tracking
- 💬 **Comments and feedback** from Tech Leads and Managers
- 📊 **Dashboard and analytics** for managers to view team performance
- 🎨 **Rich text editor** for detailed responses
- 📱 **Responsive web design** for all devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching and caching
- Tiptap for rich text editing
- Recharts for analytics visualization
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MySQL with Sequelize ORM
- JWT authentication
- Express Validator for input validation
- Bcrypt for password hashing

## Prerequisites

- Node.js 18+ and npm
- MySQL 8+
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd talent-metric
```

### 2. Setup MySQL Database

**Option A: Using Docker**
```bash
docker-compose up -d
```

**Option B: Using local MySQL**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE talent_metric;
```

### 3. Setup Backend

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Then run migrations and seed data
npm run seed

# Start development server
npm run dev
```

Backend will run on: **http://localhost:5000**

### 4. Setup Frontend

```bash
cd frontend
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

Frontend will run on: **http://localhost:3000**

## Default Credentials

After seeding the database, you can login with:

**Admin Account:**
- Email: `admin@company.com`
- Password: `Admin@123`

**Sample Developer Account:**
- Email: `john.doe@company.com`
- Password: `Password@123`

**Sample Tech Lead Account:**
- Email: `jane.smith@company.com`
- Password: `Password@123`

**Sample Manager Account:**
- Email: `bob.johnson@company.com`
- Password: `Password@123`

## Project Structure

```
talent-metric/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── models/         # Sequelize models
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth and validation middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── seeders/        # Database seeders
│   │   └── server.ts       # Main server file
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Helper functions
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

## User Roles & Permissions

### Admin
- Create, update, and delete users
- Assign tech leads and managers to developers
- View all appraisals across the organization
- Manage system-wide settings
- Access full analytics dashboard

### Developer
- Fill out self-assessment questionnaire
- Save drafts and resume later (auto-save enabled)
- Rate themselves on 5 key categories
- Submit appraisal to Tech Lead for review
- View own appraisal status and history

### Tech Lead
- Review appraisals from assigned team members
- Add comments and feedback on responses
- Forward appraisals to Manager for final review
- View team member progress

### Manager
- Perform final review of team appraisals
- Add final comments and recommendations
- Complete and finalize appraisals
- View team analytics and performance metrics
- Export team reports

## Appraisal Workflow

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

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/tech-leads` - Get all tech leads
- `GET /api/users/managers` - Get all managers

### Appraisals
- `GET /api/appraisals` - List appraisals (filtered by role)
- `GET /api/appraisals/:id` - Get appraisal details
- `POST /api/appraisals` - Create new appraisal
- `PUT /api/appraisals/:id` - Update appraisal (auto-save)
- `POST /api/appraisals/:id/submit` - Submit to next stage
- `GET /api/appraisals/:id/comments` - Get all comments
- `POST /api/appraisals/:id/comments` - Add comment

### Questions
- `GET /api/questions` - Get all questions grouped by section

### Dashboard
- `GET /api/dashboard/stats` - Get overall statistics
- `GET /api/dashboard/team` - Get team appraisals (Managers)
- `GET /api/dashboard/analytics` - Get team analytics

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=talent_metric
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Database Schema

### Tables

**users**
- id, name, email, password, role, tech_lead_id, manager_id, created_at, updated_at

**appraisals**
- id, user_id, year, status, deadline, submitted_at, tech_lead_reviewed_at, manager_reviewed_at, completed_at, created_at, updated_at

**questions**
- id, section, section_title, question_text, order, created_at, updated_at

**responses**
- id, appraisal_id, question_id, answer, created_at, updated_at

**ratings**
- id, appraisal_id, category, rating, created_at, updated_at

**comments**
- id, appraisal_id, user_id, comment, stage, created_at, updated_at

## Development

### Run Backend in Development Mode
```bash
cd backend
npm run dev
```

### Run Frontend in Development Mode
```bash
cd frontend
npm start
```

### Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder
```

## Appraisal Sections

### Section 1: Achievements & Impact
- Top 3 contributions
- Most proud feature/task
- Measurable impact
- Most challenging task
- Task completion rate

### Section 2: Technical Skills
- New skills learned
- Areas of improvement
- Areas needing growth
- Debugging approach
- Independent problem solving

### Section 3: Code Quality & Engineering Practices
- Code maintainability approach
- Handling code reviews
- Refactoring examples
- Engineering practices to improve

### Section 4: Ownership & Responsibility
- Taking ownership examples
- Handling blockers
- Learning from missed deadlines
- Task estimation approach

### Section 5: Problem Solving & Learning
- Problem-solving process
- Hardest bug fixed
- Staying updated with tech
- Recent self-learning topics

### Section 6: Communication & Teamwork
- Progress communication
- Handling disagreements
- Helping teammates
- Peer feedback received

### Section 7: Growth & Future Goals
- Improvement areas (next 6 months)
- Skills to develop
- Support needed from company
- Career vision (1 year)

### Self-Rating (1-5 stars)
- Technical Skills
- Code Quality
- Ownership
- Problem Solving
- Communication

## Deployment

### AWS Deployment (Recommended)

**Backend:**
- Deploy on AWS EC2 or Elastic Beanstalk
- Use AWS RDS for MySQL database
- Configure security groups and load balancer

**Frontend:**
- Build production bundle: `npm run build`
- Deploy to AWS S3
- Use CloudFront for CDN
- Configure Route53 for custom domain

**Environment:**
- Set production environment variables
- Enable HTTPS/SSL certificates
- Configure CORS properly
- Set up monitoring and logging

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- SQL injection prevention (Sequelize ORM)
- XSS protection
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization

## Future Enhancements

- Email notifications for deadlines and status changes
- PDF export of appraisals
- Multi-year appraisal history and comparison
- Goal setting for next review period
- 360-degree peer feedback
- AI-powered insights and recommendations
- Mobile native apps (iOS/Android)
- Integration with HR systems (BambooHR, Workday, etc.)
- Integration with project management tools (JIRA, Asana)
- Advanced analytics and reporting
- Customizable question templates
- Multi-language support

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check .env file has correct credentials
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Support & Contributing

For issues, questions, or contributions:
- Create an issue on GitHub
- Submit pull requests
- Email: support@company.com

## License

MIT License - feel free to use this for your organization

## Authors

Developed for efficient developer performance management and growth tracking.

---

**Happy Appraising! 🚀**