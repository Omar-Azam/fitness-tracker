import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  User,
  Settings,
  CheckCircle2,
  AlertCircle,
  Save,
  Bell,
  Globe,
  Moon,
  Dumbbell,
  Apple,
  TrendingUp,
  Scale,
  Calendar,
  ChevronRight,
  Flame,
  Activity,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';
import { Link } from 'react-router-dom';
import { StatCardSkeleton, ActivityItemSkeleton } from '../components/Skeletons';

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const weightUnit = user?.preferences?.units === 'imperial' ? 'lbs' : 'kg';

  const [dashboardData, setDashboardData] = useState({
    stats: {
      workoutsThisWeek: 0,
      nutritionDaysThisWeek: 0,
      latestWeight: null,
      weightUnit: 'kg',
    },
    weightSparkline: [],
    recentWorkouts: [],
    recentNutrition: [],
    latestLog: null,
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    profilePicture: user?.profilePicture || '',
    units: user?.preferences?.units || 'metric',
    theme: user?.preferences?.theme || 'dark',
    notificationsEnabled: user?.preferences?.notificationsEnabled ?? true,
  });

  const [saving, setSaving] = useState(false);

  // Fetch Dashboard Stats & Feeds
  useEffect(() => {
    const fetchDashboardSummary = async () => {
      setLoadingDashboard(true);
      try {
        const res = await api.get('/progress/dashboard-summary');
        if (res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchDashboardSummary();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        profilePicture: formData.profilePicture,
        preferences: {
          units: formData.units,
          theme: formData.theme,
          notificationsEnabled: formData.notificationsEnabled,
        },
      });
      toast.success('Account preferences saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const stats = dashboardData.stats || {};
  const weightSparkline = dashboardData.weightSparkline || [];
  const recentWorkouts = dashboardData.recentWorkouts || [];
  const recentNutrition = dashboardData.recentNutrition || [];

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xl sm:text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome, {user?.name || user?.username}!
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                @{user?.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Here is your active fitness & nutrition overview</p>
          </div>
        </div>

        <div className="text-[11px] sm:text-xs text-slate-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
          Member since: <span className="text-slate-300 font-mono">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}</span>
        </div>
      </div>

      {/* Metric Cards & Weight Sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingDashboard ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1: Workouts This Week */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Workouts This Week
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Dumbbell className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {stats.workoutsThisWeek ?? 0}
                  </span>
                  <span className="text-xs text-slate-400">sessions completed</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">Keep pushing towards your weekly goal</p>
              </div>

              <Link
                to="/workouts"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 pt-1"
              >
                View workout logs <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Card 2: Nutrition Days Logged */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nutrition Days Logged
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Apple className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {stats.nutritionDaysThisWeek ?? 0}
                  </span>
                  <span className="text-xs text-slate-400">/ 7 days this week</span>
                </div>
                <p className="text-[11px] text-amber-400 mt-1">Consistency fuels performance</p>
              </div>

              <Link
                to="/nutrition"
                className="text-xs font-semibold text-amber-400 hover:text-amber-350 inline-flex items-center gap-1 pt-1"
              >
                Track today's meals <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Card 3: Weight Trend Sparkline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-2 relative overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Latest Weight
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Scale className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {stats.latestWeight !== null ? stats.latestWeight : '--'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {stats.weightUnit || weightUnit}
                  </span>
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="h-12 w-full pt-1">
                {weightSparkline.length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightSparkline} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                      <defs>
                        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] text-cyan-300 font-mono shadow-md">
                                {payload[0].value} {weightUnit}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="url(#sparklineGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[11px] text-slate-500 pt-2">Log 2+ weight entries for sparkline</p>
                )}
              </div>

              <Link
                to="/progress"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 pt-1"
              >
                Open progress charts <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Recent Workouts</h3>
            </div>
            <Link
              to="/workouts"
              className="text-xs text-emerald-400 hover:underline font-medium"
            >
              View all
            </Link>
          </div>

          {loadingDashboard ? (
            <div className="space-y-2.5">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          ) : recentWorkouts.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-500 text-xs">
              No workouts logged yet.
              <div className="mt-2">
                <Link
                  to="/workouts"
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  + Log your first workout
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentWorkouts.map((w) => (
                <div
                  key={w._id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {w.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {w.category} • {w.exercises?.length || 0} exercises •{' '}
                      {w.date ? new Date(w.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Link
                    to="/workouts"
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Nutrition */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Recent Meals</h3>
            </div>
            <Link
              to="/nutrition"
              className="text-xs text-amber-400 hover:underline font-medium"
            >
              View all
            </Link>
          </div>

          {loadingDashboard ? (
            <div className="space-y-2.5">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          ) : recentNutrition.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-500 text-xs">
              No nutrition entries logged yet.
              <div className="mt-2">
                <Link
                  to="/nutrition"
                  className="text-amber-400 font-semibold hover:underline"
                >
                  + Log your first meal
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNutrition.map((n) => {
                const totalCal = n.foodItems?.reduce(
                  (acc, item) => acc + (Number(item.calories) || 0),
                  0
                );
                return (
                  <div
                    key={n._id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white capitalize">
                          {n.mealType}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {totalCal} kcal
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {n.foodItems?.length || 0} food items •{' '}
                        {n.date ? new Date(n.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Link
                      to="/nutrition"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
