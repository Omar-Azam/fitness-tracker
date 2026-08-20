import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TrendsChart from '../components/TrendsChart';
import MeasurementCards from '../components/MeasurementCards';
import ProgressForm from '../components/ProgressForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import PageHeader from '../components/PageHeader';
import {
  ChartSkeleton,
  MeasurementSkeleton,
  CardSkeleton,
} from '../components/Skeletons';
import {
  TrendingUp,
  Scale,
  Plus,
  Trophy,
  Calendar,
  Edit2,
  Trash2,
  Activity,
  Ruler,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function Progress() {
  const { user } = useAuth();
  const toast = useToast();
  const weightUnit = user?.preferences?.units === 'imperial' ? 'lbs' : 'kg';
  const lengthUnit = user?.preferences?.units === 'imperial' ? 'in' : 'cm';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Weight Trend State
  const [weightTrend, setWeightTrend] = useState([]);

  // Custom Metric Trend State
  const [selectedMetric, setSelectedMetric] = useState('chest');
  const [availableMetrics, setAvailableMetrics] = useState([]);
  const [customMetricTrend, setCustomMetricTrend] = useState([]);
  const [customMetricUnit, setCustomMetricUnit] = useState('');
  const [loadingCustomTrend, setLoadingCustomTrend] = useState(false);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [logToDelete, setLogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all logs and initial weight trend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, weightTrendRes] = await Promise.all([
        api.get('/progress'),
        api.get('/progress/trends', { params: { metric: 'weight' } }),
      ]);

      const fetchedLogs = logsRes.data.logs || [];
      setLogs(fetchedLogs);
      setWeightTrend(weightTrendRes.data.points || []);

      const avail = weightTrendRes.data.availableMetrics || [];
      const nonWeightMetrics = avail.filter((m) => m.toLowerCase() !== 'weight');
      setAvailableMetrics(nonWeightMetrics);

      setSelectedMetric((prev) => {
        if (nonWeightMetrics.length > 0 && !nonWeightMetrics.includes(prev)) {
          return nonWeightMetrics[0];
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to load progress data:', err);
      setError(err.message || 'Failed to load progress logs');
      toast.error('Failed to load progress logs');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch custom metric trend whenever selectedMetric changes
  const fetchCustomMetricTrend = useCallback(async (metric) => {
    if (!metric) return;
    setLoadingCustomTrend(true);
    try {
      const res = await api.get('/progress/trends', { params: { metric } });
      setCustomMetricTrend(res.data.points || []);
      setCustomMetricUnit(res.data.unit || '');
    } catch (err) {
      console.error('Failed to load custom metric trend:', err);
    } finally {
      setLoadingCustomTrend(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMetric) {
      fetchCustomMetricTrend(selectedMetric);
    }
  }, [selectedMetric, fetchCustomMetricTrend]);

  // Form Submit (Create / Edit)
  const handleFormSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editingLog?._id) {
        await api.put(`/progress/${editingLog._id}`, payload);
        toast.success('Progress log updated! 📊');
      } else {
        await api.post('/progress', payload);
        toast.success('New progress entry recorded! 📈');
      }
      setIsFormOpen(false);
      setEditingLog(null);
      await fetchData();
      if (selectedMetric) {
        await fetchCustomMetricTrend(selectedMetric);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save progress log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!logToDelete?._id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/progress/${logToDelete._id}`);
      toast.success('Progress log deleted');
      setLogToDelete(null);
      await fetchData();
      if (selectedMetric) {
        await fetchCustomMetricTrend(selectedMetric);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete log');
    } finally {
      setIsDeleting(false);
    }
  };

  const latestLog = logs[0] || null;
  const previousLog = logs[1] || null;

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Header Bar */}
      <PageHeader
        title="Progress & Trends"
        subtitle="Monitor body measurements, weight progression, and custom athletic metrics"
        count={logs.length}
        countLabel="logs"
        actions={
          <button
            onClick={() => {
              setEditingLog(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm transition duration-150 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Log New Entry</span>
          </button>
        }
      />

      {/* Body Measurements Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Body Measurements
            </h2>
          </div>
          {latestLog?.date && (
            <span className="text-[11px] text-slate-400 font-mono">
              Latest: {new Date(latestLog.date).toLocaleDateString()}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MeasurementSkeleton />
            <MeasurementSkeleton />
            <MeasurementSkeleton />
            <MeasurementSkeleton />
            <MeasurementSkeleton />
          </div>
        ) : (
          <MeasurementCards
            latestLog={latestLog}
            previousLog={previousLog}
            lengthUnit={lengthUnit}
          />
        )}
      </div>

      {/* Weight Over Time Chart */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Weight Progression
            </h2>
          </div>
        </div>

        {loading ? (
          <ChartSkeleton />
        ) : (
          <TrendsChart
            title="Weight Over Time"
            data={weightTrend}
            unit={weightUnit}
            color="#06b6d4"
            height={280}
          />
        )}
      </div>

      {/* Custom Metric Trend Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Custom Performance & Measurement Trends
              </h2>
              <p className="text-xs text-slate-400">
                Select any tracked measurement or user-defined athletic metric
              </p>
            </div>
          </div>

          {/* Metric Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Select Metric:
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-medium capitalize"
            >
              {availableMetrics.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingCustomTrend ? (
          <div className="h-56 bg-slate-950/60 border border-slate-800/40 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-xs text-slate-500">Loading trend...</span>
          </div>
        ) : (
          <TrendsChart
            title={`${selectedMetric.toUpperCase()} Trend`}
            data={customMetricTrend}
            unit={customMetricUnit}
            color="#f59e0b"
            height={240}
          />
        )}
      </div>

      {/* Progress History Log Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Log History</h2>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
            No progress entries recorded yet. Click "Log New Entry" above to start your tracking journey.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const dateStr = log.date
                ? new Date(log.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'N/A';

              const m = log.bodyMeasurements || {};
              const perf = log.performanceMetrics || [];

              return (
                <div
                  key={log._id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-white">{dateStr}</span>
                      {log.weight !== undefined && log.weight !== null && (
                        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {log.weight} {weightUnit}
                        </span>
                      )}
                    </div>

                    {/* Summary Badges */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                      {m.waist && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Waist: {m.waist} {lengthUnit}
                        </span>
                      )}
                      {m.chest && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Chest: {m.chest} {lengthUnit}
                        </span>
                      )}
                      {m.arms && (
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Arms: {m.arms} {lengthUnit}
                        </span>
                      )}
                      {perf.length > 0 &&
                        perf.map((p, idx) => (
                          <span
                            key={idx}
                            className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20"
                          >
                            {p.metricName}: {p.value} {p.unit}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        setEditingLog(log);
                        setIsFormOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Log"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLogToDelete(log)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Log"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress Form Modal */}
      {isFormOpen && (
        <ProgressForm
          initialData={editingLog}
          weightUnit={weightUnit}
          lengthUnit={lengthUnit}
          isSubmitting={isSubmitting}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingLog(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!logToDelete}
        title="Delete Progress Log"
        message="Are you sure you want to delete this progress entry? This will remove these data points from your trend charts."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLogToDelete(null)}
      />
    </div>
  );
}
