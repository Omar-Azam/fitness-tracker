import React from 'react';
import { Activity, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <Dumbbell className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              Fitness Tracker
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                MERN
              </span>
            </span>
            <p className="text-xs text-slate-400 hidden sm:block">Fullstack Skeleton</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">API Status:</span>
            <span className="font-mono text-emerald-400 font-medium">Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
