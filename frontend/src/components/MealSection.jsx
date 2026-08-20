import React from 'react';
import {
  Coffee,
  Sun,
  Moon,
  Cookie,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Utensils,
} from 'lucide-react';

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const MEAL_COLORS = {
  breakfast: {
    bg: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-300',
  },
  lunch: {
    bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-300',
  },
  dinner: {
    bg: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    badge: 'bg-cyan-500/10 text-cyan-300',
  },
  snack: {
    bg: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-300',
  },
};

export default function MealSection({
  mealType,
  entries = [],
  onAdd,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const IconComponent = MEAL_ICONS[mealType] || Utensils;
  const colorTheme = MEAL_COLORS[mealType] || MEAL_COLORS.breakfast;

  // Calculate totals for this meal section
  let mealCalories = 0;
  let mealProtein = 0;
  let mealCarbs = 0;
  let mealFat = 0;

  entries.forEach((entry) => {
    entry.foodItems?.forEach((item) => {
      mealCalories += Number(item.calories) || 0;
      mealProtein += Number(item.protein) || 0;
      mealCarbs += Number(item.carbs) || 0;
      mealFat += Number(item.fat) || 0;
    });
  });

  return (
    <div
      className={`bg-white dark:bg-slate-900 border ${colorTheme.border} rounded-2xl p-5 shadow-sm dark:shadow-xl space-y-4 relative overflow-hidden`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${colorTheme.iconBg}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {mealType}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                {mealCalories} kcal
              </span>
              <span>•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                P: {Math.round(mealProtein * 10) / 10}g | C: {Math.round(mealCarbs * 10) / 10}g | F: {Math.round(mealFat * 10) / 10}g
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onAdd(mealType)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Food
        </button>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-5 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-xs">
          No food logged for {mealType} today
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const entryCalories = entry.foodItems?.reduce(
              (acc, item) => acc + (Number(item.calories) || 0),
              0
            );

            return (
              <div
                key={entry._id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700/80 transition"
              >
                {/* Entry Header: Summary & Action Buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {entry.foodItems?.length || 0}{' '}
                      {entry.foodItems?.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-300 border border-slate-200 dark:border-slate-800">
                      {entryCalories} kcal
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicate(entry)}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-white dark:hover:bg-slate-900 transition cursor-pointer"
                      title="Quick-add / Duplicate meal"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(entry)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 transition cursor-pointer"
                      title="Edit entry"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(entry)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-900">
                  {entry.foodItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-0.5"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                          •
                        </span>
                        <span className="truncate font-medium">{item.name}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          ({item.quantity} {item.unit})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono shrink-0 ml-2">
                        {item.calories > 0 && (
                          <span className="text-slate-700 dark:text-slate-300">{item.calories} cal</span>
                        )}
                        {(item.protein > 0 || item.carbs > 0 || item.fat > 0) && (
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] hidden sm:inline">
                            P:{item.protein || 0} C:{item.carbs || 0} F:{item.fat || 0}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
