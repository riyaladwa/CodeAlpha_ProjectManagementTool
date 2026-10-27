# TaskFlow AI — Smart Project Management & Team Collaboration Platform

<p align="center">
  <img src="./client/public/logo.svg" alt="TaskFlow AI Logo" width="80" height="80" />
</p>

<p align="center">
  <b>Plan Smarter. Collaborate Better. Deliver on Time.</b><br>
  A production-ready Full-Stack Project Management and Agile Sprint Collaboration SaaS Platform.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/CodeAlpha-Full--Stack_Internship-0284c7?style=for-the-badge" alt="CodeAlpha Internship" />
  <img src="https://img.shields.io/badge/Task-Task_3_Project_Management_Tool-10b981?style=for-the-badge" alt="Task 3" />
  <img src="https://img.shields.io/badge/Stack-MERN_%2B_Gemini_AI-6366f1?style=for-the-badge" alt="Stack" />
  <img src="https://img.shields.io/badge/Tests-14%2F14_Passing-emerald?style=for-the-badge" alt="Tests Passing" />
</p>

---

## 📌 Project Overview

**TaskFlow AI** was designed and developed as part of the **CodeAlpha Full-Stack Web Development Internship (Task 3: Project Management Tool)**. 

Inspired by high-velocity platforms like Linear, Notion, and Jira, TaskFlow AI bridges modern agile project management with autonomous generative AI. It gives cross-functional software teams an intuitive, beautiful workspace to organize backlogs, plan sprints, manage Kanban workflows via drag-and-drop, track progress through live Recharts analytics, and export executive PDF reports.

