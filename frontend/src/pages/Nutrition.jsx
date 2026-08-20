import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import MealSection from '../components/MealSection';
import NutritionEntryForm from '../components/NutritionEntryForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ExportButton from '../components/ExportButton';
import PageHeader from '../components/PageHeader';
import { CardSkeleton, StatCardSkeleton } from '../components/Skeletons';
import {
  Utensils,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Activity,
  RefreshCw,
  XCircle,
  Apple,
} from 'lucide-react';

export default function Nutrition() {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    entryCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [editingEntry, setEditingEntry] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal State
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch nutrition entries and daily summary for the selected date
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        api.get('/nutrition', { params: { date: selectedDate } }),
        api.get('/nutrition/summary', { params: { date: selectedDate } }),
      ]);

      setEntries(entriesRes.data.entries || []);
      setSummary(
        summaryRes.data || {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          entryCount: 0,
        }
      );
    } catch (err) {
      console.error('Failed to load nutrition data:', err);
      setError(err.message || 'Failed to load nutrition logs');
      toast.error('Failed to load nutrition logs');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Date Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Open Create Form for specific mealType
  const handleOpenAdd = (mealType = 'breakfast') => {
    setSelectedMealType(mealType);
    setEditingEntry(null);
    setIsDuplicate(false);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (entry) => {
    setSelectedMealType(entry.mealType);
    setEditingEntry(entry);
    setIsDuplicate(false);
    setIsFormOpen(true);
  };

  // Open Duplicate / Quick-Add Form
  const handleOpenDuplicate = (entry) => {
    setSelectedMealType(entry.mealType);
    setEditingEntry(entry);
    setIsDuplicate(true);
    setIsFormOpen(true);
  };

  // Form Submit handler
  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editingEntry?._id && !isDuplicate) {
        await api.put(`/nutrition/${editingEntry._id}`, payload);
        toast.success('Meal entry updated! 🥗');
      } else {
        await api.post('/nutrition', payload);
        toast.success(isDuplicate ? 'Meal duplicated successfully! 📋' : 'Meal entry logged! 🍎');
      }
      setIsFormOpen(false);
      setEditingEntry(null);
      setIsDuplicate(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save nutrition entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete?._id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/nutrition/${entryToDelete._id}`);
      toast.success('Nutrition entry deleted');
      setEntryToDelete(null);
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete nutrition entry');
    } finally {
      setIsDeleting(false);
    }
  };

  // Group entries by mealType
  const breakfastEntries = entries.filter((e) => e.mealType === 'breakfast');
  const lunchEntries = entries.filter((e) => e.mealType === 'lunch');
  const dinnerEntries = entries.filter((e) => e.mealType === 'dinner');
  const snackEntries = entries.filter((e) => e.mealType === 'snack');

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formattedDateTitle = new Date(selectedDate + 'T00:00:00').toLocaleDateString(
    undefined,
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-6 px-2 sm:px-4">
      {/* Header & Date Navigation */}
      <PageHeader
        title="Nutrition Log"
        subtitle="Track daily calorie intake, macronutrients, and meals"
        count={summary.entryCount}
        countLabel="entries"
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <ExportButton endpoint="/export/nutrition" resourceName="nutrition" />

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 sm:p-1.5 rounded-2xl shadow-sm dark:shadow-lg">
              <button
                onClick={handlePrevDay}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none px-1.5 cursor-pointer font-mono"
              />

              {!isToday && (
                <button
                  onClick={handleToday}
                  className="text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  Today
                </button>
              )}

              <button
                onClick={handleNextDay}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
      />

      {/* Daily Summary Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl text-white">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 shrink-0 ring-1 ring-white/20">
              <Flame className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                Daily Nutrition Overview • {formattedDateTitle}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {summary.totalCalories}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-semibold">kcal total consumed</span>
              </div>
            </div>
          </div>

          {/* Macro Breakdown Chips */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[90px] shadow-sm">
              <span className="text-[10px] font-extrabold uppercase text-blue-400 tracking-wider block">
                Protein
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
                {summary.totalProtein}g
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[90px] shadow-sm">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider block">
                Carbs
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
                {summary.totalCarbs}g
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 text-center min-w-[90px] shadow-sm">
              <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider block">
                Fat
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-0.5">
                {summary.totalFat}g
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      )}

      {/* Meal Sections (Breakfast, Lunch, Dinner, Snack) */}
      {loading ? (
        <div className="space-y-4 sm:space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <MealSection
            mealType="breakfast"
            title="Breakfast"
            entries={breakfastEntries}
            onAdd={() => handleOpenAdd('breakfast')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />

          <MealSection
            mealType="lunch"
            title="Lunch"
            entries={lunchEntries}
            onAdd={() => handleOpenAdd('lunch')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />

          <MealSection
            mealType="dinner"
            title="Dinner"
            entries={dinnerEntries}
            onAdd={() => handleOpenAdd('dinner')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />

          <MealSection
            mealType="snack"
            title="Snacks"
            entries={snackEntries}
            onAdd={() => handleOpenAdd('snack')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {/* Nutrition Form Modal */}
      {isFormOpen && (
        <NutritionEntryForm
          initialData={editingEntry}
          defaultMealType={selectedMealType}
          isDuplicate={isDuplicate}
          defaultDate={selectedDate}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingEntry(null);
            setIsDuplicate(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!entryToDelete}
        title="Delete Nutrition Entry"
        message={`Are you sure you want to delete this ${entryToDelete?.mealType} entry? This will update your daily calorie totals.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
