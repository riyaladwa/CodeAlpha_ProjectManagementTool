import express from 'express';
import { body } from 'express-validator';
import {
  generateProjectPlan,
  breakDownTask,
  summarizeProject,
  prioritizeTasks,
  improveTask,
  batchCreatePlanTasks,
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceAccess } from '../middleware/workspaceAccess.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.use(authenticate);
router.use(checkWorkspaceAccess);
router.use(aiLimiter);

router.post(
  '/generate-project-plan',
  [body('projectName').trim().notEmpty().withMessage('Project name is required'), validate],
  generateProjectPlan
);

router.post(
  '/break-down-task',
  [body('title').trim().notEmpty().withMessage('Task title is required'), validate],
  breakDownTask
);

router.post(
  '/summarize-project',
  [body('projectId').optional(), validate],
  summarizeProject
);

router.post(
  '/prioritize-tasks',
  [body('projectId').optional(), validate],
  prioritizeTasks
);

router.post(
  '/improve-task',
  [body('title').trim().notEmpty().withMessage('Task title is required'), validate],
  improveTask
);

router.post('/batch-create-plan', batchCreatePlanTasks);

export default router;
