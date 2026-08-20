import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, Dumbbell, Apple, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-12">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
          <span className="text-4xl font-extrabold font-mono tracking-tighter">404</span>
        </div>
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400">
          LOST ROUTE
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The destination you are looking for doesn't exist, was renamed, or has been moved. Explore our core tracking modules below.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Go to Dashboard</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Quick Navigation Pills */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 w-full max-w-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
          Quick Navigation
        </span>
        <div className="flex justify-center gap-3">
          <Link
            to="/workouts"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Workouts</span>
          </Link>
          <Link
            to="/nutrition"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <Apple className="h-3.5 w-3.5" />
            <span>Nutrition</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
