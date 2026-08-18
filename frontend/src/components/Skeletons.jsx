import React from 'react';

/**
 * Skeleton placeholder for general card items (Workouts, Meals)
 */
export const CardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-5 bg-slate-800 rounded-lg w-1/3" />
      <div className="h-5 bg-slate-800 rounded-full w-16" />
    </div>
    <div className="space-y-2 pt-2">
      <div className="h-4 bg-slate-800/80 rounded w-3/4" />
      <div className="h-4 bg-slate-800/60 rounded w-1/2" />
    </div>
    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
      <div className="h-4 bg-slate-800 rounded w-1/4" />
      <div className="h-4 bg-slate-800 rounded w-1/6" />
    </div>
  </div>
);

/**
 * Skeleton placeholder for dashboard metric stat widgets
 */
export const StatCardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-3.5 bg-slate-800 rounded w-1/2" />
      <div className="h-9 w-9 bg-slate-800 rounded-xl" />
    </div>
    <div className="h-8 bg-slate-800 rounded-lg w-2/3" />
    <div className="h-3 bg-slate-800/60 rounded w-3/4" />
  </div>
);

/**
 * Skeleton placeholder for line charts and trends
 */
export const ChartSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-5 bg-slate-800 rounded w-40" />
        <div className="h-3 bg-slate-800/60 rounded w-28" />
      </div>
      <div className="h-8 bg-slate-800 rounded-xl w-32" />
    </div>
    <div className="h-64 bg-slate-950/60 border border-slate-800/40 rounded-xl flex items-end justify-between p-4 gap-2">
      {[40, 65, 50, 80, 70, 90, 85].map((height, i) => (
        <div
          key={i}
          style={{ height: `${height}%` }}
          className="bg-slate-800/60 rounded-t-lg flex-1 mx-1"
        />
      ))}
    </div>
  </div>
);

/**
 * Skeleton placeholder for body measurement cards
 */
export const MeasurementSkeleton = () => (
  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2 animate-pulse">
    <div className="h-3 bg-slate-800 rounded w-1/2" />
    <div className="h-6 bg-slate-800 rounded-lg w-3/4" />
    <div className="h-3 bg-slate-800/60 rounded w-1/3" />
  </div>
);

/**
 * Skeleton placeholder for activity feed rows
 */
export const ActivityItemSkeleton = () => (
  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-800" />
      <div className="space-y-1.5">
        <div className="h-4 bg-slate-800 rounded w-28" />
        <div className="h-3 bg-slate-800/60 rounded w-16" />
      </div>
    </div>
    <div className="h-4 bg-slate-800 rounded w-12" />
  </div>
);
