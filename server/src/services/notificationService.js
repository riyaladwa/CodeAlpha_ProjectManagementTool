import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const notificationService = {
  /**
   * Create an in-app notification for a user
   */
  async notifyUser({ userId, workspaceId, type, title, message, link = '', metadata = {} }) {
    try {
      if (!userId || !workspaceId) return null;
      
      const notification = await Notification.create({
        userId,
        workspaceId,
        type,
        title,
        message,
        link,
        metadata,
      });

      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error.message);
      return null;
    }
  },

  /**
   * Log an activity event in the workspace timeline
   */
  async logActivity({ workspaceId, userId, action, projectId = null, taskId = null, details = {} }) {
    try {
      if (!workspaceId || !userId || !action) return null;

      const log = await ActivityLog.create({
        workspaceId,
        userId,
        projectId,
        taskId,
        action,
        details,
      });

      return log;
    } catch (error) {
      console.error('[NotificationService] Error logging activity:', error.message);
      return null;
    }
  },
};
