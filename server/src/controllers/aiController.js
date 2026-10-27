import { aiService } from '../services/aiService.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { notificationService } from '../services/notificationService.js';

export const generateProjectPlan = async (req, res, next) => {
  try {
    const { projectName, goal, description, targetDeadline } = req.body;

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required to generate a plan.',
      });
    }

    const plan = await aiService.generateProjectPlan({
      projectName: projectName.trim(),
      goal,
      description,
      targetDeadline,
    });

    return res.status(200).json({
      success: true,
      message: 'AI Project Plan generated successfully.',
      plan,
    });
  } catch (error) {
    next(error);
  }
};

export const breakDownTask = async (req, res, next) => {
  try {
    const { title, description, projectName } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required for task breakdown.',
      });
    }

    const breakdown = await aiService.breakDownTask({
      title: title.trim(),
      description,
      projectName,
    });

    return res.status(200).json({
      success: true,
      message: 'Task breakdown generated.',
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};

export const summarizeProject = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const workspaceId = req.workspace._id;

    const project = await Project.findOne({ _id: projectId, workspaceId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const tasks = await Task.find({ projectId, workspaceId });

    const summary = await aiService.summarizeProject({ project, tasks });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

export const prioritizeTasks = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const workspaceId = req.workspace._id;

    let project = null;
    let tasks = [];
    if (projectId) {
      project = await Project.findOne({ _id: projectId, workspaceId });
      tasks = await Task.find({ projectId, workspaceId });
    } else {
      tasks = await Task.find({ workspaceId });
    }

    const prioritization = await aiService.prioritizeTasks({
      tasks,
      projectName: project ? project.name : (req.workspace.name || 'Workspace'),
    });

    return res.status(200).json({
      success: true,
      prioritization,
    });
  } catch (error) {
    next(error);
  }
};

export const improveTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    const improved = await aiService.improveTask({ title: title.trim(), description });

    return res.status(200).json({
      success: true,
      improved,
    });
  } catch (error) {
    next(error);
  }
};

export const batchCreatePlanTasks = async (req, res, next) => {
  try {
    const { projectId, tasks } = req.body;
    const workspaceId = req.workspace._id;
    const userId = req.user._id;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of tasks to save.',
      });
    }

    let project = null;
    if (projectId) {
      project = await Project.findOne({ _id: projectId, workspaceId });
    }

    const now = new Date();
    const createdTasks = [];

    for (let i = 0; i < tasks.length; i++) {
      const item = tasks[i];
      let dueDate = null;
      if (item.suggestedDueDayOffset) {
        dueDate = new Date(now.getTime() + item.suggestedDueDayOffset * 24 * 60 * 60 * 1000);
      } else if (item.dueDate) {
        dueDate = new Date(item.dueDate);
      }

      const created = await Task.create({
        workspaceId,
        projectId: project ? project._id : null,
        title: item.title,
        description: item.description || '',
        priority: item.priority || 'medium',
        status: item.status || 'todo',
        creatorId: userId,
        assigneeId: item.assigneeId || userId,
        dueDate,
        tags: item.tags || ['AI Plan'],
        estimatedHours: item.estimatedHours || null,
        order: i,
      });
      createdTasks.push(created);
    }

    // Activity Log
    await notificationService.logActivity({
      workspaceId,
      projectId,
      userId,
      action: 'imported_ai_plan',
      details: { taskCount: createdTasks.length, projectName: project.name },
    });

    return res.status(201).json({
      success: true,
      message: `Successfully created ${createdTasks.length} AI-generated tasks in "${project.name}".`,
      tasks: createdTasks,
    });
  } catch (error) {
    next(error);
  }
};
