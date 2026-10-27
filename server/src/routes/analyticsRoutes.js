import express from 'express';
import { getOverview, getProjectAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceAccess } from '../middleware/workspaceAccess.js';

const router = express.Router();

router.use(authenticate);
router.use(checkWorkspaceAccess);

router.get('/overview', getOverview);
router.get('/projects/:id', getProjectAnalytics);

export default router;
