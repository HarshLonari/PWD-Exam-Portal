import { Router } from 'express';
import { getQuestions, getSubjects, saveQuestions } from '../controllers/questionController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public (but requires auth to prevent scraping)
router.get('/subjects', verifyToken, getSubjects);
router.get('/:subject', verifyToken, (req, res, next) => {
  if (req.query.all === 'true') return requireAdmin(req, res, next);
  next();
}, getQuestions);

// Admin only
router.post('/admin/save', verifyToken, requireAdmin, saveQuestions);

export default router;
