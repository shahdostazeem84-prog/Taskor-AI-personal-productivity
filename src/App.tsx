/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { AiPlannerView } from './components/AiPlannerView';
import { DocScannerView } from './components/DocScannerView';
import { PricingModal } from './components/PricingModal';
import { QuickTaskModal } from './components/QuickTaskModal';
import { SettingsModal } from './components/SettingsModal';
import { TaskItem, AppTab, AppLanguage } from './types';

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'initial-1',
    title: 'Submit university assignment',
    description: 'Finalize references and upload to student portal before Friday deadline.',
    dueDate: '2026-10-02',
    dueTime: '11:59 PM',
    priority: 'urgent',
    category: 'study',
    estimatedMinutes: 90,
    subtasks: [
      { id: 'sub-1-1', title: 'Proofread section 3 & 4', completed: true },
      { id: 'sub-1-2', title: 'Export PDF and check formatting', completed: false },
    ],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'initial-2',
    title: 'Pay electricity utility bill',
    description: 'Settle monthly invoice #8892 online before Oct 10 to avoid late fee.',
    dueDate: '2026-10-10',
    dueTime: '05:00 PM',
    priority: 'urgent',
    category: 'finance',
    estimatedMinutes: 15,
    subtasks: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'initial-3',
    title: 'Call brother about weekend plans',
    description: 'Check if he wants to meet on Saturday for lunch.',
    dueDate: '2026-10-01',
    dueTime: '05:00 PM',
    priority: 'important',
    category: 'personal',
    estimatedMinutes: 20,
    subtasks: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'initial-4',
    title: 'Study Chapter 5: System Architecture',
    description: 'Read core textbook concepts on microservices and distributed caching.',
    dueDate: null,
    dueTime: null,
    priority: 'normal',
    category: 'study',
    estimatedMinutes: 60,
    subtasks: [
      { id: 'sub-4-1', title: 'Review lecture slides', completed: true },
      { id: 'sub-4-2', title: 'Summarize key bullet takeaways', completed: true },
    ],
    completed: true,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
  {
    id: 'initial-5',
    title: 'Buy groceries & weekly pantry essentials',
    description: 'Milk, oats, bananas, eggs, and ground coffee.',
    dueDate: '2026-10-01',
    dueTime: '06:30 PM',
    priority: 'normal',
    category: 'errand',
    estimatedMinutes: 35,
    subtasks: [],
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [userName, setUserName] = useState<string>('Alex');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(10);
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('taskora_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync tasks to local storage
  useEffect(() => {
    try {
      localStorage.setItem('taskora_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const handleConsumeCredit = (): boolean => {
    if (isPro) return true;
    if (creditsRemaining <= 0) return false;
    setCreditsRemaining((prev) => prev - 1);
    return true;
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtasks) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      })
    );
  };

  const handleAddTasks = (newTasks: TaskItem[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
  };

  const handleResetSampleData = () => {
    setTasks(INITIAL_TASKS);
    setCreditsRemaining(10);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header adhering strictly to Top Bar Contract */}
      <TopBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        onOpenQuickTask={() => setIsQuickTaskOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isPro={isPro}
        creditsRemaining={creditsRemaining}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
        {currentTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenQuickTask={() => setIsQuickTaskOpen(true)}
            onNavigateToTab={setCurrentTab}
            language={language}
            userName={userName}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskListView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onAddTaskManual={(task) => setTasks((prev) => [task, ...prev])}
            onOpenQuickTask={() => setIsQuickTaskOpen(true)}
            language={language}
          />
        )}

        {currentTab === 'planner' && (
          <AiPlannerView
            language={language}
            onAddPlanTasks={handleAddTasks}
            onConsumeCredit={handleConsumeCredit}
            isPro={isPro}
            creditsRemaining={creditsRemaining}
            onOpenPricing={() => setCurrentTab('pricing')}
          />
        )}

        {currentTab === 'scanner' && (
          <DocScannerView
            language={language}
            onAddDocTasks={handleAddTasks}
            onConsumeCredit={handleConsumeCredit}
            isPro={isPro}
            onOpenPricing={() => setCurrentTab('pricing')}
          />
        )}

        {currentTab === 'pricing' && (
          <PricingModal
            isPro={isPro}
            onUpgradeToPro={() => {
              setIsPro(true);
              setCreditsRemaining(9999);
            }}
            onDowngradeToFree={() => {
              setIsPro(false);
              setCreditsRemaining(10);
            }}
            creditsRemaining={creditsRemaining}
            language={language}
          />
        )}
      </main>

      {/* 3. Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Taskora</span>
            <span>·</span>
            <span>Tell it. Plan it. Do it.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-side data encryption</span>
            <span>·</span>
            <button
              onClick={() => setCurrentTab('pricing')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Subscription &amp; Monetization
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        onAddTasks={handleAddTasks}
        language={language}
        creditsRemaining={creditsRemaining}
        isPro={isPro}
        onConsumeCredit={handleConsumeCredit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        userName={userName}
        setUserName={setUserName}
        onResetSampleData={handleResetSampleData}
        isPro={isPro}
        onOpenPricing={() => setCurrentTab('pricing')}
      />
    </div>
  );
}
