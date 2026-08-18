import React from 'react';

/**
 * Shared Page Header component for Workouts, Nutrition, Progress, and Settings
 */
export default function PageHeader({
  title,
  subtitle,
  count,
  countLabel = 'items',
  actions,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {count !== undefined && (
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {count} {count === 1 ? countLabel.replace(/s$/, '') : countLabel}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
