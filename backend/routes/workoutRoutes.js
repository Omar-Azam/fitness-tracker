import express from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController.js';
import { protect } from '../middleware/auth.js';
import { validateWorkout } from '../middleware/workoutValidator.js';

const router = express.Router();

// Apply auth middleware to protect all workout routes
router.use(protect);

router.route('/')
  .get(getWorkouts)
  .post(validateWorkout, createWorkout);

router.route('/:id')
  .get(getWorkoutById)
  .put(validateWorkout, updateWorkout)
  .delete(deleteWorkout);

export default router;
