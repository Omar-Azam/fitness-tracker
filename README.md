# 🏋️ Fitness Tracker (MERN Stack)

A clean, modular, responsive, and secure **MERN Stack** (MongoDB, Express.js, React, Node.js) application with fullstack authentication, workout logging, daily nutrition tracking, progress charts, cross-module search, milestone notifications, CSV/PDF data export, toast notifications, loading skeletons, and production security hardening.

---

## 📁 Project Structure

```
fitness-tracker/
├── backend/                  # Node.js + Express + Mongoose API
│   ├── config/
│   │   └── db.js             # Mongoose connection logic
│   ├── controllers/
│   │   ├── authController.js # Register, Login, Me, Profile controllers
│   │   ├── exportController.js# Workouts & Nutrition CSV/PDF generator
│   │   ├── healthController.js # Route controller logic
│   │   ├── notificationController.js# Notifications list & mark-as-read
│   │   ├── nutritionController.js# Nutrition CRUD & daily summary aggregation
│   │   ├── progressController.js # Progress CRUD, time series trends & dashboard aggregation
│   │   ├── searchController.js   # Global search across workouts and nutrition
│   │   └── workoutController.js# Workout CRUD, filters & goal notification trigger
│   ├── middleware/
│   │   ├── auth.js           # JWT Bearer authentication middleware
│   │   ├── errorMiddleware.js# Central error handler with production stack trace shielding
│   │   ├── nutritionValidator.js# Nutrition validation middleware
│   │   ├── progressValidator.js # Progress validation middleware
│   │   ├── rateLimiter.js    # Rate limiting middleware for auth endpoints
│   │   ├── validator.js      # Auth validation middleware
│   │   └── workoutValidator.js# Workout validation middleware
│   ├── models/               # Mongoose schema definitions
│   │   ├── User.js           # User model with bcrypt & toJSON password shielding
│   │   ├── Workout.js        # Workout model with exercise subdocuments
│   │   ├── NutritionEntry.js # Nutrition logging model with food items
│   │   ├── ProgressLog.js    # Progress & metrics model with measurements
│   │   ├── Notification.js   # Notification model
│   │   └── index.js          # Barrel exports
│   ├── routes/               # Express API routes
│   │   ├── authRoutes.js     # /api/auth endpoints (rate limited)
│   │   ├── exportRoutes.js   # /api/export endpoints (CSV / PDF)
│   │   ├── healthRoutes.js   # /api/health endpoint
│   │   ├── notificationRoutes.js# /api/notifications endpoints
│   │   ├── nutritionRoutes.js# /api/nutrition endpoints
│   │   ├── progressRoutes.js # /api/progress endpoints
│   │   ├── searchRoutes.js   # /api/search endpoints
│   │   └── workoutRoutes.js  # /api/workouts endpoints
│   ├── .env.example          # Sample environment variables
│   ├── .env                  # Local environment file (git-ignored)
│   ├── package.json
│   └── server.js             # API entrypoint with Helmet, Morgan, and CORS
│
├── frontend/                 # React 19 + Vite + Tailwind CSS Client
│   ├── src/
│   │   ├── components/       # Reusable UI (Header, PageHeader, Skeletons, ErrorBoundary, SearchBar, NotificationBell, ExportButton, WorkoutCard, MealSection, TrendsChart, MeasurementCards, ProgressForm, DeleteConfirmModal)
│   │   ├── context/          # AuthContext (JWT & theme sync), ToastContext (global notifications)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page views (HomePage, Login, Register, Dashboard, Workouts, Nutrition, Progress, Settings, NotFoundPage)
│   │   ├── services/
│   │   │   └── api.js        # Configured Axios instance with auth interceptor
│   │   ├── App.jsx           # React Router, ErrorBoundary & ToastProvider configuration
│   │   ├── main.jsx          # React DOM root entry
│   │   └── index.css         # Tailwind CSS styling
│   ├── .env.example          # Frontend env sample
│   ├── .env                  # Frontend env file (git-ignored)
│   ├── package.json
│   └── vite.config.js        # Vite + Tailwind plugin config
│
├── .gitignore                # Git ignore rules for modules, env, and builds
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)

---

## ⚙️ Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd fitness-tracker/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   `.env` values:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/fitness-tracker
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend development server**:
   ```bash
   npm run dev
   ```
   *The API will start at `http://localhost:5000` with hot-reloading via Nodemon.*

---

## 💻 Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd fitness-tracker/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   `.env` values:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   *The React application will be available at `http://localhost:5173`.*

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📱 Responsive UI & Polish Highlights

- **Mobile Navigation (375px+)**: Sleek bottom navigation bar for mobile thumb navigation across Dashboard, Workouts, Nutrition, Progress, and Settings.
- **Loading Skeletons (`components/Skeletons.jsx`)**: Animated shimmer placeholders for cards, stats, charts, and activity feeds during data fetching.
- **Global Toast System (`context/ToastContext.jsx`)**: Non-blocking, animated feedback messages (`toast.success()`, `toast.error()`) for all user mutations.
- **Error Boundary (`components/ErrorBoundary.jsx`)**: React Error Boundary preventing screen crashes with quick reload and home redirection.
- **Shared Page Header (`components/PageHeader.jsx`)**: Standardized responsive header with title, subtitle, count badges, and action slots.

