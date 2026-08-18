import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import Workout from '../models/Workout.js';
import NutritionEntry from '../models/NutritionEntry.js';

/**
 * @desc    Export user's workouts as CSV or PDF
 * @route   GET /api/export/workouts?format=csv|pdf
 * @access  Private
 */
export const exportWorkouts = async (req, res, next) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();

    const workouts = await Workout.find({ user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });

    // 1. CSV Format
    if (format === 'csv') {
      const csvData = [];

      for (const w of workouts) {
        const dateStr = w.date ? new Date(w.date).toISOString().split('T')[0] : '';
        const tagsStr = Array.isArray(w.tags) ? w.tags.join(', ') : '';
        const exerciseSummary = Array.isArray(w.exercises)
          ? w.exercises
              .map(
                (ex) =>
                  `${ex.name} (${ex.sets} sets x ${ex.reps} reps @ ${ex.weight}kg${
                    ex.notes ? ' - ' + ex.notes : ''
                  })`
              )
              .join('; ')
          : '';

        csvData.push({
          Date: dateStr,
          WorkoutName: w.name,
          Category: w.category,
          DurationMinutes: w.duration || 0,
          Tags: tagsStr,
          TotalExercises: w.exercises?.length || 0,
          ExercisesSummary: exerciseSummary,
        });
      }

      const fields = [
        'Date',
        'WorkoutName',
        'Category',
        'DurationMinutes',
        'Tags',
        'TotalExercises',
        'ExercisesSummary',
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="workouts_export.csv"'
      );
      return res.status(200).send(csv);
    }

    // 2. PDF Format
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="workouts_export.pdf"'
      );

      doc.pipe(res);

      // Title & Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Fitness Tracker - Workouts Log', { align: 'center' });
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `User: ${req.user.name || req.user.username} (${req.user.email}) | Export Date: ${
            new Date().toISOString().split('T')[0]
          }`,
          { align: 'center' }
        );
      doc.moveDown(1.5);

      if (workouts.length === 0) {
        doc.fontSize(12).text('No workouts recorded.', { align: 'center' });
      } else {
        workouts.forEach((w, index) => {
          // Check if close to page bottom
          if (doc.y > 700) {
            doc.addPage();
          }

          const dateStr = w.date ? new Date(w.date).toISOString().split('T')[0] : '';
          doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .text(`${index + 1}. ${w.name}`, { continued: true });
          doc
            .fontSize(10)
            .font('Helvetica')
            .text(`  [${w.category.toUpperCase()}] - ${dateStr} (${w.duration || 0} mins)`);

          if (w.tags && w.tags.length > 0) {
            doc
              .fontSize(9)
              .font('Helvetica-Oblique')
              .text(`Tags: ${w.tags.join(', ')}`);
          }

          if (w.exercises && w.exercises.length > 0) {
            w.exercises.forEach((ex) => {
              doc
                .fontSize(9)
                .font('Helvetica')
                .text(
                  `   • ${ex.name}: ${ex.sets} sets x ${ex.reps} reps @ ${ex.weight}kg ${
                    ex.notes ? '(' + ex.notes + ')' : ''
                  }`
                );
            });
          }

          doc.moveDown(0.8);
        });
      }

      doc.end();
      return;
    }

    return res.status(400).json({ error: 'Invalid format. Must be csv or pdf' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export user's nutrition log as CSV or PDF
 * @route   GET /api/export/nutrition?format=csv|pdf
 * @access  Private
 */
export const exportNutrition = async (req, res, next) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();

    const entries = await NutritionEntry.find({ user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    });

    // 1. CSV Format
    if (format === 'csv') {
      const csvData = [];

      for (const entry of entries) {
        const dateStr = entry.date ? new Date(entry.date).toISOString().split('T')[0] : '';

        if (!entry.foodItems || entry.foodItems.length === 0) {
          csvData.push({
            Date: dateStr,
            MealType: entry.mealType,
            FoodItem: '',
            Quantity: '',
            Unit: '',
            Calories: 0,
            Protein: 0,
            Carbs: 0,
            Fat: 0,
          });
        } else {
          for (const item of entry.foodItems) {
            csvData.push({
              Date: dateStr,
              MealType: entry.mealType,
              FoodItem: item.name,
              Quantity: item.quantity,
              Unit: item.unit,
              Calories: item.calories || 0,
              Protein: item.protein || 0,
              Carbs: item.carbs || 0,
              Fat: item.fat || 0,
            });
          }
        }
      }

      const fields = [
        'Date',
        'MealType',
        'FoodItem',
        'Quantity',
        'Unit',
        'Calories',
        'Protein',
        'Carbs',
        'Fat',
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="nutrition_export.csv"'
      );
      return res.status(200).send(csv);
    }

    // 2. PDF Format
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="nutrition_export.pdf"'
      );

      doc.pipe(res);

      // Title & Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Fitness Tracker - Nutrition Log', { align: 'center' });
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(
          `User: ${req.user.name || req.user.username} (${req.user.email}) | Export Date: ${
            new Date().toISOString().split('T')[0]
          }`,
          { align: 'center' }
        );
      doc.moveDown(1.5);

      if (entries.length === 0) {
        doc.fontSize(12).text('No nutrition entries recorded.', { align: 'center' });
      } else {
        entries.forEach((entry, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          const dateStr = entry.date ? new Date(entry.date).toISOString().split('T')[0] : '';
          const mealCal = entry.foodItems?.reduce((acc, i) => acc + (i.calories || 0), 0) || 0;
          const mealProtein = entry.foodItems?.reduce((acc, i) => acc + (i.protein || 0), 0) || 0;
          const mealCarbs = entry.foodItems?.reduce((acc, i) => acc + (i.carbs || 0), 0) || 0;
          const mealFat = entry.foodItems?.reduce((acc, i) => acc + (i.fat || 0), 0) || 0;

          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(`${index + 1}. ${entry.mealType.toUpperCase()} - ${dateStr}`, { continued: true });
          doc
            .fontSize(9)
            .font('Helvetica')
            .text(`  (${mealCal} kcal | P:${mealProtein}g C:${mealCarbs}g F:${mealFat}g)`);

          if (entry.foodItems && entry.foodItems.length > 0) {
            entry.foodItems.forEach((item) => {
              doc
                .fontSize(9)
                .font('Helvetica')
                .text(
                  `   • ${item.name}: ${item.quantity} ${item.unit} - ${item.calories || 0} cal (P:${item.protein || 0}g, C:${item.carbs || 0}g, F:${item.fat || 0}g)`
                );
            });
          }

          doc.moveDown(0.8);
        });
      }

      doc.end();
      return;
    }

    return res.status(400).json({ error: 'Invalid format. Must be csv or pdf' });
  } catch (error) {
    next(error);
  }
};
