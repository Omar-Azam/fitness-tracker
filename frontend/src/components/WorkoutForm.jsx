import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Dumbbell,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function WorkoutForm({
  initialData,
  workout,
  onSubmit,
  onCancel,
  onClose,
  isSubmitting,
}) {
  const activeInitialData = initialData || workout;
  const handleClose = onCancel || onClose;
  const isEditing = Boolean(activeInitialData?._id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'strength',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    tags: '',
    exercises: [],
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (activeInitialData) {
      setFormData({
        name: activeInitialData.name || '',
        category: activeInitialData.category || 'strength',
        date: activeInitialData.date
          ? new Date(activeInitialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        duration: activeInitialData.duration || '',
        tags: Array.isArray(activeInitialData.tags) ? activeInitialData.tags.join(', ') : '',
        exercises: Array.isArray(activeInitialData.exercises)
          ? activeInitialData.exercises.map((ex) => ({
              name: ex.name || '',
              sets: ex.sets || 1,
              reps: ex.reps || '',
              weight: ex.weight || '',
              notes: ex.notes || '',
            }))
          : [],
      });
    }
  }, [activeInitialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Dynamic exercise handlers
  const handleAddExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { name: '', sets: 3, reps: 10, weight: 0, notes: '' },
      ],
    }));
  };

  const handleRemoveExercise = (index) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleExerciseChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedExercises = [...prev.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: value,
      };
      return { ...prev, exercises: updatedExercises };
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Workout name is required');
      return;
    }

    // Validate exercises
    for (let i = 0; i < formData.exercises.length; i++) {
      const ex = formData.exercises[i];
      if (!ex.name.trim()) {
        setErrorMessage(`Please provide a name for exercise #${i + 1}`);
        return;
      }
      if (Number(ex.sets) < 1) {
        setErrorMessage(`Sets must be at least 1 for ${ex.name}`);
        return;
      }
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      date: formData.date,
      duration: formData.duration ? Number(formData.duration) : 0,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      exercises: formData.exercises.map((ex) => ({
        name: ex.name.trim(),
        sets: Number(ex.sets) || 1,
        reps: Number(ex.reps) || 0,
        weight: Number(ex.weight) || 0,
        notes: ex.notes ? ex.notes.trim() : '',
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save workout');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 6 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Workout' : 'Log New Workout'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Workout Title <span className="text-emerald-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Upper Body Hypertrophy & Arms"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm font-semibold transition"
                required
              />
            </div>

            {/* Category Selector Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Training Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'strength', label: 'Strength', icon: Dumbbell, activeClass: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30' },
                  { id: 'cardio', label: 'Cardio', icon: Clock, activeClass: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/30' },
                  { id: 'flexibility', label: 'Flexibility', icon: Dumbbell, activeClass: 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-500/10 ring-1 ring-teal-500/30' },
                  { id: 'other', label: 'Other', icon: Tag, activeClass: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/10 ring-1 ring-purple-500/30' },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? cat.activeClass
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm font-mono transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Duration (mins)
                </label>
                <input
                  type="number"
                  name="duration"
                  min="0"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 45"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. chest, pr"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Exercise Rows */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Exercises ({formData.exercises.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track sets, reps, weight, and exercise notes
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddExercise}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Exercise
              </button>
            </div>

            {formData.exercises.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 text-xs">
                No exercises added yet. Click "+ Add Exercise" above to log exercises.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Exercise name (e.g. Bench Press)"
                        value={exercise.name}
                        onChange={(e) =>
                          handleExerciseChange(index, 'name', e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(index)}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove exercise"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="3"
                          value={exercise.sets}
                          onChange={(e) =>
                            handleExerciseChange(index, 'sets', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                          Reps
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="10"
                          value={exercise.reps}
                          onChange={(e) =>
                            handleExerciseChange(index, 'reps', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                          Weight (kg/lbs)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={exercise.weight}
                          onChange={(e) =>
                            handleExerciseChange(index, 'weight', e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Notes (e.g. drop set on final set, 90s rest)"
                        value={exercise.notes}
                        onChange={(e) =>
                          handleExerciseChange(index, 'notes', e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-semibold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Log Workout'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
