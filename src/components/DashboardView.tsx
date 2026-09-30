import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Sparkles,
  Flame,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Coffee,
  Check,
  Compass,
} from 'lucide-react';
import { TaskItem, DailyBriefing, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { playCompletionSound } from '../utils/audio';

interface DashboardViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onOpenQuickTask: () => void;
  onNavigateToTab: (tab: any) => void;
  language: AppLanguage;
  userName: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onToggleTask,
  onOpenQuickTask,
  onNavigateToTab,
  language,
  userName,
}) => {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter(
    (task) =>
      task.dueDate === todayStr ||
      (!task.dueDate && task.priority === 'urgent') ||
      task.priority === 'urgent'
  );

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const urgentCount = tasks.filter((t) => !t.completed && t.priority === 'urgent').length;
  const totalEstimatedMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((acc, curr) => acc + (curr.estimatedMinutes || 25), 0);

  const handleTaskCheck = (id: string, wasCompleted: boolean) => {
    if (!wasCompleted) {
      playCompletionSound();
    }
    onToggleTask(id);
  };

  const handleGenerateBriefing = async () => {
    if (tasks.length === 0) return;
    setIsBriefingLoading(true);
    try {
      const res = await fetch('/api/ai/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, userName }),
      });
      if (res.ok) {
        const data: DailyBriefing = await res.json();
        setBriefing(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is your daily action dashboard. Turn messy tasks into executed results.
          </p>
        </div>

        <button
          onClick={onOpenQuickTask}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Tell Taskora What To Do</span>
        </button>
      </div>

      {/* Quantitative Rigor Stats & Progress Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Progress */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{t.progress}</span>
            <span className="font-mono tabular-nums text-slate-900 font-bold">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
            {completedTasksCount} of {totalTasksCount} tasks completed
          </div>
        </div>

        {/* Metric 2: Urgent Focus */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Critical Focus</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {urgentCount}
          </div>
          <div className="text-[11px] text-slate-400">High priority action items</div>
        </div>

        {/* Metric 3: Work Estimate */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Workload Estimate</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {Math.floor(totalEstimatedMinutes / 60)}h {totalEstimatedMinutes % 60}m
          </div>
          <div className="text-[11px] text-slate-400">Planned focus duration</div>
        </div>

        {/* Metric 4: Streak */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Consistency Streak</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">5 Days</div>
          <div className="text-[11px] text-emerald-600 font-medium">+14% faster task close rate</div>
        </div>
      </div>

      {/* AI Daily Briefing Box */}
      <div className="p-5 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 border border-indigo-100 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Daily Briefing</h3>
              <p className="text-xs text-slate-500">
                Taskora synthesizes your priorities into a balanced execution sequence.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateBriefing}
            disabled={isBriefingLoading || tasks.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50/80 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            {isBriefingLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span>Analyzing Day...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>{briefing ? 'Refresh Briefing' : 'Generate Morning Briefing'}</span>
              </>
            )}
          </button>
        </div>

        {briefing ? (
          <div className="space-y-3 pt-2 border-t border-indigo-100/60 animate-in fade-in duration-300">
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {briefing.greeting}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {briefing.suggestedOrder?.map((step, idx) => (
                <div key={idx} className="p-3 bg-white border border-indigo-100/80 rounded-xl space-y-1">
                  <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {step.phase}
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{step.reason}</p>
                </div>
              ))}
            </div>

            {briefing.motivationalTip && (
              <div className="flex items-center gap-2 text-xs text-indigo-800 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                <Coffee className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="italic">&ldquo;{briefing.motivationalTip}&rdquo;</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Tap generate to have Taskora calculate your optimal work order.</span>
            <span className="font-mono text-[11px] text-indigo-600">Takes ~1.5s</span>
          </div>
        )}
      </div>

      {/* Main Focus: Today's High Priority Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-sans">{t.todaysFocus}</h2>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ({todayTasks.length})
            </span>
          </div>

          <button
            onClick={() => onNavigateToTab('tasks')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">You are all caught up for today!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No pending urgent tasks. Add a quick task or use the AI Goal Planner to schedule your next milestone.
            </p>
            <button
              onClick={onOpenQuickTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.quickTask}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors ${
                  task.completed ? 'bg-slate-50/50 opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleTaskCheck(task.id, task.completed)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500'
                            : task.priority === 'important'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <h4
                        className={`text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 pl-4 mt-0.5">
                      <span className="capitalize">{task.category}</span>
                      {task.dueTime && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{task.dueTime}</span>
                        </>
                      )}
                      {task.estimatedMinutes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{task.estimatedMinutes}m</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 capitalize shrink-0 font-medium">
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Navigation Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => onNavigateToTab('planner')}
          className="p-5 text-left bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl shadow-xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
            Multi-Day AI Goal Planner
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Break down 20-day exams, monthly product launches, or habit goals into phased schedules with 1-click import.
          </p>
        </button>

        <button
          onClick={() => onNavigateToTab('scanner')}
          className="p-5 text-left bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl shadow-xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
            Document &amp; Email Scanner
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Paste messy assignment instructions, client briefs, or long notices. AI extracts deadlines and actionable checklists.
          </p>
        </button>
      </div>
    </div>
  );
};
