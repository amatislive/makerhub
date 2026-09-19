import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckSquare,
  Cpu,
  FileCode2,
  Printer,
  FileText,
  FolderArchive,
  ArrowLeft,
  Calendar,
  Tag,
  Plus,
  Trash2,
  DollarSign,
  Zap,
  ExternalLink,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  Project,
  ProjectStatus,
  Task,
  BomItem,
  Circuit,
  CodeFile,
  PrintRecord,
  Note,
  FileRecord,
  Experiment
} from '../types';
import { api } from '../api';
import { EmptyState } from './EmptyState';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onUpdateProject: (updated: Project) => void;
  onOpenCreateTask: (projectId: string) => void;
  onOpenCreateBom: (projectId: string) => void;
  onOpenCreateCircuit: (projectId: string) => void;
  onOpenCreateCode: (projectId: string) => void;
  onOpenCreatePrint: (projectId: string) => void;
  onOpenCreateNote: (projectId: string) => void;
  onNavigateToCode: (fileId?: string) => void;
}

type TabType = 'overview' | 'tasks' | 'bom' | 'circuits' | 'code' | 'prints' | 'notes' | 'files';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onUpdateProject,
  onOpenCreateTask,
  onOpenCreateBom,
  onOpenCreateCircuit,
  onOpenCreateCode,
  onOpenCreatePrint,
  onOpenCreateNote,
  onNavigateToCode,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  // Project associated records
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boms, setBoms] = useState<BomItem[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [prints, setPrints] = useState<PrintRecord[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const proj = await api.projects.get(projectId);
      setProject(proj);

      const [
        tasksRes,
        bomsRes,
        circuitsRes,
        codeRes,
        printsRes,
        notesRes,
        expRes,
        filesRes,
      ] = await Promise.all([
        api.tasks.list(projectId),
        api.boms.list(projectId),
        api.circuits.list(projectId),
        api.codeFiles.list(projectId),
        api.prints.list(projectId),
        api.notes.list(projectId),
        api.experiments.list(projectId),
        api.files.list(projectId),
      ]);

      setTasks(tasksRes);
      setBoms(bomsRes);
      setCircuits(circuitsRes);
      setCodeFiles(codeRes);
      setPrints(printsRes);
      setNotes(notesRes);
      setExperiments(expRes);
      setFiles(filesRes);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">
        Loading project workspace...
      </div>
    );
  }

  // Calculate real task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const taskProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate real BOM costs
  let totalBomCost = 0;
  let itemsWithCost = 0;
  let itemsMissingCost = 0;

  boms.forEach((item) => {
    if (typeof item.unitCost === 'number' && !isNaN(item.unitCost)) {
      totalBomCost += item.unitCost * item.quantity;
      itemsWithCost++;
    } else {
      itemsMissingCost++;
    }
  });

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      const updated = await api.projects.update(project.id, { status: newStatus });
      setProject(updated);
      onUpdateProject(updated);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleTaskToggle = async (task: Task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const updated = await api.tasks.update(task.id, { status: nextStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBom = async (bomId: string) => {
    try {
      await api.boms.delete(bomId);
      setBoms(boms.filter((b) => b.id !== bomId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {project.category || 'Hardware Project'}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs text-neutral-400">
                Created {new Date(project.createdDate).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              {project.name}
            </h2>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-500">Status:</label>
          <select
            id="project-status-selector"
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-hidden focus:border-[#fe5029]"
          >
            <option value="idea">Idea</option>
            <option value="planning">Planning</option>
            <option value="sourcing">Sourcing</option>
            <option value="building">Building</option>
            <option value="testing">Testing</option>
            <option value="documenting">Documenting</option>
            <option value="finished">Finished</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: FolderKanban },
          { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
          { id: 'bom', label: `BOM & Costs (${boms.length})`, icon: DollarSign },
          { id: 'circuits', label: `Circuits (${circuits.length})`, icon: Zap },
          { id: 'code', label: `Code Files (${codeFiles.length})`, icon: FileCode2 },
          { id: 'prints', label: `3D Prints (${prints.length})`, icon: Printer },
          { id: 'notes', label: `Notes & Logs (${notes.length})`, icon: FileText },
          { id: 'files', label: `Files (${files.length})`, icon: FolderArchive },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#fe5029] text-[#fe5029] font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description and tags */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">About Project</h3>
                <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">
                  {project.description || 'No description has been written for this project.'}
                </p>

                {project.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Real Task Progress Card */}
              <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-neutral-900">Task Completion</h3>
                  <span className="text-xs font-bold text-neutral-700">
                    {completedTasks} / {totalTasks} ({taskProgressPercent}%)
                  </span>
                </div>

                {totalTasks === 0 ? (
                  <div className="py-4 text-center text-xs text-neutral-400 bg-neutral-50 rounded-lg">
                    No tasks created yet. Add tasks to track progress.
                  </div>
                ) : (
                  <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#fe5029] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${taskProgressPercent}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Bill of Materials Summary Card */}
              <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      Bill of Materials Cost
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Calculated directly from entered component costs
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-neutral-900">
                      ${totalBomCost.toFixed(2)}
                    </div>
                    {itemsMissingCost > 0 && (
                      <span className="text-[10px] text-amber-600 font-medium">
                        {itemsMissingCost} item(s) have cost not entered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metadata & Summary Column */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-3 text-xs">
                <h4 className="font-semibold text-neutral-900 text-sm mb-3">Project Details</h4>

                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Lifecycle State</span>
                  <span className="font-semibold uppercase text-neutral-800">{project.status}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Category</span>
                  <span className="font-medium text-neutral-800">{project.category}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Target Date</span>
                  <span className="font-medium text-neutral-800">
                    {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Circuits</span>
                  <span className="font-medium text-neutral-800">{circuits.length}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Firmware Files</span>
                  <span className="font-medium text-neutral-800">{codeFiles.length}</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-neutral-500">3D Print Records</span>
                  <span className="font-medium text-neutral-800">{prints.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Project Tasks</h3>
            <button
              type="button"
              onClick={() => onOpenCreateTask(project.id)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet."
              description="Break your project into manageable steps: planning, wiring, firmware, 3D casing, and testing."
              primaryAction={{
                label: 'Add First Task',
                onClick: () => onOpenCreateTask(project.id),
                icon: Plus,
              }}
              accentColor="blue"
            />
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => handleTaskToggle(task)}
                      className="w-4 h-4 rounded-sm border-neutral-300 text-[#fe5029] focus:ring-[#fe5029] cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span
                        className={`text-sm font-medium block truncate ${
                          task.status === 'done' ? 'line-through text-neutral-400' : 'text-neutral-800'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <p className="text-xs text-neutral-500 truncate">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        task.priority === 'critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : task.priority === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BOM & COSTS */}
      {activeTab === 'bom' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Bill of Materials</h3>
              <p className="text-xs text-neutral-500">
                Track parts needed, purchase cost, and supply status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenCreateBom(project.id)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add BOM Item</span>
            </button>
          </div>

          {boms.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No BOM items yet."
              description="Keep track of all components, hardware parts, and costs needed for this specific project."
              primaryAction={{
                label: 'Add BOM Component',
                onClick: () => onOpenCreateBom(project.id),
                icon: Plus,
              }}
              accentColor="green"
            />
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 font-semibold uppercase text-[10px]">
                    <th className="p-3">Component / Part</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit Cost</th>
                    <th className="p-3">Extended Cost</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {boms.map((item) => {
                    const extCost =
                      typeof item.unitCost === 'number'
                        ? (item.unitCost * item.quantity).toFixed(2)
                        : null;
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="p-3">
                          <span className="font-semibold text-neutral-900 block">{item.name}</span>
                          <span className="text-[11px] text-neutral-400">
                            {item.partNumber || item.category || 'General'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-neutral-700">{item.quantity}</td>
                        <td className="p-3 text-neutral-600">
                          {typeof item.unitCost === 'number'
                            ? `$${item.unitCost.toFixed(2)}`
                            : 'Cost not entered'}
                        </td>
                        <td className="p-3 font-semibold text-neutral-900">
                          {extCost ? `$${extCost}` : 'Cost not entered'}
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBom(item.id)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded-sm"
                            title="Delete BOM item"
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

      {/* TAB CONTENT: CIRCUITS */}
      {activeTab === 'circuits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Circuits & Schematics</h3>
            <button
              type="button"
              onClick={() => onOpenCreateCircuit(project.id)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Circuit</span>
            </button>
          </div>

          {circuits.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No circuits yet."
              description="Document board microcontrollers, power requirements, pin assignments, and wiring connections."
              primaryAction={{
                label: 'Create Circuit',
                onClick: () => onOpenCreateCircuit(project.id),
                icon: Plus,
              }}
              accentColor="blue"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {circuits.map((circ) => (
                <div
                  key={circ.id}
                  className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-neutral-900 text-sm">{circ.name}</h4>
                      <span className="text-xs text-blue-600 font-mono font-medium">
                        MCU: {circ.boardMcu || 'Generic Board'}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                      {circ.pins.length} pins
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {circ.description || circ.powerRequirements || 'No notes entered.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CODE */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Firmware & Software Files</h3>
            <button
              type="button"
              onClick={() => onOpenCreateCode(project.id)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Code File</span>
            </button>
          </div>

          {codeFiles.length === 0 ? (
            <EmptyState
              icon={FileCode2}
              title="Ready to build something?"
              description="Write Arduino, MicroPython, ESP-IDF, or C++ firmware with AI-assisted debugging and version control."
              primaryAction={{
                label: 'New Code File',
                onClick: () => onOpenCreateCode(project.id),
                icon: Plus,
              }}
              accentColor="orange"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {codeFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => onNavigateToCode(file.id)}
                  className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold text-neutral-900 group-hover:text-[#fe5029]">
                      {file.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                      {file.language}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 mt-3 pt-3 border-t border-neutral-100">
                    <span>{file.versions?.length || 1} version(s)</span>
                    <span className="text-[#fe5029] font-medium flex items-center gap-1">
                      Open in Editor <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3D PRINTS */}
      {activeTab === 'prints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">3D Print Jobs</h3>
            <button
              type="button"
              onClick={() => onOpenCreatePrint(project.id)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Print Job</span>
            </button>
          </div>

          {prints.length === 0 ? (
            <EmptyState
              icon={Printer}
              title="No print records yet."
              description="Track actual 3D print jobs, materials, slicer settings, filament usage, and results."
              primaryAction={{
                label: 'Add Print Record',
                onClick: () => onOpenCreatePrint(project.id),
                icon: Plus,
              }}
              accentColor="yellow"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prints.map((p) => (
                <div key={p.id} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-neutral-900 text-sm">{p.modelName}</h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1">
                    <p>Printer: {p.printer || 'Default 3D Printer'}</p>
                    <p>Material: {p.material || 'PLA'}</p>
                    {p.filamentUsageGrams && <p>Filament: {p.filamentUsageGrams}g</p>}
                    {p.printDurationMinutes && <p>Duration: {p.printDurationMinutes} mins</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Project Notes</h3>
            <button
              type="button"
              onClick={() => onOpenCreateNote(project.id)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#fe5029] text-white rounded-lg hover:bg-[#e4421d] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Note</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No notes yet."
              description="Keep track of workshop logs, pinouts, testing notes, and quick findings."
              primaryAction={{
                label: 'Create Note',
                onClick: () => onOpenCreateNote(project.id),
                icon: Plus,
              }}
              accentColor="neutral"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((note) => (
                <div key={note.id} className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
                  <h4 className="font-semibold text-neutral-900 text-sm">{note.title}</h4>
                  <p className="text-xs text-neutral-600 whitespace-pre-wrap line-clamp-4">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FILES */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Project Files</h3>
          </div>

          {files.length === 0 ? (
            <EmptyState
              icon={FolderArchive}
              title="No files yet."
              description="Add schematics, datasheets, CAD models, STL files, or documentation."
              accentColor="neutral"
            />
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="p-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-neutral-900">{f.name}</span>
                  <span className="text-neutral-400">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