### 👤 Candidate Details
- **Candidate Name:** Riya Ladwa
- **Internship Program:** CodeAlpha Full Stack Web Development Internship
- **Task Assigned:** Task 3 — Project Management Tool
- **GitHub Repository:** [TaskFlow-AI](https://github.com/riyaladwa/TaskFlow-AI)

---

## 🌟 Key Features

### 1. 🤖 AI Sprint Copilot (Google Gemini Integration)
- **Automated Project Plan Generator**: Give high-level project goals and target deadlines; Gemini outputs structured phases, milestones, actionable tasks, estimated story hours, and tags in validated JSON.
- **1-Click Batch Plan Import**: Review AI-generated milestones and persist them directly into the MongoDB project workspace with a single click.
- **Smart Task Breakdown**: Deconstructs complex tasks into 4–6 testable, bite-sized subtask checklists.
- **Sprint Prioritizer**: Ranks pending sprint backlog items by risk, deadline, and business impact.
- **Description Enhancer**: Converts unstructured bullet points into professional PRD-style specifications with a Definition of Done (DoD).
- **Graceful Fallback Mode**: Intelligent simulated engine seamlessly handles offline scenarios or missing API keys without breaking the user experience.

### 2. 📋 Interactive Drag-and-Drop Kanban Board
- 4 Standard agile workflow columns: **To Do**, **In Progress**, **In Review**, and **Completed**.
- Fluid drag-and-drop powered by `@hello-pangea/dnd` with optimistic UI updates and server synchronization.
- Confetti celebration micro-animation on task completion (`canvas-confetti`).
- Multi-filter toolbar: Filter by assignee, priority, or search term in real-time.
- Keyboard-accessible status transition menu.

### 3. 👥 Multi-Tenant Workspaces & Role-Based Access Control (RBAC)
- Create and switch between distinct client or product workspaces.
- **Three Access Tiers**:
  - `Owner`: Full administrative privileges, workspace deletion, and member role assignment.
  - `Admin`: Project creation, task assignment, and invite dispatch.
  - `Member`: Task execution, status updates, and commenting.
- Complete member invitation workflow with copyable invite tokens.
- Cross-workspace multi-tenant isolation protecting against IDOR attacks.

### 4. 📊 Real-Time Analytics & Velocity Tracking
- Real-time aggregation directly from MongoDB records:
  - **Task Distribution Donut Chart** (by completion state).
  - **Priority Breakdown Bar Chart** (Urgent, High, Medium, Low).
  - **14-Day Team Velocity Area Chart** (daily completion velocity).
  - **Team Workload Matrix** tracking assigned tasks and overdue ratios.

### 5. 📅 Calendar & Deadline Scheduling
- Month and day interactive calendar view.
- Color-coded priority badges on scheduled dates.
- Click any date cell to quickly schedule and pin a task to that deadline.

### 6. 📄 Executive PDF Status Reports
- Real-time project health summaries, completion ratios, and task counts.
- **1-Click Downloadable PDF Report** generated client-side using `jspdf` and `jspdf-autotable`.

### 7. 🔒 Authentication & Account Management
- Full user registration and login with secure password hashing (`bcryptjs`).
- Secure JWT authentication stored in HTTP-only cookies and local storage fallback.
- Profile customization (name, job title, avatar, notifications).
- **1-Click Demo Mode**: Instant access with pre-seeded demo workspace, Kanban boards, and activities.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7 | Responsive single-page client interface |
| **UI & Visuals** | Lucide React, Recharts, @hello-pangea/dnd, Canvas-Confetti | Interactive Kanban, analytics charts & icons |
| **Reports** | jsPDF, jspdf-autotable | Client-side executive PDF generation |
| **Backend API** | Node.js (ES Modules), Express.js | Validated RESTful API architecture |
| **Security & Auth**| JSON Web Tokens (JWT), bcryptjs, Helmet, CORS, express-rate-limit | Authentication, encryption, and DDoS mitigation |
| **Database** | MongoDB (Mongoose ORM) + In-Memory Fallback | Relational schemas, indexing, and persistent data |
| **AI Integration**| Google Generative AI SDK (`@google/generative-ai`) | Project plan generation & task breakdown |
| **Testing** | Node.js Test Runner (`node:test`), Supertest | Automated backend integration test suite |

---

## 📁 Repository Structure

```
TaskFlow-AI/
├── index.html                  # Root HTML entrypoint for React
├── vite.config.js              # Vite bundling & dev server config
├── tailwind.config.js          # Tailwind CSS design system tokens
├── postcss.config.js           # PostCSS configuration
├── package.json                # Single unified full-stack package manifest
├── public/                     # Public static assets (logos, icons, favicons)
├── src/                        # Full-Stack Frontend Client Application
│   ├── components/             # Reusable UI (TaskModal, Badge, LoadingSkeleton, etc.)
│   ├── context/                # AuthContext & ToastContext (global session & alerts)
│   ├── layouts/                # MainLayout, AuthLayout, PublicLayout
│   ├── pages/                  # 12 Views (Kanban, Dashboard, AIAssistant, Analytics, etc.)
│   ├── services/               # Axios API client with automatic token & workspace interceptors
│   ├── utils/                  # Helper utilities, confetti triggers, date formatters
│   ├── App.jsx                 # Client routing engine & protected route guards
│   ├── main.jsx                # React DOM root render
│   └── index.css               # Tailwind design tokens & micro-animations
├── server/                     # Full-Stack Backend API & Business Logic
│   ├── src/
│   │   ├── config/             # MongoDB connection (with in-memory fallback) & env config
│   │   ├── controllers/        # Auth, Workspace, Project, Task, AI, Analytics controllers
│   │   ├── middleware/         # JWT verification, RBAC, Rate limiter, Error handler
│   │   ├── models/             # 8 Mongoose Schemas (User, Workspace, Project, Task, etc.)
│   │   ├── routes/             # Express API route endpoints
│   │   ├── services/           # Gemini AI service, Notification service, Demo seeder
│   │   ├── utils/              # Standalone DB seed scripts
│   │   ├── app.js              # Express app middleware & static client serving
│   │   └── server.js           # Server bootstrap and port listener
│   └── tests/                  # Automated integration tests (node:test + supertest)
├── .env.example                # Unified environment variable template
├── .gitignore                  # Git exclusions for secrets, builds, and node_modules
└── README.md                   # Project documentation
```

---

## 🚦 Local Setup Instructions

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git** installed on your system

### 2. Clone the Repository
```bash
git clone https://github.com/riyaladwa/CodeAlpha_ProjectManagementTool.git
cd CodeAlpha_ProjectManagementTool
```

### 3. Install All Dependencies (Single Command)
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5001/api
MONGODB_URI=mongodb://localhost:27017/taskflow_ai
JWT_SECRET=taskflow_ai_development_jwt_secret_key_super_secure_2026
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```
*(Note: If local MongoDB is not running, the application automatically boots an in-memory MongoDB instance for zero-friction evaluation).*

### 5. Run Automated Test Suite
Verify that all 14 backend integration tests pass:
```bash
npm run test
```
```
✔ TaskFlow AI Backend API Tests
  ✔ 1. Health Check endpoint returns healthy status
  ✔ 2. User Registration creates account and returns JWT token
  ✔ 3. Registering with duplicate email returns 409 conflict
  ✔ 4. User Login with valid credentials succeeds
  ✔ 5. User Login with invalid password fails with 401
  ✔ 6. Unauthenticated request to protected route returns 401
  ✔ 7. Authenticated user can fetch their workspaces
  ✔ 8. Create a new project inside the workspace
  ✔ 9. Create a task in the project
  ✔ 10. Update task status (Kanban drag-and-drop)
  ✔ 11. Add comment to task
  ✔ 12. AI Project Plan generation returns structured milestones & tasks
  ✔ 13. Analytics overview calculates real-time metrics
  ✔ 14. Cross-workspace security: unauthorized user cannot access workspace
ℹ tests 14 | pass 14 | fail 0
```

### 6. Start the Development Servers
Run both frontend and backend concurrently with one command:
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 📡 REST API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime and system health check | No |
| `POST` | `/api/auth/register` | Register new user and initialize workspace | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `POST` | `/api/auth/demo` | 1-Click Demo user login with sample data | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `PATCH`| `/api/auth/profile` | Update profile name, job title, avatar | Yes |
| `POST` | `/api/auth/change-password` | Change password with verification | Yes |
| `GET` | `/api/workspaces` | List all user workspaces | Yes |
| `POST` | `/api/workspaces` | Create a new team workspace | Yes |
| `GET` | `/api/projects` | Fetch all projects with computed progress | Yes |
| `POST` | `/api/projects` | Create a new project | Yes |
| `PATCH`| `/api/projects/:id` | Update project properties | Yes |
| `DELETE`| `/api/projects/:id`| Delete project and cascade tasks | Yes (Admin/Owner) |
| `GET` | `/api/tasks` | Get tasks (supports filters: assignee, priority, search) | Yes |
| `POST` | `/api/tasks` | Create a new task with checklist & tags | Yes |
| `PATCH`| `/api/tasks/:id/status`| Drag-and-drop Kanban status update | Yes |
| `POST` | `/api/tasks/:id/subtasks` | Append a subtask checklist item | Yes |
| `POST` | `/api/tasks/:id/comments` | Post a comment on a task | Yes |
| `POST` | `/api/ai/generate-project-plan`| AI milestone & task breakdown generation | Yes |
| `POST` | `/api/ai/break-down-task`| AI actionable checklist breakdown | Yes |
| `POST` | `/api/ai/batch-create-plan`| Commit approved AI tasks to database | Yes |
| `GET` | `/api/analytics/overview`| Real-time task distribution & velocity metrics | Yes |
| `GET` | `/api/calendar/tasks`| Schedule-formatted tasks for calendar | Yes |
| `GET` | `/api/notifications` | Fetch user alerts and unread counts | Yes |

---

## 🚀 How to Push to GitHub

Follow these steps to push this project to your GitHub account:

1. **Create a New Repository on GitHub**:
   - Go to [https://github.com/new](https://github.com/new)
   - Repository name: `TaskFlow-AI` (or `CodeAlpha_ProjectManagementTool`)
   - Description: `TaskFlow AI - Smart Project Management & Sprint Collaboration Platform for CodeAlpha Internship Task 3`
   - Select **Public**
   - **Do NOT** check "Add a README file", ".gitignore", or "license" (we already have them).
   - Click **Create repository**.

2. **Initialize Git and Commit Files Locally**:
   ```bash
   # Navigate to the project root directory:
   cd "/Users/riyapladwa/project mangement tool"

   # Initialize git repository
   git init -b main

   # Configure your Git username and email:
   git config user.name "Riya Ladwa"
   git config user.email "your-github-email@example.com"

   # Stage all files
   git add .

   # Commit changes
   git commit -m "feat: complete TaskFlow AI full-stack project management platform for CodeAlpha internship"
   ```

3. **Link Your Remote Repository and Push**:
   ```bash
   # Replace with your actual GitHub repository URL:
   git remote add origin https://github.com/riyaladwa/TaskFlow-AI.git

   # Push to main branch:
   git push -u origin main
   ```

---

## 🎓 CodeAlpha Submission Declaration

This project was built from scratch as part of the **CodeAlpha Full-Stack Web Development Internship**. All code, database schemas, styling components, and AI pipelines conform to modern full-stack web standards and fulfill all requirements for **Task 3: Project Management Tool**.

Developed with ❤️ by **Riya Ladwa** for **CodeAlpha**.
