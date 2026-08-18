import Workout from '../models/Workout.js';
import NutritionEntry from '../models/NutritionEntry.js';

/**
 * @desc    Search user's workouts and nutrition entries
 * @route   GET /api/search?q=&type=workout|nutrition|all
 * @access  Private
 */
export const searchAll = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const type = (req.query.type || 'all').toLowerCase();

    if (!q) {
      return res.status(200).json({
        query: '',
        type,
        results: { workouts: [], nutrition: [] },
        totalResults: 0,
      });
    }

    // Escape regex special characters
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    let workouts = [];
    let nutrition = [];

    // Search Workouts
    if (type === 'all' || type === 'workout') {
      workouts = await Workout.find({
        user: req.user._id,
        $or: [
          { name: regex },
          { tags: regex },
          { 'exercises.name': regex },
        ],
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(10);
    }

    // Search Nutrition Entries
    if (type === 'all' || type === 'nutrition') {
      nutrition = await NutritionEntry.find({
        user: req.user._id,
        $or: [
          { mealType: regex },
          { 'foodItems.name': regex },
        ],
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(10);
    }

    const totalResults = workouts.length + nutrition.length;

    return res.status(200).json({
      query: q,
      type,
      results: {
        workouts,
        nutrition,
      },
      totalResults,
    });
  } catch (error) {
    next(error);
  }
};
