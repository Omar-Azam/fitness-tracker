import express from 'express';
import {
  getProgressLogs,
  getProgressTrends,
  getDashboardSummary,
  createProgressLog,
  updateProgressLog,
  deleteProgressLog,
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';
import { validateProgress } from '../middleware/progressValidator.js';

const router = express.Router();

// Apply auth middleware to protect all progress routes
router.use(protect);

router.get('/trends', getProgressTrends);
router.get('/dashboard-summary', getDashboardSummary);

router.route('/')
  .get(getProgressLogs)
  .post(validateProgress, createProgressLog);

router.route('/:id')
  .put(validateProgress, updateProgressLog)
  .delete(deleteProgressLog);

export default router;
