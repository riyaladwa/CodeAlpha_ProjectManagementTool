import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { TaskComment } from '../models/TaskComment.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const demoDataService = {
  async seedDemoWorkspace(targetUser) {
    try {
      // 1. Create or ensure sample team members exist
      const sampleTeam = [
        { name: 'Sarah Chen', email: 'sarah.chen@taskflow.dev', title: 'Senior Frontend Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
        { name: 'Alex Rivera', email: 'alex.rivera@taskflow.dev', title: 'Lead Backend Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        { name: 'Maya Patel', email: 'maya.patel@taskflow.dev', title: 'Product Designer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        { name: 'Liam Vance', email: 'liam.vance@taskflow.dev', title: 'DevOps & Cloud Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      ];

      const createdMembers = [];
      for (const memberData of sampleTeam) {
        let member = await User.findOne({ email: memberData.email });
        if (!member) {
          member = await User.create({
            ...memberData,
            password: 'DemoPassword123!',
          });
        }
        createdMembers.push(member);
      }

      // 2. Create Workspace
      const workspace = await Workspace.create({
        name: `${targetUser.name}'s Workspace`,
        description: 'Core product development, AI research, and agile sprint workspace.',
        ownerId: targetUser._id,
        isDemo: true,
        members: [
          { user: targetUser._id, role: 'owner' },
          { user: createdMembers[0]._id, role: 'admin' },
          { user: createdMembers[1]._id, role: 'member' },
          { user: createdMembers[2]._id, role: 'member' },
          { user: createdMembers[3]._id, role: 'member' },
        ],
      });

      // 3. Date helpers
      const today = new Date();
      const inDays = (d) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
      const pastDays = (d) => new Date(today.getTime() - d * 24 * 60 * 60 * 1000);

      // 4. Create Workspace Tasks
      const p1Tasks = [
        {
          title: 'Implement Interactive Kanban Board with Drag & Drop',
          description: 'Build responsive columns (Todo, In Progress, In Review, Done) with smooth drag and drop and accessible fallback controls.',
          status: 'in_progress',
          priority: 'urgent',
          assigneeId: targetUser._id,
          creatorId: createdMembers[0]._id,
          startDate: pastDays(3),
          dueDate: inDays(2),
          tags: ['Frontend', 'Kanban', 'Feature'],
          estimatedHours: 16,
          actualHours: 10,
          subtasks: [
            { title: 'Setup drag-and-drop state handlers', completed: true, completedAt: pastDays(1) },
            { title: 'Implement optimistic UI updates with rollback', completed: true, completedAt: pastDays(1) },
            { title: 'Build accessible status change menu', completed: false },
            { title: 'Mobile touch responsiveness testing', completed: false },
          ],
        },
        {
          title: 'Integrate Google Gemini AI Sprint Planning Engine',
          description: 'Construct server-side prompt pipelines to break down goals into structured milestone JSON and verified task schemas.',
          status: 'completed',
          priority: 'urgent',
          assigneeId: createdMembers[1]._id,
          creatorId: targetUser._id,
          startDate: pastDays(8),
          dueDate: pastDays(1),
          completedAt: pastDays(1),
          tags: ['AI', 'Backend', 'Gemini'],
          estimatedHours: 20,
          actualHours: 18,
          subtasks: [
            { title: 'Prompt engineering for JSON schema', completed: true, completedAt: pastDays(4) },
            { title: 'Validation parser with safe fallback mode', completed: true, completedAt: pastDays(2) },
            { title: 'API rate limiting and error handling', completed: true, completedAt: pastDays(1) },
          ],
        },
        {
          title: 'Design Executive Analytics & Burnup Charts',
          description: 'Implement Recharts dashboards visualizing task status distributions, priority breakdowns, and team workload balance.',
          status: 'in_review',
          priority: 'high',
          assigneeId: createdMembers[0]._id,
          creatorId: targetUser._id,
          startDate: pastDays(4),
          dueDate: inDays(3),
          tags: ['Analytics', 'Charts', 'Recharts'],
          estimatedHours: 12,
          actualHours: 11,
          subtasks: [
            { title: 'Task distribution pie charts', completed: true, completedAt: pastDays(2) },
            { title: 'Workload bar charts per member', completed: true, completedAt: pastDays(1) },
            { title: 'Zero-division safety checks on empty datasets', completed: true, completedAt: pastDays(1) },
          ],
        },
        {
          title: 'Build Global Command Palette (Ctrl+K Omnisearch)',
          description: 'Global keyboard-accessible search dialog indexing all accessible projects, tasks, team members, and quick action shortcuts.',
          status: 'todo',
          priority: 'medium',
          assigneeId: targetUser._id,
          creatorId: createdMembers[0]._id,
          startDate: inDays(1),
          dueDate: inDays(5),
          tags: ['Productivity', 'Keyboard', 'UX'],
          estimatedHours: 8,
          subtasks: [
            { title: 'Keyboard listener and modal toggle', completed: false },
            { title: 'Debounced search query to backend endpoint', completed: false },
            { title: 'Recent searches caching', completed: false },
          ],
        },
        {
          title: 'Implement Automated PDF Report Exporter',
          description: 'Generate high-resolution printable PDF summaries containing milestone statistics, team allocation, and overdue task lists.',
          status: 'completed',
          priority: 'high',
          assigneeId: createdMembers[1]._id,
          creatorId: targetUser._id,
          startDate: pastDays(6),
          dueDate: pastDays(2),
          completedAt: pastDays(2),
          tags: ['Reports', 'PDF', 'Export'],
          estimatedHours: 10,
          actualHours: 9,
          subtasks: [
            { title: 'Design PDF layout template', completed: true, completedAt: pastDays(3) },
            { title: 'Connect real-time MongoDB stats', completed: true, completedAt: pastDays(2) },
          ],
        },
        {
          title: 'Conduct Security Audit & RBAC Permission Boundaries',
          description: 'Verify cross-tenant authorization checks, HTTP-only cookie security flags, and sanitized user outputs.',
          status: 'todo',
          priority: 'high',
          assigneeId: createdMembers[3]._id,
          creatorId: targetUser._id,
          startDate: inDays(3),
          dueDate: inDays(10),
          tags: ['Security', 'RBAC', 'Audit'],
          estimatedHours: 14,
          subtasks: [
            { title: 'Test IDOR boundaries across different users', completed: false },
            { title: 'Verify rate limiting on auth and AI endpoints', completed: false },
          ],
        },
      ];

      for (let i = 0; i < p1Tasks.length; i++) {
        const t = p1Tasks[i];
        const createdTask = await Task.create({
          workspaceId: workspace._id,
          projectId: null,
          ...t,
          order: i,
        });

        // Add a sample comment to in_progress task
        if (t.status === 'in_progress') {
          await TaskComment.create({
            taskId: createdTask._id,
            workspaceId: workspace._id,
            userId: createdMembers[0]._id,
            content: 'Great progress on this! Tested the drag physics and it feels very crisp and responsive on both desktop and tablet.',
          });
        }
      }

      // 5. Create Sample Tasks for Sprint Deliverables
      const p2Tasks = [
        {
          title: 'Design Accessible Color Palette (WCAG AAA)',
          description: 'Establish high contrast charcoal, subtle grey, and warning semantic tokens.',
          status: 'completed',
          priority: 'high',
          assigneeId: createdMembers[2]._id,
          creatorId: targetUser._id,
          startDate: pastDays(12),
          dueDate: pastDays(5),
          completedAt: pastDays(5),
          tags: ['Design', 'Tokens', 'A11y'],
          subtasks: [{ title: 'Color contrast ratio audit', completed: true }],
        },
        {
          title: 'Create Micro-Interaction Motion Guidelines',
          description: 'Standardize hover transitions, skeleton shimmer effects, and modal entry/exit animations.',
          status: 'in_progress',
          priority: 'medium',
          assigneeId: createdMembers[2]._id,
          creatorId: createdMembers[0]._id,
          startDate: pastDays(4),
          dueDate: inDays(2),
          tags: ['UI', 'Animation'],
          subtasks: [{ title: 'Button hover and press states', completed: true }],
        },
        {
          title: 'Build Reusable Form Components & Input Masks',
          description: 'Input fields with inline validation, floating labels, select dropdowns, and date range pickers.',
          status: 'todo',
          priority: 'medium',
          assigneeId: createdMembers[0]._id,
          creatorId: createdMembers[2]._id,
          startDate: inDays(1),
          dueDate: inDays(6),
          tags: ['Components', 'Forms'],
        },
      ];

      for (let i = 0; i < p2Tasks.length; i++) {
        await Task.create({
          workspaceId: workspace._id,
          projectId: null,
          ...p2Tasks[i],
          order: p1Tasks.length + i,
        });
      }

      // 6. Create Initial Notifications for targetUser
      await Notification.create({
        userId: targetUser._id,
        workspaceId: workspace._id,
        type: 'task_assigned',
        title: 'New Task Assignment',
        message: 'Sarah Chen assigned you to "Implement Interactive Kanban Board with Drag & Drop"',
        link: '/kanban',
        isRead: false,
      });

      await Notification.create({
        userId: targetUser._id,
        workspaceId: workspace._id,
        type: 'deadline_approaching',
        title: 'Deadline Approaching',
        message: 'Task "Design Executive Analytics & Burnup Charts" is due in 3 days.',
        link: '/kanban',
        isRead: false,
      });

      await Notification.create({
        userId: targetUser._id,
        workspaceId: workspace._id,
        type: 'system',
        title: 'Workspace Initialized',
        message: `Welcome to TaskFlow AI! Workspace "${workspace.name}" has been populated with sample deliverables and agile boards.`,
        link: '/dashboard',
        isRead: true,
      });

      // 7. Create Activity Logs
      await ActivityLog.create({
        workspaceId: workspace._id,
        projectId: null,
        userId: targetUser._id,
        action: 'created_workspace',
        details: { workspaceName: workspace.name },
      });

      await ActivityLog.create({
        workspaceId: workspace._id,
        projectId: null,
        userId: createdMembers[1]._id,
        action: 'completed_task',
        details: { taskTitle: 'Integrate Google Gemini AI Sprint Planning Engine' },
      });

      await ActivityLog.create({
        workspaceId: workspace._id,
        projectId: null,
        userId: createdMembers[0]._id,
        action: 'added_comment',
        details: { taskTitle: 'Implement Interactive Kanban Board with Drag & Drop' },
      });

      return { workspace, projects: [] };
    } catch (error) {
      console.error('[DemoDataService] Error seeding workspace:', error);
      throw error;
    }
  },
};
