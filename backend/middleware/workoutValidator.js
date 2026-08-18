const VALID_CATEGORIES = ['strength', 'cardio', 'flexibility', 'other'];

/**
 * Middleware to validate workout payload for create and update operations
 */
export const validateWorkout = (req, res, next) => {
  const { name, category, exercises, date, duration, tags } = req.body;

  // On create or if name is provided, ensure it's a valid string
  if (req.method === 'POST' || name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Workout name is required' });
    }
  }

  // Validate category if provided
  if (category !== undefined) {
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      });
    }
  }

  // Validate duration if provided
  if (duration !== undefined && duration !== null) {
    if (typeof duration !== 'number' || duration < 0) {
      return res.status(400).json({ error: 'Duration must be a positive number of minutes' });
    }
  }

  // Validate date if provided
  if (date !== undefined && date !== null) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
  }

  // Validate tags if provided
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array of strings' });
    }
  }

  // Validate exercises if provided
  if (exercises !== undefined) {
    if (!Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Exercises must be an array' });
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex || typeof ex !== 'object') {
        return res.status(400).json({ error: `Exercise at row ${i + 1} is invalid` });
      }

      if (!ex.name || typeof ex.name !== 'string' || !ex.name.trim()) {
        return res.status(400).json({ error: `Exercise name is required at row ${i + 1}` });
      }

      if (ex.sets !== undefined && (typeof ex.sets !== 'number' || ex.sets < 1)) {
        return res.status(400).json({ error: `Sets must be at least 1 for ${ex.name}` });
      }

      if (ex.reps !== undefined && (typeof ex.reps !== 'number' || ex.reps < 0)) {
        return res.status(400).json({ error: `Reps cannot be negative for ${ex.name}` });
      }

      if (ex.weight !== undefined && (typeof ex.weight !== 'number' || ex.weight < 0)) {
        return res.status(400).json({ error: `Weight cannot be negative for ${ex.name}` });
      }
    }
  }

  next();
};
