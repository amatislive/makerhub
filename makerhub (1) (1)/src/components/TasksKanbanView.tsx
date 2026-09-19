import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Task, Project, TaskStatus, TaskPriority } from '../types';
import { EmptyState } from './EmptyState';

interface TasksKanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onOpenCreateTask: (projectId?: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TasksKanbanView: React.FC<TasksKanbanViewProps> = ({
  tasks,
  projects,
  onOpenCreateTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesProj = projectFilter === 'all' || t.projectId === projectFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesProj && matchesPriority;
  });

  const columns: Array<{ id: TaskStatus; label: string; countColor: string }> = [
    { id: 'todo', label: 'To Do', countColor: 'bg-neutral-200 text-neutral-700' },
    { id: 'in_progress', label: 'In Progress', countColor: 'bg-blue-100 text-blue-800' },
    { id: 'review', label: 'Review & Testing', countColor: 'bg-amber-100 text-amber-800' },
    { id: 'done', label: 'Completed', countColor: 'bg-emerald-100 text-emerald-800' },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Critical</span>;
      case 'high':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">High</span>;
      case 'medium':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Medium</span>;
      case 'low':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">Low</span>;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Tasks & Kanban
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Track hardware assembly, wiring milestones, firmware code sprints, and verification steps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Board / List switch */}
          <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'board' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            id="tasks-add-btn"
            type="button"
            onClick={() => onOpenCreateTask()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet."
          description="Break your project into actionable steps: plan, source parts, wire breadboard, write firmware, and test."
          primaryAction={{
            label: 'Add Task',
            onClick: () => onOpenCreateTask(),
            icon: Plus,
          }}
          accentColor="blue"
        />
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-xs font-medium text-neutral-500 pl-1">Filter by:</span>
            {projects.length > 0 && (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1 bg-white text-neutral-700"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-neutral-200 rounded-lg px-2.5 py-1 bg-white text-neutral-700"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {viewMode === 'board' ? (
            /* Kanban Columns */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {columns.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.id);
                return (
                  <div
                    key={col.id}
                    className="bg-neutral-100/75 rounded-xl border border-neutral-200 p-3 space-y-3 min-h-[400px]"
                  >
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        {col.label}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.countColor}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map((task) => {
                        const proj = projects.find((p) => p.id === task.projectId);
                        return (
                          <div
                            key={task.id}
                            className="bg-white rounded-lg p-3.5 border border-neutral-200 shadow-2xs space-y-2 hover:border-neutral-300 transition-all"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-semibold text-neutral-900 leading-snug">
                                {task.title}
                              </span>
                              {getPriorityBadge(task.priority)}
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-neutral-500 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {proj && (
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md inline-block">
                                {proj.name}
                              </span>
                            )}

                            {/* Move status buttons */}
                            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                              <select
                                value={task.status}
                                onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                className="text-[10px] border border-neutral-200 rounded px-1.5 py-0.5 bg-neutral-50 text-neutral-700"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => onDeleteTask(task.id)}
                                className="p-1 text-neutral-400 hover:text-red-600 rounded-sm"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 font-semibold uppercase text-[10px]">
                    <th className="p-3">Task</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTasks.map((t) => {
                    const proj = projects.find((p) => p.id === t.projectId);
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/50">
                        <td className="p-3">
                          <span className="font-semibold text-neutral-900 block">{t.title}</span>
                          <span className="text-[11px] text-neutral-400">{t.description}</span>
                        </td>
                        <td className="p-3 text-neutral-600">{proj?.name || 'Unassigned'}</td>
                        <td className="p-3">{getPriorityBadge(t.priority)}</td>
                        <td className="p-3">
                          <select
                            value={t.status}
                            onChange={(e) => onUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                            className="text-xs border border-neutral-200 rounded-md px-2 py-0.5 bg-white text-neutral-700"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
