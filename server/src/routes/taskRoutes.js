import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  addComment,
  deleteComment,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceAccess } from '../middleware/workspaceAccess.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.use(authenticate);
router.use(checkWorkspaceAccess);

router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('projectId').optional(),
    body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    validate,
  ],
  createTask
);

router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

// Subtasks
router.post('/:id/subtasks', addSubtask);
router.patch('/:id/subtasks/:subtaskId/toggle', toggleSubtask);
router.delete('/:id/subtasks/:subtaskId', deleteSubtask);

// Comments
router.post(
  '/:id/comments',
  [body('content').trim().notEmpty().withMessage('Comment content cannot be empty'), validate],
  addComment
);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;
