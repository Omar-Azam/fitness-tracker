import React, { useState, useEffect } from 'react';
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
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const isEditing = Boolean(initialData?._id);

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
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'strength',
        date: initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        duration: initialData.duration || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        exercises: Array.isArray(initialData.exercises)
          ? initialData.exercises.map((ex) => ({
              name: ex.name || '',
              sets: ex.sets || 1,
              reps: ex.reps || '',
              weight: ex.weight || '',
              notes: ex.notes || '',
            }))
          : [],
      });
    }
  }, [initialData]);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Workout' : 'Log New Workout'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Workout Title <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Chest & Triceps Hypertrophy"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio & Running</option>
                <option value="flexibility">Flexibility & Yoga</option>
                <option value="other">Other / Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Duration <span className="text-slate-500 text-[10px] font-normal">(minutes)</span>
              </label>
              <input
                type="number"
                name="duration"
                min="0"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 45"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                Tags <span className="text-slate-500 text-[10px] font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. chest, hypertrophy, pr"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Dynamic Exercise Rows */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Exercises ({formData.exercises.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Track sets, reps, weight, and exercise notes
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddExercise}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Exercise
              </button>
            </div>

            {formData.exercises.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
                No exercises added yet. Click "+ Add Exercise" above to log exercises.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        #{index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Exercise name (e.g. Bench Press)"
                        value={exercise.name}
                        onChange={(e) =>
                          handleExerciseChange(index, 'name', e.target.value)
                        }
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(index)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove exercise"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
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
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
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
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
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
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
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
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
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
      </div>
    </div>
  );
}