---

## 🔌 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)

*Rate-limited to 15 requests per 15-minute window via `express-rate-limit`.*

| Method | Endpoint | Description | Rate Limited | Auth Required |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with username, email, password | Yes (15 / 15m) | No |
| `POST` | `/api/auth/login` | Login with email/username and password | Yes (15 / 15m) | No |
| `GET` | `/api/auth/me` | Get logged-in user profile (no password field) | No | Yes (Bearer Token) |
| `PUT` | `/api/auth/profile` | Update profile (`name`, `profilePicture`, `preferences`) | No | Yes (Bearer Token) |

### 🏋️ Workouts (`/api/workouts`)

*All workout endpoints are user-scoped with strict isolation. Automatically creates milestone notifications upon completing 3+ workouts in a week.*

| Method | Endpoint | Description | Query Parameters | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/workouts` | List user's workouts | `category`, `tag`, `from`, `to`, `page`, `limit` | Yes (Bearer Token) |
| `POST` | `/api/workouts` | Create a workout | — | Yes (Bearer Token) |
| `GET` | `/api/workouts/:id` | Get single workout by ID | — | Yes (Bearer Token) |
| `PUT` | `/api/workouts/:id` | Update workout | — | Yes (Bearer Token) |
| `DELETE` | `/api/workouts/:id` | Delete workout | — | Yes (Bearer Token) |

### 🥗 Nutrition (`/api/nutrition`)

*All nutrition endpoints are user-scoped with strict isolation.*

| Method | Endpoint | Description | Query Parameters | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/nutrition` | List user's nutrition entries | `date`, `mealType`, `from`, `to` | Yes (Bearer Token) |
| `GET` | `/api/nutrition/summary` | Get day totals (`totalCalories`, `totalProtein`, `totalCarbs`, `totalFat`) | `date=YYYY-MM-DD` | Yes (Bearer Token) |
| `POST` | `/api/nutrition` | Create a nutrition entry | — | Yes (Bearer Token) |
| `PUT` | `/api/nutrition/:id` | Update nutrition entry | — | Yes (Bearer Token) |
| `DELETE` | `/api/nutrition/:id` | Delete nutrition entry | — | Yes (Bearer Token) |

### 📈 Progress & Trends (`/api/progress`)

*All progress endpoints are user-scoped with strict isolation.*

| Method | Endpoint | Description | Query Parameters | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/progress` | List user's progress logs | `from`, `to` | Yes (Bearer Token) |
| `GET` | `/api/progress/trends` | Time series for charts | `metric=weight` or custom metric name, `from`, `to` | Yes (Bearer Token) |
| `GET` | `/api/progress/dashboard-summary` | Aggregated weekly stats, weight sparkline & recent activity | — | Yes (Bearer Token) |
| `POST` | `/api/progress` | Create a progress log | — | Yes (Bearer Token) |
| `PUT` | `/api/progress/:id` | Update progress log | — | Yes (Bearer Token) |
| `DELETE` | `/api/progress/:id` | Delete progress log | — | Yes (Bearer Token) |

### 🔍 Unified Search (`/api/search`)

| Method | Endpoint | Description | Query Parameters | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/search` | Search across workouts & meals | `q=[query]`, `type=workout\|nutrition\|all` | Yes (Bearer Token) |

### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notifications` | List user's notifications and unread count | Yes (Bearer Token) |
| `PUT` | `/api/notifications/:id/read` | Mark a notification as read | Yes (Bearer Token) |

### 📥 Data Export (`/api/export`)

| Method | Endpoint | Description | Query Parameters | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/export/workouts` | Export workouts log as CSV or PDF | `format=csv\|pdf` | Yes (Bearer Token) |
| `GET` | `/api/export/nutrition` | Export nutrition entries as CSV or PDF | `format=csv\|pdf` | Yes (Bearer Token) |

---

## 🛡️ Security & Reliability Architecture

1. **HTTP Security Headers (`helmet`)**:
   - Automatic protection against MIME-sniffing (`X-Content-Type-Options: nosniff`), clickjacking (`X-Frame-Options: SAMEORIGIN`), XSS, and HSTS headers.
2. **Brute Force Protection (`express-rate-limit`)**:
   - `/api/auth/login` and `/api/auth/register` endpoints are limited to 15 requests per 15 minutes per IP address with `429 Too Many Requests` responses.
3. **Password Shielding (Defense in Depth)**:
   - Passwords hashed with bcrypt (salt cost 10).
   - Mongoose schema `toJSON` & `toObject` transform automatically deletes `password` and `__v` upon serialization.
   - Controllers and auth middleware use `.select('-password')` and manual `sanitizeUser` stripping.
4. **Tenant Isolation (`req.user._id`)**:
   - Every single query, mutation, and deletion in workouts, nutrition, progress, search, notifications, and export requires a matching `user: req.user._id`.
5. **Input Validation & Sanitization**:
   - All write endpoints run through dedicated request validator middlewares before controller execution.
6. **Central Error Handler**:
   - In production (`NODE_ENV=production`), logs real errors with full stack traces server-side while masking 500 error details and suppressing stack traces to clients.
7. **Development Logging (`morgan`)**:
   - Formatted HTTP request logs in development mode.
