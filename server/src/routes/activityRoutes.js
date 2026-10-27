import express from 'express';
import { getWorkspaceActivity } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceAccess } from '../middleware/workspaceAccess.js';

const router = express.Router();

router.use(authenticate);
router.use(checkWorkspaceAccess);

router.get('/', getWorkspaceActivity);

export default router;
