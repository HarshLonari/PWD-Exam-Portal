import { Router } from 'express';
import { getResults, saveResult, clearResults } from '../controllers/resultController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, getResults);
router.post('/', verifyToken, saveResult);
router.delete('/', verifyToken, clearResults);

export default router;
