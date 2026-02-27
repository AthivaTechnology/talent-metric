# Quick Start Guide - Talent Metric Developer Appraisal System

Complete setup guide to get your application running in minutes!

## 📋 Prerequisites

- Node.js 18+ and npm
- MySQL 8+
- Git

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone and Install Backend

```bash
# Navigate to backend
cd talent-metric/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Step 2: Configure Database

**Option A: Using Docker (Recommended)**

```bash
# From root directory
cd talent-metric
docker-compose up -d

# Wait 30 seconds for MySQL to start
```

**Option B: Local MySQL**

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE talent_metric;
EXIT;
```

### Step 3: Update Environment Variables

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000

# Database (adjust if needed)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=talent_metric
DB_USER=root
DB_PASSWORD=password

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Seed Database

```bash
# From backend directory
npm run seed
```

This creates:
- ✅ 1 Admin user
- ✅ 2 Managers  
- ✅ 3 Tech Leads
- ✅ 10 Developers
- ✅ All 29 appraisal questions

### Step 5: Start Backend

```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

### Step 6: Setup and Start Frontend

Open a new terminal:

```bash
# Navigate to frontend
cd talent-metric/frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

## 🎉 Done! Application is Ready

Open your browser: **http://localhost:3000**

## 🔑 Default Login Credentials

### Admin
- **Email:** admin@company.com
- **Password:** Admin@123

### Developer (Sample)
- **Email:** john.doe@company.com
- **Password:** Password@123

### Tech Lead (Sample)
- **Email:** jane.smith@company.com
- **Password:** Password@123

### Manager (Sample)
- **Email:** bob.johnson@company.com
- **Password:** Password@123

## 📁 Project Structure

```
talent-metric/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database & app config
│   │   ├── models/         # Database models
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth & validation
│   │   ├── services/       # Service layer
│   │   ├── utils/          # Helpers
│   │   └── seeders/        # Database seeders
│   ├── package.json
│   └── .env
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # Context providers
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   ├── package.json
│   └── .env
├── docker-compose.yml
└── README.md
```

## 🎯 Application Features

### For Developers
- Fill self-assessment with 7 comprehensive sections
- Rate yourself on 5 key categories (1-5 stars)
- Auto-save functionality
- Track appraisal status
- View feedback from Tech Lead and Manager

### For Tech Leads
- Review team members' appraisals
- Add detailed feedback and comments
- Forward to Manager for final review
- Track team progress

### For Managers
- Final review and approval
- Add management feedback
- View team analytics
- Access dashboard with insights
- Export team reports

### For Admins
- Complete user management
- Create/edit/delete users
- Assign Tech Leads and Managers
- System-wide dashboard
- Access all appraisals

## 📊 API Endpoints Overview

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Appraisals
- `GET /api/appraisals` - List appraisals
- `GET /api/appraisals/:id` - Get appraisal details
- `POST /api/appraisals` - Create appraisal
- `PUT /api/appraisals/:id` - Update (auto-save)
- `POST /api/appraisals/:id/submit` - Submit to next stage
- `POST /api/appraisals/:id/comments` - Add comment

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/team` - Team appraisals
- `GET /api/dashboard/analytics` - Team analytics

### Questions
- `GET /api/questions` - Get all questions

## 🔧 Common Commands

### Backend

```bash
cd backend

# Development
npm run dev              # Start with hot reload

# Production
npm run build            # Compile TypeScript
npm start                # Start production server

# Database
npm run seed             # Seed database with test data

# Utilities
npm run lint             # Lint code
```

### Frontend

```bash
cd frontend

# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Utilities
npm run lint             # Lint code
```

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# For Docker
docker-compose ps

# Restart Docker MySQL
docker-compose restart mysql
```

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Can't Connect to Backend

1. Check backend is running: http://localhost:5000/health
2. Verify CORS_ORIGIN in backend/.env
3. Check VITE_API_URL in frontend/.env

### Database Migration Issues

```bash
# Reset database (WARNING: deletes all data)
cd backend
npm run seed  # This runs sync with force:true in development
```

## 🧪 Testing the Application

### 1. Test Authentication
- Go to http://localhost:3000
- Login as admin: admin@company.com / Admin@123
- Verify dashboard loads

### 2. Test Developer Flow
- Login as developer: john.doe@company.com / Password@123
- Create new appraisal
- Fill out all 7 sections
- Add self-ratings
- Submit appraisal

### 3. Test Tech Lead Flow
- Login as tech lead: jane.smith@company.com / Password@123
- View team member appraisals
- Add feedback comments
- Forward to manager

### 4. Test Manager Flow
- Login as manager: bob.johnson@company.com / Password@123
- View pending appraisals
- Review and add final comments
- Complete appraisals
- Check team analytics

### 5. Test Admin Features
- Login as admin: admin@company.com / Admin@123
- Create new users
- View all appraisals
- Access system-wide statistics

## 📚 API Documentation

Test the API using:

### cURL Examples

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin@123"}'

# Get Dashboard Stats (replace TOKEN)
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get Questions
curl http://localhost:5000/api/questions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Talent Metric API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@company.com\",\"password\":\"Admin@123\"}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

## 🌐 Deployment Guide

### Backend Deployment (AWS EC2)

```bash
# Build
npm run build

# Set environment variables
export NODE_ENV=production
export DB_HOST=your-rds-host
export JWT_SECRET=your-production-secret

# Start with PM2
pm2 start dist/server.js --name talent-metric-api
```

### Frontend Deployment (Vercel/Netlify)

```bash
# Build
npm run build

# Deploy build folder
# Set environment variable:
# VITE_API_URL=https://your-api-domain.com/api
```

## 🔒 Security Checklist for Production

- [ ] Change JWT_SECRET to strong random string
- [ ] Use environment-specific database credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Use secure password policies
- [ ] Set up monitoring and logging
- [ ] Review and restrict API access
- [ ] Enable database connection pooling

## 📖 Additional Resources

- **Main README:** `/README.md`
- **Backend README:** `/backend/README.md`
- **Frontend Guide:** `/FRONTEND_COMPLETE_GUIDE.md`
- **API Documentation:** http://localhost:5000/api (when running)

## 💡 Tips

1. **Auto-save Feature:** Changes in appraisal forms auto-save every 2 seconds
2. **Rich Text Editor:** Use formatting toolbar for detailed answers
3. **Progress Tracking:** Visual indicators show workflow progress
4. **Deadline Alerts:** System highlights approaching deadlines
5. **Mobile Responsive:** Works on all device sizes

## 🤝 Support

For issues or questions:
- Check troubleshooting section above
- Review error logs in terminal
- Verify environment variables
- Ensure all services are running

## 🎊 Success!

You now have a fully functional Developer Appraisal System!

**Test all features:**
1. ✅ Login with different roles
2. ✅ Create and submit appraisals
3. ✅ Add reviews and comments
4. ✅ View dashboards and analytics
5. ✅ Manage users (as admin)

**Next Steps:**
- Customize questions (modify backend/src/config/constants.ts)
- Add your company branding
- Configure email notifications
- Set up production deployment
- Create additional user accounts

---

**Happy Appraising! 🚀**

Need help? Check the detailed documentation in the project files.