import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Plus,
  Play,
  Save,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Bug,
  HelpCircle,
  FileText,
  AlertTriangle,
  History,
  Loader2,
  Code,
  Layers,
  ChevronRight
} from 'lucide-react';
import { CodeFile, Project, Circuit } from '../types';
import { api } from '../api';
import { EmptyState } from './EmptyState';

interface AiCodingViewProps {
  codeFiles: CodeFile[];
  projects: Project[];
  circuits: Circuit[];
  initialFileId?: string;
  onOpenCreateFile: (projectId?: string) => void;
  onUpdateFile: (fileId: string, data: Partial<CodeFile> & { commitMessage?: string }) => void;
  onRestoreVersion: (fileId: string, versionId: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export const AiCodingView: React.FC<AiCodingViewProps> = ({
  codeFiles,
  projects,
  circuits,
  initialFileId,
  onOpenCreateFile,
  onUpdateFile,
  onRestoreVersion,
  onDeleteFile,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    initialFileId || (codeFiles.length > 0 ? codeFiles[0].id : null)
  );
  const [codeContent, setCodeContent] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // AI Assistant panel states
  const [aiAction, setAiAction] = useState<
    'explain' | 'fix' | 'improve' | 'review' | 'docs' | 'tests' | 'debug' | 'circuit_mismatch'
  >('explain');
  const [aiErrorInput, setAiErrorInput] = useState('');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const activeFile = codeFiles.find((f) => f.id === selectedFileId) || codeFiles[0] || null;

  useEffect(() => {
    if (activeFile) {
      setCodeContent(activeFile.content);
      setSelectedFileId(activeFile.id);
    } else {
      setCodeContent('');
    }
  }, [activeFile?.id]);

  const handleSave = () => {
    if (!activeFile) return;
    onUpdateFile(activeFile.id, {
      content: codeContent,
      commitMessage: commitMessage.trim() || `Update ${activeFile.name}`,
    });
    setCommitMessage('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRunAi = async () => {
    if (!activeFile) return;
    setAiLoading(true);
    setAiResult(null);

    // Get active project circuit for circuit-mismatch checking
    const projectCircuits = circuits.filter((c) => c.projectId === activeFile.projectId);

    try {
      const res = await api.ai.runCodeAction({
        action: aiAction,
        code: codeContent,
        language: activeFile.language,
        fileName: activeFile.name,
        errorMessage: aiErrorInput || undefined,
        customInstruction: customAiPrompt || undefined,
        projectContext: {
          circuits: projectCircuits,
        },
      });
      setAiResult(res.result);
    } catch (err: any) {
      setAiResult(`Error processing AI action: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            AI Firmware & Code Studio
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Write firmware, inspect pin assignments, verify hardware/code alignment, and debug with Gemini AI.
          </p>
        </div>

        <button
          id="coding-new-file-btn"
          type="button"
          onClick={() => onOpenCreateFile()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Code File</span>
        </button>
      </div>

      {codeFiles.length === 0 ? (
        <EmptyState
          icon={FileCode2}
          title="Ready to build something?"
          description="Create or open a project to start working with firmware code files, version commits, and AI-assisted debugging."
          primaryAction={{
            label: 'New Code File',
            onClick: () => onOpenCreateFile(),
            icon: Plus,
          }}
          accentColor="orange"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* File Explorer sidebar */}
          <div className="bg-white rounded-xl border border-neutral-200 p-3 space-y-2 shadow-2xs">
            <div className="px-2 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Project Code Files ({codeFiles.length})
            </div>
            {codeFiles.map((file) => {
              const isSelected = activeFile?.id === file.id;
              const proj = projects.find((p) => p.id === file.projectId);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    setSelectedFileId(file.id);
                    setShowHistory(false);
                  }}
                  className={`w-full p-2.5 rounded-lg text-left transition-colors flex items-center justify-between border ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'border-transparent hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-mono block truncate">{file.name}</span>
                    <span
                      className={`text-[10px] block truncate ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-400'
                      }`}
                    >
                      {proj ? proj.name : 'Standalone'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm shrink-0 ml-2 ${
                      isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Code Editor & AI Panel */}
          {activeFile && (
            <div className="lg:col-span-3 space-y-4">
              {/* Editor Bar */}
              <div className="bg-white rounded-xl border border-neutral-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs sm:text-sm font-bold text-neutral-900 truncate">
                    {activeFile.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                    {activeFile.language}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-1"
                    title="Version History"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Versions ({activeFile.versions?.length || 1})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-1"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-1"
                    title="Download Code File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Revision</span>
                  </button>
                </div>
              </div>

              {/* Version History Drawer */}
              {showHistory && (
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
                  <div className="font-semibold text-neutral-800">Version History & Commits</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {activeFile.versions?.map((ver, idx) => (
                      <div
                        key={ver.id || idx}
                        className="p-2 bg-white rounded-lg border border-neutral-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium text-neutral-800">{ver.commitMessage}</span>
                          <span className="text-[11px] text-neutral-400 block">
                            {new Date(ver.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRestoreVersion(activeFile.id, ver.id)}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Editor Code Area */}
              <div className="bg-[#1e1e1e] rounded-xl border border-neutral-800 overflow-hidden shadow-lg">
                <div className="flex">
                  {/* Line numbers */}
                  <div className="py-4 px-2 text-right select-none text-neutral-600 font-mono text-xs border-r border-neutral-800 bg-[#181818] min-w-[3rem]">
                    {codeContent.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  {/* Textarea */}
                  <textarea
                    id="code-editor-textarea"
                    rows={18}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    spellCheck={false}
                    className="flex-1 p-4 font-mono text-xs sm:text-sm bg-transparent text-[#d4d4d4] outline-hidden resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Optional Commit Note Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Commit note (e.g. Add debounce to button read, update I2C address)"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-hidden focus:border-[#fe5029]"
                />
              </div>

              {/* Gemini AI Hardware & Code Assistant Panel */}
              <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#fe5029]/10 text-[#fe5029] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">
                        AI Hardware & Firmware Assistant
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Powered by Google Gemini 2.5 • Server-Side Execution
                      </p>
                    </div>
                  </div>

                  <button
                    id="run-ai-action-btn"
                    type="button"
                    onClick={handleRunAi}
                    disabled={aiLoading || !codeContent.trim()}
                    className="px-4 py-2 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run AI Action</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Action Tabs */}
                <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 pb-3">
                  {[
                    { id: 'explain', label: 'Explain Code', icon: HelpCircle },
                    { id: 'circuit_mismatch', label: 'Check Circuit & Pin Mismatch', icon: AlertTriangle },
                    { id: 'fix', label: 'Fix Bugs & Errors', icon: Bug },
                    { id: 'improve', label: 'Optimize Firmware', icon: Sparkles },
                    { id: 'docs', label: 'Generate Comments & Docs', icon: FileText },
                    { id: 'tests', label: 'Generate Unit Tests', icon: Code },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setAiAction(act.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        aiAction === act.id
                          ? 'bg-neutral-900 text-white font-semibold'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <act.icon className="w-3 h-3" />
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>

                {/* Specific context inputs */}
                {aiAction === 'fix' && (
                  <input
                    type="text"
                    placeholder="Paste compiler error message or observed runtime bug..."
                    value={aiErrorInput}
                    onChange={(e) => setAiErrorInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-hidden focus:border-[#fe5029]"
                  />
                )}

                {aiAction === 'circuit_mismatch' && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900">
                    <p className="font-semibold mb-0.5">Hardware Alignment Check:</p>
                    <p className="text-[11px] text-sky-800">
                      Gemini will compare the GPIO pins and peripherals declared in your circuit schematics
                      against the actual pin numbers in your firmware code to prevent wiring bugs.
                    </p>
                  </div>
                )}

                {/* AI Output Box */}
                {aiResult && (
                  <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-400 font-sans">
                      <span className="text-[11px] uppercase font-semibold">Gemini Response</span>
                      <button
                        type="button"
                        onClick={() => setAiResult(null)}
                        className="text-xs hover:text-white"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                      {aiResult}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
