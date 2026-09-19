import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Tag,
  Calendar,
  FlaskConical,
  BookOpen,
  Pin,
  CheckCircle2
} from 'lucide-react';
import { Note, Experiment, Project } from '../types';
import { EmptyState } from './EmptyState';

interface NotesViewProps {
  notes: Note[];
  experiments: Experiment[];
  projects: Project[];
  onOpenCreateNote: () => void;
  onOpenCreateExperiment: () => void;
  onDeleteNote: (id: string) => void;
  onDeleteExperiment: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  experiments,
  projects,
  onOpenCreateNote,
  onOpenCreateExperiment,
  onDeleteNote,
  onDeleteExperiment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'experiments'>('notes');

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Notes & Engineering Experiments
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Document hardware lab logs, sensor calibration procedures, testing benchmarks, and observations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'notes' ? (
            <button
              id="notes-add-btn"
              type="button"
              onClick={onOpenCreateNote}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Note</span>
            </button>
          ) : (
            <button
              id="experiments-add-btn"
              type="button"
              onClick={onOpenCreateExperiment}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Experiment</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab selection */}
      <div className="flex border-b border-neutral-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'notes'
              ? 'border-[#fe5029] text-[#fe5029]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Workshop Notes ({notes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('experiments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeSubTab === 'experiments'
              ? 'border-[#fe5029] text-[#fe5029]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Engineering Experiments ({experiments.length})</span>
        </button>
      </div>

      {/* Notes Sub-Tab */}
      {activeSubTab === 'notes' && (
        <>
          {notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes yet."
              description="Keep track of workshop logs, wiring pinouts, breadboard sketches, and quick brainstorm ideas."
              primaryAction={{
                label: 'Create Note',
                onClick: onOpenCreateNote,
                icon: Plus,
              }}
              accentColor="neutral"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => {
                const proj = projects.find((p) => p.id === note.projectId);
                return (
                  <div
                    key={note.id}
                    className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-neutral-900 text-sm">{note.title}</h4>
                        <button
                          type="button"
                          onClick={() => onDeleteNote(note.id)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {proj && (
                        <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md inline-block mb-2">
                          {proj.name}
                        </span>
                      )}

                      <p className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {note.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      {note.tags.length > 0 && (
                        <span className="truncate max-w-[120px]">
                          {note.tags.map((t) => `#${t}`).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Experiments Sub-Tab */}
      {activeSubTab === 'experiments' && (
        <>
          {experiments.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No experiments recorded yet."
              description="Document structured engineering experiments: objective, hypothesis, materials tested, procedure, and quantitative conclusions."
              primaryAction={{
                label: 'Record Experiment',
                onClick: onOpenCreateExperiment,
                icon: Plus,
              }}
              accentColor="blue"
            />
          ) : (
            <div className="space-y-4">
              {experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">
                        Lab Experiment
                      </span>
                      <h4 className="text-base font-bold text-neutral-900">{exp.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteExperiment(exp.id)}
                      className="text-neutral-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                      <span className="font-semibold text-neutral-700 block">Objective:</span>
                      <p className="text-neutral-600">{exp.objective || '—'}</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                      <span className="font-semibold text-neutral-700 block">Hypothesis:</span>
                      <p className="text-neutral-600">{exp.hypothesis || '—'}</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                      <span className="font-semibold text-neutral-700 block">Procedure:</span>
                      <p className="text-neutral-600 whitespace-pre-wrap">{exp.procedure || '—'}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg space-y-1">
                      <span className="font-semibold text-emerald-900 block">Results & Conclusion:</span>
                      <p className="text-emerald-800 whitespace-pre-wrap">
                        {exp.results || exp.conclusion || 'Pending conclusion'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
