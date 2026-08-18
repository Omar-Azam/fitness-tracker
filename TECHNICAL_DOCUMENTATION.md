# 🏋️ Fitness Tracker — Technical Documentation

A comprehensive technical reference for the **Fitness Tracker** MERN stack application, documenting the system architecture, security implementation, database schemas, REST API endpoints, and development setup instructions.

---

## 🏛️ System Architecture

The application is engineered following a decoupled, multi-tiered **MERN (MongoDB, Express.js, React, Node.js)** architecture.

```
+-----------------------------------------------------------------------------------+
|                                CLIENT TIER (Frontend)                             |
|  React 19 + Vite 8 + Tailwind CSS 4 + Lucide Icons + Recharts + React Router 7    |
|                                                                                   |
|  [ AuthContext ] <---> [ ToastContext ] <---> [ ErrorBoundary ]                   |
|  [ Pages: Dashboard, Workouts, Nutrition, Progress, Settings, Login, Register ]   |
|  [ Axios HTTP Client (Authorization: Bearer <JWT> Interceptor) ]                  |
+-----------------------------------------------------------------------------------+
                                         │
                                   HTTP / HTTPS
                                         │
+-----------------------------------------------------------------------------------+
|                                SERVER TIER (Backend)                              |
|  Node.js (v18+) + Express.js 4 REST API                                           |
|                                                                                   |
|  [ Global Middleware ]: Helmet Security Headers, Morgan Logger, CORS, RateLimit  |
|  [ Auth Layer ]: JWT Bearer Verification (`middleware/auth.js`)                   |
|  [ Validation Layer ]: Dedicated request sanitizers & validators                  |
|  [ Controllers ]: auth, workout, nutrition, progress, search, export, notif       |
|  [ Central Error Handler ]: Sanitized error responses & production stack masking |
+-----------------------------------------------------------------------------------+
                                         │
                                  Mongoose ODM (v8)
                                         │
+-----------------------------------------------------------------------------------+
|                               DATABASE TIER (MongoDB)                             |
|  MongoDB (Local or Atlas Cluster) / MongoMemoryServer (In-Memory Testing)         |
|                                                                                   |
|  Collections: users, workouts, nutritionentries, progresslogs, notifications     |
|  Indexes: Compound tenant indices ({ user: 1, date: -1 }), unique constraints     |
+-----------------------------------------------------------------------------------+
```

---

## 🛡️ Security & Reliability Features

1. **Helmet HTTP Security Headers**: Mitigates Cross-Site Scripting (XSS), MIME-type sniffing (`X-Content-Type-Options: nosniff`), and clickjacking (`X-Frame-Options: SAMEORIGIN`).
2. **Brute-Force Rate Limiting (`express-rate-limit`)**: Limits authentication endpoints (`/api/auth/login`, `/api/auth/register`) to 15 requests per 15-minute window per IP.
3. **Multi-Tenant Data Isolation**: Every read, write, update, and delete operation on user resources (`workouts`, `nutrition`, `progress`, `notifications`, `export`, `search`) strictly filters by `user: req.user._id`.
4. **Password Hashing & Serialization Shielding**:
   - Passwords hashed using bcrypt with salt rounds of 10.
   - Mongoose schemas configure `toJSON` and `toObject` transforms to strip `password` and `__v` from all JSON payloads before leaving the server.
5. **Centralized Error Handling**: Ensures stack traces and database internal error messages are never leaked in production (`NODE_ENV=production`), returning structured `{ error: "message" }` JSON responses.

---

## 🗄️ Database Schemas & Data Models

### 1. User Model (`User.js`)
Represents an authenticated account with user preferences.

```javascript
{
  username: { type: String, required: true, unique: true, lowercase: true, minlength: 3, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 }, // bcrypt hashed
  name: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  preferences: {
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    notificationsEnabled: { type: Boolean, default: true }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Workout Model (`Workout.js`)
Represents a workout session with an embedded array of exercise subdocuments.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['strength', 'cardio', 'flexibility', 'other'], default: 'strength' },
  tags: [{ type: String, trim: true }],
  exercises: [
    {
      name: { type: String, required: true },
      sets: { type: Number, default: 1, min: 1 },
      reps: { type: Number, default: 0, min: 0 },
      weight: { type: Number, default: 0, min: 0 },
      notes: { type: String, default: '' }
    }
  ],
  date: { type: Date, required: true, default: Date.now },
  duration: { type: Number, default: 0, min: 0 }, // in minutes
  createdAt: Date,
  updatedAt: Date
}
```
*Indexes: `{ user: 1, date: -1 }`, `{ user: 1, category: 1 }`*

### 3. NutritionEntry Model (`NutritionEntry.js`)
Represents meal records containing a list of food items and calculated macronutrients.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  foodItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, default: 1, min: 0 },
      unit: { type: String, default: 'serving' },
      calories: { type: Number, default: 0, min: 0 },
      protein: { type: Number, default: 0, min: 0 }, // in grams
      carbs: { type: Number, default: 0, min: 0 },   // in grams
      fat: { type: Number, default: 0, min: 0 }      // in grams
    }
  ],
  date: { type: Date, required: true, default: Date.now },
  createdAt: Date,
  updatedAt: Date
}
```
*Indexes: `{ user: 1, date: -1 }`, `{ user: 1, mealType: 1, date: -1 }`*

### 4. ProgressLog Model (`ProgressLog.js`)
Represents body measurement tracking and user-defined athletic performance milestones.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, default: Date.now },
  weight: { type: Number, min: 0 },
  bodyMeasurements: {
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hips: { type: Number, min: 0 },
    arms: { type: Number, min: 0 },
    thighs: { type: Number, min: 0 }
  },
  performanceMetrics: [
    {
      metricName: { type: String, required: true, trim: true },
      value: { type: Number, required: true, min: 0 },
      unit: { type: String, default: '' }
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```
*Index: `{ user: 1, date: -1 }`*

