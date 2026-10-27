import { Workspace } from '../models/Workspace.js';
import mongoose from 'mongoose';

export const checkWorkspaceAccess = async (req, res, next) => {
  try {
    const workspaceId =
      req.params.workspaceId ||
      req.body.workspaceId ||
      req.query.workspaceId ||
      req.headers['x-workspace-id'];

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'Workspace ID is required for this operation.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Workspace ID format.',
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    // Check if current user is owner or member
    const userIdStr = req.user._id.toString();
    const isOwner = workspace.ownerId.toString() === userIdStr;
    const memberRecord = workspace.members.find(
      (m) => m.user.toString() === userIdStr
    );

    if (!isOwner && !memberRecord) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this workspace.',
      });
    }

    req.workspace = workspace;
    req.membershipRole = isOwner ? 'owner' : (memberRecord?.role || 'member');
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRoles = (allowedRoles = ['owner', 'admin']) => {
  return (req, res, next) => {
    if (!req.membershipRole || !allowedRoles.includes(req.membershipRole)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
    }
    next();
  };
};
