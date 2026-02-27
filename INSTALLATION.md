# Complete Installation & Usage Guide
## Talent Metric - Developer Appraisal System

### 📦 What You've Built

A complete, production-ready full-stack application for conducting annual developer performance appraisals with:

- ✅ **Backend API** - Node.js + Express + TypeScript + MySQL
- ✅ **Frontend App** - React + TypeScript + Tailwind CSS + Vite
- ✅ **Database** - MySQL with Sequelize ORM
- ✅ **29 Questions** across 7 comprehensive sections
- ✅ **5 Rating Categories** (1-5 stars)
- ✅ **4 User Roles** (Admin, Manager, Tech Lead, Developer)
- ✅ **Multi-stage Workflow** with review process
- ✅ **Auto-save** functionality
- ✅ **Rich Text Editor** for detailed responses
- ✅ **Analytics Dashboard** for managers
- ✅ **Secure Authentication** with JWT

---

## 🚀 OPTION 1: Automated Setup (Recommended)

### Run the Setup Script

```bash
cd talent-metric
chmod +x setup.sh
./setup.sh
```

This script will:
1. Check prerequisites (Node.js, npm, MySQL)
2. Set up database (Docker or local)
3. Install backend dependencies
4. Configure environment variables
5. Seed database with sample data
6. Install frontend dependencies
7. Configure frontend

**Follow the prompts and you're done!**

---

## 🛠️ OPTION 2: Manual Setup (Step by Step)

### Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check npm
npm --version

# Check MySQL
mysql --version
```

### Step 1: Database Setup

**Option A - Using Docker (Easiest)**

```bash
# From project root
cd talent-metric
docker-compose up -d

# Wait 30 seconds for MySQL to initialize
sleep 30
```

**Option B - Using Local MySQL**

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE talent_metric;
EXIT;
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd talent-metric/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Required .env Configuration:**

```env
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=talent_metric
DB_USER=root
DB_PASSWORD=password

# JWT (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Seed Database:**

```bash
npm run seed
```

This creates:
- 1 Admin: admin@company.com / Admin@123
- 2 Managers
- 3 Tech Leads
- 10 Developers
- All 29 questions

**Start Backend:**

```bash
npm run dev
```

✅ Backend running at: **http://localhost:5000**

### Step 3: Frontend Setup

**Open a NEW terminal window:**

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

✅ Frontend running at: **http://localhost:3000**

---

## 🎯 Verify Installation

### 1. Check Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-...",
  "uptime": 123.45
}
```

### 2. Check Frontend

Open browser: **http://localhost:3000**

You should see the login page.

### 3. Test Login

Use these credentials:

**Admin:**
- Email: `admin@company.com`
- Password: `Admin@123`

**Developer:**
- Email: `john.doe@company.com`
- Password: `Password@123`

---

## 📱 Using the Application

### As a Developer

1. **Login** with developer credentials
2. **Dashboard** shows your appraisal status
3. **Create Appraisal** or continue draft
4. **Fill 7 Sections:**
   - Achievements & Impact
   - Technical Skills
   - Code Quality & Engineering
   - Ownership & Responsibility
   - Problem Solving & Learning
   - Communication & Teamwork
   - Growth & Future Goals
5. **Rate Yourself** (1-5 stars) on:
   - Technical Skills
   - Code Quality
   - Ownership
   - Problem Solving
   - Communication
6. **Auto-save** happens every 2 seconds
7. **Submit** when ready (validates all fields)

### As a Tech Lead

1. **Login** with tech lead credentials
2. **Dashboard** shows team appraisals
3. **Review** submitted appraisals
4. **Add Comments** with feedback
5. **Forward to Manager** when done

### As a Manager

1. **Login** with manager credentials
2. **Dashboard** shows team overview
3. **View Analytics** and reports
4. **Review** appraisals from tech lead
5. **Add Final Comments**
6. **Complete** appraisals

### As an Admin

1. **Login** with admin credentials
2. **User Management:**
   - Create new users
   - Edit user details
   - Assign tech leads/managers
   - Delete users
3. **View All Appraisals** system-wide
4. **Access Analytics** dashboard

---

## 🔧 Development Workflow

### Backend Development

```bash
cd backend

# Start with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Re-seed database (WARNING: deletes data)
npm run seed
```

**Backend runs on:** http://localhost:5000

**API Endpoints:** http://localhost:5000/api

### Frontend Development

```bash
cd frontend

# Start with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Frontend runs on:** http://localhost:3000

---

## 📊 API Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin@123"}'
```

**Get Current User (replace TOKEN):**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Dashboard Stats:**
```bash
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get All Questions:**
```bash
curl http://localhost:5000/api/questions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import collection from docs
2. Set `base_url` variable to `http://localhost:5000/api`
3. Login to get token
4. Add token to Authorization header: `Bearer <token>`
5. Test all endpoints

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed**

```bash
# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# For Docker
docker-compose ps
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

**Port 5000 Already in Use**

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

**Module Not Found**

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Module Not Found**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Cannot Connect to Backend**

1. Verify backend is running: http://localhost:5000/health
2. Check `VITE_API_URL` in frontend/.env
3. Verify `CORS_ORIGIN` in backend/.env
4. Restart both servers

**Build Errors**

```bash
# Clear cache
rm -rf node_modules .vite
npm install
npm run dev
```

### Database Issues

**Tables Not Created**

```bash
cd backend
npm run seed  # This syncs tables and seeds data
```

**Need Fresh Start**

```bash
# Stop and remove Docker volumes
docker-compose down -v

