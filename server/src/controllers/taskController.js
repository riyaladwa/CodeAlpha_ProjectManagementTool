import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { TaskComment } from '../models/TaskComment.js';
import { notificationService } from '../services/notificationService.js';

export const getTasks = async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const {
      projectId,
      assigneeId,
      status,
      priority,
      search,
      dueDateFilter,
      tag,
      sortBy = 'order',
      sortOrder = 'asc',
    } = req.query;

    const filter = { workspaceId };

    if (projectId) filter.projectId = projectId;
    if (assigneeId) {
      if (assigneeId === 'unassigned') {
        filter.assigneeId = null;
      } else if (assigneeId === 'me') {
        filter.assigneeId = req.user._id;
      } else {
        filter.assigneeId = assigneeId;
      }
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;

    // Date filters
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dueDateFilter === 'today') {
      filter.dueDate = { $gte: startOfToday, $lte: endOfToday };
    } else if (dueDateFilter === 'overdue') {
      filter.status = { $ne: 'completed' };
      filter.dueDate = { $lt: startOfToday };
    } else if (dueDateFilter === 'upcoming') {
      filter.status = { $ne: 'completed' };
      filter.dueDate = { $gt: endOfToday };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .populate('assigneeId', 'name email avatar title')
      .populate('creatorId', 'name email avatar')
      .populate('projectId', 'name color status')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const userId = req.user._id;
    const {
      projectId,
      title,
      description,
      status = 'todo',
      priority = 'medium',
      assigneeId,
      startDate,
      dueDate,
      tags = [],
      subtasks = [],
      estimatedHours,
    } = req.body;

    // Verify project belongs to this workspace if projectId provided
    let project = null;
    if (projectId) {
      project = await Project.findOne({ _id: projectId, workspaceId });
      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'The selected project does not belong to this workspace.',
        });
      }
    }

    // Determine task order in column
    const orderFilter = projectId ? { projectId, status } : { workspaceId, status };
    const highestOrder = await Task.findOne(orderFilter)
      .sort({ order: -1 })
      .select('order');
    const order = highestOrder ? highestOrder.order + 1 : 0;

    const task = await Task.create({
      workspaceId,
      projectId: projectId || null,
      title,
      description: description || '',
      status,
      priority,
      creatorId: userId,
      assigneeId: assigneeId || null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      completedAt: status === 'completed' ? new Date() : null,
      tags,
      subtasks: subtasks.map((st) => ({ title: typeof st === 'string' ? st : st.title, completed: false })),
      order,
      estimatedHours: estimatedHours || null,
    });

    await task.populate('assigneeId', 'name email avatar title');
    await task.populate('creatorId', 'name email avatar');
    await task.populate('projectId', 'name color status');

    // Notify assignee if not the creator
    if (assigneeId && assigneeId.toString() !== userId.toString()) {
      await notificationService.notifyUser({
        userId: assigneeId,
        workspaceId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you to "${task.title}"${project ? ` in project "${project.name}"` : ''}.`,
        link: `/kanban`,
      });
    }

    // Activity Log
    await notificationService.logActivity({
      workspaceId,
      projectId: projectId || null,
      taskId: task._id,
      userId,
      action: 'created_task',
      details: { taskTitle: task.title, projectName: project ? project.name : 'Workspace' },
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, workspaceId: req.workspace._id })
      .populate('assigneeId', 'name email avatar title')
      .populate('creatorId', 'name email avatar')
      .populate('projectId', 'name color status');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const comments = await TaskComment.find({ taskId: task._id })
      .populate('userId', 'name email avatar title')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      task: {
        ...task.toObject(),
        comments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace._id;
    const userId = req.user._id;

    const task = await Task.findOne({ _id: id, workspaceId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const prevStatus = task.status;
    const prevAssignee = task.assigneeId?.toString();

    const {
      title,
      description,
      status,
      priority,
      assigneeId,
      startDate,
      dueDate,
      tags,
      subtasks,
      order,
      estimatedHours,
      actualHours,
      projectId,
    } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (startDate !== undefined) task.startDate = startDate || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (tags) task.tags = tags;
    if (subtasks) task.subtasks = subtasks;
    if (order !== undefined) task.order = order;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (projectId) task.projectId = projectId;

    if (assigneeId !== undefined) {
      task.assigneeId = assigneeId || null;
    }

    if (status && status !== prevStatus) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      } else {
        task.completedAt = null;
      }
    }

    await task.save();
    await task.populate('assigneeId', 'name email avatar title');
    await task.populate('creatorId', 'name email avatar');
    await task.populate('projectId', 'name color status');

    // Notify new assignee if changed
    if (assigneeId && assigneeId !== prevAssignee && assigneeId.toString() !== userId.toString()) {
      await notificationService.notifyUser({
        userId: assigneeId,
        workspaceId,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${req.user.name} assigned you to task "${task.title}".`,
        link: task.projectId?._id ? `/projects/${task.projectId._id}` : `/kanban`,
      });
    }

    // Notify if completed
    if (status === 'completed' && prevStatus !== 'completed') {
      await notificationService.logActivity({
        workspaceId,
        projectId: task.projectId?._id || null,
        taskId: task._id,
        userId,
        action: 'completed_task',
        details: { taskTitle: task.title },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, order } = req.body;
    const workspaceId = req.workspace._id;

    if (!['todo', 'in_progress', 'in_review', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task status.',
      });
    }

    const task = await Task.findOne({ _id: id, workspaceId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    task.status = status;
    if (order !== undefined) task.order = order;
    task.completedAt = status === 'completed' ? new Date() : null;

    await task.save();
    await task.populate('assigneeId', 'name email avatar title');
    await task.populate('creatorId', 'name email avatar');
    await task.populate('projectId', 'name color status');

    return res.status(200).json({
      success: true,
      message: 'Status updated.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, workspaceId: req.workspace._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Delete comments
    await TaskComment.deleteMany({ taskId: id });

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const addSubtask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subtask title cannot be empty.',
      });
    }

    const task = await Task.findOne({ _id: id, workspaceId: req.workspace._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    task.subtasks.push({ title: title.trim(), completed: false });
    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Subtask added.',
      subtasks: task.subtasks,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;

    const task = await Task.findOne({ _id: id, workspaceId: req.workspace._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found.',
      });
    }

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;
    await task.save();

    return res.status(200).json({
      success: true,
      subtasks: task.subtasks,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;

    const task = await Task.findOne({ _id: id, workspaceId: req.workspace._id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    task.subtasks.pull({ _id: subtaskId });
    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Subtask removed.',
      subtasks: task.subtasks,
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const workspaceId = req.workspace._id;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    const task = await Task.findOne({ _id: id, workspaceId }).populate('projectId', 'name');
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const comment = await TaskComment.create({
      taskId: task._id,
      workspaceId,
      userId,
      content: content.trim(),
    });

    await comment.populate('userId', 'name email avatar title');

    // Notify assignee if not the commenter
    if (task.assigneeId && task.assigneeId.toString() !== userId.toString()) {
      await notificationService.notifyUser({
        userId: task.assigneeId,
        workspaceId,
        type: 'comment_added',
        title: 'New Comment on Task',
        message: `${req.user.name} commented on "${task.title}": "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
        link: task.projectId?._id ? `/projects/${task.projectId._id}` : `/kanban`,
      });
    }

    // Activity Log
    await notificationService.logActivity({
      workspaceId,
      projectId: task.projectId?._id || null,
      taskId: task._id,
      userId,
      action: 'added_comment',
      details: { taskTitle: task.title },
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added.',
      comment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await TaskComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    // Verify ownership or workspace admin/owner
    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = ['owner', 'admin'].includes(req.membershipRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment.',
      });
    }

    await TaskComment.findByIdAndDelete(commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted.',
    });
  } catch (error) {
    next(error);
  }
};
