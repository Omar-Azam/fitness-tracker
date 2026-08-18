import express from 'express';
import {
  exportWorkouts,
  exportNutrition,
} from '../controllers/exportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);

router.get('/workouts', exportWorkouts);
router.get('/nutrition', exportNutrition);

export default router;
