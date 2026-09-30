import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  X,
  Check,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { TaskItem, Priority, Category, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: TaskItem[]) => void;
  language: AppLanguage;
  creditsRemaining: number;
  isPro: boolean;
  onConsumeCredit: () => boolean;
}

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTasks,
  language,
  creditsRemaining,
  isPro,
  onConsumeCredit,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTasks, setParsedTasks] = useState<TaskItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Web Speech Recognition support
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isRecording && SpeechRecognitionClass) {
      try {
        recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'ur' ? 'ur-PK' : language === 'ar' ? 'ar-SA' : 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch {
        setIsRecording(false);
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isRecording, language]);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!inputText.trim()) return;

    if (!onConsumeCredit()) {
      setErrorMsg('Monthly AI credit limit reached on Free plan. Upgrade to Pro for unlimited AI!');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const today = new Date();
      const userDateContext = {
        today: today.toISOString().split('T')[0],
        dayOfWeek: today.toLocaleDateString(language, { weekday: 'long' }),
      };

      const res = await fetch('/api/ai/parse-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText, userDateContext }),
      });

      if (!res.ok) {
        throw new Error('Failed to parse input');
      }

      const data = await res.json();
      if (data.tasks && Array.isArray(data.tasks)) {
        const formatted: TaskItem[] = data.tasks.map((item: any, idx: number) => ({
          id: item.id || `task-${Date.now()}-${idx}`,
          title: item.title || 'Untitled Task',
          description: item.description || '',
          dueDate: item.dueDate || null,
          dueTime: item.dueTime || null,
          priority: (item.priority || 'normal') as Priority,
          category: (item.category || 'personal') as Category,
          estimatedMinutes: item.estimatedMinutes || 30,
          subtasks: Array.isArray(item.subtasks)
            ? item.subtasks.map((st: string, sIdx: number) => ({
                id: `sub-${idx}-${sIdx}`,
                title: st,
                completed: false,
              }))
            : [],
          reminder: item.reminder || null,
          completed: false,
          createdAt: new Date().toISOString(),
        }));
        setParsedTasks(formatted);
      } else {
        throw new Error('No structured tasks returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Unable to parse with AI. Try typing directly or reviewing connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (parsedTasks.length > 0) {
      onAddTasks(parsedTasks);
      setParsedTasks([]);
      setInputText('');
      onClose();
    }
  };

  const handleRemoveParsedTask = (id: string) => {
    setParsedTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTaskPriority = (id: string, newPriority: Priority) => {
    setParsedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: newPriority } : t))
    );
  };

  const samplePrompts = [
    'I have to submit my university assignment on Friday, pay my electricity bill before the 10th, call my brother tomorrow at 5 PM, and study Chapter 5.',
    'Finish quarterly financial summary by Thursday, book dental checkup for next week, buy groceries tonight at 7 PM.',
    'Prepare pitch deck presentation by Wednesday 2 PM, review pull request on GitHub, renew passport before month end.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 font-sans">
                Tell Taskora What To Do
              </h2>
              <p className="text-xs text-slate-500">
                Type or speak in everyday language. AI automatically sets deadlines, priorities, and steps.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Natural language input area */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.tellItPlaceholder}
              rows={4}
              className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-rose-100 text-rose-600 animate-pulse'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={isRecording ? 'Stop Voice Recording' : 'Dictate with Voice'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleParse}
                disabled={isLoading || !inputText.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Organizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse Tasks</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Quick Test Prompts:</span>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(prompt)}
                  className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 border border-slate-200/80 rounded-lg p-2 transition-colors cursor-pointer truncate"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedTasks.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Detected Tasks ({parsedTasks.length})
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  Review &amp; customize before saving
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {parsedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
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
                        <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                      </div>

                      {/* Clean unboxed metadata with separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-4">
                        <span className="capitalize">{task.category}</span>
                        {task.dueDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                          </>
                        )}
                        {task.dueTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 font-mono tabular-nums">
                              <Clock className="w-3 h-3" />
                              {task.dueTime}
                            </span>
                          </>
                        )}
                        {task.estimatedMinutes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{task.estimatedMinutes}m</span>
                          </>
                        )}
                      </div>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="pl-4 pt-1 space-y-0.5">
                          {task.subtasks.map((st) => (
                            <div
                              key={st.id}
                              className="text-[11px] text-slate-600 flex items-center gap-1.5"
                            >
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{st.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Priority Selector & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          handleUpdateTaskPriority(task.id, e.target.value as Priority)
                        }
                        className="text-[11px] border border-slate-200 rounded-md bg-white px-2 py-1 text-slate-700 focus:outline-none"
                      >
                        <option value="urgent">🔴 Urgent</option>
                        <option value="important">🟠 Important</option>
                        <option value="normal">🟢 Normal</option>
                        <option value="later">⚪ Later</option>
                      </select>
                      <button
                        onClick={() => handleRemoveParsedTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {isPro ? (
              <span className="text-emerald-600 font-medium">Pro Plan · Unlimited AI</span>
            ) : (
              <span>
                Free Plan: <strong className="font-mono tabular-nums">{creditsRemaining}</strong>{' '}
                credits left
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAdd}
              disabled={parsedTasks.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Add {parsedTasks.length} Tasks to My Board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