# Start fresh
docker-compose up -d
sleep 30

# Re-seed
cd backend
npm run seed
```

---

## 🌐 Production Deployment

### Backend (AWS EC2 Example)

```bash
# Build
cd backend
npm run build

# Set environment variables
export NODE_ENV=production
export DB_HOST=your-rds-host.amazonaws.com
export JWT_SECRET=your-super-strong-production-secret-min-32-chars

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name talent-metric-api

# Save PM2 config
pm2 save
pm2 startup
```

### Frontend (Vercel/Netlify)

```bash
# Build
cd frontend
npm run build

# Deploy build folder
# Configure environment variable:
# VITE_API_URL=https://your-api-domain.com/api
```

### Database (AWS RDS)

1. Create MySQL RDS instance
2. Configure security groups
3. Update backend .env with RDS credentials
4. Run migrations
5. Set up automated backups

---

## 🔒 Security Checklist for Production

- [ ] Change `JWT_SECRET` to strong random string (min 32 chars)
- [ ] Use environment-specific database credentials
- [ ] Enable HTTPS/SSL on both frontend and backend
- [ ] Configure CORS to match your frontend domain
- [ ] Set up database backups (daily recommended)
- [ ] Enable rate limiting (already configured)
- [ ] Use strong password policy
- [ ] Set up monitoring (CloudWatch, Datadog, etc.)
- [ ] Review and restrict API access
- [ ] Enable database connection pooling
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Use CDN for frontend (CloudFront, Cloudflare)
- [ ] Enable database SSL connections
- [ ] Review user permissions regularly

---

## 📖 Project Documentation

All documentation files:

1. **README.md** - Main project overview
2. **QUICK_START.md** - Quick setup guide
3. **INSTALLATION.md** - This file (detailed setup)
4. **PROJECT_SUMMARY.md** - Complete project summary
5. **FRONTEND_COMPLETE_GUIDE.md** - Frontend implementation guide
6. **backend/README.md** - Backend API documentation

---

## 🎓 Learning Resources

### Technologies Used

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Express**: https://expressjs.com
- **Sequelize**: https://sequelize.org
- **Tailwind CSS**: https://tailwindcss.com
- **Vite**: https://vitejs.dev
- **React Query**: https://tanstack.com/query
- **Tiptap**: https://tiptap.dev

### Best Practices

- REST API Design
- JWT Authentication
- TypeScript Type Safety
- React Component Patterns
- Database Schema Design
- Security Best Practices

---

## 🎯 Next Steps

### Immediate

1. ✅ Verify installation works
2. ✅ Test all user roles
3. ✅ Create test appraisals
4. ✅ Review workflow

### Customization

1. **Update Questions:**
   - Edit: `backend/src/config/constants.ts`
   - Modify `QUESTIONS` array
   - Re-run: `npm run seed`

2. **Change Branding:**
   - Update: `frontend/src/utils/constants.ts`
   - Modify colors in `tailwind.config.js`
   - Update logo/favicon in `public/`

3. **Add Features:**
   - Email notifications
   - PDF export
   - Multi-year history
   - Custom reports

### Production

1. Set up CI/CD pipeline
2. Configure monitoring
3. Set up backups
4. Load testing
5. Security audit

---

## 📞 Support

### Common Questions

**Q: Can I modify the questions?**
A: Yes! Edit `backend/src/config/constants.ts` and re-seed.

**Q: How do I add more users?**
A: Login as admin and use User Management page.

**Q: Can I use PostgreSQL instead of MySQL?**
A: Yes, update Sequelize config and connection string.

**Q: How do I export appraisals?**
A: Currently manual. Future enhancement: PDF export.

**Q: Can I host this on shared hosting?**
A: Backend needs Node.js support. Use VPS or cloud.

### Getting Help

- Check troubleshooting section
- Review documentation files
- Check server logs (terminal output)
- Verify environment variables
- Test API endpoints with curl

---

## 📝 Quick Reference

### Default Ports
- Backend: 5000
- Frontend: 3000
- MySQL: 3306

### Default Credentials
```
Admin:     admin@company.com / Admin@123
Developer: john.doe@company.com / Password@123
Tech Lead: jane.smith@company.com / Password@123
Manager:   bob.johnson@company.com / Password@123
```

### Common Commands
```bash
# Backend
cd backend && npm run dev
cd backend && npm run seed

# Frontend
cd frontend && npm run dev

# Database
docker-compose up -d
docker-compose down
```

### Important URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api
- Health: http://localhost:5000/health

---

## ✅ Installation Complete!

You now have a fully functional Developer Appraisal System!

**Test the complete flow:**

1. Login as Developer → Fill appraisal → Submit
2. Login as Tech Lead → Review → Add comments → Forward
3. Login as Manager → Final review → Add comments → Complete
4. Login as Admin → View all data → Create users

**System is ready for use!** 🎉

---

## 📄 License

MIT License - Free to use and modify for your organization.

---

## 🙏 Acknowledgments

Built with modern web technologies following industry best practices.

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready

---

**Questions? Check the documentation or review the troubleshooting section above.**

**Happy Appraising! 🚀**