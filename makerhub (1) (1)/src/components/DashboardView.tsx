import React from 'react';
import {
  FolderKanban,
  Cpu,
  CheckSquare,
  FileCode2,
  Printer,
  FileText,
  Lightbulb,
  Plus,
  ArrowRight,
  Zap,
  Activity,
  Compass,
  Layers,
  Terminal,
} from 'lucide-react';
import { Project, AnalyticsData, InventoryItem } from '../types';
import { NavView } from './Navigation';

interface DashboardViewProps {
  projects: Project[];
  inventory: InventoryItem[];
  analytics: AnalyticsData | null;
  onNavigate: (view: NavView, detailId?: string) => void;
  onOpenCreate: (
    type:
      | 'project'
      | 'task'
      | 'inventory'
      | 'note'
      | 'print'
      | 'circuit'
      | 'code'
      | 'idea'
  ) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  inventory,
  analytics,
  onNavigate,
  onOpenCreate,
}) => {
  const hasProjects = projects.length > 0;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner - Variation 6 Style */}
      <div className="border border-[#111111] bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#111111] relative overflow-hidden circuit-grid">
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#111111] bg-[#75f76e] text-[#111111] font-mono-tech text-[10px] font-bold uppercase mb-4 shadow-[2px_2px_0px_#111111]">
            <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>WORKSHOP STAGE // PRODUCTION</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#111111] tracking-tight mb-3">
            MAKERHUB // DIGITAL WORKSHOP
          </h2>

          <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 leading-relaxed uppercase tracking-wide mb-6 max-w-2xl">
            Unified hardware engineering environment: Circuit Pin Mapping, Real BOM Inventory, Microcontroller Firmware, 3D Manufacturing Jobs, and Project Task Pipelines.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-create-project-btn"
              type="button"
              onClick={() => onOpenCreate('project')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fe5029] text-white border border-[#111111] font-mono-tech text-xs font-bold uppercase shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>INITIALIZE NEW PROJECT</span>
            </button>

            <button
              id="dashboard-explore-circuits-btn"
              type="button"
              onClick={() => onNavigate('circuits')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#111111] border border-[#111111] font-mono-tech text-xs font-bold uppercase shadow-[2px_2px_0px_#111111] hover:bg-[#eeeeee] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Zap className="w-4 h-4 text-[#fe5029]" />
              <span>LAUNCH CIRCUIT MAPPING</span>
            </button>
          </div>
        </div>
      </div>

      {/* Maker Workflow Pipeline - Variation 6 Style */}
      <div className="border border-[#111111] bg-white p-4 shadow-[3px_3px_0px_#111111]">
        <div className="flex items-center justify-between pb-2 border-b border-[#111111] mb-3">
          <h3 className="font-mono-tech text-[10px] font-bold text-[#111111] uppercase tracking-wider">
            // HARDWARE DEVELOPMENT LIFECYCLE
          </h3>
          <span className="font-mono-tech text-[9px] text-[#111111]/60 uppercase hidden sm:inline">
            STEP SEQUENCER PIPELINE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { step: '01. IDEA', desc: 'Concept sparks', badge: 'bg-[#f7e96e]', view: 'ideas' as NavView },
            { step: '02. PLAN', desc: 'Kanban tasks', badge: 'bg-[#6ebdf7]', view: 'tasks' as NavView },
            { step: '03. SOURCE', desc: 'BOM inventory', badge: 'bg-[#75f76e]', view: 'inventory' as NavView },
            { step: '04. MAP', desc: 'Pinout & rails', badge: 'bg-[#fe5029] text-white', view: 'circuits' as NavView },
            { step: '05. CODE', desc: 'MCU firmware', badge: 'bg-white', view: 'coding' as NavView },
            { step: '06. PRINT', desc: '3D CAD parts', badge: 'bg-[#eeeeee]', view: 'prints' as NavView },
            { step: '07. SHIP', desc: 'Release logs', badge: 'bg-[#111111] text-white', view: 'projects' as NavView },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => onNavigate(item.view)}
              className="p-2.5 border border-[#111111] bg-white text-left transition-all hover:bg-[#eeeeee] shadow-[1px_1px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className={`inline-block font-mono-tech font-bold text-[9px] px-1.5 py-0.5 border border-[#111111] ${item.badge}`}>
                {item.step}
              </span>
              <span className="font-mono-tech text-[10px] text-[#111111]/70 block truncate mt-1 uppercase">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Real Metrics Row (Strictly zero fake statistics) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono-tech text-[10px] font-bold text-[#111111] uppercase tracking-wider">
            // WORKSHOP METRIC TELEMETRY
          </h3>
          <span className="font-mono-tech text-[9px] text-[#111111]/60 uppercase">
            STRICT VERIFIED STORE
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-[#111111] mb-1 font-mono-tech text-[10px] uppercase font-bold">
              <span>ACTIVE PROJECTS</span>
              <FolderKanban className="w-4 h-4 text-[#fe5029]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-[#111111]">
              {projects.length}
            </div>
            <p className="font-mono-tech text-[10px] uppercase text-[#111111]/60 mt-1">
              {projects.length === 0 ? 'ZERO PROJECTS' : `${projects.length} REAL PROJECTS`}
            </p>
          </div>

          <div className="p-4 border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-[#111111] mb-1 font-mono-tech text-[10px] uppercase font-bold">
              <span>BOM COMPONENTS</span>
              <Cpu className="w-4 h-4 text-[#75f76e]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-[#111111]">
              {inventory.length}
            </div>
            <p className="font-mono-tech text-[10px] uppercase text-[#111111]/60 mt-1">
              {inventory.length === 0 ? 'EMPTY INVENTORY' : `${analytics?.inventory.totalQuantity || 0} TOTAL UNITS`}
            </p>
          </div>

          <div className="p-4 border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-[#111111] mb-1 font-mono-tech text-[10px] uppercase font-bold">
              <span>COMPLETED TASKS</span>
              <CheckSquare className="w-4 h-4 text-[#6ebdf7]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-[#111111]">
              {analytics?.tasks.completed || 0}
            </div>
            <p className="font-mono-tech text-[10px] uppercase text-[#111111]/60 mt-1">
              {analytics?.tasks.total ? `${analytics.tasks.total} TOTAL TASKS` : 'ZERO TASKS RECORDED'}
            </p>
          </div>

          <div className="p-4 border border-[#111111] bg-white shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-[#111111] mb-1 font-mono-tech text-[10px] uppercase font-bold">
              <span>3D PRINT LOGS</span>
              <Printer className="w-4 h-4 text-[#111111]" />
            </div>
            <div className="font-display font-extrabold text-3xl text-[#111111]">
              {analytics?.prints.total || 0}
            </div>
            <p className="font-mono-tech text-[10px] uppercase text-[#111111]/60 mt-1">
              {analytics?.prints.total === 0 ? 'ZERO PRINT JOBS' : `${analytics?.prints.byStatus?.completed || 0} COMPLETED`}
            </p>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-extrabold text-xl text-[#111111]">
              Workshop Projects
            </h3>
            <p className="font-mono-tech text-xs text-[#111111]/60 uppercase">
              {hasProjects ? `${projects.length} ACTIVE PROJECTS IN DIRECTORY` : 'NO PROJECTS RECORDED'}
            </p>
          </div>
          {hasProjects && (
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="font-mono-tech text-xs font-bold uppercase text-[#fe5029] hover:text-[#e4421d] flex items-center gap-1"
            >
              <span>VIEW ALL PROJECTS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!hasProjects ? (
          <div className="p-8 sm:p-12 text-center border border-[#111111] bg-white shadow-[4px_4px_0px_#111111] circuit-grid">
            <div className="w-12 h-12 border border-[#111111] bg-[#fe5029] text-white flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_#111111]">
              <FolderKanban className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="font-display font-extrabold text-lg text-[#111111] uppercase mb-1">
              WORKSHOP IS READY FOR FIRST PROJECT
            </h4>
            <p className="font-mono-tech text-xs text-[#111111]/70 max-w-md mx-auto mb-5 uppercase tracking-wide">
              Create your initial project to connect tasks, components, pinout wiring, MCU firmware, and 3D print logs.
            </p>
            <button
              id="dashboard-first-project-action"
              type="button"
              onClick={() => onOpenCreate('project')}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono-tech text-xs font-bold uppercase bg-[#fe5029] text-white border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>CREATE PROJECT</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigate('projects', proj.id)}
                className="p-4 border border-[#111111] bg-white hover:bg-[#eeeeee]/30 transition-all cursor-pointer group shadow-[2px_2px_0px_#111111]"
              >
                <div className="flex items-start justify-between gap-2 mb-2 font-mono-tech">
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 border border-[#111111] bg-[#eeeeee] text-[#111111]">
                    {proj.status}
                  </span>
                  <span className="text-[10px] text-[#111111]/50">
                    {new Date(proj.createdDate).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-display font-extrabold text-base text-[#111111] group-hover:text-[#fe5029] transition-colors truncate">
                  {proj.name}
                </h4>
                <p className="font-mono-tech text-xs text-[#111111]/70 line-clamp-2 mt-1 min-h-[2rem]">
                  {proj.description || 'No description recorded.'}
                </p>
                <div className="mt-3 pt-3 border-t border-[#eeeeee] flex items-center justify-between font-mono-tech text-xs">
                  <span className="text-[10px] font-bold uppercase text-[#111111]/60">{proj.category}</span>
                  <span className="text-[#fe5029] flex items-center gap-1 font-bold text-xs uppercase">
                    OPEN WORKSHOP <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workshop Quick Access Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono-tech text-[10px] font-bold text-[#111111] uppercase tracking-wider">
            // SPECIALIZED ENGINEERING MODULES
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('circuits')}
            className="p-4 border border-[#111111] bg-white hover:bg-[#eeeeee]/40 text-left transition-all group shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <div className="w-8 h-8 border border-[#111111] bg-[#fe5029] text-white flex items-center justify-center mb-3 shadow-[1px_1px_0px_#111111]">
              <Zap className="w-4 h-4 stroke-[2]" />
            </div>
            <h4 className="font-display font-extrabold text-sm text-[#111111] group-hover:text-[#fe5029] transition-colors uppercase">
              Circuit Mapping
            </h4>
            <p className="font-mono-tech text-xs text-[#111111]/70 mt-1 uppercase">
              Microcontroller pinouts, voltage rails, and hardware wiring matrix.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="p-4 border border-[#111111] bg-white hover:bg-[#eeeeee]/40 text-left transition-all group shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <div className="w-8 h-8 border border-[#111111] bg-[#75f76e] text-[#111111] flex items-center justify-center mb-3 shadow-[1px_1px_0px_#111111]">
              <Cpu className="w-4 h-4 stroke-[2]" />
            </div>
            <h4 className="font-display font-extrabold text-sm text-[#111111] group-hover:text-[#fe5029] transition-colors uppercase">
              Inventory & BOM
            </h4>
            <p className="font-mono-tech text-xs text-[#111111]/70 mt-1 uppercase">
              Component stock, sensors, pin assignments, and pricing calculations.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('coding')}
            className="p-4 border border-[#111111] bg-white hover:bg-[#eeeeee]/40 text-left transition-all group shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <div className="w-8 h-8 border border-[#111111] bg-[#6ebdf7] text-[#111111] flex items-center justify-center mb-3 shadow-[1px_1px_0px_#111111]">
              <FileCode2 className="w-4 h-4 stroke-[2]" />
            </div>
            <h4 className="font-display font-extrabold text-sm text-[#111111] group-hover:text-[#fe5029] transition-colors uppercase">
              Firmware Code Lab
            </h4>
            <p className="font-mono-tech text-xs text-[#111111]/70 mt-1 uppercase">
              Microcontroller firmware IDE, AI pin-verification, and compiler notes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('prints')}
            className="p-4 border border-[#111111] bg-white hover:bg-[#eeeeee]/40 text-left transition-all group shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <div className="w-8 h-8 border border-[#111111] bg-[#f7e96e] text-[#111111] flex items-center justify-center mb-3 shadow-[1px_1px_0px_#111111]">
              <Printer className="w-4 h-4 stroke-[2]" />
            </div>
            <h4 className="font-display font-extrabold text-sm text-[#111111] group-hover:text-[#fe5029] transition-colors uppercase">
              3D Print Tracker
            </h4>
            <p className="font-mono-tech text-xs text-[#111111]/70 mt-1 uppercase">
              Manufacturing job logs, filament usage, print settings, and QA outcomes.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
