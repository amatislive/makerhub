import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Calendar,
  Tag,
  Eye,
  Trash2,
  Edit2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Project, ProjectStatus } from '../types';
import { EmptyState } from './EmptyState';

interface ProjectsViewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onOpenCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onSelectProject,
  onOpenCreateProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(projects.map((p) => p.category))).filter(Boolean);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'idea': return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 'planning': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sourcing': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'building': return 'bg-[#fe5029]/10 text-[#fe5029] border-[#fe5029]/20';
      case 'testing': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'documenting': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'finished': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'archived': return 'bg-neutral-100 text-neutral-500 border-neutral-200';
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Projects
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Organize hardware builds, firmware code, BOMs, and manufacturing records.
          </p>
        </div>

        <button
          id="projects-create-btn"
          type="button"
          onClick={onOpenCreateProject}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] active:scale-[0.98] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              id="projects-search-filter"
              type="text"
              placeholder="Search projects by name, description, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-neutral-200 rounded-lg focus:outline-hidden focus:border-[#fe5029]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              id="projects-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-700"
            >
              <option value="all">All Statuses</option>
              <option value="idea">Idea</option>
              <option value="planning">Planning</option>
              <option value="sourcing">Sourcing</option>
              <option value="building">Building</option>
              <option value="testing">Testing</option>
              <option value="documenting">Documenting</option>
              <option value="finished">Finished</option>
              <option value="archived">Archived</option>
            </select>

            {categories.length > 0 && (
              <select
                id="projects-category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white text-neutral-700"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Projects List or Contextual Empty State */}
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Your workshop is ready."
          description="Create your first project to start organizing your ideas, components, code, and builds."
          primaryAction={{
            label: 'Create Project',
            onClick: onOpenCreateProject,
            icon: Plus,
          }}
          accentColor="orange"
        />
      ) : filteredProjects.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-neutral-200">
          <p className="text-sm font-medium text-neutral-700">No matching projects found.</p>
          <p className="text-xs text-neutral-400 mt-1">Try clearing your search or status filter.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}
            className="mt-3 text-xs text-[#fe5029] font-medium hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-neutral-200 shadow-2xs hover:border-neutral-300 hover:shadow-xs transition-all flex flex-col overflow-hidden group"
            >
              {project.coverImage && (
                <div className="h-36 w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {project.category}
                  </span>
                </div>

                <h3
                  onClick={() => onSelectProject(project.id)}
                  className="text-base font-bold text-neutral-900 group-hover:text-[#fe5029] transition-colors cursor-pointer truncate mb-1"
                >
                  {project.name}
                </h3>

                <p className="text-xs text-neutral-500 line-clamp-3 mb-4 flex-1">
                  {project.description || 'No description recorded.'}
                </p>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(project.createdDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProject(project.id)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#fe5029] hover:bg-[#fe5029]/10 transition-colors flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
