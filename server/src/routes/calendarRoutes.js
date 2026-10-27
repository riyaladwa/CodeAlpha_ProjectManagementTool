import express from 'express';
import { getCalendarTasks } from '../controllers/calendarController.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceAccess } from '../middleware/workspaceAccess.js';

const router = express.Router();

router.use(authenticate);
router.use(checkWorkspaceAccess);

router.get('/tasks', getCalendarTasks);

export default router;
