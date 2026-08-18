import mongoose from 'mongoose';
import NutritionEntry from '../models/NutritionEntry.js';

/**
 * @desc    Get nutrition entries for logged-in user with date/mealType filtering
 * @route   GET /api/nutrition
 * @access  Private
 */
export const getNutritionEntries = async (req, res, next) => {
  try {
    const { date, mealType, from, to } = req.query;

    const filterQuery = { user: req.user._id };

    // Filter by single exact day if ?date=YYYY-MM-DD is provided
    if (date) {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        filterQuery.date = { $gte: startOfDay, $lte: endOfDay };
      }
    } else if (from || to) {
      // Date range filter ?from=&to=
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

    // Filter by Meal Type
    if (mealType && mealType !== 'all') {
      filterQuery.mealType = mealType.trim().toLowerCase();
    }

    const entries = await NutritionEntry.find(filterQuery).sort({
      date: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      entries,
      totalEntries: entries.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get nutrition daily summary (totals for calories, protein, carbs, fat)
 * @route   GET /api/nutrition/summary?date=YYYY-MM-DD
 * @access  Private
 */
export const getNutritionSummary = async (req, res, next) => {
  try {
    const queryDate = req.query.date ? new Date(req.query.date) : new Date();

    if (isNaN(queryDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await NutritionEntry.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealBreakdown = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, itemsCount: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, itemsCount: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, itemsCount: 0 },
      snack: { calories: 0, protein: 0, carbs: 0, fat: 0, itemsCount: 0 },
    };

    for (const entry of entries) {
      const meal = entry.mealType.toLowerCase();

      for (const item of entry.foodItems) {
        const itemCal = Number(item.calories) || 0;
        const itemProtein = Number(item.protein) || 0;
        const itemCarbs = Number(item.carbs) || 0;
        const itemFat = Number(item.fat) || 0;

        totalCalories += itemCal;
        totalProtein += itemProtein;
        totalCarbs += itemCarbs;
        totalFat += itemFat;

        if (mealBreakdown[meal]) {
          mealBreakdown[meal].calories += itemCal;
          mealBreakdown[meal].protein += itemProtein;
          mealBreakdown[meal].carbs += itemCarbs;
          mealBreakdown[meal].fat += itemFat;
          mealBreakdown[meal].itemsCount += 1;
        }
      }
    }

    return res.status(200).json({
      date: queryDate.toISOString().split('T')[0],
      totalCalories: Math.round(totalCalories * 10) / 10,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      entryCount: entries.length,
      mealBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new nutrition entry
 * @route   POST /api/nutrition
 * @access  Private
 */
export const createNutritionEntry = async (req, res, next) => {
  try {
    const { mealType, date, foodItems } = req.body;

    const entry = await NutritionEntry.create({
      user: req.user._id,
      mealType: mealType.trim().toLowerCase(),
      date: date ? new Date(date) : new Date(),
      foodItems: Array.isArray(foodItems)
        ? foodItems.map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity) || 1,
            unit: item.unit ? item.unit.trim() : 'serving',
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbs: Number(item.carbs) || 0,
            fat: Number(item.fat) || 0,
          }))
        : [],
    });

    return res.status(201).json({
      message: 'Nutrition entry created successfully',
      entry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a nutrition entry (scoped to logged-in user)
 * @route   PUT /api/nutrition/:id
 * @access  Private
 */
export const updateNutritionEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }

    const entry = await NutritionEntry.findOne({ _id: id, user: req.user._id });

    if (!entry) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }

    const { mealType, date, foodItems } = req.body;

    if (mealType !== undefined) {
      entry.mealType = mealType.trim().toLowerCase();
    }
    if (date !== undefined) {
      entry.date = new Date(date);
    }
    if (foodItems !== undefined) {
      entry.foodItems = Array.isArray(foodItems)
        ? foodItems.map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity) || 1,
            unit: item.unit ? item.unit.trim() : 'serving',
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbs: Number(item.carbs) || 0,
            fat: Number(item.fat) || 0,
          }))
        : [];
    }

    const updatedEntry = await entry.save();

    return res.status(200).json({
      message: 'Nutrition entry updated successfully',
      entry: updatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a nutrition entry (scoped to logged-in user)
 * @route   DELETE /api/nutrition/:id
 * @access  Private
 */
export const deleteNutritionEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }

    const entry = await NutritionEntry.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Nutrition entry not found' });
    }

    return res.status(200).json({
      message: 'Nutrition entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
