# Orange Global - Admin Panel

A secure, comprehensive administrative dashboard for the Orange Global platform.

## 🚀 Overview

The Orange Global Admin Panel provides internal staff and administrators with the tools necessary to manage users, jobs, applications, and system configurations. It is built for performance, security, and ease of use.

## ✨ Key Features & Recent Updates

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
