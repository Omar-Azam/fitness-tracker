import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Dumbbell,
  Apple,
  TrendingUp,
  Scale,
  Calendar,
  ChevronRight,
  Flame,
  Activity,
  Plus,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Clock,
  ArrowUpRight,
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
  const { user } = useAuth();
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

  const stats = dashboardData.stats || {};
  const weightSparkline = dashboardData.weightSparkline || [];
  const recentWorkouts = dashboardData.recentWorkouts || [];
  const recentNutrition = dashboardData.recentNutrition || [];

  // Compute time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Compute weekly workout progress percentage (target: 4 sessions)
  const workoutTarget = 4;
  const workoutProgress = Math.min(100, Math.round(((stats.workoutsThisWeek || 0) / workoutTarget) * 100));

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Dynamic Greeting & Quick Action Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl text-white">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* User Greeting Details */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.name || user?.username || 'Avatar'}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-xl sm:text-2xl shadow-lg shadow-emerald-500/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full">
                <span className="block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {getGreeting()}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 font-mono">
                  @{user?.username}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-0.5 text-white">
                {user?.name || user?.username}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
                Stay consistent and crush your weekly fitness & nutrition milestones today.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <Link
              to="/workouts"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Log Workout</span>
            </Link>

            <Link
              to="/nutrition"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Apple className="h-4 w-4 text-amber-400" />
              <span>Log Meal</span>
            </Link>

            <Link
              to="/progress"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
            >
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>Progress</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards & Sparkline Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingDashboard ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1: Workouts Momentum */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Workouts This Week
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Goal: {workoutTarget} sessions/wk
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {workoutProgress}%
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {stats.workoutsThisWeek ?? 0}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    / {workoutTarget} completed
                  </span>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${workoutProgress}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {stats.workoutsThisWeek >= 3 ? '🔥 Goal threshold met!' : 'Push for 3+ for rewards'}
                </span>
                <Link
                  to="/workouts"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Workouts <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Nutrition Consistency */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <Apple className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Nutrition Logged
                    </span>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Weekly Discipline
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {Math.round(((stats.nutritionDaysThisWeek || 0) / 7) * 100)}%
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {stats.nutritionDaysThisWeek ?? 0}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    / 7 days this week
                  </span>
                </div>

                {/* 7-Day Dot Consistency Track */}
                <div className="grid grid-cols-7 gap-1.5 mt-3">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-colors ${
                        i < (stats.nutritionDaysThisWeek || 0)
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Consistency drives macro targets
                </span>
                <Link
                  to="/nutrition"
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Nutrition <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Weight Trend & Mini Sparkline */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-3 sm:col-span-2 lg:col-span-1 hover:border-cyan-500/40 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Body Weight
                    </span>
                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                      Recent Measurement
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Trend
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                    {stats.latestWeight !== null ? stats.latestWeight : '--'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                    {stats.weightUnit || weightUnit}
                  </span>
                </div>

                {/* Mini Sparkline Chart */}
                <div className="h-11 w-full pt-1">
                  {weightSparkline.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightSparkline} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                          <linearGradient id="dashboardSparkGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-[10px] text-cyan-300 font-mono shadow-xl">
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
                          fill="url(#dashboardSparkGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 font-medium">
                      Log 2+ weight entries to see sparkline
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {weightSparkline.length} entries on record
                </span>
                <Link
                  to="/progress"
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Trends <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Activity Feeds Split Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workouts Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Dumbbell className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Recent Workouts
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Latest training sessions
                </span>
              </div>
            </div>
            <Link
              to="/workouts"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loadingDashboard ? (
            <div className="space-y-3">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          ) : recentWorkouts.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Dumbbell className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  No workouts recorded yet
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
                  Track your sets, reps, and exercise volume to start building your streak.
                </p>
              </div>
              <Link
                to="/workouts"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Log First Workout</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentWorkouts.map((w) => {
                const categoryColor =
                  w.category === 'strength'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : w.category === 'cardio'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : w.category === 'flexibility'
                    ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20'
                    : 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20';

                return (
                  <div
                    key={w._id}
                    className="bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {w.name}
                        </h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColor}`}>
                          {w.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>{w.exercises?.length || 0} exercises</span>
                        <span>•</span>
                        <span>{w.duration ? `${w.duration} min` : 'Duration N/A'}</span>
                        <span>•</span>
                        <span>{w.date ? new Date(w.date).toLocaleDateString() : 'N/A'}</span>
                      </p>
                    </div>
                    <Link
                      to="/workouts"
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 shadow-xs transition group-hover:scale-105"
                      title="View workout"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Meals Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Apple className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Recent Meals
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Nutrition and calorie breakdown
                </span>
              </div>
            </div>
            <Link
              to="/nutrition"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 inline-flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loadingDashboard ? (
            <div className="space-y-3">
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </div>
          ) : recentNutrition.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Apple className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  No meals logged today
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
                  Track macros, calories, and healthy nutrition habits effortlessly.
                </p>
              </div>
              <Link
                to="/nutrition"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-450 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Log First Meal</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNutrition.map((n) => {
                const totalCal = n.foodItems?.reduce(
                  (acc, item) => acc + (Number(item.calories) || 0),
                  0
                );
                const totalProtein = n.foodItems?.reduce(
                  (acc, item) => acc + (Number(item.protein) || 0),
                  0
                );

                return (
                  <div
                    key={n._id}
                    className="bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
                          {n.mealType}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {totalCal} kcal
                        </span>
                        {totalProtein > 0 && (
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            {totalProtein}g protein
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {n.foodItems?.length || 0} items •{' '}
                        {n.date ? new Date(n.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Link
                      to="/nutrition"
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-800 shadow-xs transition group-hover:scale-105"
                      title="View nutrition"
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
