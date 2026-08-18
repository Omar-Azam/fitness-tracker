const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

/**
 * Middleware to validate nutrition entry payloads for create and update operations
 */
export const validateNutrition = (req, res, next) => {
  const { mealType, date, foodItems } = req.body;

  // Validate mealType
  if (req.method === 'POST' || mealType !== undefined) {
    if (!mealType || typeof mealType !== 'string') {
      return res.status(400).json({ error: 'Meal type is required' });
    }

    const normalizedMealType = mealType.trim().toLowerCase();
    if (!VALID_MEAL_TYPES.includes(normalizedMealType)) {
      return res.status(400).json({
        error: `Invalid meal type. Must be one of: ${VALID_MEAL_TYPES.join(', ')}`,
      });
    }
  }

  // Validate date if provided
  if (date !== undefined && date !== null) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  }

  // Validate foodItems if provided
  if (foodItems !== undefined) {
    if (!Array.isArray(foodItems)) {
      return res.status(400).json({ error: 'foodItems must be an array' });
    }

    for (let i = 0; i < foodItems.length; i++) {
      const item = foodItems[i];
      if (!item || typeof item !== 'object') {
        return res.status(400).json({ error: `Food item at row ${i + 1} is invalid` });
      }

      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
        return res.status(400).json({ error: `Food item name is required at row ${i + 1}` });
      }

      if (item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity < 0)) {
        return res.status(400).json({ error: `Quantity cannot be negative for ${item.name}` });
      }

      if (item.calories !== undefined && (typeof item.calories !== 'number' || item.calories < 0)) {
        return res.status(400).json({ error: `Calories cannot be negative for ${item.name}` });
      }

      if (item.protein !== undefined && (typeof item.protein !== 'number' || item.protein < 0)) {
        return res.status(400).json({ error: `Protein cannot be negative for ${item.name}` });
      }

      if (item.carbs !== undefined && (typeof item.carbs !== 'number' || item.carbs < 0)) {
        return res.status(400).json({ error: `Carbohydrates cannot be negative for ${item.name}` });
      }

      if (item.fat !== undefined && (typeof item.fat !== 'number' || item.fat < 0)) {
        return res.status(400).json({ error: `Fat cannot be negative for ${item.name}` });
      }
    }
  }

  next();
};
