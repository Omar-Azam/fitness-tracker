import React from 'react';
import {
  Dumbbell,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Apple,
  TrendingUp,
  Settings as SettingsIcon,
  Home,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workouts', path: '/workouts', icon: Dumbbell },
    { name: 'Nutrition', path: '/nutrition', icon: Apple },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Dumbbell className="h-4.5 w-4.5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Fitness Tracker
              </span>
            </div>
          </Link>

          {/* Global Search Bar (Desktop & Tablet) */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 justify-center max-w-sm mx-2">
              <SearchBar />
            </div>
          )}

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Mobile Search Bar popover trigger */}
                <div className="md:hidden">
                  <SearchBar />
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                  {navLinks.slice(0, 4).map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile / Settings Link (Desktop) */}
                <Link
                  to="/settings"
                  className={`hidden md:flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border transition cursor-pointer ${
                    location.pathname === '/settings'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80'
                  }`}
                  title={`Settings (@${user?.username || 'user'})`}
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name || user?.username || 'Avatar'}
                      className="w-6 h-6 rounded-lg object-cover border border-emerald-500/40 shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold uppercase font-mono shrink-0">
                      {user?.username ? user.username.charAt(0) : <SettingsIcon className="h-3.5 w-3.5" />}
                    </div>
                  )}
                  <span className="text-xs font-semibold max-w-[85px] truncate">
                    {user?.name || user?.username || 'Settings'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 border border-rose-500/20 text-xs font-medium transition cursor-pointer"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm font-medium transition"
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

      {/* Mobile Bottom Navigation Bar (Visible on mobile screens < 768px when authenticated) */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            const isSettings = link.name === 'Settings';
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isSettings && user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Settings"
                    className={`w-5 h-5 rounded-md object-cover border border-emerald-500/40 ${isActive ? 'scale-110' : ''} transition-transform`}
                  />
                ) : (
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                )}
                <span className="text-[10px] font-semibold tracking-tight">{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
