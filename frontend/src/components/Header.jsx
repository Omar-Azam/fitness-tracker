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
  ];

  return (
    <>
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-200 shadow-sm dark:shadow-none">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-emerald-500/35 transition-all duration-200 ring-1 ring-white/20">
              <Dumbbell className="h-4.5 w-4.5 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
                Fitness Tracker
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                MERN Health Suite
              </span>
            </div>
          </Link>

          {/* Global Search Bar (Desktop & Tablet) */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 justify-center max-w-sm mx-3">
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
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile / Settings Link (Desktop) */}
                <Link
                  to="/settings"
                  className={`hidden md:flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    location.pathname === '/settings'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/80 shadow-sm'
                  }`}
                  title={`Settings (@${user?.username || 'user'})`}
                >
                  <div className="relative shrink-0">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.name || user?.username || 'Avatar'}
                        className="w-6 h-6 rounded-xl object-cover border border-emerald-500/40 shadow-xs"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold uppercase font-mono border border-emerald-500/30">
                        {user?.username ? user.username.charAt(0) : <SettingsIcon className="h-3 w-3" />}
                      </div>
                    )}
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <span className="text-xs font-bold max-w-[90px] truncate">
                    {user?.name || user?.username || 'Settings'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-xs"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible on mobile screens < 768px when authenticated) */}
      {isAuthenticated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
          {[...navLinks, { name: 'Settings', path: '/settings', icon: SettingsIcon }].map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            const isSettings = link.name === 'Settings';
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-150 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isSettings && user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Settings"
                    className={`w-5 h-5 rounded-lg object-cover border border-emerald-500/40 ${isActive ? 'scale-110 ring-1 ring-emerald-500' : ''} transition-transform`}
                  />
                ) : (
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'} transition-transform`} />
                )}
                <span className="text-[10px] tracking-tight">{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
