import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import WorkoutCard from '../components/WorkoutCard';
import WorkoutForm from '../components/WorkoutForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ExportButton from '../components/ExportButton';
import PageHeader from '../components/PageHeader';
import { CardSkeleton } from '../components/Skeletons';
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
  const toast = useToast();
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
      toast.error('Failed to load workouts list');
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
        toast.success('Workout updated successfully! 💪');
      } else {
        await api.post('/workouts', payload);
        toast.success('New workout logged! 🏋️');
      }
      setIsFormOpen(false);
      setEditingWorkout(null);
      await fetchWorkouts();
    } catch (err) {
      toast.error(err.message || 'Failed to save workout');
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
      toast.success('Workout deleted successfully');
      setWorkoutToDelete(null);
      await fetchWorkouts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete workout');
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
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-6 px-2 sm:px-4">
      {/* Header Bar */}
      <PageHeader
        title="Workout Log"
        subtitle="Track and analyze your training routines and exercises"
        count={totalWorkouts}
        countLabel="sessions"
        actions={
          <>
            <ExportButton endpoint="/export/workouts" resourceName="workouts" />
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm transition duration-150 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>New Workout</span>
            </button>
          </>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Filter Workouts</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 font-semibold cursor-pointer transition"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">All Categories</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Tag Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. chest, legday"
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition font-mono"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            onClick={fetchWorkouts}
            className="px-4 py-2 bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Dumbbell className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {hasActiveFilters ? 'No workouts match your filters' : 'No workouts yet — log your first one'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your category, tag, or date range filters to see your sessions.'
                : 'Start tracking your strength, cardio, and flexibility progress today.'}
            </p>
          </div>
          <div>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Log Your First Workout
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Workouts Grid */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {workouts.map((workout) => (
              <motion.div
                key={workout._id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
                }}
              >
                <WorkoutCard
                  workout={workout}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteClick}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-mono text-slate-900 dark:text-slate-200">{page}</span> of{' '}
                <span className="font-mono text-slate-900 dark:text-slate-200">{totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition cursor-pointer active:scale-95"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Workout Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <WorkoutForm
            initialData={editingWorkout}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingWorkout(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {workoutToDelete && (
          <DeleteConfirmModal
            isOpen={!!workoutToDelete}
            title="Delete Workout"
            message={`Are you sure you want to delete "${workoutToDelete?.name}"? This action cannot be undone.`}
            isDeleting={isDeleting}
            onConfirm={handleConfirmDelete}
            onCancel={() => setWorkoutToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
