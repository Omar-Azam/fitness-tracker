import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TrendsChart from '../components/TrendsChart';
import MeasurementCards from '../components/MeasurementCards';
import ProgressForm from '../components/ProgressForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
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
      // Filter out weight from available custom metrics since weight has its own dedicated chart
      const nonWeightMetrics = avail.filter((m) => m.toLowerCase() !== 'weight');
      setAvailableMetrics(nonWeightMetrics);

      // If selectedMetric is not in availableMetrics and availableMetrics has items, pick the first one
      if (nonWeightMetrics.length > 0 && !nonWeightMetrics.includes(selectedMetric)) {
        setSelectedMetric(nonWeightMetrics[0]);
      }
    } catch (err) {
      console.error('Failed to load progress data:', err);
      setError(err.message || 'Failed to load progress logs');
    } finally {
      setLoading(false);
    }
  }, []);

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
      } else {
        await api.post('/progress', payload);
      }
      setIsFormOpen(false);
      setEditingLog(null);
      await fetchData();
      if (selectedMetric) {
        await fetchCustomMetricTrend(selectedMetric);
      }
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
      setLogToDelete(null);
      await fetchData();
      if (selectedMetric) {
        await fetchCustomMetricTrend(selectedMetric);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete log');
    } finally {
      setIsDeleting(false);
    }
  };

  const latestLog = logs[0] || null;
  const previousLog = logs[1] || null;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Progress & Body Analytics
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {logs.length} {logs.length === 1 ? 'log' : 'logs'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor weight fluctuations, circumference shifts, and performance personal records
          </p>
        </div>

        <button
          onClick={() => {
            setEditingLog(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Log Progress</span>
        </button>
      </div>

      {/* Body Measurements Delta Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-cyan-400" />
            Current Stats vs. Previous Entry
          </h2>
          {latestLog?.date && (
            <span className="text-xs text-slate-500 font-mono">
              Last updated: {new Date(latestLog.date).toLocaleDateString()}
            </span>
          )}
        </div>

        <MeasurementCards
          latestLog={latestLog}
          previousLog={previousLog}
          weightUnit={weightUnit}
          lengthUnit={lengthUnit}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weight Progression */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Weight Over Time</h3>
                <p className="text-xs text-slate-400">Progression curve in {weightUnit}</p>
              </div>
            </div>

            {weightTrend.length > 0 && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800">
                Latest: {weightTrend[weightTrend.length - 1].value} {weightUnit}
              </span>
            )}
          </div>

          <TrendsChart
            data={weightTrend}
            metricName="Weight"
            unit={weightUnit}
            color="#10b981"
            height={260}
          />
        </div>

        {/* Chart 2: Custom Performance / Body Metric */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Metric Trends & PRs</h3>
                <p className="text-xs text-slate-400">Track benchmarks & circumferences</p>
              </div>
            </div>

            {/* Metric Selector Dropdown */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-cyan-500 capitalize cursor-pointer"
            >
              {availableMetrics.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {loadingCustomTrend ? (
            <div className="h-[260px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <TrendsChart
              data={customMetricTrend}
              metricName={selectedMetric}
              unit={customMetricUnit || lengthUnit}
              color="#06b6d4" // cyan-500
              height={260}
            />
          )}
        </div>
      </div>

      {/* Progress History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            <h3 className="text-base font-bold text-white">Log History</h3>
          </div>
          <span className="text-xs text-slate-400">{logs.length} entries</span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
            No progress logs recorded yet. Click "+ Log Progress" above to start your baseline!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Chest / Waist / Hips</th>
                  <th className="py-3 px-4">Arms / Thighs</th>
                  <th className="py-3 px-4">PRs & Metrics</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-medium text-white whitespace-nowrap">
                      {log.date ? new Date(log.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold whitespace-nowrap">
                      {log.weight !== undefined && log.weight !== null
                        ? `${log.weight} ${weightUnit}`
                        : '--'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.bodyMeasurements?.chest ?? '--'} /{' '}
                      {log.bodyMeasurements?.waist ?? '--'} /{' '}
                      {log.bodyMeasurements?.hips ?? '--'}{' '}
                      <span className="text-[10px] text-slate-500">{lengthUnit}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {log.bodyMeasurements?.arms ?? '--'} /{' '}
                      {log.bodyMeasurements?.thighs ?? '--'}{' '}
                      <span className="text-[10px] text-slate-500">{lengthUnit}</span>
                    </td>
                    <td className="py-3 px-4">
                      {log.performanceMetrics && log.performanceMetrics.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {log.performanceMetrics.map((pm, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono text-cyan-300 border border-slate-800"
                            >
                              {pm.metricName}: {pm.value} {pm.unit}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingLog(log);
                            setIsFormOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title="Edit log"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setLogToDelete(log)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Delete log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Form Modal */}
      {isFormOpen && (
        <ProgressForm
          initialData={editingLog}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingLog(null);
          }}
          isSubmitting={isSubmitting}
          weightUnit={weightUnit}
          lengthUnit={lengthUnit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(logToDelete)}
        title="Delete Progress Entry"
        message={`Are you sure you want to delete the log from ${
          logToDelete?.date ? new Date(logToDelete.date).toLocaleDateString() : 'this date'
        }?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLogToDelete(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
