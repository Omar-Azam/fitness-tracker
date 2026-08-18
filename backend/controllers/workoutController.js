import mongoose from 'mongoose';
import Workout from '../models/Workout.js';

/**
 * @desc    Get all workouts for logged-in user with filtering & pagination
 * @route   GET /api/workouts
 * @access  Private
 */
export const getWorkouts = async (req, res, next) => {
  try {
    const { category, tag, from, to, page = 1, limit = 10 } = req.query;

    const filterQuery = { user: req.user._id };

    // Filter by Category
    if (category && category !== 'all') {
      filterQuery.category = category;
    }

    // Filter by Tag
    if (tag && tag.trim()) {
      filterQuery.tags = { $regex: tag.trim(), $options: 'i' };
    }

    // Filter by Date Range (from, to)
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

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [workouts, totalWorkouts] = await Promise.all([
      Workout.find(filterQuery)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Workout.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(totalWorkouts / limitNum) || 1;

    return res.status(200).json({
      workouts,
      page: pageNum,
      totalPages,
      totalWorkouts,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single workout by ID (scoped to logged-in user)
 * @route   GET /api/workouts/:id
 * @access  Private
 */
export const getWorkoutById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const workout = await Workout.findOne({ _id: id, user: req.user._id });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    return res.status(200).json({ workout });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new workout
 * @route   POST /api/workouts
 * @access  Private
 */
export const createWorkout = async (req, res, next) => {
  try {
    const { name, category, tags, exercises, date, duration } = req.body;

    const workout = await Workout.create({
      user: req.user._id,
      name: name.trim(),
      category: category || 'strength',
      tags: Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : [],
      exercises: Array.isArray(exercises)
        ? exercises.map((ex) => ({
            name: ex.name.trim(),
            sets: Number(ex.sets) || 1,
            reps: Number(ex.reps) || 0,
            weight: Number(ex.weight) || 0,
            notes: ex.notes ? ex.notes.trim() : '',
          }))
        : [],
      date: date ? new Date(date) : new Date(),
      duration: duration !== undefined ? Number(duration) : 0,
    });

    return res.status(201).json({
      message: 'Workout created successfully',
      workout,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing workout (scoped to logged-in user)
 * @route   PUT /api/workouts/:id
 * @access  Private
 */
export const updateWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const workout = await Workout.findOne({ _id: id, user: req.user._id });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const { name, category, tags, exercises, date, duration } = req.body;

    if (name !== undefined) workout.name = name.trim();
    if (category !== undefined) workout.category = category;
    if (tags !== undefined) {
      workout.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : [];
    }
    if (exercises !== undefined) {
      workout.exercises = Array.isArray(exercises)
        ? exercises.map((ex) => ({
            name: ex.name.trim(),
            sets: Number(ex.sets) || 1,
            reps: Number(ex.reps) || 0,
            weight: Number(ex.weight) || 0,
            notes: ex.notes ? ex.notes.trim() : '',
          }))
        : [];
    }
    if (date !== undefined) workout.date = new Date(date);
    if (duration !== undefined) workout.duration = Number(duration) || 0;

    const updatedWorkout = await workout.save();

    return res.status(200).json({
      message: 'Workout updated successfully',
      workout: updatedWorkout,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a workout (scoped to logged-in user)
 * @route   DELETE /api/workouts/:id
 * @access  Private
 */
export const deleteWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const workout = await Workout.findOneAndDelete({ _id: id, user: req.user._id });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    return res.status(200).json({
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
