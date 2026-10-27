import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Workspace } from '../models/Workspace.js';

export const getOverview = async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;

    // 1. Project stats
    const totalProjects = await Project.countDocuments({ workspaceId, isArchived: false });
    const activeProjects = await Project.countDocuments({ workspaceId, status: 'active', isArchived: false });
    const completedProjects = await Project.countDocuments({ workspaceId, status: 'completed', isArchived: false });
    const planningProjects = await Project.countDocuments({ workspaceId, status: 'planning', isArchived: false });

    // 2. Task counts
    const totalTasks = await Task.countDocuments({ workspaceId });
    const completedTasks = await Task.countDocuments({ workspaceId, status: 'completed' });
    const inProgressTasks = await Task.countDocuments({ workspaceId, status: 'in_progress' });
    const inReviewTasks = await Task.countDocuments({ workspaceId, status: 'in_review' });
    const todoTasks = await Task.countDocuments({ workspaceId, status: 'todo' });

    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      workspaceId,
      status: { $ne: 'completed' },
      dueDate: { $ne: null, $lt: now },
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 3. Status distribution for charts
    const statusDistribution = [
      { name: 'To Do', value: todoTasks, key: 'todo', color: '#64748b' },
      { name: 'In Progress', value: inProgressTasks, key: 'in_progress', color: '#f59e0b' },
      { name: 'In Review', value: inReviewTasks, key: 'in_review', color: '#8b5cf6' },
      { name: 'Completed', value: completedTasks, key: 'completed', color: '#18181B' },
    ];

    // 4. Priority distribution
    const priorityStats = await Task.aggregate([
      { $match: { workspaceId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
    priorityStats.forEach((p) => {
      if (p._id && priorityMap[p._id] !== undefined) {
        priorityMap[p._id] = p.count;
      }
    });

    const priorityDistribution = [
      { name: 'Low', count: priorityMap.low, color: '#94a3b8' },
      { name: 'Medium', count: priorityMap.medium, color: '#3b82f6' },
      { name: 'High', count: priorityMap.high, color: '#f97316' },
      { name: 'Urgent', count: priorityMap.urgent, color: '#ef4444' },
    ];

    // 5. Project progress comparison
    const projects = await Project.find({ workspaceId, isArchived: false })
      .select('name color status deadline')
      .limit(8);

    const projectComparison = [];
    for (const p of projects) {
      const pTotal = await Task.countDocuments({ projectId: p._id });
      const pCompleted = await Task.countDocuments({ projectId: p._id, status: 'completed' });
      const pRate = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;
      projectComparison.push({
        id: p._id,
        name: p.name,
        color: p.color,
        status: p.status,
        totalTasks: pTotal,
        completedTasks: pCompleted,
        progress: pRate,
      });
    }

    // 6. Tasks completed over past 14 days trend
    const past14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const count = await Task.countDocuments({
        workspaceId,
        status: 'completed',
        completedAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      past14Days.push({ date: dayLabel, completed: count });
    }

    // 7. Team Workload distribution
    const workspace = await Workspace.findById(workspaceId).populate('members.user', 'name email avatar title');
    const teamWorkload = [];

    if (workspace && workspace.members) {
      for (const m of workspace.members) {
        if (!m.user) continue;
        const assignedTotal = await Task.countDocuments({ workspaceId, assigneeId: m.user._id });
        const assignedCompleted = await Task.countDocuments({
          workspaceId,
          assigneeId: m.user._id,
          status: 'completed',
        });
        const assignedPending = assignedTotal - assignedCompleted;
        const assignedOverdue = await Task.countDocuments({
          workspaceId,
          assigneeId: m.user._id,
          status: { $ne: 'completed' },
          dueDate: { $ne: null, $lt: now },
        });

        teamWorkload.push({
          userId: m.user._id,
          name: m.user.name,
          avatar: m.user.avatar,
          title: m.user.title || 'Team Member',
          role: m.role,
          total: assignedTotal,
          completed: assignedCompleted,
          pending: assignedPending,
          overdue: assignedOverdue,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects,
          activeProjects,
          completedProjects,
          planningProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          inReviewTasks,
          todoTasks,
          overdueTasks,
          completionRate,
        },
        statusDistribution,
        priorityDistribution,
        projectComparison,
        completionTrend: past14Days,
        teamWorkload,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace._id;

    const project = await Project.findOne({ _id: id, workspaceId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const tasks = await Task.find({ projectId: id }).populate('assigneeId', 'name avatar');
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const inReview = tasks.filter((t) => t.status === 'in_review').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;

    const now = new Date();
    const overdue = tasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        projectName: project.name,
        status: project.status,
        priority: project.priority,
        deadline: project.deadline,
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        inReviewTasks: inReview,
        todoTasks: todo,
        overdueTasks: overdue,
        completionRate: rate,
      },
    });
  } catch (error) {
    next(error);
  }
};
