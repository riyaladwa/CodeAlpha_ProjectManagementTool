import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { TaskComment } from '../models/TaskComment.js';
import { Notification } from '../models/Notification.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { demoDataService } from '../services/demoDataService.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await TaskComment.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Creating demo user...');
    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'alex@taskflow.dev',
      password: 'Password123!',
      title: 'Principal Product Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    console.log('Seeding demo workspace, projects, and Kanban tasks...');
    await demoDataService.seedDemoWorkspace(demoUser);

    console.log('✅ Database seeded successfully!');
    console.log(`Demo Credentials:`);
    console.log(`Email: alex@taskflow.dev`);
    console.log(`Password: Password123!`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
