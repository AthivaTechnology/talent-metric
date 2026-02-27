# 🎯 START HERE - Talent Metric Setup

## Welcome! You have a complete Developer Appraisal System ready to use.

This guide gets you up and running in **5 minutes**.

---

## 🚀 Quick Start (3 Commands)

### Step 1: Start Database (1 minute)

```bash
cd talent-metric
docker-compose up -d
sleep 30  # Wait for MySQL to initialize
```

### Step 2: Setup & Start Backend (2 minutes)

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

✅ Backend running at: **http://localhost:5000**

### Step 3: Setup & Start Frontend (2 minutes)

**Open a NEW terminal:**

```bash
cd talent-metric/frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

## 🎉 You're Done!

Open your browser: **http://localhost:3000**

---

## 🔑 Login Credentials

### Admin (Full Access)
- **Email:** `admin@company.com`
- **Password:** `Admin@123`

### Developer (Test Appraisal)
- **Email:** `john.doe@company.com`
- **Password:** `Password@123`

### Tech Lead (Review Team)
- **Email:** `jane.smith@company.com`
- **Password:** `Password@123`

### Manager (Team Analytics)
- **Email:** `bob.johnson@company.com`
- **Password:** `Password@123`

---

## ✅ What You Can Do Now

### As Developer
1. Create new appraisal
2. Fill 7 sections with 29 questions
3. Rate yourself (1-5 stars) on 5 categories
4. Auto-save keeps your progress
5. Submit for review

### As Tech Lead
1. View team appraisals
2. Add review comments
3. Forward to manager

### As Manager
1. Final review & approval
2. View team analytics
3. Add final comments

### As Admin
1. Create/edit users
2. Assign tech leads & managers
3. View all appraisals
4. System analytics

---

## 📋 What's Included

### Complete System
- ✅ **Backend API** - Node.js + Express + TypeScript + MySQL
- ✅ **Frontend App** - React + TypeScript + Tailwind CSS
- ✅ **Database** - MySQL with sample data
- ✅ **4 User Roles** - Admin, Manager, Tech Lead, Developer
- ✅ **29 Questions** across 7 comprehensive sections
- ✅ **5 Rating Categories** with 1-5 star ratings
- ✅ **Multi-stage Workflow** with review process
- ✅ **Auto-save** every 2 seconds
- ✅ **Rich Text Editor** for responses
- ✅ **Analytics Dashboard** for insights
- ✅ **Secure Authentication** with JWT

### Sample Data Created
- 1 Admin user
- 2 Managers
- 3 Tech Leads
- 10 Developers
- All 29 questions loaded

---

## 🧪 Quick Test

### Test the Complete Flow (5 minutes)

1. **Login as Developer**
   - Email: `john.doe@company.com`
   - Password: `Password@123`
   - Create new appraisal
   - Fill some sections (auto-saves)
   - Submit appraisal

2. **Login as Tech Lead**
   - Email: `jane.smith@company.com`
   - Password: `Password@123`
   - View John's appraisal
   - Add review comment
   - Forward to manager

3. **Login as Manager**
   - Email: `bob.johnson@company.com`
   - Password: `Password@123`
   - View pending appraisal
   - Add final comment
   - Complete appraisal
   - Check team analytics

4. **Login as Admin**
   - Email: `admin@company.com`
   - Password: `Admin@123`
   - View all appraisals
   - Create new user
   - Check system stats

✅ **If all works, your system is ready!**

---

## 🐛 Something Not Working?

### Backend won't start?
```bash
# Check MySQL is running
docker-compose ps

# Restart if needed
docker-compose restart mysql

# Check logs
docker-compose logs mysql
```

### Frontend won't connect?
```bash
# Verify backend is running
curl http://localhost:5000/health

# Should return: {"success":true, ...}

# Check .env file exists
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:5000/api
```

### Port already in use?
```bash
# Find what's using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change port in backend/.env
# PORT=5001
```

### Module not found?
```bash
# Reinstall dependencies
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

### Learn More
1. **QUICK_START.md** - Detailed setup guide
2. **README.md** - Complete project overview
3. **INSTALLATION.md** - Step-by-step instructions
4. **PROJECT_SUMMARY.md** - Full feature list
5. **FEATURES.md** - Feature checklist
6. **backend/README.md** - API documentation

### Customize
1. **Change Questions:**
   - Edit: `backend/src/config/constants.ts`
   - Modify `QUESTIONS` array
   - Re-run: `npm run seed`

2. **Update Branding:**
   - Colors: `frontend/tailwind.config.js`
   - Logo: `frontend/public/`
   - App name: `frontend/src/utils/constants.ts`

3. **Add Users:**
   - Login as Admin
   - Go to User Management
   - Create new users

---

## 🎯 Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health
- **API Test:** http://localhost:5000

---

## 💡 Pro Tips

1. **Auto-save**: Changes save automatically every 2 seconds
2. **Rich Text**: Use toolbar to format your answers
3. **Progress**: Visual indicator shows workflow progress
4. **Drafts**: Incomplete appraisals saved as drafts
5. **Mobile**: Fully responsive, works on phone/tablet

---

## 🚀 You're All Set!

Your complete Developer Appraisal System is:
- ✅ Installed
- ✅ Running
- ✅ Ready to use
- ✅ Pre-loaded with test data

**Start by logging in as Admin and exploring!**

---

## 📞 Need Help?

1. Check **Troubleshooting** section above
2. Review **QUICK_START.md** for details
3. Read **INSTALLATION.md** for step-by-step guide
4. Check logs in terminal windows

---

## 🎊 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login as Admin
- [ ] Dashboard loads correctly
- [ ] Can view sample users
- [ ] Can create test appraisal
- [ ] Auto-save works
- [ ] Can submit appraisal
- [ ] Can add review comments

**All checked? You're ready to go! 🎉**

---

**Questions? Everything you need is in the documentation files.**

**Have fun appraising! 🚀**