import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import MealSection from '../components/MealSection';
import NutritionEntryForm from '../components/NutritionEntryForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ExportButton from '../components/ExportButton';
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
      } else {
        await api.post('/nutrition', payload);
      }
      setIsFormOpen(false);
      setEditingEntry(null);
      setIsDuplicate(false);
      await fetchData();
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
      setEntryToDelete(null);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete nutrition entry');
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
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6 px-4">
      {/* Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Nutrition Log
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {summary.entryCount} {summary.entryCount === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track daily calorie intake, macronutrients, and meals
          </p>
        </div>

        {/* Actions & Date Selector Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <ExportButton endpoint="/export/nutrition" resourceName="nutrition" />

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-lg">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none px-2 cursor-pointer font-mono"
            />

            {!isToday && (
              <button
                onClick={handleToday}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer"
              >
                Today
              </button>
            )}

            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Daily Calorie Intake ({formattedDateTitle})
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {summary.totalCalories}
                </span>
                <span className="text-sm font-medium text-slate-400">kcal total</span>
              </div>
            </div>
          </div>

          {/* Macro Breakdown Pills */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            {/* Protein */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                Protein
              </span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
                {summary.totalProtein}g
              </span>
            </div>

            {/* Carbs */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Carbs
              </span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
                {summary.totalCarbs}g
              </span>
            </div>

            {/* Fat */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-purple-400 block">
                Fat
              </span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
                {summary.totalFat}g
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Meals Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading meals...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center space-y-3">
          <XCircle className="h-8 w-8 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Breakfast */}
          <MealSection
            mealType="breakfast"
            entries={breakfastEntries}
            onAdd={() => handleOpenAdd('breakfast')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />

          {/* Lunch */}
          <MealSection
            mealType="lunch"
            entries={lunchEntries}
            onAdd={() => handleOpenAdd('lunch')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />

          {/* Dinner */}
          <MealSection
            mealType="dinner"
            entries={dinnerEntries}
            onAdd={() => handleOpenAdd('dinner')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />

          {/* Snacks */}
          <MealSection
            mealType="snack"
            entries={snackEntries}
            onAdd={() => handleOpenAdd('snack')}
            onEdit={handleOpenEdit}
            onDuplicate={handleOpenDuplicate}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {/* Nutrition Entry Form Modal */}
      {isFormOpen && (
        <NutritionEntryForm
          initialData={editingEntry}
          defaultMealType={selectedMealType}
          defaultDate={selectedDate}
          isDuplicate={isDuplicate}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingEntry(null);
            setIsDuplicate(false);
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(entryToDelete)}
        title="Delete Nutrition Entry"
        message={`Are you sure you want to delete this ${entryToDelete?.mealType} entry?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
