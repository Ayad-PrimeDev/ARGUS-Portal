# ARGUS Portal

A modern, full-stack Lost & Found management system designed for individuals and communities to report, search, verify, and return lost personal belongings with challenge-based ownership verification, reputation scoring, and administrative moderation.

- **Live Web Application:** [https://majestic-empanada-19e10d.netlify.app](https://majestic-empanada-19e10d.netlify.app)
- **API Service:** [https://argus-portal-q5q6.onrender.com/api](https://argus-portal-q5q6.onrender.com/api)
- **Source Repository:** [https://github.com/Ayad-PrimeDev/ARGUS-Portal](https://github.com/Ayad-PrimeDev/ARGUS-Portal)

---

## Overview

In shared environments and public spaces—such as workplaces, residential communities, educational institutions, and public venues—personal belongings such as identification cards, electronics, keys, and wallets are frequently misplaced. Traditional recovery relies on informal social media groups, bulletin boards, and unverified handovers, creating privacy risks and fraudulent claims.

**ARGUS Portal** provides a centralized, authenticated platform to streamline lost and found recovery for individuals, organizations, and communities:
- **Centralized Item Registry:** Distinct tracking for lost and found reports with categories, timestamps, locations, and descriptions.
- **Challenge Verification:** Ownership verification prompts where claimants must answer submitter-defined challenge questions before handovers.
- **Personal Control Dashboards:** Dedicated panels for users to monitor their reports, inspect incoming claims, and track recovery requests.
- **Trust & Reputation Scoring:** Automated point accrual (+10 pts per report, +150 pts per completed return), achievement tiers (Bronze through Diamond), and verified peer reviews.
- **Administrative Operations Center:** Comprehensive moderation suite enabling administrators to manage accounts, moderate listings, resolve claim disputes, and inspect immutable system audit logs.

---

## Key Features

- **Authentication & Security:** JSON Web Tokens transmitted exclusively via HTTP-only, SameSite cookies to protect against XSS token leakage; `bcrypt` password hashing; token-based password recovery; and IP rate limiting for sensitive auth actions.
- **Lost & Found Reporting:** Categorized item submission with optional ownership challenge questions (e.g., *"What sticker is on the laptop lid?"*), in-place submitter editing, and listing deletion with claim cascading.
- **Search & Multi-Facet Filtering:** Live search across listing titles, descriptions, and locations; filter tabs for All, Lost Only, and Found Only; and category-based filtering.
- **Claim & Verification Workflow:** Secure claim submission requiring claimants to provide explanatory notes and answers to verification questions; self-claim prevention; and resolution automation that transitions items to `CLAIMED` while rejecting competing pending claims.
- **Reputation & Tier System:** Contribution score tracking awarding points for active participation (+10 pts per report, +150 pts per completed return); achievement tiers (Bronze, Silver, Gold, Platinum, Diamond); and verified 1–5 star peer reviews.
- **Admin Operations Center:** Overview metrics, user role management and account suspensions, content moderation queue to hide fraudulent listings, dispute determination, and immutable audit logs.

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Declarative UI component library |
| **Vite** | `^8.3.0` | Development server and build tooling |
| **React Router DOM** | `^7.18.4` | Client-side routing and protected route guards |
| **Tailwind CSS** | `^4.3.3` | Utility-first styling via `@tailwindcss/vite` |
| **Axios** | `^1.20.0` | HTTP client configured with credentials support |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=18.x` | JavaScript runtime environment |
| **Express.js** | `^5.2.1` | REST API framework and routing |
| **Mongoose** | `^9.10.2` | MongoDB object data modeling (ODM) |
| **jsonwebtoken** | `^9.0.3` | Signed stateless token authentication |
| **bcrypt** | `^6.0.0` | Cryptographic password hashing |
| **cookie-parser** | `^1.4.7` | HTTP request cookie parser |
| **express-rate-limit** | `^8.7.1` | Endpoint abuse and brute-force protection |
| **express-validator** | `^7.3.2` | Request body validation schemas and sanitization |
| **nodemailer** | `^10.2.1` | SMTP transactional email transport |
| **helmet** | `^8.3.0` | HTTP security headers middleware |
| **cors** | `^2.8.6` | Cross-Origin Resource Sharing configuration |
| **dotenv** | `^18.0.3` | Environment variable management |

### Database
- **MongoDB**: Document database storing collections for `users`, `items`, `claims`, `ratings`, and `auditlogs`.

---

## Project Structure

```text
ARGUS-Portal/
├── Backend/
│   ├── config/
│   │   └── db.js                    # Database connection via Mongoose
│   ├── controllers/
│   │   ├── adminController.js       # Admin statistics, users, moderation & audit logs
│   │   ├── authController.js        # Authentication, sessions & password recovery
│   │   ├── claimController.js       # Claim filing, verification & resolution workflow
│   │   ├── itemController.js        # Lost & found item CRUD, search & filtering
│   │   └── userController.js        # Profiles, reputation scoring & peer ratings
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT cookies, admin authorization & password reset rate limiter
│   │   ├── errorMiddleware.js       # 404 handler and centralized JSON error responses
│   │   └── validateMiddleware.js    # Express-validator input validation schemas
│   ├── models/
│   │   ├── AuditLog.js              # Administrative audit trail schema
│   │   ├── Claim.js                 # Item claim schema with verification answer
│   │   ├── Item.js                  # Lost and found item listing schema
│   │   ├── Rating.js                # Peer rating and review schema
│   │   └── User.js                  # User account and profile schema
│   ├── routes/
│   │   ├── adminRoutes.js           # /api/admin endpoints
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── claimRoutes.js           # /api/claims endpoints
│   │   ├── itemRoutes.js            # /api/items endpoints
│   │   └── userRoutes.js            # /api/users endpoints
│   ├── scripts/
│   │   └── makeAdmin.js             # CLI script to grant admin privileges to a user
│   ├── utils/
│   │   └── helpers.js               # Consolidated email dispatch & search regex sanitization
│   ├── .env.example                 # Template for backend environment variables
│   ├── package.json                 # Backend dependencies and scripts
│   └── server.js                    # Express application entry point
├── Frontend/
│   ├── public/                      # Static assets, branding logo & redirects
│   ├── src/
│   │   ├── components/              # Modals, Navbar, Footer, and ProtectedRoute (with AdminRoute)
│   │   ├── constants/               # categories.js (predefined item category definitions)
│   │   ├── context/                 # AuthContext.jsx (global authentication state)
│   │   ├── pages/                   # User pages and admin/ management views
│   │   ├── services/                # Axios instance (api.js) and domain API services
│   │   ├── utils/                   # dateUtils.js (date formatting utilities)
│   │   ├── App.jsx                  # Client-side routing configuration
│   │   ├── index.css                # Global CSS styles and Tailwind imports
│   │   └── main.jsx                 # Client entry point
│   ├── .env.example                 # Template for frontend environment variables
│   ├── package.json                 # Frontend dependencies and scripts
│   └── vite.config.js               # Vite build configuration
└── README.md
```

---

## Installation and Setup

### Prerequisites
- **Node.js** (v18.x or higher) and **npm** (v9.x or higher)
- **MongoDB** (Local Community Server running on `mongodb://localhost:27017` or a cloud-hosted MongoDB Atlas cluster)
- **Git**

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Ayad-PrimeDev/ARGUS-Portal.git
cd ARGUS-Portal
```

#### 2. Backend Setup
```bash
cd Backend
npm install

# Copy environment template (Linux/macOS)
cp .env.example .env
# Windows (Command Prompt / PowerShell):
copy .env.example .env

# Start development server on http://localhost:5000
npm run dev
```
> **Tip:** To grant admin privileges to an account, run: `node scripts/makeAdmin.js <user-email>`

#### 3. Frontend Setup
```bash
cd ../Frontend
npm install

# Copy environment template (Linux/macOS)
cp .env.example .env
# Windows (Command Prompt / PowerShell):
copy .env.example .env

# Start client development server on http://localhost:5173
npm run dev
```

> **Important Environment Note:** The frontend uses a single environment file (`Frontend/.env`). By default, the active URL points to the hosted Render backend (`https://argus-portal-q5q6.onrender.com/api`). As a result, both local development (`npm run dev`) and production builds will communicate with the live Render backend unless you update `Frontend/.env` to point to your local server.

---

## Environment Variables

### Backend Configuration (`Backend/.env`)

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port on which the Express server listens | `5000` |
| `NODE_ENV` | Optional | Application runtime mode (`development` / `production`) | `development` |
| `CLIENT_URL` | Optional | Frontend origin for CORS policy | `http://localhost:5173` |
| `MONGO_URI` | **Yes** | MongoDB connection string (Local or MongoDB Atlas) | `mongodb://localhost:27017/argus_portal` |
| `JWT_SECRET` | **Yes** | Secret key used to sign and verify authentication JWT cookies | `your_secure_jwt_secret_min_32_chars` |
| `SMTP_HOST` | Optional | SMTP host for password reset emails | `smtp.example.com` |
| `SMTP_PORT` | Optional | SMTP port number | `587` |
| `SMTP_SECURE`| Optional | Set to `true` for SSL (port 465) or `false` for TLS (port 587) | `false` |
| `SMTP_USER` | Optional | SMTP authentication username / email | `user@example.com` |
| `SMTP_PASS` | Optional | SMTP authentication password / app password | `your_smtp_app_password` |
| `FROM_EMAIL` | Optional | Sender address appearing in outgoing emails | `no-reply@argusportal.com` |
| `FROM_NAME` | Optional | Display name appearing in outgoing emails | `ARGUS Portal` |

> *Note on Password Reset:* If SMTP is unconfigured during development, `POST /api/auth/forgot-password` generates a local `devResetUrl` directly in the JSON response for easy testing.

### Frontend Configuration (`Frontend/.env`)

The frontend uses a single `Frontend/.env` file. To switch between local and production backends, toggle the commented lines:

```env
# LOCAL DEVELOPMENT
# VITE_API_URL=http://localhost:5000/api

# PRODUCTION (RENDER)
VITE_API_URL=https://argus-portal-q5q6.onrender.com/api
```

| Variable | Required | Description | Default / Active Value |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | Base URL pointing to the Backend REST API | `https://argus-portal-q5q6.onrender.com/api` |

---

## API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear authentication cookie session |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token / email |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset password using verified token |
| `GET` | `/api/items` | Public | Retrieve items with search and filters |
| `GET` | `/api/items/:id` | Public | Retrieve single item details |
| `POST` | `/api/items` | Private | Create a new lost or found item report |
| `PUT` | `/api/items/:id` | Private | Update an item report (submitter only) |
| `DELETE` | `/api/items/:id` | Private | Delete an item report and associated claims |
| `POST` | `/api/claims` | Private | Submit a claim on a found item |
| `GET` | `/api/claims/my-claims` | Private | List claims filed by the authenticated user |
| `PUT` | `/api/claims/:id/status` | Private | Accept or reject a claim (submitter only) |
| `GET` | `/api/users/profile` | Private | Get user profile and reputation statistics |
| `POST` | `/api/users/rate` | Private | Submit a peer rating and review for a return |
| `GET` | `/api/admin/stats` | Admin | Get system metrics and counts |
| `GET` | `/api/admin/users` | Admin | Search and inspect user accounts |
| `PUT` | `/api/admin/users/:id/role` | Admin | Update user role (`USER` / `ADMIN`) |
| `PUT` | `/api/admin/users/:id/suspend` | Admin | Suspend or reactivate user account |
| `GET` | `/api/admin/logs` | Admin | Inspect immutable administrative audit logs |
