# Talent Metric Backend

Backend API for the Developer Appraisal System built with Node.js, Express, TypeScript, and MySQL.

## Features

- RESTful API architecture
- JWT-based authentication
- Role-based access control (RBAC)
- MySQL database with Sequelize ORM
- TypeScript for type safety
- Input validation and sanitization
- Error handling middleware
- Rate limiting
- Security headers with Helmet
- CORS configuration
- Logging with Morgan

## Prerequisites

- Node.js 18+ and npm
- MySQL 8+
- Git

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=talent_metric
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# CORS Origins
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

**Option A: Using Docker (Recommended)**

From the root directory:
```bash
docker-compose up -d
```

**Option B: Local MySQL**

Create the database manually:
```bash
mysql -u root -p
CREATE DATABASE talent_metric;
EXIT;
```

### 4. Seed Database

Populate the database with initial data (users and questions):

```bash
npm run seed
```

This will create:
- 1 Admin user
- 2 Managers
- 3 Tech Leads
- 10 Developers
- All appraisal questions

### 5. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `npm run lint` - Lint code with ESLint
- `npm test` - Run tests

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /api/auth/login
Login user and receive JWT token

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "System Admin",
      "email": "admin@company.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/me
Get current logged-in user details

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@company.com",
    "role": "admin",
    "techLeadId": null,
    "managerId": null
  }
}
```

#### PUT /api/auth/change-password
Change user password

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewPassword@123"
}
```

### User Endpoints (Admin Only)

#### GET /api/users
Get all users with pagination and filtering

**Query Parameters:**
- `role` - Filter by role (admin, manager, tech_lead, developer)
- `search` - Search by name or email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### POST /api/users
Create new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "Password@123",
  "role": "developer",
  "techLeadId": 3,
  "managerId": 2
}
```

#### PUT /api/users/:id
Update user details

#### DELETE /api/users/:id
Delete user

#### GET /api/users/tech-leads
Get all tech leads

#### GET /api/users/managers
Get all managers

### Appraisal Endpoints

#### GET /api/appraisals
Get all appraisals (filtered by user role)

**Query Parameters:**
- `status` - Filter by status (draft, submitted, tech_lead_review, manager_review, completed)
- `year` - Filter by year
- `page` - Page number
- `limit` - Items per page

#### GET /api/appraisals/:id
Get single appraisal with all details

**Response includes:**
- Appraisal details
- All responses to questions
- Self-ratings
- Comments from reviewers
- User information

#### POST /api/appraisals
Create new appraisal

**Request Body:**
```json
{
  "userId": 5,
  "year": 2024,
  "deadline": "2024-12-31"
}
```

#### PUT /api/appraisals/:id
Update appraisal (auto-save)

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": 1,
      "answer": "My top 3 contributions were..."
    }
  ],
  "ratings": [
    {
      "category": "technical_skills",
      "rating": 4
    }
  ]
}
```

#### POST /api/appraisals/:id/submit
Submit appraisal to next workflow stage

**Workflow stages:**
1. draft → submitted (Developer)
2. submitted → tech_lead_review (Tech Lead)
3. tech_lead_review → manager_review (Tech Lead)
4. manager_review → completed (Manager)

#### POST /api/appraisals/:id/comments
Add comment to appraisal (Tech Lead/Manager)

**Request Body:**
```json
{
  "comment": "Great work on the project delivery. Consider improving testing practices."
}
```

#### GET /api/appraisals/:id/comments
Get all comments for an appraisal

### Question Endpoints

#### GET /api/questions
Get all questions grouped by section

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "section": 1,
      "sectionTitle": "Achievements & Impact",
      "questions": [
        {
          "id": 1,
          "questionText": "What were your top 3 contributions?",
          "order": 1
        }
      ]
    }
  ]
}
```

#### GET /api/questions/section/:section
Get questions for a specific section (1-7)

#### GET /api/questions/:id
Get single question by ID

### Dashboard Endpoints

#### GET /api/dashboard/stats
Get dashboard statistics based on user role

**Response (varies by role):**
```json
{
  "success": true,
  "data": {
    "totalAppraisals": 15,
    "draftAppraisals": 3,
    "submittedAppraisals": 2,
    "completedAppraisals": 10,
    "currentYear": 2024
  }
}
```

#### GET /api/dashboard/team
Get team appraisals (Manager/Tech Lead/Admin)

**Query Parameters:**
- `year` - Filter by year (default: current year)

#### GET /api/dashboard/analytics
Get team analytics with rating averages (Manager/Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "averageRatings": {
      "technical_skills": 4.2,
      "code_quality": 3.8,
      "ownership": 4.0,
      "problem_solving": 4.1,
      "communication": 3.9
    },
    "statusDistribution": [...],
    "ratingDistribution": [...],
    "totalCompleted": 10,
    "totalTeamMembers": 15
  }
}
```

## Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Stack trace (only in development)"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Database Schema

### users
- id (PK)
- name
- email (unique)
- password (hashed)
- role (enum: admin, manager, tech_lead, developer)
- tech_lead_id (FK → users.id)
- manager_id (FK → users.id)
- created_at
- updated_at

### appraisals
- id (PK)
- user_id (FK → users.id)
- year
- status (enum: draft, submitted, tech_lead_review, manager_review, completed)
- deadline
- submitted_at
- tech_lead_reviewed_at
- manager_reviewed_at
- completed_at
- created_at
- updated_at

### questions
- id (PK)
- section (1-7)
- section_title
- question_text
- order
- created_at
- updated_at

### responses
- id (PK)
- appraisal_id (FK → appraisals.id)
- question_id (FK → questions.id)
- answer (text)
- created_at
- updated_at

### ratings
- id (PK)
- appraisal_id (FK → appraisals.id)
- category (enum: technical_skills, code_quality, ownership, problem_solving, communication)
- rating (1-5)
- created_at
- updated_at

### comments
- id (PK)
- appraisal_id (FK → appraisals.id)
- user_id (FK → users.id)
- comment (text)
- stage (tech_lead_review, manager_review)
- created_at
- updated_at

## Security Best Practices

1. **JWT Secret**: Change `JWT_SECRET` to a strong random string in production
2. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 10
3. **Rate Limiting**: API requests are rate-limited to prevent abuse
4. **CORS**: Configure `CORS_ORIGIN` to match your frontend domain
5. **Helmet**: Security headers are set automatically
6. **Input Validation**: All inputs are validated and sanitized
7. **SQL Injection**: Protected by Sequelize ORM parameterized queries

## Production Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### Environment Variables

Set all production environment variables:
- Use strong `JWT_SECRET` (min 32 characters)
- Set `NODE_ENV=production`
- Configure production database credentials
- Set appropriate `CORS_ORIGIN`
- Enable SSL/TLS for database connections

### Start Production Server

```bash
npm start
```

### Deployment Checklist

- [ ] Update all environment variables
- [ ] Use production database (RDS, etc.)
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting appropriately
- [ ] Review and restrict CORS origins
- [ ] Enable database connection pooling
- [ ] Set up health check monitoring

## Troubleshooting

### Database Connection Issues

```bash
# Test MySQL connection
mysql -h localhost -u root -p -e "SHOW DATABASES;"

# Check if database exists
mysql -u root -p -e "USE talent_metric; SHOW TABLES;"
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Dependency Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues or questions:
- Create an issue on GitHub
- Check existing documentation
- Review error logs in console

## License

MIT License

---

**Happy Coding! 🚀**