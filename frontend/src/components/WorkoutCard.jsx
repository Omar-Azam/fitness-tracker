import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Tag,
  Flame,
  Zap,
  Layers,
} from 'lucide-react';

const CATEGORY_STYLES = {
  strength: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-500',
    icon: Dumbbell,
    label: 'Strength',
  },
  cardio: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    dot: 'bg-amber-500',
    icon: Flame,
    label: 'Cardio',
  },
  flexibility: {
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25',
    dot: 'bg-teal-500',
    icon: Zap,
    label: 'Flexibility',
  },
  other: {
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
    dot: 'bg-purple-500',
    icon: Layers,
    label: 'Other',
  },
};

export default function WorkoutCard({ workout, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const categoryConfig =
    CATEGORY_STYLES[workout.category] || CATEGORY_STYLES.strength;
  const CategoryIcon = categoryConfig.icon;
  const exerciseCount = workout.exercises?.length || 0;

  const formattedDate = workout.date
    ? new Date(workout.date).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No date';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 shadow-sm dark:shadow-xl transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top row: Category Badge & Date & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${categoryConfig.badge}`}
            >
              <CategoryIcon className="h-3 w-3" />
              {categoryConfig.label}
            </span>

            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Calendar className="h-3 w-3 text-slate-400" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(workout)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
              title="Edit workout"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(workout)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer shadow-xs"
              title="Delete workout"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="pt-3.5">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {workout.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            {workout.duration > 0 && (
              <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                {workout.duration} mins
              </span>
            )}

            <span className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
              <Dumbbell className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
        </div>

        {/* Tags */}
        {workout.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {workout.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80"
              >
                <Tag className="h-2.5 w-2.5 text-slate-400 dark:text-slate-500" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Exercise details accordion */}
      {exerciseCount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer py-0.5"
          >
            <span>Exercise Breakdown ({exerciseCount})</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {expanded && (
            <div className="mt-2.5 space-y-1.5">
              {workout.exercises.map((ex, index) => (
                <div
                  key={index}
                  className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 text-xs flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span className="truncate pr-2">{ex.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px] shrink-0 font-extrabold">
                      {ex.sets} {ex.sets === 1 ? 'set' : 'sets'}
                      {ex.reps > 0 && ` × ${ex.reps}`}
                      {ex.weight > 0 && ` @ ${ex.weight}kg`}
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] italic">
                      "{ex.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
