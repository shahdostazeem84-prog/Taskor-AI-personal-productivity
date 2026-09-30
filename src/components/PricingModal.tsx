import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  Sparkles,
  Zap,
  CreditCard,
  Lock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  X,
} from 'lucide-react';
import { AppLanguage } from '../types';

interface PricingModalProps {
  isPro: boolean;
  onUpgradeToPro: () => void;
  onDowngradeToFree: () => void;
  creditsRemaining: number;
  language: AppLanguage;
  onClose?: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isPro,
  onUpgradeToPro,
  onDowngradeToFree,
  creditsRemaining,
  language,
  onClose,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [targetSubscribers, setTargetSubscribers] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Form states
  const [cardName, setCardName] = useState('Alex Morgan');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  const monthlyPrice = billingCycle === 'annual' ? 3.25 : 4.99;
  const projectedMRR = targetSubscribers * 4.99;
  const projectedARR = projectedMRR * 12;

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
      onUpgradeToPro();
      setTimeout(() => {
        setShowCheckoutModal(false);
        setCheckoutSuccess(false);
      }, 1400);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Title & Slogan */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Taskora Business &amp; Monetization Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
          Simple Plans for High Achievers Worldwide
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Start free with core planning, or upgrade to Pro for unlimited AI breakdown, document scanning, and seamless calendar synchronization.
        </p>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 mt-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual (Save 35%)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              BEST VALUE
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div
          className={`p-6 sm:p-8 bg-white border rounded-2xl shadow-xs space-y-6 flex flex-col justify-between ${
            !isPro ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200'
          }`}
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Starter Tier
              </span>
              <h2 className="text-xl font-bold text-slate-900">Taskora Free</h2>
              <p className="text-xs text-slate-500">
                For students and individuals organizing everyday to-do lists.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                $0
              </span>
              <span className="text-xs text-slate-500">/ forever free</span>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>10 AI Natural Language requests per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited manual task creation &amp; subtasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Daily dashboard with progress tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic priority levels &amp; categories</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Export to iCalendar (.ics) and CSV</span>
              </div>
            </div>
          </div>

          <div>
            {!isPro ? (
              <div className="w-full py-2.5 px-4 text-xs font-semibold text-center text-slate-700 bg-slate-100 rounded-xl">
                Current Active Plan ({creditsRemaining} credits left)
              </div>
            ) : (
              <button
                onClick={onDowngradeToFree}
                className="w-full py-2.5 px-4 text-xs font-semibold text-center text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Switch to Free Plan
              </button>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div
          className={`p-6 sm:p-8 bg-white border-2 rounded-2xl shadow-md space-y-6 flex flex-col justify-between relative overflow-hidden ${
            isPro ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-indigo-600'
          }`}
        >
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Pro Productivity
              </span>
              <h2 className="text-xl font-bold text-slate-900">Taskora Pro</h2>
              <p className="text-xs text-slate-500">
                For professionals, researchers, exam takers, and entrepreneurs.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                ${monthlyPrice.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">
                / month {billingCycle === 'annual' ? '(billed annually at $39)' : ''}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-medium text-indigo-950">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Unlimited AI Natural Language Task Breakdown</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-indigo-950">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Full AI Multi-Day &amp; Phased Goal Planner</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Document, syllabus &amp; email checklist extractor</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Voice input dictation in multiple languages</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>AI Daily Morning Briefing generator</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Priority processing with sub-second response</span>
              </div>
            </div>
          </div>

          <div>
            {isPro ? (
              <div className="w-full py-2.5 px-4 text-xs font-semibold text-center text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pro Member Active</span>
              </div>
            ) : (
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="w-full py-3 px-4 text-xs font-bold text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Upgrade to Taskora Pro</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Creator Revenue & Business Model Blueprint */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 max-w-4xl mx-auto shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>Owner &amp; Creator Business Engine</span>
            </div>
            <h2 className="text-xl font-bold font-sans">
              How Taskora Generates Income for You
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              As the business owner, you earn predictable Monthly Recurring Revenue (MRR) through micro-subscriptions from users around the world who want automatic organization.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400">Subscription price</span>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
              $4.99 / mo
            </div>
          </div>
        </div>

        {/* Revenue Projection Calculator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">
              Simulate Paying Subscribers:
            </span>
            <span className="font-mono tabular-nums text-indigo-300 font-bold text-sm">
              {targetSubscribers.toLocaleString()} Users
            </span>
          </div>

          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={targetSubscribers}
            onChange={(e) => setTargetSubscribers(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Projected Monthly Revenue (MRR)</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">
                ${projectedMRR.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                <span className="text-xs text-slate-400 font-normal"> / mo</span>
              </div>
              <p className="text-[11px] text-slate-400">Recurring revenue deposited each month</p>
            </div>

            <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Projected Annual Revenue (ARR)</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
                ${projectedARR.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                <span className="text-xs text-slate-400 font-normal"> / yr</span>
              </div>
              <p className="text-[11px] text-slate-400">Full annual business earnings</p>
            </div>
          </div>
        </div>

        {/* Mechanism to Outcome Chain (Section 2C in references/3_saas_dashboard.md) */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Mechanism to Outcome Chain
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
              <strong className="text-white block">1. User Problem</strong>
              <p className="text-slate-400 text-[11px]">
                People everywhere feel overwhelmed with messy messages, bills, and deadlines.
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
              <strong className="text-indigo-400 block">2. Taskora Mechanism</strong>
              <p className="text-slate-400 text-[11px]">
                AI turns natural sentences or voice notes into clear, timed actions without manual form-filling.
              </p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg space-y-1">
              <strong className="text-emerald-400 block">3. Monetized Value</strong>
              <p className="text-slate-400 text-[11px]">
                Saves users 5–10 hours each week. Paying $4.99/mo is an effortless ROI decision for them.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Upgrade to Taskora Pro
                </h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Welcome to Taskora Pro!</h4>
                <p className="text-xs text-slate-500">
                  Your account has been upgraded. Unlimited AI planning and task tools are now active.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="p-6 space-y-4">
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">Taskora Pro ({billingCycle})</span>
                    <p className="text-[11px] text-slate-500">Cancel anytime with 1 click</p>
                  </div>
                  <div className="font-bold text-slate-900 font-mono text-sm">
                    ${billingCycle === 'annual' ? '39.00 / yr' : '4.99 / mo'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expires
                      </label>
                      <input
                        type="text"
                        defaultValue="12 / 28"
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="password"
                        defaultValue="888"
                        maxLength={4}
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Securing Subscription...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Activate Pro</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-center text-slate-400">
                  Encrypted 256-bit payment simulation for Taskora MVP demonstration.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
