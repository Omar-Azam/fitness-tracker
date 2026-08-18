import express from 'express';
import {
  getNutritionEntries,
  getNutritionSummary,
  createNutritionEntry,
  updateNutritionEntry,
  deleteNutritionEntry,
} from '../controllers/nutritionController.js';
import { protect } from '../middleware/auth.js';
import { validateNutrition } from '../middleware/nutritionValidator.js';

const router = express.Router();

// Apply auth middleware to protect all nutrition routes
router.use(protect);

router.get('/summary', getNutritionSummary);

router.route('/')
  .get(getNutritionEntries)
  .post(validateNutrition, createNutritionEntry);

router.route('/:id')
  .put(validateNutrition, updateNutritionEntry)
  .delete(deleteNutritionEntry);

export default router;
