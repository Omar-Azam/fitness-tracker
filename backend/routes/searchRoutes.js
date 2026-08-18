import express from 'express';
import { searchAll } from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);

router.get('/', searchAll);

export default router;
