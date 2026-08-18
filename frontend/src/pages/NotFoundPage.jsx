import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-semibold text-sm transition duration-150 shadow-lg shadow-emerald-500/20"
      >
        <Home className="h-4 w-4" />
        Return to Home
      </Link>
    </div>
  );
}
