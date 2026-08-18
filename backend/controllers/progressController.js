import mongoose from 'mongoose';
import ProgressLog from '../models/ProgressLog.js';
import Workout from '../models/Workout.js';
import NutritionEntry from '../models/NutritionEntry.js';

/**
 * @desc    Get all progress logs for logged-in user
 * @route   GET /api/progress
 * @access  Private
 */
export const getProgressLogs = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filterQuery = { user: req.user._id };

    if (from || to) {
      filterQuery.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          fromDate.setHours(0, 0, 0, 0);
          filterQuery.date.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          filterQuery.date.$lte = toDate;
        }
      }
    }

    const logs = await ProgressLog.find(filterQuery).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      logs,
      totalLogs: logs.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get time-series trends for a specific metric (weight, body measurements, or performance metrics)
 * @route   GET /api/progress/trends?metric=weight&from=&to=
 * @access  Private
 */
export const getProgressTrends = async (req, res, next) => {
  try {
    const metricParam = (req.query.metric || 'weight').trim();
    const { from, to } = req.query;

    const filterQuery = { user: req.user._id };

    if (from || to) {
      filterQuery.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          fromDate.setHours(0, 0, 0, 0);
          filterQuery.date.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          filterQuery.date.$lte = toDate;
        }
      }
    }

    // Fetch all logs chronologically (date ascending)
    const logs = await ProgressLog.find(filterQuery).sort({ date: 1, createdAt: 1 });

    const standardMeasurements = ['chest', 'waist', 'hips', 'arms', 'thighs'];
    const points = [];
    let metricUnit = '';
    const availableMetricsSet = new Set(['weight', ...standardMeasurements]);

    for (const log of logs) {
      const dateStr = log.date ? new Date(log.date).toISOString().split('T')[0] : '';

      // Collect available performance metric names for client selector
      if (Array.isArray(log.performanceMetrics)) {
        for (const pm of log.performanceMetrics) {
          if (pm.metricName) {
            availableMetricsSet.add(pm.metricName);
          }
        }
      }

      // 1. Weight metric
      if (metricParam.toLowerCase() === 'weight') {
        if (log.weight !== undefined && log.weight !== null && !isNaN(Number(log.weight))) {
          metricUnit = req.user.preferences?.units === 'imperial' ? 'lbs' : 'kg';
          points.push({
            date: dateStr,
            value: Number(log.weight),
            unit: metricUnit,
            label: `${log.weight} ${metricUnit}`,
          });
        }
      }
      // 2. Standard body measurements
      else if (standardMeasurements.includes(metricParam.toLowerCase())) {
        const key = metricParam.toLowerCase();
        const val = log.bodyMeasurements?.[key];
        if (val !== undefined && val !== null && !isNaN(Number(val))) {
          metricUnit = req.user.preferences?.units === 'imperial' ? 'in' : 'cm';
          points.push({
            date: dateStr,
            value: Number(val),
            unit: metricUnit,
            label: `${val} ${metricUnit}`,
          });
        }
      }
      // 3. Custom performance metrics (case-insensitive name match)
      else {
        if (Array.isArray(log.performanceMetrics)) {
          const match = log.performanceMetrics.find(
            (pm) => pm.metricName.trim().toLowerCase() === metricParam.toLowerCase()
          );
          if (match && match.value !== undefined && match.value !== null && !isNaN(Number(match.value))) {
            metricUnit = match.unit || '';
            points.push({
              date: dateStr,
              value: Number(match.value),
              unit: metricUnit,
              label: `${match.value} ${metricUnit}`.trim(),
            });
          }
        }
      }
    }

    return res.status(200).json({
      metric: metricParam,
      unit: metricUnit,
      points,
      totalPoints: points.length,
      availableMetrics: Array.from(availableMetricsSet),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated dashboard summary stats (this week's workouts, nutrition days, sparkline, and recent activity)
 * @route   GET /api/progress/dashboard-summary
 * @access  Private
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    // Calculate start of current week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      workoutsThisWeekCount,
      recentWorkouts,
      nutritionEntriesThisWeek,
      recentNutrition,
      latestProgressLogs,
    ] = await Promise.all([
      // Count workouts this week
      Workout.countDocuments({
        user: req.user._id,
        date: { $gte: startOfWeek, $lte: endOfWeek },
      }),
      // 3 Most recent workouts
      Workout.find({ user: req.user._id })
        .sort({ date: -1, createdAt: -1 })
        .limit(3),
      // Nutrition entries this week to count distinct days
      NutritionEntry.find({
        user: req.user._id,
        date: { $gte: startOfWeek, $lte: endOfWeek },
      }).select('date'),
      // 3 Most recent nutrition entries
      NutritionEntry.find({ user: req.user._id })
        .sort({ date: -1, createdAt: -1 })
        .limit(3),
      // Latest 10 progress logs (for latest weight & sparkline)
      ProgressLog.find({ user: req.user._id })
        .sort({ date: -1, createdAt: -1 })
        .limit(10),
    ]);

    // Calculate distinct nutrition logged days this week
    const distinctNutritionDays = new Set(
      nutritionEntriesThisWeek.map((e) =>
        e.date ? new Date(e.date).toISOString().split('T')[0] : ''
      ).filter(Boolean)
    ).size;

    // Weight sparkline points (chronological order)
    const weightSparkline = latestProgressLogs
      .filter((l) => l.weight !== undefined && l.weight !== null)
      .reverse()
      .map((l) => ({
        date: l.date ? new Date(l.date).toISOString().split('T')[0] : '',
        weight: Number(l.weight),
      }));

    const latestLog = latestProgressLogs[0] || null;

    return res.status(200).json({
      stats: {
        workoutsThisWeek: workoutsThisWeekCount,
        nutritionDaysThisWeek: distinctNutritionDays,
        latestWeight: latestLog?.weight ?? null,
        weightUnit: req.user.preferences?.units === 'imperial' ? 'lbs' : 'kg',
      },
      weightSparkline,
      recentWorkouts,
      recentNutrition,
      latestLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new progress log entry
 * @route   POST /api/progress
 * @access  Private
 */
export const createProgressLog = async (req, res, next) => {
  try {
    const { date, weight, bodyMeasurements, performanceMetrics } = req.body;

    const log = await ProgressLog.create({
      user: req.user._id,
      date: date ? new Date(date) : new Date(),
      weight: weight !== undefined && weight !== '' ? Number(weight) : undefined,
      bodyMeasurements: bodyMeasurements
        ? {
            chest: bodyMeasurements.chest ? Number(bodyMeasurements.chest) : undefined,
            waist: bodyMeasurements.waist ? Number(bodyMeasurements.waist) : undefined,
            hips: bodyMeasurements.hips ? Number(bodyMeasurements.hips) : undefined,
            arms: bodyMeasurements.arms ? Number(bodyMeasurements.arms) : undefined,
            thighs: bodyMeasurements.thighs ? Number(bodyMeasurements.thighs) : undefined,
          }
        : {},
      performanceMetrics: Array.isArray(performanceMetrics)
        ? performanceMetrics.map((pm) => ({
            metricName: pm.metricName.trim(),
            value: Number(pm.value) || 0,
            unit: pm.unit ? pm.unit.trim() : '',
          }))
        : [],
    });

    return res.status(201).json({
      message: 'Progress log created successfully',
      log,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a progress log entry (scoped to logged-in user)
 * @route   PUT /api/progress/:id
 * @access  Private
 */
export const updateProgressLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    const log = await ProgressLog.findOne({ _id: id, user: req.user._id });

    if (!log) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    const { date, weight, bodyMeasurements, performanceMetrics } = req.body;

    if (date !== undefined) log.date = new Date(date);
    if (weight !== undefined) {
      log.weight = weight !== '' ? Number(weight) : undefined;
    }
    if (bodyMeasurements !== undefined) {
      log.bodyMeasurements = {
        chest: bodyMeasurements.chest ? Number(bodyMeasurements.chest) : undefined,
        waist: bodyMeasurements.waist ? Number(bodyMeasurements.waist) : undefined,
        hips: bodyMeasurements.hips ? Number(bodyMeasurements.hips) : undefined,
        arms: bodyMeasurements.arms ? Number(bodyMeasurements.arms) : undefined,
        thighs: bodyMeasurements.thighs ? Number(bodyMeasurements.thighs) : undefined,
      };
    }
    if (performanceMetrics !== undefined) {
      log.performanceMetrics = Array.isArray(performanceMetrics)
        ? performanceMetrics.map((pm) => ({
            metricName: pm.metricName.trim(),
            value: Number(pm.value) || 0,
            unit: pm.unit ? pm.unit.trim() : '',
          }))
        : [];
    }

    const updatedLog = await log.save();

    return res.status(200).json({
      message: 'Progress log updated successfully',
      log: updatedLog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a progress log entry (scoped to logged-in user)
 * @route   DELETE /api/progress/:id
 * @access  Private
 */
export const deleteProgressLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    const log = await ProgressLog.findOneAndDelete({ _id: id, user: req.user._id });

    if (!log) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    return res.status(200).json({
      message: 'Progress log deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
