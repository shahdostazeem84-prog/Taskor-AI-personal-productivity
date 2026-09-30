import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI if key is present
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Prompt for Taskora AI
const TASKORA_SYSTEM_INSTRUCTION = `You are Taskora AI, an intelligent personal productivity assistant.
Taskora helps users turn natural-language requests into organized actions.

Your responsibilities are:
1. Understand what the user wants to accomplish.
2. Identify tasks and subtasks accurately.
3. Detect dates, deadlines, and times when provided or implied.
4. Suggest reasonable priorities: 'urgent' (🔴 critical/today), 'important' (🟠 high priority), 'normal' (🟢 standard), or 'later' (⚪ backlog).
5. Categorize each task: 'work', 'study', 'personal', 'finance', 'health', or 'errand'.
6. Break large goals into clear, actionable steps.
7. Return only strict, valid JSON with no markdown wrapping or backticks when requested.
8. Never invent false dates, deadlines, or facts.
9. Keep task titles concise, punchy, and action-oriented.`;

// Endpoint 1: Parse natural language or voice notes into structured tasks
app.post('/api/ai/parse-tasks', async (req: Request, res: Response) => {
  try {
    const { input, userDateContext } = req.body;
    if (!input || typeof input !== 'string') {
      res.status(400).json({ error: 'Input text is required' });
      return;
    }

    const todayStr = userDateContext?.today || new Date().toISOString().split('T')[0];
    const dayOfWeek = userDateContext?.dayOfWeek || 'Today';

    if (ai) {
      const prompt = `Current context: Today is ${dayOfWeek}, date is ${todayStr}.
User text to organize:
"""
${input}
"""

Extract and organize all tasks into a JSON array of objects.
Each object must have:
- "id": string (unique random uuid like "t-1")
- "title": string (clean, concise action title)
- "description": string (details, context, notes)
- "dueDate": string (YYYY-MM-DD format if date mentioned/implied, else null)
- "dueTime": string (e.g. "17:00", "09:30" if mentioned, else null)
- "priority": "urgent" | "important" | "normal" | "later"
- "category": "work" | "study" | "personal" | "finance" | "health" | "errand"
- "estimatedMinutes": number (estimated minutes to complete, e.g. 15, 30, 60)
- "subtasks": array of strings (breakdown items if any, e.g. ["Find receipt", "Submit form"])
- "reminder": string (e.g. "Remind 1 hour before", or null)

Return ONLY valid JSON in format:
{
  "tasks": [...]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: TASKORA_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        res.json(parsed);
        return;
      } catch (parseErr) {
        // Clean markdown backticks if any slipped through
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
        return;
      }
    }

    // Smart heuristic fallback if API key is not yet set
    const fallbackTasks = fallbackParseTasks(input, todayStr);
    res.json({ tasks: fallbackTasks });
  } catch (error: any) {
    console.error('Error in /api/ai/parse-tasks:', error);
    // Provide safe fallback so user experiences 0 downtime
    const fallbackTasks = fallbackParseTasks(req.body?.input || '', new Date().toISOString().split('T')[0]);
    res.json({ tasks: fallbackTasks, note: 'Processed with local task parser' });
  }
});

// Endpoint 2: Generate multi-day or phased action plan
app.post('/api/ai/plan-goal', async (req: Request, res: Response) => {
  try {
    const { goal, timeframe, dailyAvailableHours } = req.body;
    if (!goal || typeof goal !== 'string') {
      res.status(400).json({ error: 'Goal description is required' });
      return;
    }

    if (ai) {
      const prompt = `Create an intelligent, realistic, step-by-step action plan for this user goal:
Goal: "${goal}"
Timeframe: "${timeframe || 'flexible'}"
Daily available time: "${dailyAvailableHours || '2 hours'}"

Break this down into logical phases or days. Return ONLY valid JSON with this structure:
{
  "planTitle": string,
  "summary": string,
  "totalDuration": string,
  "keyMilestones": string[],
  "phases": [
    {
      "phaseNumber": number,
      "title": string,
      "description": string,
      "estimatedDays": string,
      "tasks": [
        {
          "title": string,
          "priority": "urgent" | "important" | "normal" | "later",
          "category": "work" | "study" | "personal" | "finance" | "health" | "errand",
          "estimatedMinutes": number,
          "subtasks": string[]
        }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: TASKORA_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
      return;
    }

    // Heuristic fallback plan
    res.json(fallbackGeneratePlan(goal, timeframe));
  } catch (error: any) {
    console.error('Error in /api/ai/plan-goal:', error);
    res.json(fallbackGeneratePlan(req.body?.goal || '', req.body?.timeframe || '14 days'));
  }
});

// Endpoint 3: Analyze long text/document (syllabus, email, project brief) into checklist
app.post('/api/ai/analyze-document', async (req: Request, res: Response) => {
  try {
    const { documentText, documentTitle } = req.body;
    if (!documentText) {
      res.status(400).json({ error: 'Document text is required' });
      return;
    }

    if (ai) {
      const prompt = `Analyze this document/note/email titled "${documentTitle || 'Document'}":
"""
${documentText.slice(0, 15000)}
"""

Extract structured action items, deadlines, obligations, and guidelines. Return ONLY valid JSON:
{
  "summary": string,
  "mainDeadlines": [
    { "item": string, "date": string, "priority": "urgent" | "important" | "normal" }
  ],
  "actionChecklist": [
    {
      "title": string,
      "priority": "urgent" | "important" | "normal" | "later",
      "category": "work" | "study" | "personal" | "finance" | "errand",
      "context": string
    }
  ],
  "risksOrNotes": string[]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: TASKORA_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
      return;
    }

    res.json({
      summary: 'Extracted key action items from document.',
      mainDeadlines: [{ item: 'Review key submission requirements', date: 'Next Friday', priority: 'important' }],
      actionChecklist: [
        { title: 'Read guidelines in full', priority: 'important', category: 'study', context: 'Initial review' },
        { title: 'Prepare draft submission', priority: 'normal', category: 'work', context: 'Core deliverables' },
      ],
      risksOrNotes: ['Double check formatting and citation rules before submission.'],
    });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-document:', error);
    res.status(500).json({ error: 'Failed to analyze document' });
  }
});

// Endpoint 4: Daily Briefing / Smart Priorities
app.post('/api/ai/daily-briefing', async (req: Request, res: Response) => {
  try {
    const { tasks, userName } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      res.status(400).json({ error: 'Tasks array required' });
      return;
    }

    if (ai && tasks.length > 0) {
      const prompt = `Here are the user's current tasks (${tasks.length} total):
${JSON.stringify(tasks.slice(0, 20), null, 2)}

Provide an encouraging, executive-grade Daily Briefing for ${userName || 'Alex'}. Return ONLY valid JSON:
{
  "greeting": string,
  "topFocusTasks": string[],
  "suggestedOrder": [
    { "phase": "Morning Focus" | "Afternoon Momentum" | "Wrap Up", "recommendedTaskId": string, "reason": string }
  ],
  "motivationalTip": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: TASKORA_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
      return;
    }

    res.json({
      greeting: `Good day! You have ${tasks.length} active tasks lined up.`,
      topFocusTasks: tasks.filter(t => t.priority === 'urgent' || t.priority === 'important').map(t => t.title).slice(0, 3),
      suggestedOrder: [
        { phase: 'Morning Focus', recommendedTaskId: tasks[0]?.id || '1', reason: 'Tackle high cognitive load items first.' },
      ],
      motivationalTip: 'Break big items into 20-minute focus sprints for steady momentum.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Daily briefing generation failed' });
  }
});

// Fallback logic when AI key is unavailable or off-line
function fallbackParseTasks(input: string, todayStr: string) {
  const sentences = input
    .split(/[,;\n]|\band\b/i)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  return sentences.map((phrase, idx) => {
    const lower = phrase.toLowerCase();
    let priority: 'urgent' | 'important' | 'normal' | 'later' = 'normal';
    let category: 'work' | 'study' | 'personal' | 'finance' | 'health' | 'errand' = 'personal';

    if (lower.includes('urgent') || lower.includes('bill') || lower.includes('exam') || lower.includes('asap') || lower.includes('today')) {
      priority = 'urgent';
    } else if (lower.includes('assignment') || lower.includes('submit') || lower.includes('tomorrow') || lower.includes('meeting')) {
      priority = 'important';
    } else if (lower.includes('someday') || lower.includes('maybe') || lower.includes('later')) {
      priority = 'later';
    }

    if (lower.includes('exam') || lower.includes('study') || lower.includes('chapter') || lower.includes('assignment') || lower.includes('homework')) {
      category = 'study';
    } else if (lower.includes('bill') || lower.includes('pay') || lower.includes('bank') || lower.includes('tax') || lower.includes('money')) {
      category = 'finance';
    } else if (lower.includes('work') || lower.includes('client') || lower.includes('meeting') || lower.includes('report') || lower.includes('email')) {
      category = 'work';
    } else if (lower.includes('doctor') || lower.includes('workout') || lower.includes('gym') || lower.includes('medicine')) {
      category = 'health';
    } else if (lower.includes('buy') || lower.includes('groceries') || lower.includes('shopping') || lower.includes('call') || lower.includes('clean')) {
      category = 'errand';
    }

    let dueDate = null;
    if (lower.includes('today')) {
      dueDate = todayStr;
    } else if (lower.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    } else if (lower.includes('friday')) {
      dueDate = 'Upcoming Friday';
    }

    let dueTime = null;
    const timeMatch = phrase.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    if (timeMatch) {
      dueTime = timeMatch[1].toUpperCase();
    }

    const cleanTitle = phrase.replace(/^(i need to|i have to|need to|remind me to|please)\s+/i, '').trim();

    return {
      id: `task-${Date.now()}-${idx}`,
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      description: `Extracted from: "${phrase}"`,
      dueDate,
      dueTime,
      priority,
      category,
      estimatedMinutes: 30,
      subtasks: [],
      reminder: dueTime ? `Alert at ${dueTime}` : null,
    };
  });
}

function fallbackGeneratePlan(goal: string, timeframe: string) {
  return {
    planTitle: `Structured Plan: ${goal}`,
    summary: `A progressive roadmap mapped to ${timeframe} with focused execution blocks.`,
    totalDuration: timeframe || '14 Days',
    keyMilestones: [
      'Foundational preparation and resource gathering',
      'Intensive execution and milestone benchmarks',
      'Comprehensive review, refinement, and final verification',
    ],
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Setup & Foundations',
        description: 'Organize materials and establish baseline checkpoints.',
        estimatedDays: 'Days 1-3',
        tasks: [
          {
            title: `Map out requirements for ${goal}`,
            priority: 'urgent',
            category: 'study',
            estimatedMinutes: 45,
            subtasks: ['Gather reference materials', 'Identify critical deadlines'],
          },
          {
            title: 'Complete initial module or Chapter 1 review',
            priority: 'important',
            category: 'study',
            estimatedMinutes: 60,
            subtasks: ['Take bullet notes', 'Highlight unfamiliar terms'],
          },
        ],
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Deep Core Execution',
        description: 'Tackle the heaviest components systematically.',
        estimatedDays: 'Days 4-10',
        tasks: [
          {
            title: 'Mid-point progress assessment and practice drills',
            priority: 'important',
            category: 'study',
            estimatedMinutes: 90,
            subtasks: ['Complete mock exercise', 'Review mistakes'],
          },
          {
            title: 'Consolidate core project deliverables',
            priority: 'normal',
            category: 'work',
            estimatedMinutes: 60,
            subtasks: ['Synthesize findings', 'Check formatting'],
          },
        ],
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Final Polish & Mock Run',
        description: 'Simulate final test/submission conditions and eliminate gaps.',
        estimatedDays: 'Final Days',
        tasks: [
          {
            title: 'Final comprehensive mock review',
            priority: 'urgent',
            category: 'study',
            estimatedMinutes: 75,
            subtasks: ['Timed run-through', 'Sleep well and recharge'],
          },
        ],
      },
    ],
  };
}

// Serve Vite in development or static dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Taskora server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
