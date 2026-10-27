import express from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  archiveProject,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceAccess, requireRoles } from '../middleware/workspaceAccess.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.use(authenticate);
router.use(checkWorkspaceAccess);

router.get('/', getProjects);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('status').optional().isIn(['planning', 'active', 'on_hold', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    validate,
  ],
  createProject
);

router.get('/:id', getProjectById);
router.patch('/:id', updateProject);
router.delete('/:id', requireRoles(['owner', 'admin']), deleteProject);
router.patch('/:id/archive', archiveProject);

export default router;
