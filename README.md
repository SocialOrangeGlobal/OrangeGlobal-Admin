# Orange Global - Admin Panel

A secure, comprehensive administrative dashboard for the Orange Global platform.

## 🚀 Overview

The Orange Global Admin Panel provides internal staff and administrators with the tools necessary to manage users, jobs, applications, and system configurations. It is built for performance, security, and ease of use.

## ✨ Key Features & Recent Updates
- **Profile Validation Optimization**: Enhanced User Edit Modal by making non-critical fields (Institution Name, Legal Work Rights, Visa Passport, English Test, Professional License) optional and preventing empty string payload errors to backend.
- **Enhanced Toast Notifications**: Upgraded the toast alert system style with improved typography, dynamic theming support, and elevated z-index logic to ensure visibility over stacked open modals.
- **Platform Integrity & Global State Alignments**: Optimized structural components, page titles, and alignments to support unified UI presentation systems and clean compilation diagnostics across all admin views.
- **Admin Chat & Messaging Hub**: Features a fully integrated, real-time message console (`MessagePage`) supporting instantaneous client-candidate-admin text communication and instant customer service workflows.
- **Real-Time Notification Center**: Added a sleek glassmorphic header notification dropdown and specialized `/notifications` alerts panel, integrated via Socket.io for dynamic instant alerts on applicant updates and interview states.
- **Dynamic Dashboard**: Interactive overview displaying total candidates, employers, active job ratios, and application pipeline distribution charts using real-time API metrics.
- **Jobs & Applicant Management Hub**: A unified workspace featuring two core tabs:
  - **Job Postings**: Manage vacancies, publish drafts, and track hiring metrics.
  - **Applied Jobs**: A global view of all candidate applications across all jobs with dynamic filtering, search, and pagination.
- **Advanced Applicant Tracking**: 
  - View AI-generated ATS Match Scores directly in the application tables.
  - Seamlessly change application statuses.
  - **Interview Scheduling Module**: Set interview dates, types (Video/In-person), generate meeting links, and leave internal recruiter feedback.
  - View Offer Details and track final candidate decisions.
- **Document Preview**: Built-in document viewer modal to read candidate resumes seamlessly within the browser.
- **User Management**: Comprehensive talent user tables allowing admins to manage accounts, edit profiles, and view uploaded portfolios.

## 🛠️ Technology Stack

* **Framework:** React 19 with Vite
* **Styling:** Tailwind CSS v4
* **Language:** TypeScript
* **Routing:** React Router

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/SocialOrangeGlobal/OrangeGlobal-Admin.git
cd OrangeGlobal-Admin
npm install
```

### 3. Environment Variables
Create a `.env` file based on the `.env.example` file and configure the necessary API endpoints:
```env
VITE_API_URL=http://localhost:3001/api/v1
```

### 4. Development Server
Run the local development server:
```bash
npm run dev
```

## 🔒 Security
This portal is strictly for authorized Orange Global personnel. Ensure that all API calls are authenticated via JWT tokens.

---
© 2026 Orange Global. All Rights Reserved.


### Available Endpoints

## API Endpoints

- **[Authentication]** POST /api/v1/auth/signup/talent - Register a new Talent account
- **[Authentication]** POST /api/v1/auth/signup/employer - Register a new Employer account
- **[Authentication]** POST /api/v1/auth/signin - Sign in as Talent or Employer
- **[Authentication]** POST /api/v1/auth/refresh - Rotate refresh token — returns a new token pair
- **[Authentication]** POST /api/v1/auth/signout - Sign out — invalidates the refresh token
- **[Authentication]** POST /api/v1/auth/forgot-password - Request password reset link
- **[Authentication]** POST /api/v1/auth/reset-password - Reset password using token
- **[Authentication]** GET /api/v1/auth/verify-email - Verify email using token
- **[Authentication]** POST /api/v1/auth/resend-verification - Resend verification email
- **[Users]** GET /api/v1/users/me - Get the current authenticated user with their profile
- **[Users]** PATCH /api/v1/users/profile - Update user profile
- **[Users]** POST /api/v1/users/resumes - Add a new resume (max 5)
- **[Users]** PATCH /api/v1/users/resumes/{id}/default - Set a resume as default
- **[Users]** DELETE /api/v1/users/resumes/{id} - Delete a resume
- **[Users]** GET /api/v1/users/talents - Get all talents (Admin only)
- **[Users]** GET /api/v1/users/employers - Get all employers (Admin only)
- **[Users]** GET /api/v1/users/{id} - Get details of a single user (Admin only)
- **[Users]** PATCH /api/v1/users/{id} - Update a user (Admin only)
- **[Users]** DELETE /api/v1/users/{id} - Delete a user (Admin only)
- **[Maintenance]** DELETE /api/v1/maintenance/reset - Reset System (DEVELOPMENT ONLY)
- **[Contact]** POST /api/v1/contact - Submit a contact form message / enquiry
- **[Contact]** GET /api/v1/contact - Get all contact messages (Admin only)
- **[Contact]** GET /api/v1/contact/my-messages - Get current user's submitted enquiries and replies
- **[Contact]** POST /api/v1/contact/{id}/reply - Submit a reply / follow-up to a message
- **[Contact]** GET /api/v1/contact/{id} - Get a single contact message / enquiry (Admin only)
- **[Contact]** PATCH /api/v1/contact/{id} - Update status or notes of an enquiry (Admin only)
- **[Jobs]** GET /api/v1/jobs - Get all published jobs with filtering and pagination
- **[Jobs]** POST /api/v1/jobs - Create a new job (Admin only)
- **[Jobs]** GET /api/v1/jobs/stats - Get job statistics (Admin only)
- **[Jobs]** GET /api/v1/jobs/{id} - Get a specific job by ID
- **[Jobs]** PATCH /api/v1/jobs/{id} - Update an existing job (Admin only)
- **[Jobs]** DELETE /api/v1/jobs/{id} - Delete a job (Admin only)
- **[Applications]** POST /api/v1/jobs/{id}/apply - Apply for a job (Talent only)
- **[Applications]** GET /api/v1/talent/applications - Get current talent applications
- **[Applications]** GET /api/v1/applications - Get all applications (Admin only)
- **[Applications]** GET /api/v1/jobs/{id}/applications - Get applications for a specific job (Admin only)
- **[Applications]** PATCH /api/v1/applications/{id}/status - Update application status (Admin only)
- **[Admin Dashboard]** GET /api/v1/dashboard/stats - Get comprehensive dashboard statistics (Admin only)
- **[Notifications]** GET /api/v1/notifications - Get user notifications with pagination
- **[Notifications]** GET /api/v1/notifications/unread-count - Get unread notifications count
- **[Notifications]** PATCH /api/v1/notifications/{id}/read - Mark a notification as read
- **[Notifications]** PATCH /api/v1/notifications/read-all - Mark all notifications as read
- **[Chatbot]** POST /api/v1/chatbot - Send a message to the Orange AI Chatbot
