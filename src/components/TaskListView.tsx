import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Search,
  Filter,
  Download,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { TaskItem, Priority, Category, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { exportTasksToICS, exportTasksToCSV } from '../utils/calendar';
import { playCompletionSound } from '../utils/audio';

interface TaskListViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddTaskManual: (task: TaskItem) => void;
  onOpenQuickTask: () => void;
  language: AppLanguage;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onToggleSubtask,
  onAddTaskManual,
  onOpenQuickTask,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'urgent' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual task form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualDueDate, setManualDueDate] = useState('');
  const [manualDueTime, setManualDueTime] = useState('');
  const [manualPriority, setManualPriority] = useState<Priority>('normal');
  const [manualCategory, setManualCategory] = useState<Category>('personal');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTaskCheck = (id: string, wasCompleted: boolean) => {
    if (!wasCompleted) {
      playCompletionSound();
    }
    onToggleTask(id);
  };

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    if (statusFilter === 'today') {
      if (task.dueDate !== todayStr) return false;
    } else if (statusFilter === 'urgent') {
      if (task.priority !== 'urgent') return false;
    } else if (statusFilter === 'completed') {
      if (!task.completed) return false;
    } else if (statusFilter === 'all') {
      // Show pending first in all view
    }

    if (categoryFilter !== 'all') {
      if (task.category !== categoryFilter) return false;
    }

    return true;
  });

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newTask: TaskItem = {
      id: `manual-task-${Date.now()}`,
      title: manualTitle.trim(),
      dueDate: manualDueDate || null,
      dueTime: manualDueTime || null,
      priority: manualPriority,
      category: manualCategory,
      estimatedMinutes: 30,
      subtasks: [],
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onAddTaskManual(newTask);
    setManualTitle('');
    setManualDueDate('');
    setManualDueTime('');
    setIsManualModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Editorial Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            My Tasks &amp; Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized actions, priorities, and subtasks. Export directly to your calendar anytime.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportTasksToICS(tasks)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Download iCal file for Google Calendar, Apple Calendar, or Outlook"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Calendar (.ics)</span>
          </button>
          <button
            onClick={() => exportTasksToCSV(tasks)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="Export spreadsheet CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
          <button
            onClick={onOpenQuickTask}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.quickTask}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs - functional buttons per Section 1A */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'today', label: 'Due Today' },
              { id: 'urgent', label: '🔴 Urgent' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Category:</span>
          {['all', 'work', 'study', 'finance', 'health', 'errand', 'personal'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 text-xs rounded-md capitalize transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800">No matching tasks</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery ? 'Try changing your search terms or filters.' : t.noTasks}
              </p>
            </div>
            <button
              onClick={onOpenQuickTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.quickTask}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isExpanded = expandedTaskIds.has(task.id);
              const hasSubtasks = task.subtasks && task.subtasks.length > 0;
              const completedSubtasksCount = (task.subtasks || []).filter((s) => s.completed).length;

              return (
                <div
                  key={task.id}
                  className={`p-4 transition-colors hover:bg-slate-50/70 ${
                    task.completed ? 'bg-slate-50/40 opacity-75' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Checkbox + Title */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleTaskCheck(task.id, task.completed)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
                        title={task.completed ? 'Mark pending' : 'Mark completed'}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              task.priority === 'urgent'
                                ? 'bg-rose-500'
                                : task.priority === 'important'
                                ? 'bg-amber-500'
                                : task.priority === 'normal'
                                ? 'bg-emerald-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <h3
                            className={`text-sm font-semibold truncate ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 pl-4">
                            {task.description}
                          </p>
                        )}

                        {/* Metadata row adhering to Section 1A Zero-Pill rule */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-4">
                          <span className="capitalize">{task.category}</span>
                          {task.dueDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 font-mono tabular-nums">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {task.dueDate === todayStr ? 'Today' : task.dueDate}
                              </span>
                            </>
                          )}
                          {task.dueTime && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 font-mono tabular-nums">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {task.dueTime}
                              </span>
                            </>
                          )}
                          {task.estimatedMinutes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {task.estimatedMinutes}m
                              </span>
                            </>
                          )}
                          {hasSubtasks && (
                            <>
                              <span aria-hidden="true">·</span>
                              <button
                                onClick={() => handleToggleExpand(task.id)}
                                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-0.5"
                              >
                                <span>
                                  {completedSubtasksCount}/{task.subtasks?.length} subtasks
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 capitalize hidden sm:inline">
                        {task.priority}
                      </span>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Subtasks Checklist */}
                  {isExpanded && hasSubtasks && (
                    <div className="mt-3 pl-8 space-y-1.5 border-t border-slate-100 pt-2.5">
                      {task.subtasks?.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => onToggleSubtask(task.id, sub.id)}
                          className="flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer group"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                              sub.completed
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 group-hover:border-indigo-400'
                            }`}
                          >
                            {sub.completed && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Task Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Task Manually</h3>
            <form onSubmit={handleCreateManual} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Call dentist to reschedule"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={manualDueDate}
                    onChange={(e) => setManualDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={manualDueTime}
                    onChange={(e) => setManualDueTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as Priority)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="important">🟠 Important</option>
                    <option value="normal">🟢 Normal</option>
                    <option value="later">⚪ Later</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as Category)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800 capitalize"
                  >
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="personal">Personal</option>
                    <option value="finance">Finance</option>
                    <option value="health">Health</option>
                    <option value="errand">Errand</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
