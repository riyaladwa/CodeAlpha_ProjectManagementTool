import crypto from 'crypto';
import { Workspace } from '../models/Workspace.js';
import { User } from '../models/User.js';
import { Invitation } from '../models/Invitation.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { notificationService } from '../services/notificationService.js';

export const getWorkspaces = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const workspaces = await Workspace.find({
      $or: [{ ownerId: userId }, { 'members.user': userId }],
    })
      .populate('members.user', 'name email avatar title')
      .populate('ownerId', 'name email avatar')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;

    const workspace = await Workspace.create({
      name,
      description: description || '',
      ownerId: userId,
      members: [{ user: userId, role: 'owner' }],
    });

    await workspace.populate('members.user', 'name email avatar title');

    // Log activity
    await notificationService.logActivity({
      workspaceId: workspace._id,
      userId,
      action: 'created_workspace',
      details: { workspaceName: name },
    });

    return res.status(201).json({
      success: true,
      message: 'Workspace created successfully.',
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('members.user', 'name email avatar title')
      .populate('ownerId', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    return res.status(200).json({
      success: true,
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const workspace = req.workspace;

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: 'Workspace updated successfully.',
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = req.workspace;
    const userIdStr = req.user._id.toString();

    if (workspace.ownerId.toString() !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: 'Only the workspace owner can delete this workspace.',
      });
    }

    // Cascade delete projects, tasks, invitations
    await Project.deleteMany({ workspaceId: workspace._id });
    await Task.deleteMany({ workspaceId: workspace._id });
    await Invitation.deleteMany({ workspaceId: workspace._id });
    await Workspace.findByIdAndDelete(workspace._id);

    return res.status(200).json({
      success: true,
      message: 'Workspace and all associated projects and tasks deleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    const workspace = req.workspace;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if target user already exists in platform
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      // Check if already a member
      const alreadyMember = workspace.members.some(
        (m) => m.user.toString() === existingUser._id.toString()
      );

      if (alreadyMember) {
        return res.status(400).json({
          success: false,
          message: 'This user is already a member of this workspace.',
        });
      }

      // Add to workspace directly
      workspace.members.push({ user: existingUser._id, role });
      await workspace.save();
      await workspace.populate('members.user', 'name email avatar title');

      // Send notification
      await notificationService.notifyUser({
        userId: existingUser._id,
        workspaceId: workspace._id,
        type: 'invitation',
        title: 'Added to Workspace',
        message: `${req.user.name} added you to workspace "${workspace.name}" as a ${role}.`,
        link: `/dashboard`,
      });

      return res.status(200).json({
        success: true,
        message: `Added ${existingUser.name} (${normalizedEmail}) to workspace.`,
        workspace,
      });
    }

    // If user does not exist yet, generate invitation token
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      workspaceId: workspace._id,
      email: normalizedEmail,
      role,
      token,
      invitedBy: req.user._id,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      message: `Invitation generated for ${normalizedEmail}. Share the invite link with them.`,
      invitationToken: token,
      inviteLink: `/register?invite=${token}&email=${encodeURIComponent(normalizedEmail)}`,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { targetUserId, role } = req.body;
    const workspace = req.workspace;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either admin or member.',
      });
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === targetUserId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in this workspace.',
      });
    }

    if (workspace.ownerId.toString() === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change the workspace owner role.',
      });
    }

    member.role = role;
    await workspace.save();
    await workspace.populate('members.user', 'name email avatar title');

    return res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      workspace,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { targetUserId } = req.params;
    const workspace = req.workspace;

    if (workspace.ownerId.toString() === targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the workspace owner.',
      });
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== targetUserId
    );

    await workspace.save();
    await workspace.populate('members.user', 'name email avatar title');

    return res.status(200).json({
      success: true,
      message: 'Member removed from workspace.',
      workspace,
    });
  } catch (error) {
    next(error);
  }
};
