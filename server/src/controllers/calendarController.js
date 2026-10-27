import { Task } from '../models/Task.js';

export const getCalendarTasks = async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const { month, year, projectId, assigneeId } = req.query;

    const filter = { workspaceId };
    if (projectId) filter.projectId = projectId;
    if (assigneeId) {
      if (assigneeId === 'me') {
        filter.assigneeId = req.user._id;
      } else {
        filter.assigneeId = assigneeId;
      }
    }

    // Must have at least a startDate or dueDate to appear on calendar
    filter.$or = [{ dueDate: { $ne: null } }, { startDate: { $ne: null } }];

    // Optional month/year bounding
    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

      filter.$and = [
        {
          $or: [
            { dueDate: { $gte: startOfMonth, $lte: endOfMonth } },
            { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
          ],
        },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assigneeId', 'name email avatar title')
      .populate('projectId', 'name color status')
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};
