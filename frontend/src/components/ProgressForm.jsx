import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Scale,
  Calendar,
  Ruler,
  Trophy,
  AlertCircle,
  Save,
} from 'lucide-react';

export default function ProgressForm({
  initialData,
  onSubmit,
  onCancel,
  onClose,
  isSubmitting,
  weightUnit = 'kg',
  lengthUnit = 'cm',
}) {
  const handleClose = onCancel || onClose;
  const isEditing = Boolean(initialData?._id);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyMeasurements: {
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: '',
    },
    performanceMetrics: [],
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        weight: initialData.weight !== undefined ? initialData.weight : '',
        bodyMeasurements: {
          chest: initialData.bodyMeasurements?.chest ?? '',
          waist: initialData.bodyMeasurements?.waist ?? '',
          hips: initialData.bodyMeasurements?.hips ?? '',
          arms: initialData.bodyMeasurements?.arms ?? '',
          thighs: initialData.bodyMeasurements?.thighs ?? '',
        },
        performanceMetrics: Array.isArray(initialData.performanceMetrics)
          ? initialData.performanceMetrics.map((pm) => ({
              metricName: pm.metricName || '',
              value: pm.value !== undefined ? pm.value : '',
              unit: pm.unit || '',
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

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bodyMeasurements: {
        ...prev.bodyMeasurements,
        [name]: value,
      },
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Performance metrics handlers
  const handleAddMetric = () => {
    setFormData((prev) => ({
      ...prev,
      performanceMetrics: [
        ...prev.performanceMetrics,
        { metricName: '', value: '', unit: '' },
      ],
    }));
  };

  const handleRemoveMetric = (index) => {
    setFormData((prev) => ({
      ...prev,
      performanceMetrics: prev.performanceMetrics.filter((_, i) => i !== index),
    }));
  };

  const handleMetricChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.performanceMetrics];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, performanceMetrics: updated };
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Check that at least one metric or measurement is provided
    const hasWeight = formData.weight !== '' && !isNaN(Number(formData.weight));
    const hasMeasurements = Object.values(formData.bodyMeasurements).some(
      (v) => v !== '' && !isNaN(Number(v))
    );
    const hasPerfMetrics = formData.performanceMetrics.length > 0;

    if (!hasWeight && !hasMeasurements && !hasPerfMetrics) {
      setErrorMessage('Please enter at least weight, a body measurement, or a performance metric');
      return;
    }

    // Validate performance metric rows
    for (let i = 0; i < formData.performanceMetrics.length; i++) {
      const pm = formData.performanceMetrics[i];
      if (!pm.metricName.trim()) {
        setErrorMessage(`Please provide a name for performance metric #${i + 1}`);
        return;
      }
      if (pm.value === '' || isNaN(Number(pm.value)) || Number(pm.value) < 0) {
        setErrorMessage(`Value must be a non-negative number for ${pm.metricName}`);
        return;
      }
    }

    const payload = {
      date: formData.date,
      weight: formData.weight !== '' ? Number(formData.weight) : undefined,
      bodyMeasurements: {
        chest: formData.bodyMeasurements.chest !== '' ? Number(formData.bodyMeasurements.chest) : undefined,
        waist: formData.bodyMeasurements.waist !== '' ? Number(formData.bodyMeasurements.waist) : undefined,
        hips: formData.bodyMeasurements.hips !== '' ? Number(formData.bodyMeasurements.hips) : undefined,
        arms: formData.bodyMeasurements.arms !== '' ? Number(formData.bodyMeasurements.arms) : undefined,
        thighs: formData.bodyMeasurements.thighs !== '' ? Number(formData.bodyMeasurements.thighs) : undefined,
      },
      performanceMetrics: formData.performanceMetrics.map((pm) => ({
        metricName: pm.metricName.trim(),
        value: Number(pm.value) || 0,
        unit: pm.unit ? pm.unit.trim() : '',
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save progress log');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Progress Entry' : 'Log Body & Fitness Progress'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track weight, circumference measurements, and personal records
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Date & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                Log Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Body Weight ({weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="weight"
                placeholder={`e.g. 75.5 ${weightUnit}`}
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* Body Circumference Measurements */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Body Measurements ({lengthUnit})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                  Chest
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="chest"
                  placeholder="0.0"
                  value={formData.bodyMeasurements.chest}
                  onChange={handleMeasurementChange}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                  Waist
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="waist"
                  placeholder="0.0"
                  value={formData.bodyMeasurements.waist}
                  onChange={handleMeasurementChange}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                  Hips
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="hips"
                  placeholder="0.0"
                  value={formData.bodyMeasurements.hips}
                  onChange={handleMeasurementChange}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                  Arms
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="arms"
                  placeholder="0.0"
                  value={formData.bodyMeasurements.arms}
                  onChange={handleMeasurementChange}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold mb-1">
                  Thighs
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="thighs"
                  placeholder="0.0"
                  value={formData.bodyMeasurements.thighs}
                  onChange={handleMeasurementChange}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Performance Metrics */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  Performance Metrics ({formData.performanceMetrics.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Custom PRs, benchmarks (e.g. 5k run time, Bench 1RM, Deadlift)
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMetric}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Metric
              </button>
            </div>

            {formData.performanceMetrics.length === 0 ? (
              <div className="text-center py-5 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-xs">
                No custom performance metrics added. Click "+ Add Metric" to track PRs.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.performanceMetrics.map((pm, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Metric name (e.g. 5k Run Time)"
                        value={pm.metricName}
                        onChange={(e) =>
                          handleMetricChange(index, 'metricName', e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Value (e.g. 24.5)"
                        value={pm.value}
                        onChange={(e) =>
                          handleMetricChange(index, 'value', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Unit (mins, kg)"
                        value={pm.unit}
                        onChange={(e) =>
                          handleMetricChange(index, 'unit', e.target.value)
                        }
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveMetric(index)}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove metric"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                <span>{isEditing ? 'Save Changes' : 'Save Progress Log'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
