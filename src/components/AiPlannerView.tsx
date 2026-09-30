import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  PlusCircle,
  Layers,
  ArrowRight,
  BookOpen,
  Briefcase,
  Dumbbell,
  Rocket,
  Check,
} from 'lucide-react';
import { GoalPlan, TaskItem, Priority, Category, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface AiPlannerViewProps {
  language: AppLanguage;
  onAddPlanTasks: (tasks: TaskItem[]) => void;
  onConsumeCredit: () => boolean;
  isPro: boolean;
  creditsRemaining: number;
  onOpenPricing: () => void;
}

export const AiPlannerView: React.FC<AiPlannerViewProps> = ({
  language,
  onAddPlanTasks,
  onConsumeCredit,
  isPro,
  creditsRemaining,
  onOpenPricing,
}) => {
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('14 days');
  const [dailyHours, setDailyHours] = useState('2 hours');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GoalPlan | null>(null);
  const [isImported, setIsImported] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const sampleGoals = [
    {
      title: 'Pass Final Exams',
      desc: 'Prepare for university exams in 20 days across 8 chapters with revisions.',
      icon: BookOpen,
      timeframe: '20 days',
      hours: '3 hours',
    },
    {
      title: 'Launch Online Business',
      desc: 'Build and launch an e-commerce store with first product lineup in 30 days.',
      icon: Rocket,
      timeframe: '30 days',
      hours: '2 hours',
    },
    {
      title: 'Quarterly Team Deliverable',
      desc: 'Deliver client project milestone, sprint backlog, testing, and sign-off.',
      icon: Briefcase,
      timeframe: '14 days',
      hours: '4 hours',
    },
    {
      title: 'Fitness Milestone',
      desc: 'Train for 5K run and build consistent morning exercise habits in 4 weeks.',
      icon: Dumbbell,
      timeframe: '28 days',
      hours: '1 hour',
    },
  ];

  const handleGeneratePlan = async () => {
    if (!goal.trim()) return;

    if (!onConsumeCredit()) {
      setErrorMsg('AI credit limit reached on Free plan. Upgrade to Pro for unlimited planning!');
      onOpenPricing();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsImported(false);

    try {
      const res = await fetch('/api/ai/plan-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          timeframe,
          dailyAvailableHours: dailyHours,
        }),
      });

      if (!res.ok) throw new Error('Planning request failed');
      const data: GoalPlan = await res.json();
      setGeneratedPlan(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to generate plan right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportAllTasks = () => {
    if (!generatedPlan) return;

    const newTasks: TaskItem[] = [];
    const today = new Date();

    let dayOffset = 1;
    generatedPlan.phases.forEach((phase) => {
      phase.tasks.forEach((tItem, tIdx) => {
        const taskDate = new Date(today);
        taskDate.setDate(today.getDate() + dayOffset);

        newTasks.push({
          id: `plan-task-${Date.now()}-${tIdx}-${Math.random().toString(36).substring(2, 6)}`,
          title: tItem.title,
          description: `Part of: ${generatedPlan.planTitle} · ${phase.title}`,
          dueDate: taskDate.toISOString().split('T')[0],
          dueTime: '10:00 AM',
          priority: tItem.priority || 'important',
          category: tItem.category || 'study',
          estimatedMinutes: tItem.estimatedMinutes || 45,
          subtasks: (tItem.subtasks || []).map((sub, sIdx) => ({
            id: `plan-sub-${sIdx}`,
            title: sub,
            completed: false,
          })),
          completed: false,
          createdAt: new Date().toISOString(),
        });
      });
      dayOffset += 3;
    });

    onAddPlanTasks(newTasks);
    setIsImported(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Editorial Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
          AI Goal &amp; Task Planner
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Tell Taskora your big target. Whether it&apos;s preparing for exams, launching a product,
          or managing a complex project, AI maps out actionable phases, daily tasks, and deadlines.
        </p>
      </div>

      {/* Goal Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="space-y-2">
          <label htmlFor="goal-input" className="block text-sm font-semibold text-slate-900">
            What do you want to accomplish?
          </label>
          <textarea
            id="goal-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            placeholder="e.g. I need to prepare for my university finals in 20 days. I have 8 chapters to study and need to finish mock tests before exam week..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Configuration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Target Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="7 days">7 Days (Sprint)</option>
              <option value="14 days">14 Days (Standard)</option>
              <option value="20 days">20 Days (Exam prep)</option>
              <option value="30 days">30 Days (Full month)</option>
              <option value="60 days">60 Days (Quarterly)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Daily Focus Time
            </label>
            <select
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="1 hour">1 hour / day</option>
              <option value="2 hours">2 hours / day</option>
              <option value="3 hours">3 hours / day</option>
              <option value="4+ hours">4+ hours / day (Intensive)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGeneratePlan}
              disabled={isLoading || !goal.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Action Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Goal Inspirations */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-xs font-medium text-slate-500">Popular Plan Blueprints:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {sampleGoals.map((sample, idx) => {
              const Icon = sample.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setGoal(sample.desc);
                    setTimeframe(sample.timeframe);
                    setDailyHours(sample.hours);
                  }}
                  className="p-3 text-left bg-slate-50/70 hover:bg-indigo-50/60 border border-slate-200/80 rounded-xl transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                      {sample.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {sample.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          {!isPro && (
            <button
              onClick={onOpenPricing}
              className="text-xs font-semibold text-rose-800 underline ml-2"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      )}

      {/* Generated Plan Output */}
      {generatedPlan && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-8 animate-in fade-in duration-300">
          {/* Plan Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Generated Roadmap · {generatedPlan.totalDuration}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                {generatedPlan.planTitle}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {generatedPlan.summary}
              </p>
            </div>

            <div className="shrink-0">
              {isImported ? (
                <div className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span>Imported to My Tasks</span>
                </div>
              ) : (
                <button
                  onClick={handleImportAllTasks}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Plan to My Tasks</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Milestones */}
          {generatedPlan.keyMilestones && generatedPlan.keyMilestones.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Key Benchmarks &amp; Milestones
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {generatedPlan.keyMilestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-mono">
                        0{idx + 1}
                      </span>
                      <span>Benchmark</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{ms}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phases and Action Tasks */}
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Phased Execution Steps
            </span>

            <div className="space-y-4">
              {generatedPlan.phases.map((phase) => (
                <div
                  key={phase.phaseNumber}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                >
                  {/* Phase Bar */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                        {phase.phaseNumber}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{phase.title}</h3>
                        <p className="text-xs text-slate-500">{phase.description}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums shrink-0">
                      {phase.estimatedDays}
                    </div>
                  </div>

                  {/* Tasks inside this phase */}
                  <div className="p-4 space-y-2.5">
                    {phase.tasks.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 bg-white border border-slate-100 hover:border-slate-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-1 flex-1">
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
                            <h4 className="text-xs font-semibold text-slate-900">{task.title}</h4>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 pl-4">
                            <span className="capitalize">{task.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {task.estimatedMinutes} mins
                            </span>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{task.subtasks.length} subtasks</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 capitalize shrink-0 font-medium">
                          {task.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
