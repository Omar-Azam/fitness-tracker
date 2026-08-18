import React from 'react';
import {
  Dumbbell,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  User,
  Apple,
  TrendingUp,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Dumbbell className="h-4.5 w-4.5 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
              Fitness Tracker
            </span>
          </div>
        </Link>

        {/* Global Search Bar (Visible for authenticated users) */}
        {isAuthenticated && (
          <div className="hidden md:flex flex-1 justify-center max-w-sm mx-2">
            <SearchBar />
          </div>
        )}

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated ? (
            <>
              {/* Mobile Search Bar Toggle / Small Screen */}
              <div className="md:hidden">
                <SearchBar />
              </div>

              <Link
                to="/workouts"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-medium transition"
              >
                <Dumbbell className="h-3.5 w-3.5 text-emerald-400" />
                <span>Workouts</span>
              </Link>

              <Link
                to="/nutrition"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-medium transition"
              >
                <Apple className="h-3.5 w-3.5 text-emerald-400" />
                <span>Nutrition</span>
              </Link>

              <Link
                to="/progress"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-medium transition"
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Progress</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-medium transition"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Notification Bell */}
              <NotificationBell />

              {/* Settings Link */}
              <Link
                to="/settings"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
                title="Settings & Preferences"
              >
                <SettingsIcon className="h-4 w-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs sm:text-sm font-medium transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs sm:text-sm font-medium transition"
              >
                <LogIn className="h-4 w-4 text-slate-400" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs sm:text-sm font-semibold transition shadow-md shadow-emerald-500/20"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
