import React, { useState } from 'react';
import {
  SimulationOutput,
  AiCircuitReview,
} from '../../types/circuit';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AiOverviewPanelProps {
  circuitName: string;
  simulation: SimulationOutput | null;
  aiReview: AiCircuitReview | null;
  loading: boolean;
  onRequestReview: (customQuery?: string) => void;
  onApplyFix?: (action: AiCircuitReview['suggestedAction']) => void;
  onHighlightComponent?: (id: string) => void;
}

export const AiOverviewPanel: React.FC<AiOverviewPanelProps> = ({
  circuitName,
  simulation,
  aiReview,
  loading,
  onRequestReview,
  onApplyFix,
  onHighlightComponent,
}) => {
  const [userQuery, setUserQuery] = useState('');

  const renderVerdictBadge = (verdict: AiCircuitReview['verdict']) => {
    switch (verdict) {
      case 'SUPPORTS_DESIGN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#111111] bg-[#75f76e] text-[#111111] font-mono-tech text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
            SUPPORTS DESIGN INTENT
          </span>
        );
      case 'POTENTIAL_ISSUE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#111111] bg-[#f7e96e] text-[#111111] font-mono-tech text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
            POTENTIAL CIRCUIT DEFECT
          </span>
        );
      case 'SIMULATION_FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#111111] bg-[#fe5029] text-white font-mono-tech text-[10px] font-bold">
            <XCircle className="w-3 h-3 stroke-[2.5]" />
            SIMULATION FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#111111] bg-[#eeeeee] text-[#111111] font-mono-tech text-[10px] font-bold">
            <HelpCircle className="w-3 h-3" />
            INSUFFICIENT DATA
          </span>
        );
    }
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    onRequestReview(userQuery.trim());
    setUserQuery('');
  };

  return (
    <div className="w-full flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 border-b border-[#111111] bg-white flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono-tech text-[11px] font-bold uppercase tracking-wider text-[#111111]">
          <Sparkles className="w-3.5 h-3.5 text-[#fe5029]" />
          <span>AI_OVERVIEW</span>
        </div>

        <button
          type="button"
          onClick={() => onRequestReview()}
          disabled={loading || !simulation}
          title="Run Fresh AI Review of Current Simulation"
          className="px-2 py-1 bg-white hover:bg-[#111111] hover:text-white text-[#111111] border border-[#111111] font-mono-tech text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-40 shadow-[1px_1px_0px_#111111]"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'ANALYZING...' : 'ANALYZE'}</span>
        </button>
      </div>

      {/* Main Review Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {!simulation ? (
          <div className="p-6 text-center border border-dashed border-[#111111]/30 bg-[#eeeeee]/20">
            <Zap className="w-6 h-6 mx-auto mb-2 text-[#111111]/40" />
            <div className="font-mono-tech text-[11px] font-bold text-[#111111]">
              AWAITING SIMULATION DATA
            </div>
            <p className="text-[10px] text-[#111111]/70 mt-1 max-w-[220px] mx-auto">
              Click [RUN SPICE] in the workbench toolbar to compute nodal voltages and enable AI review.
            </p>
          </div>
        ) : loading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#fe5029] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="font-mono-tech text-[11px] font-bold text-[#111111]">
              COMPUTING HARDWARE ANALYSIS...
            </div>
            <p className="text-[10px] font-mono-tech text-[#111111]/60">
              Examining SPICE matrix solution & netlist...
            </p>
          </div>
        ) : aiReview ? (
          <div className="space-y-3 text-xs">
            {/* Verdict */}
            <div>
              {renderVerdictBadge(aiReview.verdict)}
            </div>

            {/* Overall Summary */}
            <div className="p-2.5 border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
              <div className="font-mono-tech text-[9px] font-bold uppercase text-[#111111]/60 mb-1">
                // EXECUTIVE ASSESSMENT
              </div>
              <p className="text-[11px] text-[#111111] leading-relaxed font-medium">
                {aiReview.overall}
              </p>
            </div>

            {/* What Happened & Why */}
            <div className="space-y-2">
              <div className="p-2.5 border border-[#111111] bg-[#eeeeee]/30">
                <div className="font-mono-tech text-[9px] font-bold uppercase text-[#111111] mb-1">
                  1. WHAT HAPPENED UNDER SIMULATION
                </div>
                <p className="text-[10px] text-[#111111]/80 leading-relaxed font-mono-tech">
                  {aiReview.whatHappened}
                </p>
              </div>

              <div className="p-2.5 border border-[#111111] bg-[#eeeeee]/30">
                <div className="font-mono-tech text-[9px] font-bold uppercase text-[#111111] mb-1">
                  2. WHY (PHYSICS & OHM'S LAW ROOT CAUSE)
                </div>
                <p className="text-[10px] text-[#111111]/80 leading-relaxed">
                  {aiReview.why}
                </p>
              </div>
            </div>

            {/* Concrete Simulation Evidence Metrics */}
            {aiReview.simulationEvidence && aiReview.simulationEvidence.length > 0 && (
              <div className="p-2.5 border border-[#111111] bg-white">
                <div className="font-mono-tech text-[9px] font-bold uppercase text-[#111111] mb-1.5">
                  // CALCULATED EVIDENCE
                </div>
                <div className="space-y-1">
                  {aiReview.simulationEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 border border-[#eeeeee] flex items-center justify-between text-[10px] font-mono-tech"
                    >
                      <span className="text-[#111111]/70">{ev.metric}:</span>
                      <span className="font-bold text-[#fe5029]">{ev.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Fix Action Button */}
            {aiReview.suggestedAction && aiReview.suggestedAction.suggestedValue && (
              <div className="p-3 border border-[#111111] bg-[#f7e96e]/30 shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center gap-1 font-mono-tech text-[9px] font-extrabold uppercase text-[#111111] mb-1">
                  <Zap className="w-3 h-3 text-[#fe5029]" />
                  <span>RECOMMENDED ACTION</span>
                </div>
                <p className="text-[10px] text-[#111111] mb-2">
                  Change <strong>{aiReview.suggestedAction.componentName || 'component'}</strong> from{' '}
                  <code className="bg-white px-1 border border-[#111111]">{aiReview.suggestedAction.currentValue}</code>{' '}
                  to <code className="bg-white px-1 border border-[#111111] font-bold text-[#fe5029]">{aiReview.suggestedAction.suggestedValue}</code>.
                </p>
                {aiReview.suggestedAction.reason && (
                  <p className="text-[9px] text-[#111111]/70 mb-2 italic">
                    {aiReview.suggestedAction.reason}
                  </p>
                )}
                {onApplyFix && (
                  <button
                    type="button"
                    onClick={() => onApplyFix(aiReview.suggestedAction)}
                    className="w-full py-1.5 bg-[#111111] hover:bg-[#fe5029] text-white border border-[#111111] font-mono-tech text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 transition-colors shadow-[1px_1px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <span>APPLY MODIFICATION & RE-SIMULATE</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* What to check checklist */}
            {aiReview.whatToCheck && aiReview.whatToCheck.length > 0 && (
              <div className="p-2.5 border border-[#111111] bg-white">
                <div className="font-mono-tech text-[9px] font-bold uppercase text-[#111111] mb-1.5">
                  // PHYSICAL BENCH CHECKLIST
                </div>
                <ul className="space-y-1 text-[10px]">
                  {aiReview.whatToCheck.map((chk, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-mono-tech font-bold text-[#fe5029]">[{idx + 1}]</span>
                      <span className="text-[#111111]/80">{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#fe5029]" />
            <div className="font-mono-tech text-[11px] font-bold text-[#111111]">
              SIMULATION READY FOR REVIEW
            </div>
            <p className="text-[10px] text-[#111111]/70 mt-1 mb-3">
              SPICE solved {Object.keys(simulation.dc?.nodeVoltages || {}).length} nodes. Ask AI Overview to evaluate safety, component ratings, or design intent.
            </p>
            <button
              type="button"
              onClick={() => onRequestReview()}
              className="px-3 py-1.5 bg-[#fe5029] text-white border border-[#111111] font-mono-tech text-[10px] font-bold uppercase shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] transition-all"
            >
              GENERATE AI REVIEW
            </button>
          </div>
        )}
      </div>

      {/* Interactive Query Input */}
      <form onSubmit={handleAsk} className="p-2 border-t border-[#111111] bg-white flex gap-1.5">
        <input
          type="text"
          placeholder="ASK ABOUT THIS CIRCUIT..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          disabled={loading || !simulation}
          className="flex-1 px-2.5 py-1.5 text-[11px] font-mono-tech border border-[#111111] bg-white text-[#111111] placeholder-[#111111]/40 focus:outline-none focus:ring-1 focus:ring-[#fe5029] disabled:bg-[#eeeeee]/50"
        />
        <button
          type="submit"
          disabled={loading || !simulation || !userQuery.trim()}
          title="Submit question to AI Overview"
          className="p-1.5 bg-[#111111] hover:bg-[#fe5029] disabled:opacity-40 text-white border border-[#111111] transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
