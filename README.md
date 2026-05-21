# Orange Global - Admin Panel

A secure, comprehensive administrative dashboard for the Orange Global platform.

## 🚀 Overview

The Orange Global Admin Panel provides internal staff and administrators with the tools necessary to manage users, jobs, applications, and system configurations. It is built for performance, security, and ease of use.

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
