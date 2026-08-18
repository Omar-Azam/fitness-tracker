# 🏋️ Fitness Tracker (MERN Stack)

A clean, modular **MERN Stack** (MongoDB, Express.js, React, Node.js) application skeleton for building a modern fitness tracker.

---

## 📁 Project Structure

```
fitness-tracker/
├── backend/                  # Node.js + Express + Mongoose API
│   ├── config/
│   │   └── db.js             # Mongoose connection logic
│   ├── controllers/
│   │   └── healthController.js # Route controller logic
│   ├── middleware/
│   │   └── errorMiddleware.js  # Central error and 404 handler
│   ├── models/               # Mongoose schema definitions
│   │   └── .gitkeep
│   ├── routes/               # Express API routes
│   │   └── healthRoutes.js
│   ├── .env.example          # Sample environment variables
│   ├── .env                  # Local environment file (git-ignored)
│   ├── package.json
│   └── server.js             # API entrypoint
│
├── frontend/                 # React 19 + Vite + Tailwind CSS Client
│   ├── src/
│   │   ├── components/       # Reusable UI components (Header, StatusCard, etc.)
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page views (HomePage, NotFoundPage, etc.)
│   │   ├── services/
│   │   │   └── api.js        # Configured Axios instance with baseURL
│   │   ├── App.jsx           # React Router configuration
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

5. **Verify health endpoint**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   *Expected response:*
   ```json
   {
     "status": "ok",
     "message": "Fitness Tracker API is operational",
     "timestamp": "2026-08-18T...",
     "uptime": 12.34
   }
   ```

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

## 🔌 API Verification & Integration

- **Backend Health Check**: `GET /api/health`
- **Frontend Live Check**: Open `http://localhost:5173` in your browser. The homepage automatically queries `/api/health` via the configured Axios service and displays a real-time status badge with uptime and timestamp information.

---

## 🛡️ Error Handling & CORS

- **Central Error Handling**: All route errors and unhandled exceptions are caught by `middleware/errorMiddleware.js`, formatting errors as structured JSON responses.
- **CORS**: Configured in `server.js` using `FRONTEND_URL` to allow seamless local development and cross-origin requests from the React client.
