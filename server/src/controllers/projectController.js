import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { notificationService } from '../services/notificationService.js';

export const getProjects = async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const { status, priority, search, isArchived } = req.query;

    const filter = { workspaceId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (isArchived !== undefined) {
      filter.isArchived = isArchived === 'true';
    } else {
      filter.isArchived = false;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const projects = await Project.find(filter)
      .populate('ownerId', 'name email avatar')
      .populate('members', 'name email avatar title')
      .sort({ updatedAt: -1 });

    // Calculate real-time task statistics for each project
    const projectIds = projects.map((p) => p._id);
    const taskStats = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: '$projectId',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'completed'] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const statsMap = {};
    taskStats.forEach((s) => {
      statsMap[s._id.toString()] = {
        totalTasks: s.totalTasks,
        completedTasks: s.completedTasks,
        inProgressTasks: s.inProgressTasks,
        overdueTasks: s.overdueTasks,
        progressPercentage:
          s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0,
      };
    });

    const enrichedProjects = projects.map((p) => {
      const stats = statsMap[p._id.toString()] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        progressPercentage: 0,
      };
      return {
        ...p.toObject(),
        stats,
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedProjects.length,
      projects: enrichedProjects,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, color, icon, startDate, deadline, members, tags } = req.body;
    const workspaceId = req.workspace._id;
    const userId = req.user._id;

    // Ensure creator is in members list
    const memberSet = new Set(members || []);
    memberSet.add(userId.toString());

    const project = await Project.create({
      workspaceId,
      name,
      description: description || '',
      status: status || 'planning',
      priority: priority || 'medium',
      color: color || '#10b981',
      icon: icon || 'folder',
      startDate: startDate || null,
      deadline: deadline || null,
      ownerId: userId,
      members: Array.from(memberSet),
      tags: tags || [],
    });

    await project.populate('ownerId', 'name email avatar');
    await project.populate('members', 'name email avatar title');

    // Activity Log
    await notificationService.logActivity({
      workspaceId,
      projectId: project._id,
      userId,
      action: 'created_project',
      details: { projectName: project.name },
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: {
        ...project.toObject(),
        stats: { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, overdueTasks: 0, progressPercentage: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      _id: id,
      workspaceId: req.workspace._id,
    })
      .populate('ownerId', 'name email avatar')
      .populate('members', 'name email avatar title');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found in this workspace.',
      });
    }

    // Aggregate project tasks stats
    const totalTasks = await Task.countDocuments({ projectId: project._id });
    const completedTasks = await Task.countDocuments({ projectId: project._id, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ projectId: project._id, status: 'in_progress' });
    const inReviewTasks = await Task.countDocuments({ projectId: project._id, status: 'in_review' });
    const todoTasks = await Task.countDocuments({ projectId: project._id, status: 'todo' });
    const overdueTasks = await Task.countDocuments({
      projectId: project._id,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() },
    });

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          inReviewTasks,
          todoTasks,
          overdueTasks,
          progressPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, priority, color, icon, startDate, deadline, members, tags } = req.body;

    const project = await Project.findOne({
      _id: id,
      workspaceId: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (color) project.color = color;
    if (icon) project.icon = icon;
    if (startDate !== undefined) project.startDate = startDate || null;
    if (deadline !== undefined) project.deadline = deadline || null;
    if (members) project.members = members;
    if (tags) project.tags = tags;

    await project.save();
    await project.populate('ownerId', 'name email avatar');
    await project.populate('members', 'name email avatar title');

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({
      _id: id,
      workspaceId: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Cascade delete tasks
    await Task.deleteMany({ projectId: id });

    return res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const archiveProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      _id: id,
      workspaceId: req.workspace._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    project.isArchived = !project.isArchived;
    await project.save();

    return res.status(200).json({
      success: true,
      message: project.isArchived ? 'Project archived.' : 'Project unarchived.',
      project,
    });
  } catch (error) {
    next(error);
  }
};
