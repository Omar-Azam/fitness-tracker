# 🏋️ Fitness Tracker (MERN Stack)

A clean, modular **MERN Stack** (MongoDB, Express.js, React, Node.js) application skeleton with fullstack authentication for building a modern fitness tracker.

---

## 📁 Project Structure

```
fitness-tracker/
├── backend/                  # Node.js + Express + Mongoose API
│   ├── config/
│   │   └── db.js             # Mongoose connection logic
│   ├── controllers/
│   │   ├── authController.js # Register, Login, Me, Profile controllers
│   │   └── healthController.js # Route controller logic
│   ├── middleware/
│   │   ├── auth.js           # JWT Bearer authentication middleware
│   │   ├── errorMiddleware.js# Central error and 404 handler
│   │   └── validator.js      # Request validation middleware
│   ├── models/               # Mongoose schema definitions
│   │   ├── User.js           # User model with bcrypt & validation
│   │   ├── Workout.js        # Workout model
│   │   ├── NutritionEntry.js # Nutrition logging model
│   │   ├── ProgressLog.js    # Progress & metrics model
│   │   ├── Notification.js   # Notification model
│   │   └── index.js          # Barrel exports
│   ├── routes/               # Express API routes
│   │   ├── authRoutes.js     # /api/auth endpoints
│   │   └── healthRoutes.js   # /api/health endpoint
│   ├── .env.example          # Sample environment variables
│   ├── .env                  # Local environment file (git-ignored)
│   ├── package.json
│   └── server.js             # API entrypoint
│
├── frontend/                 # React 19 + Vite + Tailwind CSS Client
│   ├── src/
│   │   ├── components/       # Reusable UI (Header, StatusCard, ProtectedRoute)
│   │   ├── context/          # AuthContext (token storage & global auth state)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page views (HomePage, Login, Register, Dashboard)
│   │   ├── services/
│   │   │   └── api.js        # Configured Axios instance with auth interceptor
│   │   ├── App.jsx           # React Router & AuthProvider configuration
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

## 🔐 Authentication API

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with username, email, password | No |
| `POST` | `/api/auth/login` | Login with email/username and password | No |
| `GET` | `/api/auth/me` | Get logged-in user profile (no password field) | Yes (Bearer Token) |
| `PUT` | `/api/auth/profile` | Update profile (`name`, `profilePicture`, `preferences`) | Yes (Bearer Token) |
| `GET` | `/api/health` | API health check endpoint | No |

---

## 🛡️ Error Handling & CORS

- **Central Error Handling**: All route errors and unhandled exceptions return structured JSON `{ error: "message" }`.
- **CORS**: Configured in `server.js` using `FRONTEND_URL` to allow seamless local development and cross-origin requests from the React client.
