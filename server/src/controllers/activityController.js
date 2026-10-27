import { ActivityLog } from '../models/ActivityLog.js';

export const getWorkspaceActivity = async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const { limit = 30 } = req.query;

    const activities = await ActivityLog.find({ workspaceId })
      .populate('userId', 'name email avatar title')
      .populate('projectId', 'name color')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};
