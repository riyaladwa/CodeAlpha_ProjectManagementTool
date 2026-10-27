import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Workspace } from '../src/models/Workspace.js';
import { Project } from '../src/models/Project.js';
import { Task } from '../src/models/Task.js';

let app;

describe('TaskFlow AI Backend API Tests', () => {
  before(async () => {
    await connectDB();
    app = createApp();
  });

  after(async () => {
    await disconnectDB();
  });

  let userToken = '';
  let secondUserToken = '';
  let testWorkspaceId = '';
  let testProjectId = '';
  let testTaskId = '';

  test('1. Health Check endpoint returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
  });

  test('2. User Registration creates account and returns JWT token', async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email,
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, email.toLowerCase());

    userToken = res.body.token;
  });

  test('3. Registering with duplicate email returns 409 conflict', async () => {
    const email = `dup_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Dup User',
      email,
      password: 'Password123!',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Dup User 2',
      email,
      password: 'Password123!',
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  test('4. User Login with valid credentials succeeds', async () => {
    const email = `login_${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Login Tester',
      email,
      password: 'ValidPassword123!',
    });

    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'ValidPassword123!',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
  });

  test('5. User Login with invalid password fails with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'WrongPassword!',
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  test('6. Unauthenticated request to protected route returns 401', async () => {
    const res = await request(app).get('/api/workspaces');
    assert.strictEqual(res.status, 401);
  });

  test('7. Authenticated user can fetch their workspaces', async () => {
    const res = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.workspaces.length > 0);

    testWorkspaceId = res.body.workspaces[0]._id;
  });

  test('8. Create a new project inside the workspace', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-workspace-id', testWorkspaceId)
      .send({
        name: 'Sprint 2026 Core Delivery',
        description: 'Delivering end-to-end task flows and AI pipelines.',
        priority: 'high',
        status: 'active',
        color: '#10b981',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.project.name, 'Sprint 2026 Core Delivery');

    testProjectId = res.body.project._id;
  });

  test('9. Create a task in the project', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-workspace-id', testWorkspaceId)
      .send({
        projectId: testProjectId,
        title: 'Build Vitest and Integration Tests',
        description: 'Write integration test coverage for all primary endpoints.',
        status: 'todo',
        priority: 'high',
        tags: ['Testing', 'QA'],
        subtasks: [{ title: 'Write auth test' }, { title: 'Write project test' }],
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.task.title, 'Build Vitest and Integration Tests');

    testTaskId = res.body.task._id;
  });

  test('10. Update task status (Kanban drag-and-drop)', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${testTaskId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-workspace-id', testWorkspaceId)
      .send({ status: 'in_progress' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.task.status, 'in_progress');
  });

  test('11. Add comment to task', async () => {
    const res = await request(app)
      .post(`/api/tasks/${testTaskId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-workspace-id', testWorkspaceId)
      .send({ content: 'Status changed to in-progress during automated test suite.' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.comment.content, 'Status changed to in-progress during automated test suite.');
  });

  test('12. AI Project Plan generation returns structured milestones & tasks', async () => {
    const res = await request(app)
      .post('/api/ai/generate-project-plan')
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-workspace-id', testWorkspaceId)
      .send({
        projectName: 'Smart CRM Integration',
        goal: 'Automate sales lead routing and notifications',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.plan);
    assert.ok(Array.isArray(res.body.plan.milestones));
  });

  test('13. Analytics overview calculates real-time metrics', async () => {
    const res = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${userToken}`)
      .set('x-workspace-id', testWorkspaceId);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.summary.totalTasks >= 1);
    assert.ok(Array.isArray(res.body.data.statusDistribution));
  });

  test('14. Cross-workspace security: unauthorized user cannot access workspace', async () => {
    // Register second user
    const resReg = await request(app).post('/api/auth/register').send({
      name: 'Intruder User',
      email: `intruder_${Date.now()}@example.com`,
      password: 'Password123!',
    });
    secondUserToken = resReg.body.token;

    // Try accessing testWorkspaceId with secondUserToken
    const resAccess = await request(app)
      .get(`/api/workspaces/${testWorkspaceId}`)
      .set('Authorization', `Bearer ${secondUserToken}`)
      .set('x-workspace-id', testWorkspaceId);

    assert.strictEqual(resAccess.status, 403);
    assert.strictEqual(resAccess.body.success, false);
  });
});
