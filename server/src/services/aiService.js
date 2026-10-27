import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

let genAI = null;
if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  } catch (err) {
    console.warn('[AI Service] Failed to initialize GoogleGenerativeAI:', err.message);
  }
}

/**
 * Clean and parse JSON from AI response string
 */
function extractJSON(text) {
  try {
    // Check for markdown code blocks ```json ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    return JSON.parse(text);
  } catch (err) {
    // If straightforward parse fails, attempt regex extraction for arrays or objects
    const objMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objMatch && objMatch[1]) {
      return JSON.parse(objMatch[1]);
    }
    throw new Error('Failed to parse AI output into structured JSON');
  }
}

export const aiService = {
  /**
   * Feature A: Generate a full structured project plan
   */
  async generateProjectPlan({ projectName, goal, description, targetDeadline }) {
    const fallbackPlan = {
      summary: `Automated plan for "${projectName}". Goal: ${goal || 'Deliver project on schedule with high quality'}.`,
      estimatedDurationDays: 30,
      milestones: [
        {
          name: 'Phase 1: Discovery & Architecture',
          description: 'Establish technical requirements, user stories, and foundational design systems.',
          tasks: [
            {
              title: 'Draft Product Requirements Document (PRD)',
              description: 'Define core user flows, technical constraints, and release criteria.',
              priority: 'high',
              estimatedHours: 12,
              tags: ['Planning', 'Documentation'],
              suggestedDueDayOffset: 4,
            },
            {
              title: 'Design System & UI Component Specs',
              description: 'Create responsive UI tokens, accessible color palettes, and key wireframes.',
              priority: 'medium',
              estimatedHours: 16,
              tags: ['Design', 'UI/UX'],
              suggestedDueDayOffset: 7,
            },
            {
              title: 'Database Schema & API Contract Design',
              description: 'Model relational collections, indexes, and OpenAPI route signatures.',
              priority: 'high',
              estimatedHours: 14,
              tags: ['Backend', 'Database'],
              suggestedDueDayOffset: 8,
            },
          ],
        },
        {
          name: 'Phase 2: Core Engineering & Integrations',
          description: 'Build primary business logic, authentication, and service endpoints.',
          tasks: [
            {
              title: 'Implement Core Data Models & CRUD Endpoints',
              description: 'Develop validated REST controllers, access control middleware, and database repositories.',
              priority: 'high',
              estimatedHours: 20,
              tags: ['Backend', 'API'],
              suggestedDueDayOffset: 15,
            },
            {
              title: 'Build Interactive Dashboard & Workspace Views',
              description: 'Assemble real-time task boards, responsive tables, and analytics widgets.',
              priority: 'medium',
              estimatedHours: 24,
              tags: ['Frontend', 'Components'],
              suggestedDueDayOffset: 20,
            },
            {
              title: 'Implement Third-Party Integrations & Real-time Sync',
              description: 'Connect notification queues, AI copilot endpoints, and file exports.',
              priority: 'medium',
              estimatedHours: 18,
              tags: ['Integration', 'AI'],
              suggestedDueDayOffset: 24,
            },
          ],
        },
        {
          name: 'Phase 3: QA, Security & Deployment',
          description: 'End-to-end verification, load testing, performance optimizations, and production launch.',
          tasks: [
            {
              title: 'Automated Test Suite & Regression Testing',
              description: 'Execute integration tests, route boundary checks, and accessibility audits.',
              priority: 'high',
              estimatedHours: 12,
              tags: ['QA', 'Testing'],
              suggestedDueDayOffset: 27,
            },
            {
              title: 'Production Infrastructure Setup & Launch',
              description: 'Configure environment variables, SSL certificates, monitoring, and deploy to cloud.',
              priority: 'urgent',
              estimatedHours: 8,
              tags: ['DevOps', 'Deployment'],
              suggestedDueDayOffset: 30,
            },
          ],
        },
      ],
    };

    if (!genAI) {
      return { ...fallbackPlan, isSimulated: true };
    }

    try {
      const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
      const prompt = `You are a Principal Software Project Manager & AI Architect.
Create a structured project breakdown and task execution plan for the following project:
- Project Name: "${projectName}"
- Primary Goal: "${goal || 'N/A'}"
- Description: "${description || 'N/A'}"
- Target Deadline: "${targetDeadline || 'Within 4 weeks'}"

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "summary": "Executive summary string",
  "estimatedDurationDays": 30,
  "milestones": [
    {
      "name": "Phase 1: Title",
      "description": "Short description",
      "tasks": [
        {
          "title": "Actionable task title",
          "description": "Clear step-by-step description with acceptance requirements",
          "priority": "low" | "medium" | "high" | "urgent",
          "estimatedHours": 10,
          "tags": ["Tag1", "Tag2"],
          "suggestedDueDayOffset": 5
        }
      ]
    }
  ]
}
Do not include markdown outside the json or preamble.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = extractJSON(responseText);
      return { ...parsed, isSimulated: false };
    } catch (err) {
      console.warn('[AI Service] Gemini plan generation failed, falling back to smart engine:', err.message);
      return { ...fallbackPlan, isSimulated: true, notice: 'Generated via built-in intelligent planner template.' };
    }
  },

  /**
   * Feature B: Break down a complex task into bite-sized actionable subtasks
   */
  async breakDownTask({ title, description, projectName }) {
    const fallback = {
      suggestedPriority: 'high',
      suggestedHours: 8,
      subtasks: [
        { title: `Analyze technical requirements and edge cases for "${title}"`, completed: false },
        { title: 'Create initial prototype or data schema structure', completed: false },
        { title: 'Implement primary feature logic and error handling', completed: false },
        { title: 'Write automated unit tests and perform code review', completed: false },
        { title: 'Verify responsive UI/UX and cross-browser consistency', completed: false },
      ],
      recommendations: 'Break this feature into incremental commits to maintain high team velocity.',
    };

    if (!genAI) {
      return { ...fallback, isSimulated: true };
    }

    try {
      const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
      const prompt = `You are a Senior Tech Lead. Break down this task into 4-6 specific, actionable, testable subtasks:
Task Title: "${title}"
Task Description: "${description || 'None'}"
Project Context: "${projectName || 'Standard Software Project'}"

Respond ONLY with valid JSON in this exact structure:
{
  "suggestedPriority": "low" | "medium" | "high" | "urgent",
  "suggestedHours": 6,
  "subtasks": [
    { "title": "Specific action item string", "completed": false }
  ],
  "recommendations": "Concise technical guidance"
}`;

      const result = await model.generateContent(prompt);
      const parsed = extractJSON(result.response.text());
      return { ...parsed, isSimulated: false };
    } catch (err) {
      console.warn('[AI Service] Gemini task breakdown fallback:', err.message);
      return { ...fallback, isSimulated: true };
    }
  },

  /**
   * Feature C: Project Progress Summary & Risk Assessment
   */
  async summarizeProject({ project, tasks }) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const inReview = tasks.filter((t) => t.status === 'in_review').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const now = new Date();
    const overdue = tasks.filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const fallback = {
      projectHealth: overdue > 2 ? 'At Risk' : completionRate > 60 ? 'On Track' : 'Needs Attention',
      calculatedStats: {
        totalTasks: total,
        completed,
        inProgress,
        inReview,
        todo,
        overdue,
        completionRate: `${completionRate}%`,
      },
      executiveSummary: `The project "${project.name}" is currently at ${completionRate}% completion with ${completed} of ${total} tasks finished. There are ${overdue} overdue task(s) requiring immediate developer triage.`,
      keyRisks: overdue > 0 ? [`${overdue} deadline(s) missed or approaching without review.`] : ['No critical blocker identified.'],
      actionableRecommendations: [
        'Prioritize high-priority items currently in progress.',
        'Review and unblock tasks sitting in the In Review column.',
        'Conduct a weekly sprint check-in to realign upcoming milestone deliverables.',
      ],
    };

    if (!genAI) {
      return { ...fallback, isSimulated: true };
    }

    try {
      const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
      const prompt = `Analyze this project's real state and provide an executive progress summary and risk report:
Project: "${project.name}" (Status: ${project.status}, Priority: ${project.priority}, Deadline: ${project.deadline || 'None'})
Metrics: Total Tasks: ${total}, Completed: ${completed}, In Progress: ${inProgress}, In Review: ${inReview}, Todo: ${todo}, Overdue: ${overdue}, Completion Rate: ${completionRate}%.
Sample Task Titles: ${tasks.slice(0, 10).map((t) => `[${t.status}] ${t.title}`).join(', ')}

Return ONLY a JSON object:
{
  "projectHealth": "On Track" | "Needs Attention" | "At Risk",
  "executiveSummary": "2-3 sentences summarising progress",
  "keyRisks": ["Risk 1", "Risk 2"],
  "actionableRecommendations": ["Action 1", "Action 2", "Action 3"]
}`;

      const result = await model.generateContent(prompt);
      const parsed = extractJSON(result.response.text());
      return {
        projectHealth: parsed.projectHealth || fallback.projectHealth,
        calculatedStats: fallback.calculatedStats,
        executiveSummary: parsed.executiveSummary || fallback.executiveSummary,
        keyRisks: parsed.keyRisks || fallback.keyRisks,
        actionableRecommendations: parsed.actionableRecommendations || fallback.actionableRecommendations,
        isSimulated: false,
      };
    } catch (err) {
      console.warn('[AI Service] Gemini project summary fallback:', err.message);
      return { ...fallback, isSimulated: true };
    }
  },

  /**
   * Feature D: Smart Task Prioritization
   */
  async prioritizeTasks({ tasks, projectName }) {
    const uncompletedTasks = tasks.filter((t) => t.status !== 'completed');

    if (uncompletedTasks.length === 0) {
      return {
        priorityList: [],
        insight: 'All tasks in this project are completed! Great job.',
        isSimulated: true,
      };
    }

    // Default heuristic prioritization
    const sorted = [...uncompletedTasks].sort((a, b) => {
      const pWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
      const weightDiff = (pWeights[b.priority] || 1) - (pWeights[a.priority] || 1);
      if (weightDiff !== 0) return weightDiff;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      return 0;
    });

    const fallback = {
      priorityList: sorted.slice(0, 5).map((t, idx) => ({
        taskId: t._id,
        title: t.title,
        suggestedRank: idx + 1,
        reasoning: `Ranked #${idx + 1} due to ${t.priority} priority ${t.dueDate ? `and deadline on ${new Date(t.dueDate).toLocaleDateString()}` : ''}.`,
      })),
      insight: 'Focus on urgent blockers first, followed by tasks in the In Review and In Progress columns.',
    };

    if (!genAI) {
      return { ...fallback, isSimulated: true };
    }

    try {
      const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
      const prompt = `You are a Smart Project Prioritization Engine.
Analyze the following pending tasks for project "${projectName}":
${uncompletedTasks
  .map(
    (t) =>
      `ID: ${t._id}, Title: "${t.title}", Status: ${t.status}, Priority: ${t.priority}, Due: ${t.dueDate || 'None'}`
  )
  .join('\n')}

Select the top 5 highest impact tasks that the team should focus on today, ranked from 1 to 5 with rationales.
Return ONLY valid JSON:
{
  "priorityList": [
    {
      "taskId": "task id string",
      "title": "task title",
      "suggestedRank": 1,
      "reasoning": "Clear explanation why this is critical right now"
    }
  ],
  "insight": "High-level strategic takeaway for the team"
}`;

      const result = await model.generateContent(prompt);
      const parsed = extractJSON(result.response.text());
      return { ...parsed, isSimulated: false };
    } catch (err) {
      console.warn('[AI Service] Gemini prioritization fallback:', err.message);
      return { ...fallback, isSimulated: true };
    }
  },

  /**
   * Feature E: Improve task descriptions and generate acceptance criteria
   */
  async improveTask({ title, description }) {
    const fallback = {
      improvedTitle: title.trim(),
      improvedDescription: `${description ? description + '\n\n' : ''}### Implementation Details\n- Ensure proper input validation and boundary checks.\n- Maintain consistent error handling and user feedback states.\n- Optimize component rendering and responsiveness across screen sizes.\n\n### Definition of Done / Acceptance Criteria\n- [ ] Code implemented and passing linting\n- [ ] UI tested on mobile, tablet, and desktop\n- [ ] Edge cases verified with positive and negative inputs\n- [ ] Integrated with backend API and verified data persistence`,
      suggestedTags: ['Refactor', 'Feature', 'Frontend'],
      suggestedPriority: 'medium',
    };

    if (!genAI) {
      return { ...fallback, isSimulated: true };
    }

    try {
      const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
      const prompt = `You are a Senior Product Manager and Engineer.
Enhance this raw task description with professional technical clarity, user acceptance criteria, and clear checklist items:
- Raw Title: "${title}"
- Raw Description: "${description || 'None'}"

Return ONLY a JSON object:
{
  "improvedTitle": "Polished concise action-oriented title",
  "improvedDescription": "Well-formatted Markdown description with Context, Implementation Details, and Acceptance Checklist",
  "suggestedTags": ["Tag1", "Tag2"],
  "suggestedPriority": "low" | "medium" | "high" | "urgent"
}`;

      const result = await model.generateContent(prompt);
      const parsed = extractJSON(result.response.text());
      return { ...parsed, isSimulated: false };
    } catch (err) {
      console.warn('[AI Service] Gemini task improve fallback:', err.message);
      return { ...fallback, isSimulated: true };
    }
  },
};
