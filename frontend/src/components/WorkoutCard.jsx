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
} from 'lucide-react';

const CATEGORY_STYLES = {
  strength: {
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    dot: 'bg-cyan-400',
    label: 'Strength',
  },
  cardio: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Cardio',
  },
  flexibility: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Flexibility',
  },
  other: {
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
    label: 'Other',
  },
};

export default function WorkoutCard({ workout, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const categoryConfig =
    CATEGORY_STYLES[workout.category] || CATEGORY_STYLES.strength;
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl p-5 shadow-sm dark:shadow-lg transition duration-200">
      {/* Top row: Category Badge & Date & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryConfig.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${categoryConfig.dot}`} />
            {categoryConfig.label}
          </span>

          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(workout)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Edit workout"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(workout)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
            title="Delete workout"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="pt-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {workout.name}
        </h3>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
          {workout.duration > 0 && (
            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
              {workout.duration} mins
            </span>
          )}

          <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">
            <Dumbbell className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
          </span>
        </div>
      </div>

      {/* Tags */}
      {workout.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {workout.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80"
            >
              <Tag className="h-2.5 w-2.5 text-slate-400 dark:text-slate-500" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Exercise details accordion */}
      {exerciseCount > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <span>Exercise Breakdown ({exerciseCount})</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400 dark:text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-400" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {workout.exercises.map((ex, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{ex.name}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {ex.sets} {ex.sets === 1 ? 'set' : 'sets'}
                      {ex.reps > 0 && ` × ${ex.reps} reps`}
                      {ex.weight > 0 && ` @ ${ex.weight} kg/lbs`}
                    </span>
                  </div>
                  {ex.notes && (
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 italic">
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
