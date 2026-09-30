import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Upload,
  ArrowRight,
  Check,
} from 'lucide-react';
import { DocumentAnalysisResult, TaskItem, Priority, Category, AppLanguage } from '../types';

interface DocScannerViewProps {
  language: AppLanguage;
  onAddDocTasks: (tasks: TaskItem[]) => void;
  onConsumeCredit: () => boolean;
  isPro: boolean;
  onOpenPricing: () => void;
}

export const DocScannerView: React.FC<DocScannerViewProps> = ({
  language,
  onAddDocTasks,
  onConsumeCredit,
  isPro,
  onOpenPricing,
}) => {
  const [docTitle, setDocTitle] = useState('');
  const [docText, setDocText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [isImported, setIsImported] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleDocs = [
    {
      title: 'University Term Paper Rubric',
      text: `Course: CS301 Software Architecture
Final Assignment: Microservices Distributed System Case Study
Deadlines:
- Topic Proposal submission: Friday Oct 14 at 11:59 PM (5% penalty for late submission)
- Code repository commit and draft test report: Oct 28
- Final Report (15 pages, IEEE format) + Video Demo: Nov 10

Key Instructions:
1. Must include architecture diagram with UML standard
2. Run benchmark load test with minimum 500 req/sec
3. Cite at least 6 peer-reviewed academic papers
4. Plagiarism score strictly below 10% on Turnitin`,
    },
    {
      title: 'Client Service Agreement Email',
      text: `Hi Alex,
Following our contract call, here are our kickoff requirements for the Q4 revamp:
1. Please send the signed Non-Disclosure Agreement (NDA) by Tuesday 5:00 PM.
2. Schedule a 45-minute technical stakeholder alignment meeting before Thursday.
3. Share the Figma design token exports and repository access with our lead developer Sarah.
4. Prepare first sprint milestone deliverables for review on November 1st.
Payment invoice #1042 will be released upon NDA countersignature.`,
    },
    {
      title: 'Apartment Lease Renewal & Utilities',
      text: `Resident Notice:
Your lease for Unit 4B expires on November 30.
Action items required:
- Submit formal renewal intention or notice to vacate by October 15.
- Update renter's insurance policy declaration page for next year's term.
- Annual safety inspection is scheduled for Wednesday Oct 12 between 10 AM and 2 PM. Ensure access to smoke detectors.
- Settle outstanding water & trash utility balance ($84.20) before the 10th.`,
    },
  ];

  const handleAnalyze = async () => {
    if (!docText.trim()) return;

    if (!onConsumeCredit()) {
      setErrorMsg('AI credit limit reached on Free plan. Upgrade to Pro for unlimited document scanning!');
      onOpenPricing();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setIsImported(false);

    try {
      const res = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTitle: docTitle || 'Document Note',
          documentText: docText,
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data: DocumentAnalysisResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to analyze document. Please check text and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportChecklist = () => {
    if (!result) return;

    const newTasks: TaskItem[] = result.actionChecklist.map((item, idx) => ({
      id: `doc-task-${Date.now()}-${idx}`,
      title: item.title,
      description: item.context || `Extracted from: ${docTitle || 'Uploaded document'}`,
      dueDate: result.mainDeadlines[0]?.date || null,
      dueTime: null,
      priority: item.priority || 'normal',
      category: item.category || 'work',
      estimatedMinutes: 40,
      subtasks: [],
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    onAddDocTasks(newTasks);
    setIsImported(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Document &amp; Text to Tasks
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Paste syllabus guidelines, client emails, project briefs, or complex notices.
          Taskora AI extracts critical deadlines, instructions, and an actionable checklist instantly.
        </p>
      </div>

      {/* Input container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="doc-title-input" className="block text-xs font-semibold text-slate-700">Document Label (Optional)</label>
          <input
            id="doc-title-input"
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="e.g. CS301 Term Paper Rubric, or Client Kickoff Email"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="doc-text-input" className="block text-xs font-semibold text-slate-700">
            Paste Document, Email, or Instructions
          </label>
          <textarea
            id="doc-text-input"
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            rows={7}
            placeholder="Paste text here..."
            className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Quick preset samples */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Sample templates:</span>
            {sampleDocs.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDocTitle(sample.title);
                  setDocText(sample.text);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                {sample.title}
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !docText.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting Action Items...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract Tasks &amp; Checklist</span>
              </>
            )}
          </button>
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

      {/* Analysis Results */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                Document Synthesis
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-sans mt-0.5">
                {docTitle || 'Extracted Action Plan'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">{result.summary}</p>
            </div>

            <div className="shrink-0">
              {isImported ? (
                <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Check className="w-4 h-4" />
                  <span>Checklist Added to Board</span>
                </div>
              ) : (
                <button
                  onClick={handleImportChecklist}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Checklist to Tasks</span>
                </button>
              )}
            </div>
          </div>

          {/* Deadlines Section */}
          {result.mainDeadlines && result.mainDeadlines.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Key Dates &amp; Deadlines
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.mainDeadlines.map((dl, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dl.date}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{dl.item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Items List */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Extracted Action Checklist ({result.actionChecklist.length})
            </span>
            <div className="space-y-2">
              {result.actionChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.priority === 'urgent'
                            ? 'bg-rose-500'
                            : item.priority === 'important'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-4">{item.context}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
                    <span className="capitalize">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize font-medium text-slate-700">{item.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings & Risks */}
          {result.risksOrNotes && result.risksOrNotes.length > 0 && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Important Rules &amp; Submission Notes</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-900/80 space-y-1">
                {result.risksOrNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
