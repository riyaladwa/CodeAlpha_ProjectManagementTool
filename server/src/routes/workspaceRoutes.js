import express from 'express';
import { body } from 'express-validator';
import {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../controllers/workspaceController.js';
import { authenticate } from '../middleware/auth.js';
import { checkWorkspaceAccess, requireRoles } from '../middleware/workspaceAccess.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWorkspaces);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Workspace name is required'), validate],
  createWorkspace
);

router.get('/:workspaceId', checkWorkspaceAccess, getWorkspaceById);
router.patch('/:workspaceId', checkWorkspaceAccess, requireRoles(['owner', 'admin']), updateWorkspace);
router.delete('/:workspaceId', checkWorkspaceAccess, requireRoles(['owner']), deleteWorkspace);

// Members & Invitations
router.post(
  '/:workspaceId/invite',
  checkWorkspaceAccess,
  requireRoles(['owner', 'admin']),
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required'), validate],
  inviteMember
);

router.patch(
  '/:workspaceId/members/role',
  checkWorkspaceAccess,
  requireRoles(['owner', 'admin']),
  updateMemberRole
);

router.delete(
  '/:workspaceId/members/:targetUserId',
  checkWorkspaceAccess,
  requireRoles(['owner', 'admin']),
  removeMember
);

export default router;
