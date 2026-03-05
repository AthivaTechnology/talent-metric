# Talent Metric - Developer Appraisal System User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Developer Guide](#developer-guide)
5. [Tech Lead Guide](#tech-lead-guide)
6. [Manager Guide](#manager-guide)
7. [Admin Guide](#admin-guide)
8. [Appraisal Workflow](#appraisal-workflow)
9. [Features Overview](#features-overview)
10. [FAQ](#faq)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

Talent Metric is a comprehensive developer appraisal system designed to streamline the annual performance review process. It provides a structured multi-stage workflow where developers complete self-assessments, tech leads provide feedback, and managers finalize reviews.

### Key Benefits

- **Structured Self-Assessment**: 7 comprehensive sections covering all aspects of developer performance
- **Multi-Stage Review**: Ensures thorough evaluation with multiple reviewers
- **Auto-Save**: Never lose your work with automatic draft saving
- **Real-Time Progress Tracking**: Monitor appraisal status at every stage
- **Analytics Dashboard**: Data-driven insights for managers and admins

---

## Getting Started

### Accessing the System

1. Open your web browser and navigate to the application URL
2. You will see the login page

### Logging In

1. Enter your **Email Address** in the email field
2. Enter your **Password** in the password field
3. Click the **Login** button
4. Upon successful login, you will be redirected to your dashboard

### First-Time Login

If this is your first time logging in:
- Use the credentials provided by your administrator
- It is recommended to change your password after first login

### Changing Your Password

1. Click on your profile icon in the top-right corner
2. Select **Change Password**
3. Enter your current password
4. Enter your new password (must meet security requirements)
5. Confirm your new password
6. Click **Save**

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## User Roles

The system has four distinct user roles, each with specific permissions:

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Developer** | Team members who complete self-assessments | Fill appraisals, view own status |
| **Tech Lead** | Senior developers who review team members | Review team appraisals, add feedback |
| **Manager** | Team managers who finalize reviews | Final review, complete appraisals, view analytics |
| **Admin** | System administrators | Full access, user management, system settings |

---

## Developer Guide

### Your Dashboard

When you log in as a developer, your dashboard displays:

- **Current Appraisal Status**: Shows your active appraisal and its current stage
- **Deadline**: Due date for your appraisal (highlighted if approaching)
- **Progress Indicator**: Visual representation of completion percentage
- **Quick Actions**: Buttons to start, continue, or view your appraisal

### Starting a New Appraisal

1. From your dashboard, click **Start New Appraisal**
2. The system will create an appraisal for the current year
3. You will be redirected to the appraisal form

### Filling Out Your Appraisal

The appraisal form consists of **7 sections** with a total of **29 questions**:

#### Section 1: Achievements & Impact (5 questions)
- Top 3 contributions to the team/company
- Most proud feature or task
- Measurable impact of your work
- Most challenging task completed
- Task completion rate

#### Section 2: Technical Skills (5 questions)
- New skills learned this year
- Areas where you've improved
- Areas needing further growth
- Your debugging approach
- Independent problem-solving abilities

#### Section 3: Code Quality & Engineering Practices (4 questions)
- How you maintain code quality
- Your approach to code reviews
- Examples of refactoring work
- Engineering practices to improve

#### Section 4: Ownership & Responsibility (4 questions)
- Examples of taking ownership
- How you handle blockers
- Learning from missed deadlines
- Your task estimation approach

#### Section 5: Problem Solving & Learning (4 questions)
- Your problem-solving process
- Hardest bug you fixed
- How you stay updated with technology
- Recent self-learning topics

#### Section 6: Communication & Teamwork (4 questions)
- How you communicate progress
- Handling disagreements
- Ways you've helped teammates
- Peer feedback you've received

#### Section 7: Growth & Future Goals (4 questions)
- Improvement areas for next 6 months
- Skills you want to develop
- Support needed from the company
- Your career vision for the next year

### Using the Rich Text Editor

Each question has a rich text editor that supports:

- **Bold** text (Ctrl/Cmd + B)
- *Italic* text (Ctrl/Cmd + I)
- Bullet lists
- Numbered lists
- Headings

### Self-Rating Section

After completing all sections, rate yourself on 5 key categories using a 1-5 star scale:

| Category | Description |
|----------|-------------|
| **Technical Skills** | Your coding abilities, technology knowledge |
| **Code Quality** | Quality of code you produce, maintainability |
| **Ownership** | Taking responsibility, seeing tasks through |
| **Problem Solving** | Ability to solve complex problems |
| **Communication** | How well you communicate with the team |

**Rating Scale:**
- 1 Star: Needs significant improvement
- 2 Stars: Below expectations
- 3 Stars: Meets expectations
- 4 Stars: Exceeds expectations
- 5 Stars: Outstanding performance

### Auto-Save Feature

The system automatically saves your work:

- Changes are saved every **2 seconds** after you stop typing
- A "Saving..." indicator appears when saving
- A "Saved" indicator confirms your work is saved
- You can safely close the browser and return later

### Saving as Draft

1. Your work is automatically saved as a draft
2. You can click **Save Draft** anytime to manually save
3. Return to continue working on your appraisal at any time

### Submitting Your Appraisal

1. Ensure all sections are complete
2. Ensure all ratings are provided
3. Click the **Submit** button
4. Confirm your submission in the dialog
5. Once submitted, you cannot edit the appraisal

**Important**: Review all your responses before submitting. Once submitted, the appraisal moves to Tech Lead review and cannot be edited.

### Viewing Your Appraisal

After submission, you can:

1. View your appraisal in read-only mode
2. Track the current status (Tech Lead Review, Manager Review, Completed)
3. View feedback and comments from reviewers

---

## Tech Lead Guide

### Your Dashboard

As a Tech Lead, your dashboard shows:

- **Pending Reviews**: Number of appraisals waiting for your review
- **Team Members**: List of developers assigned to you
- **Recent Activity**: Latest appraisals submitted for review
- **Quick Access**: Direct links to pending appraisals

### Viewing Team Appraisals

1. From your dashboard, click **View Team Appraisals**
2. You'll see a list of all appraisals from your team members
3. Filter by status: Draft, Submitted, In Review, Completed
4. Click on any appraisal to view details

### Reviewing an Appraisal

1. Click on a **Submitted** appraisal
2. Review all sections and responses
3. View the developer's self-ratings
4. Read through each section carefully

### Adding Feedback

1. While reviewing an appraisal, scroll to the **Comments** section
2. Click **Add Comment**
3. Enter your feedback (minimum 10 characters)
4. Click **Submit Comment**

**Best Practices for Feedback:**
- Be specific and constructive
- Reference specific responses when relevant
- Highlight strengths and areas for improvement
- Provide actionable suggestions

### Forwarding to Manager

After completing your review:

1. Click the **Forward to Manager** button
2. Confirm the action in the dialog
3. The appraisal status changes to "Manager Review"
4. The manager will be notified

---

## Manager Guide

### Your Dashboard

As a Manager, your dashboard displays:

- **Team Overview**: Summary of all team appraisals
- **Pending Final Reviews**: Appraisals awaiting your review
- **Completed Appraisals**: Finalized reviews
- **Analytics Dashboard**: Team performance metrics

### Viewing Team Analytics

1. Click **Analytics** in the navigation menu
2. View charts showing:
   - Rating averages by category
   - Status distribution across team
   - Year-over-year comparisons
   - Team performance trends

### Reviewing Appraisals

1. Click on an appraisal in "Manager Review" status
2. Review the developer's self-assessment
3. Read the Tech Lead's comments and feedback
4. Add your own comments if needed

### Adding Final Comments

1. In the appraisal view, scroll to the **Comments** section
2. Click **Add Final Comment**
3. Enter your management feedback
4. Include recommendations for growth or recognition

### Completing an Appraisal

1. After thorough review, click **Complete Appraisal**
2. Confirm your decision
3. The appraisal status changes to "Completed"
4. The appraisal is now finalized and viewable by all parties

### Exporting Reports

1. Go to **Analytics** page
2. Click **Export Report**
3. Select format (PDF or CSV)
4. Choose date range
5. Download the report

---

## Admin Guide

### Admin Dashboard

As an Admin, you have access to:

- **System Overview**: Total users, appraisals, and status breakdown
- **All Appraisals**: View and manage any appraisal
- **User Management**: Create, edit, and manage all users
- **System Settings**: Configure system-wide options

### User Management

#### Viewing All Users

1. Click **Users** in the navigation menu
2. View the list of all users in the system
3. Use filters to sort by role, status, or name
4. Use search to find specific users

#### Creating a New User

1. Click **Add User** button
2. Fill in the required fields:
   - **Name**: Full name of the user
   - **Email**: Must be unique in the system
   - **Role**: Select Developer, Tech Lead, Manager, or Admin
   - **Password**: Set initial password
3. If creating a Developer:
   - Assign a **Tech Lead**
   - Assign a **Manager**
4. Click **Create User**

#### Editing a User

1. Find the user in the list
2. Click the **Edit** icon
3. Modify the necessary fields
4. Click **Save Changes**

#### Deleting a User

1. Find the user in the list
2. Click the **Delete** icon
3. Confirm deletion in the dialog

**Warning**: Deleting a user will also affect their associated appraisals.

### Assigning Tech Leads and Managers

1. Edit a Developer's profile
2. Select their assigned **Tech Lead** from the dropdown
3. Select their assigned **Manager** from the dropdown
4. Save changes

### Viewing All Appraisals

1. Click **All Appraisals** in the navigation
2. View appraisals across the entire organization
3. Filter by:
   - Year
   - Status
   - Department
   - User

### System Analytics

Access organization-wide analytics:

- Total users by role
- Appraisal completion rates
- Average ratings by department
- Deadline compliance statistics

---

## Appraisal Workflow

### Status Stages

```
1. DRAFT          -> Developer fills self-assessment
                     Auto-save enabled
                     Can save and continue later

2. SUBMITTED      -> Developer submits to Tech Lead
                     No longer editable by Developer

3. TECH_LEAD_REVIEW -> Tech Lead reviews and adds comments
                       Tech Lead forwards to Manager

4. MANAGER_REVIEW -> Manager performs final review
                     Manager adds final comments
                     Manager marks as complete

5. COMPLETED      -> Appraisal is finalized
                     Available for viewing and reports
```

### Status Indicators

| Status | Color | Meaning |
|--------|-------|---------|
| Draft | Gray | Work in progress |
| Submitted | Blue | Awaiting Tech Lead review |
| Tech Lead Review | Yellow | Under Tech Lead review |
| Manager Review | Purple | Under Manager review |
| Completed | Green | Finalized |

### Deadlines

- Deadlines are set by admins when creating appraisals
- Approaching deadlines (within 7 days) are highlighted in orange
- Overdue deadlines are highlighted in red
- Deadline alerts appear on the dashboard

---

## Features Overview

### Auto-Save

- All changes are automatically saved every 2 seconds
- Save indicator shows status: "Saving...", "Saved", or "Error"
- Draft progress is preserved even if you close the browser
- No need to manually save while working

### Rich Text Editor

- Format text with bold, italic, underline
- Create bullet and numbered lists
- Add headings for organization
- Keyboard shortcuts supported

### Responsive Design

- Works on desktop, tablet, and mobile devices
- Optimized layouts for all screen sizes
- Touch-friendly interface on mobile

### Progress Tracking

- Visual progress bar shows workflow stage
- Timeline view of status changes
- Timestamps for each stage transition

### Comments and Feedback

- Thread-based comments on appraisals
- Stage-specific comments (Tech Lead vs Manager)
- Rich text support in comments
- Comment history preserved

### Dashboard Analytics

For Managers and Admins:
- Bar charts for rating distributions
- Pie charts for status breakdown
- Line charts for trends over time
- Export capabilities for reports

---

## FAQ

### General Questions

**Q: How often are appraisals conducted?**
A: Appraisals are typically conducted annually. Only one appraisal per user per year is allowed.

**Q: Can I edit my appraisal after submitting?**
A: No, once submitted, the appraisal cannot be edited. Please review carefully before submitting.

**Q: What happens if I miss the deadline?**
A: The system will highlight overdue appraisals. Contact your manager if you need an extension.

**Q: Can I see feedback from my reviewers?**
A: Yes, after reviewers add comments, you can view them in your appraisal details.

### Technical Questions

**Q: Is my data saved if I close the browser?**
A: Yes, auto-save preserves your work. Your draft will be available when you return.

**Q: Which browsers are supported?**
A: The system works best with Chrome, Firefox, Safari, and Edge (latest versions).

**Q: Can I access the system on mobile?**
A: Yes, the system is fully responsive and works on mobile devices.

**Q: How secure is my data?**
A: The system uses JWT authentication, encrypted passwords, and HTTPS for data protection.

---

## Troubleshooting

### Login Issues

**Problem**: Cannot log in
- Verify your email and password are correct
- Check if Caps Lock is on
- Try resetting your password
- Contact your administrator if problems persist

**Problem**: Session expired
- Re-enter your credentials to log in again
- Session tokens expire after 7 days for security

### Appraisal Form Issues

**Problem**: Changes not saving
- Check your internet connection
- Look for the save indicator status
- Try manually clicking "Save Draft"
- Refresh the page and check if changes were saved

**Problem**: Cannot submit appraisal
- Ensure all sections are complete
- Verify all 5 ratings are provided
- Check for any validation errors highlighted in red

### Display Issues

**Problem**: Page not loading properly
- Clear your browser cache
- Try a different browser
- Disable browser extensions
- Ensure JavaScript is enabled

**Problem**: Charts not displaying
- Refresh the page
- Clear browser cache
- Try a different browser

### Getting Help

If you encounter issues not covered here:

1. Contact your system administrator
2. Check the main README documentation
3. Report issues through the proper channels

---

## Quick Reference Card

### Keyboard Shortcuts (Rich Text Editor)

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + B | Bold text |
| Ctrl/Cmd + I | Italic text |
| Ctrl/Cmd + U | Underline text |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y | Redo |

### Important URLs

| Page | Description |
|------|-------------|
| /login | Login page |
| /dashboard | Main dashboard |
| /appraisal/:id | Edit appraisal |
| /appraisal/:id/view | View appraisal |
| /users | User management (Admin) |

### Contact Information

For technical support or questions, contact your system administrator.

---

**Document Version**: 1.0
**Last Updated**: March 2026
**System Version**: Talent Metric v1.0.0

---

*This user manual is part of the Talent Metric Developer Appraisal System documentation.*
