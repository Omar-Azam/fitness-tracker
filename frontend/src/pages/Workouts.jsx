import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import WorkoutCard from '../components/WorkoutCard';
import WorkoutForm from '../components/WorkoutForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ExportButton from '../components/ExportButton';
import {
  Dumbbell,
  Plus,
  Filter,
  Search,
  Calendar,
  RefreshCw,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
} from 'lucide-react';

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and pagination
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch workouts with active filters & pagination
  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
      };

      if (categoryFilter && categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (tagFilter.trim()) {
        params.tag = tagFilter.trim();
      }
      if (fromDate) {
        params.from = fromDate;
      }
      if (toDate) {
        params.to = toDate;
      }

      const response = await api.get('/workouts', { params });
      setWorkouts(response.data.workouts || []);
      setPage(response.data.page || 1);
      setTotalPages(response.data.totalPages || 1);
      setTotalWorkouts(response.data.totalWorkouts || 0);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
      setError(err.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, tagFilter, fromDate, toDate, page]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Handle open create modal
  const handleOpenCreate = () => {
    setEditingWorkout(null);
    setIsFormOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (workout) => {
    setEditingWorkout(workout);
    setIsFormOpen(true);
  };

  // Handle form submit (create or update)
  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editingWorkout?._id) {
        await api.put(`/workouts/${editingWorkout._id}`, payload);
      } else {
        await api.post('/workouts', payload);
      }
      setIsFormOpen(false);
      setEditingWorkout(null);
      await fetchWorkouts();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (workout) => {
    setWorkoutToDelete(workout);
  };

  // Confirm delete execution
  const handleConfirmDelete = async () => {
    if (!workoutToDelete?._id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/workouts/${workoutToDelete._id}`);
      setWorkoutToDelete(null);
      await fetchWorkouts();
    } catch (err) {
      alert(err.message || 'Failed to delete workout');
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setCategoryFilter('all');
    setTagFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters =
    categoryFilter !== 'all' || tagFilter.trim() !== '' || fromDate !== '' || toDate !== '';

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6 px-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Workout Log
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {totalWorkouts} {totalWorkouts === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track and analyze your training routines and exercises
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <ExportButton endpoint="/export/workouts" resourceName="workouts" />

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm transition duration-150 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Workout</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Filter className="h-4 w-4 text-emerald-400" />
            <span>Filter Workouts</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio & Running</option>
              <option value="flexibility">Flexibility & Yoga</option>
              <option value="other">Other / Mixed</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Search by Tag
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. legs, chest, 5k..."
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading workouts...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center space-y-3">
          <XCircle className="h-8 w-8 mx-auto" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchWorkouts}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      ) : workouts.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Dumbbell className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {hasActiveFilters
                ? 'No workouts match your filters'
                : 'No workouts yet — log your first one'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
              {hasActiveFilters
                ? 'Try adjusting your category, tag, or date range filters to view matching workouts.'
                : 'Start tracking your daily exercise routines, sets, reps, and performance metrics.'}
            </p>
          </div>

          <div className="pt-2">
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus className="h-4 w-4" />
                Log Your First Workout
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Workout Cards Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout._id}
                workout={workout}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-4 px-2">
              <span className="text-xs text-slate-400">
                Showing Page <span className="font-mono text-white">{page}</span> of{' '}
                <span className="font-mono text-white">{totalPages}</span> ({totalWorkouts} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workout Form Modal (Create / Edit) */}
      {isFormOpen && (
        <WorkoutForm
          initialData={editingWorkout}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingWorkout(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(workoutToDelete)}
        title="Delete Workout Session"
        message={`Are you sure you want to delete "${workoutToDelete?.name}"? All recorded exercises and sets in this workout will be removed.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setWorkoutToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
