import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Trash2,
  ArrowRight,
  FolderKanban,
  Sparkles,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Idea } from '../types';
import { EmptyState } from './EmptyState';

interface IdeasViewProps {
  ideas: Idea[];
  onOpenCreateIdea: () => void;
  onConvertToProject: (ideaId: string) => void;
  onDeleteIdea: (ideaId: string) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  ideas,
  onOpenCreateIdea,
  onConvertToProject,
  onDeleteIdea,
}) => {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Ideas Spark
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Capture hardware concepts, robotics ideas, or tool blueprints, and convert them to active projects in one click.
          </p>
        </div>

        <button
          id="ideas-add-btn"
          type="button"
          onClick={onOpenCreateIdea}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Idea</span>
        </button>
      </div>

      {ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No ideas recorded yet."
          description="Capture concept sparks, project inspirations, and inventions. When you are ready, convert any idea into a full project workspace."
          primaryAction={{
            label: 'Capture Idea',
            onClick: onOpenCreateIdea,
            icon: Plus,
          }}
          accentColor="yellow"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-5 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-4 flex flex-col justify-between group hover:border-neutral-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      idea.status === 'promoted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : idea.status === 'evaluating'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {idea.status}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-neutral-900 text-base mb-1">{idea.title}</h3>
                <p className="text-xs text-neutral-600 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                  {idea.description || 'No description provided.'}
                </p>

                {idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {idea.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onDeleteIdea(idea.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md transition-colors"
                  title="Delete idea"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {idea.status !== 'promoted' ? (
                  <button
                    type="button"
                    onClick={() => onConvertToProject(idea.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#fe5029]/10 text-[#fe5029] hover:bg-[#fe5029] hover:text-white transition-all"
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                    <span>Convert to Project</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Promoted</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
