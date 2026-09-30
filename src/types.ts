export type Priority = 'urgent' | 'important' | 'normal' | 'later';

export type Category = 'work' | 'study' | 'personal' | 'finance' | 'health' | 'errand';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  priority: Priority;
  category: Category;
  estimatedMinutes?: number;
  subtasks?: SubTask[];
  reminder?: string | null;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
}

export interface PlanPhaseTask {
  title: string;
  priority: Priority;
  category: Category;
  estimatedMinutes: number;
  subtasks: string[];
}

export interface PlanPhase {
  phaseNumber: number;
  title: string;
  description: string;
  estimatedDays: string;
  tasks: PlanPhaseTask[];
}

export interface GoalPlan {
  planTitle: string;
  summary: string;
  totalDuration: string;
  keyMilestones: string[];
  phases: PlanPhase[];
}

export interface DocumentAnalysisResult {
  summary: string;
  mainDeadlines: { item: string; date: string; priority: Priority }[];
  actionChecklist: {
    title: string;
    priority: Priority;
    category: Category;
    context: string;
  }[];
  risksOrNotes: string[];
}

export interface DailyBriefing {
  greeting: string;
  topFocusTasks: string[];
  suggestedOrder: {
    phase: string;
    recommendedTaskId: string;
    reason: string;
  }[];
  motivationalTip: string;
}

export type AppTab = 'dashboard' | 'tasks' | 'planner' | 'scanner' | 'pricing';

export type AppLanguage = 'en' | 'es' | 'fr' | 'de' | 'ur' | 'ar' | 'zh';
