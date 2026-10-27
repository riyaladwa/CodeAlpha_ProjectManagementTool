import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

export const getProjectReportData = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const workspaceId = req.workspace._id;

    const project = await Project.findOne({ _id: projectId, workspaceId })
      .populate('ownerId', 'name email avatar')
      .populate('members', 'name email avatar title');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found in this workspace.',
      });
    }

    const tasks = await Task.find({ projectId, workspaceId })
      .populate('assigneeId', 'name email avatar title')
      .populate('creatorId', 'name')
      .sort({ status: 1, dueDate: 1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
    const inReviewTasks = tasks.filter((t) => t.status === 'in_review');
    const todoTasks = tasks.filter((t) => t.status === 'todo');

    const now = new Date();
    const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Member workload breakdown
    const memberStats = {};
    tasks.forEach((t) => {
      const memberName = t.assigneeId ? t.assigneeId.name : 'Unassigned';
      if (!memberStats[memberName]) {
        memberStats[memberName] = { total: 0, completed: 0, inProgress: 0, overdue: 0 };
      }
      memberStats[memberName].total += 1;
      if (t.status === 'completed') memberStats[memberName].completed += 1;
      if (t.status === 'in_progress') memberStats[memberName].inProgress += 1;
      if (t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now) {
        memberStats[memberName].overdue += 1;
      }
    });

    const report = {
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        color: project.color,
        startDate: project.startDate,
        deadline: project.deadline,
        owner: project.ownerId?.name || 'Unknown',
        membersCount: project.members.length,
      },
      summary: {
        totalTasks,
        completedCount: completedTasks.length,
        inProgressCount: inProgressTasks.length,
        inReviewCount: inReviewTasks.length,
        todoCount: todoTasks.length,
        overdueCount: overdueTasks.length,
        completionRate,
      },
      memberWorkload: Object.entries(memberStats).map(([name, stats]) => ({
        name,
        ...stats,
      })),
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignee: t.assigneeId?.name || 'Unassigned',
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        subtasksTotal: t.subtasks?.length || 0,
        subtasksCompleted: t.subtasks?.filter((s) => s.completed).length || 0,
        estimatedHours: t.estimatedHours,
      })),
      generatedAt: new Date(),
    };

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkspaceReportData = async (req, res, next) => {
  try {
    const workspace = req.workspace;
    const workspaceId = workspace._id;

    const tasks = await Task.find({ workspaceId })
      .populate('assigneeId', 'name email avatar title')
      .populate('creatorId', 'name')
      .sort({ status: 1, dueDate: 1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
    const inReviewTasks = tasks.filter((t) => t.status === 'in_review');
    const todoTasks = tasks.filter((t) => t.status === 'todo');

    const now = new Date();
    const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Member workload breakdown
    const memberStats = {};
    tasks.forEach((t) => {
      const memberName = t.assigneeId ? t.assigneeId.name : 'Unassigned';
      if (!memberStats[memberName]) {
        memberStats[memberName] = { total: 0, completed: 0, inProgress: 0, overdue: 0 };
      }
      memberStats[memberName].total += 1;
      if (t.status === 'completed') memberStats[memberName].completed += 1;
      if (t.status === 'in_progress') memberStats[memberName].inProgress += 1;
      if (t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now) {
        memberStats[memberName].overdue += 1;
      }
    });

    const report = {
      workspace: {
        id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        owner: workspace.ownerId?.name || 'Workspace Owner',
        membersCount: workspace.members?.length || 1,
      },
      summary: {
        totalTasks,
        completedCount: completedTasks.length,
        inProgressCount: inProgressTasks.length,
        inReviewCount: inReviewTasks.length,
        todoCount: todoTasks.length,
        overdueCount: overdueTasks.length,
        completionRate,
      },
      memberWorkload: Object.entries(memberStats).map(([name, stats]) => ({
        name,
        ...stats,
      })),
      tasks: tasks.map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignee: t.assigneeId?.name || 'Unassigned',
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        subtasksTotal: t.subtasks?.length || 0,
        subtasksCompleted: t.subtasks?.filter((s) => s.completed).length || 0,
        estimatedHours: t.estimatedHours,
      })),
      generatedAt: new Date(),
    };

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};

