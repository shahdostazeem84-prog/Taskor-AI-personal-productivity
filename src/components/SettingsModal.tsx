import React from 'react';
import {
  X,
  Globe,
  Bell,
  Volume2,
  Trash2,
  RotateCcw,
  User,
  Shield,
  Check,
} from 'lucide-react';
import { AppLanguage } from '../types';
import avatarImg from '../assets/images/avatar_user_1790759291853.jpg';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  userName: string;
  setUserName: (name: string) => void;
  onResetSampleData: () => void;
  isPro: boolean;
  onOpenPricing: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  userName,
  setUserName,
  onResetSampleData,
  isPro,
  onOpenPricing,
}) => {
  if (!isOpen) return null;

  const languages: { code: AppLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'es', label: 'Spanish', native: 'Español' },
    { code: 'fr', label: 'French', native: 'Français' },
    { code: 'de', label: 'German', native: 'Deutsch' },
    { code: 'ur', label: 'Urdu', native: 'اردو' },
    { code: 'ar', label: 'Arabic', native: 'العربية' },
    { code: 'zh', label: 'Chinese', native: '简体中文' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 font-sans">Settings &amp; Preferences</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Profile Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <img
              src={avatarImg}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200"
            />
            <div className="space-y-1 flex-1">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-indigo-500"
                placeholder="Your Name"
              />
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className={isPro ? 'text-emerald-600 font-semibold' : ''}>
                  {isPro ? 'Pro Member' : 'Free Tier'}
                </span>
                {!isPro && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPricing();
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Display Language</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`p-2.5 text-left text-xs rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    language === l.code
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-sans">{l.native}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{l.label}</div>
                  </div>
                  {language === l.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-700">Sample State</span>
            <p className="text-[11px] text-slate-500">
              Restore default tasks to test different priority workflows and AI planners.
            </p>
            <button
              onClick={() => {
                onResetSampleData();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Tasks</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