### 5. Notification Model (`Notification.js`)
Represents milestone alerts and system notifications.

```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['workout_reminder', 'meal_reminder', 'goal_achieved', 'system'], required: true },
  message: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}
```
*Indexes: `{ user: 1, read: 1, createdAt: -1 }`, `{ user: 1, createdAt: -1 }`*

---

## 🔌 API Endpoints Reference

All data endpoints require an `Authorization: Bearer <JWT>` header unless designated as Public.

### Authentication Endpoints (`/api/auth`)
| Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | 15 / 15m | Register new user account with `username`, `email`, `password`, `name` |
| `POST` | `/api/auth/login` | No | 15 / 15m | Authenticate user credentials and receive JWT |
| `GET` | `/api/auth/me` | **Yes** | No | Return currently logged-in user profile (no password) |
| `PUT` | `/api/auth/profile` | **Yes** | No | Update user details (`name`, `profilePicture`, `preferences`) |

### Workout Endpoints (`/api/workouts`)
| Method | Path | Auth | Query / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/workouts` | **Yes** | `?category=`, `?tag=`, `?from=`, `?to=`, `?page=`, `?limit=` | List user's workouts with pagination and filtering |
| `POST` | `/api/workouts` | **Yes** | — | Create workout and trigger milestone notification on 3+ weekly workouts |
| `GET` | `/api/workouts/:id` | **Yes** | `id` (Workout ID) | Retrieve single workout document |
| `PUT` | `/api/workouts/:id` | **Yes** | `id` (Workout ID) | Update workout details, metadata, and exercises |
| `DELETE` | `/api/workouts/:id` | **Yes** | `id` (Workout ID) | Permanently delete workout document |

### Nutrition Endpoints (`/api/nutrition`)
| Method | Path | Auth | Query / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/nutrition` | **Yes** | `?date=YYYY-MM-DD`, `?mealType=`, `?from=`, `?to=` | List user's nutrition entries for day or date range |
| `GET` | `/api/nutrition/summary` | **Yes** | `?date=YYYY-MM-DD` | Aggregated daily totals (`totalCalories`, `totalProtein`, `totalCarbs`, `totalFat`) |
| `POST` | `/api/nutrition` | **Yes** | — | Log meal with food items and macro values |
| `PUT` | `/api/nutrition/:id` | **Yes** | `id` (Nutrition ID) | Update meal entry and food items |
| `DELETE` | `/api/nutrition/:id` | **Yes** | `id` (Nutrition ID) | Delete meal entry |

### Progress Endpoints (`/api/progress`)
| Method | Path | Auth | Query / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/progress` | **Yes** | `?from=`, `?to=` | List progress logs in descending date order |
| `GET` | `/api/progress/trends` | **Yes** | `?metric=weight` or custom name, `?from=`, `?to=` | Get time series data points `[{date, value}]` for charts |
| `GET` | `/api/progress/dashboard-summary` | **Yes** | — | Returns weekly workout count, nutrition count, sparkline, and recent feeds |
| `POST` | `/api/progress` | **Yes** | — | Create progress log with weight, measurements, and performance metrics |
| `PUT` | `/api/progress/:id` | **Yes** | `id` (Log ID) | Update progress log entry |
| `DELETE` | `/api/progress/:id` | **Yes** | `id` (Log ID) | Delete progress log entry |

### Unified Search (`/api/search`)
| Method | Path | Auth | Query Params | Description |
|---|---|---|---|---|
| `GET` | `/api/search` | **Yes** | `?q=[term]`, `?type=workout\|nutrition\|all` | Search across user's workouts and food logs |

### Notification Endpoints (`/api/notifications`)
| Method | Path | Auth | Query / Params | Description |
|---|---|---|---|---|
| `GET` | `/api/notifications` | **Yes** | — | List all notifications and total unread count |
| `PUT` | `/api/notifications/:id/read` | **Yes** | `id` (Notification ID) | Mark a notification as read |

### Data Export Endpoints (`/api/export`)
| Method | Path | Auth | Query Params | Description |
|---|---|---|---|---|
| `GET` | `/api/export/workouts` | **Yes** | `?format=csv\|pdf` | Export user workout history in CSV or PDF format |
| `GET` | `/api/export/nutrition` | **Yes** | `?format=csv\|pdf` | Export user nutrition logs in CSV or PDF format |

### System Health (`/api/health`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | System health check (MongoDB connection state, uptime, timestamp) |

---

## ⚙️ Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Local MongoDB daemon running on `27017` or a MongoDB Atlas URI string

---

### 2. Backend Setup
1. **Navigate to the backend directory**:
   ```bash
   cd fitness-tracker/backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables (`.env`)**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Required variables*:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/fitness-tracker
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=http://localhost:5173
   ```
4. **Start the API server**:
   ```bash
   npm run dev
   ```
   *API will run at `http://localhost:5000`.*
5. **Run backend automated tests**:
   ```bash
   npm test
   ```

---

### 3. Frontend Setup
1. **Navigate to the frontend directory**:
   ```bash
   cd fitness-tracker/frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables (`.env`)**:
   ```bash
   cp .env.example .env
   ```
   *Required variable*:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```
   *Application will open at `http://localhost:5173`.*
5. **Run frontend component tests**:
   ```bash
   npm test
   ```
6. **Build for production**:
   ```bash
   npm run build
   ```
