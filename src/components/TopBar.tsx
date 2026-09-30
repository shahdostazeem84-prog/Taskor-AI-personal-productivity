import React from 'react';
import { Sparkles, Globe, Settings, ShieldCheck, CheckSquare2 } from 'lucide-react';
import { AppTab, AppLanguage } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import avatarImg from '../assets/images/avatar_user_1790759291853.jpg';

interface TopBarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  onOpenQuickTask: () => void;
  onOpenSettings: () => void;
  isPro: boolean;
  creditsRemaining: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onOpenQuickTask,
  onOpenSettings,
  isPro,
  creditsRemaining,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const navItems: { id: AppTab; label: string }[] = [
    { id: 'dashboard', label: t.dashboard },
    { id: 'tasks', label: t.tasks },
    { id: 'planner', label: t.planner },
    { id: 'scanner', label: t.scanner },
    { id: 'pricing', label: t.pricing },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            setCurrentTab('dashboard');
          }}
          className="flex items-center gap-2 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <CheckSquare2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
            Taskora
          </span>
        </a>
        <span className="hidden xl:inline text-xs text-slate-400 font-normal">
          {t.slogan}
        </span>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`relative py-1 text-sm font-medium transition-colors hover:text-slate-900 cursor-pointer ${
                isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        {/* Credits or Pro status */}
        <button
          onClick={() => setCurrentTab('pricing')}
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          title="View plan and usage"
        >
          {isPro ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pro Plan
            </span>
          ) : (
            <span className="font-mono tabular-nums text-slate-500">
              {creditsRemaining} credits left
            </span>
          )}
        </button>

        {/* Language selector */}
        <div className="relative group">
          <button
            className="flex items-center gap-1 p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs uppercase font-mono">{language}</span>
          </button>
          <div className="absolute right-0 mt-1 hidden group-hover:block group-focus-within:block bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 w-36 z-50">
            {[
              { code: 'en', label: 'English' },
              { code: 'es', label: 'Español' },
              { code: 'fr', label: 'Français' },
              { code: 'de', label: 'Deutsch' },
              { code: 'ur', label: 'اردو' },
              { code: 'ar', label: 'العربية' },
              { code: 'zh', label: '中文' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as AppLanguage)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                  language === lang.code
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{lang.label}</span>
                <span className="text-[10px] uppercase text-slate-400 font-mono">
                  {lang.code}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Task primary button */}
        <button
          onClick={onOpenQuickTask}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.quickTask}</span>
        </button>

        {/* User profile & settings toggle */}
        <button
          onClick={onOpenSettings}
          className="relative flex items-center rounded-full p-0.5 ring-1 ring-slate-200 hover:ring-indigo-400 transition-all focus:outline-none"
          title="Profile & Settings"
        >
          <img
            src={avatarImg}
            alt="User Profile"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover"
            onError={(e) => {
              // fallback if image ever fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span className="sr-only">Open Settings</span>
        </button>
      </div>
    </header>
  );
};
