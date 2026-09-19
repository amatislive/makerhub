import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api';
import {
  Project,
  InventoryItem,
  Task,
  Circuit,
  CodeFile,
  PrintRecord,
  Note,
  Experiment,
  Idea,
  FileRecord,
  AnalyticsData,
  TaskStatus,
  PrinterProfile,
  FilamentSpool,
  SliceProject
} from './types';

import { Navigation, NavView } from './components/Navigation';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal } from './components/AuthModal';
import { CreateModals, CreateModalType } from './components/CreateModals';
import { CreateBomModal } from './components/CreateBomModal';
import { OnboardingModal } from './components/OnboardingModal';

import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { ProjectDetailView } from './components/ProjectDetailView';
import { InventoryView } from './components/InventoryView';
import { CircuitLabView } from './components/CircuitLabView';
import { AiCodingView } from './components/AiCodingView';
import { PrintingView } from './components/PrintingView';
import { SliceStudioView } from './components/SliceStudioView';
import { TasksKanbanView } from './components/TasksKanbanView';
import { NotesView } from './components/NotesView';
import { IdeasView } from './components/IdeasView';
import { FilesView } from './components/FilesView';
import { AnalyticsView } from './components/AnalyticsView';
import { QrCodeMakerView } from './components/QrCodeMakerView';
import { UnitChangerView } from './components/UnitChangerView';

function WorkshopApp() {
  const { user, loading: authLoading } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCodeFileId, setSelectedCodeFileId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dialogs
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    return !localStorage.getItem('makeo_onboarding_completed');
  });
  const [createModalType, setCreateModalType] = useState<CreateModalType>(null);
  const [createModalProjectId, setCreateModalProjectId] = useState<string | undefined>(undefined);
  const [bomModalOpen, setBomModalOpen] = useState(false);
  const [bomModalProjectId, setBomModalProjectId] = useState<string>('');

  // Primary data state (strictly initialized from real API database)
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [prints, setPrints] = useState<PrintRecord[]>([]);
  const [printers, setPrinters] = useState<PrinterProfile[]>([]);
  const [spools, setSpools] = useState<FilamentSpool[]>([]);
  const [sliceProjects, setSliceProjects] = useState<SliceProject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [
        projRes,
        invRes,
        tasksRes,
        circRes,
        codeRes,
        printsRes,
        printersRes,
        spoolsRes,
        sliceProjRes,
        notesRes,
        expRes,
        ideasRes,
        filesRes,
        analyticsRes,
      ] = await Promise.all([
        api.projects.list(),
        api.inventory.list(),
        api.tasks.list(),
        api.circuits.list(),
        api.codeFiles.list(),
        api.prints.list(),
        api.printers.list(),
        api.spools.list(),
        api.sliceProjects.list(),
        api.notes.list(),
        api.experiments.list(),
        api.ideas.list(),
        api.files.list(),
        api.analytics.get(),
      ]);

      setProjects(projRes);
      setInventory(invRes);
      setTasks(tasksRes);
      setCircuits(circRes);
      setCodeFiles(codeRes);
      setPrints(printsRes);
      setPrinters(printersRes);
      setSpools(spoolsRes);
      setSliceProjects(sliceProjRes);
      setNotes(notesRes);
      setExperiments(expRes);
      setIdeas(ideasRes);
      setFiles(filesRes);
      setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Error fetching workshop data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllData();
    }
  }, [user, authLoading]);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute real low-stock notification items
  const lowStockItems = inventory
    .filter(
      (item) =>
        item.minStockLevel !== null &&
        item.minStockLevel !== undefined &&
        item.quantity <= item.minStockLevel
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minStockLevel: item.minStockLevel!,
    }));

  // Navigation handlers
  const handleSelectView = (view: NavView) => {
    setCurrentView(view);
    setSelectedProjectId(null);
    setMobileMenuOpen(false);
  };

  const handleOpenCreate = (
    type: 'project' | 'task' | 'inventory' | 'note' | 'print' | 'circuit' | 'code' | 'idea',
    projectId?: string
  ) => {
    setCreateModalProjectId(projectId);
    setCreateModalType(type);
  };

  // Entity Handlers
  const handleCreateProject = async (data: Partial<Project>) => {
    try {
      const created = await api.projects.create(data);
      setProjects([created, ...projects]);
      setSelectedProjectId(created.id);
      setCurrentView('projects');
      fetchAllData();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.projects.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      const created = await api.tasks.create(data);
      setTasks([created, ...tasks]);
      fetchAllData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await api.tasks.update(taskId, { status: newStatus });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
      fetchAllData();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.tasks.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateInventory = async (data: Partial<InventoryItem>) => {
    try {
      const created = await api.inventory.create(data);
      setInventory([created, ...inventory]);
      fetchAllData();
    } catch (err) {
      console.error('Failed to create component:', err);
    }
  };

  const handleUpdateInventoryQty = async (id: string, newQty: number) => {
    try {
      const updated = await api.inventory.update(id, { quantity: newQty });
      setInventory(inventory.map((i) => (i.id === id ? updated : i)));
      fetchAllData();
    } catch (err) {
      console.error('Failed to update inventory quantity:', err);
    }
  };

  const handleDeleteInventory = async (id: string) => {
    try {
      await api.inventory.delete(id);
      setInventory(inventory.filter((i) => i.id !== id));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
    }
  };

  const handleImportCsv = async (csvData: string) => {
    const lines = csvData.split('\n').filter((l) => l.trim().length > 0);
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 2) {
        const name = parts[0];
        const category = (parts[1].toLowerCase() as any) || 'custom';
        const qty = parseInt(parts[2]) || 1;
        const unit = parts[3] || 'pcs';
        const loc = parts[4] || undefined;
        const cost = parts[5] ? parseFloat(parts[5]) : null;

        if (name && name.toLowerCase() !== 'name') {
          try {
            await api.inventory.create({
              name,
              category,
              quantity: qty,
              unit,
              storageLocation: loc,
              purchaseCost: cost,
            });
          } catch (e) {
            console.error('Error importing item:', e);
          }
        }
      }
    }
    fetchAllData();
  };

  const handleCreateCircuit = async (data: Partial<Circuit>) => {
    try {
      const created = await api.circuits.create(data);
      setCircuits((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setCurrentView('circuits');
      fetchAllData();
    } catch (err) {
      console.error('Failed to create circuit:', err);
    }
  };

  const handleUpdateCircuit = async (id: string, data: Partial<Circuit>) => {
    try {
      const updated = await api.circuits.update(id, data);
      setCircuits(circuits.map((c) => (c.id === id ? updated : c)));
      fetchAllData();
    } catch (err) {
      console.error('Failed to update circuit:', err);
    }
  };

  const handleDeleteCircuit = async (id: string) => {
    try {
      await api.circuits.delete(id);
      setCircuits(circuits.filter((c) => c.id !== id));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete circuit:', err);
    }
  };

  const handleCreateCode = async (data: Partial<CodeFile>) => {
    try {
      const created = await api.codeFiles.create(data);
      setCodeFiles([created, ...codeFiles]);
      setSelectedCodeFileId(created.id);
      setCurrentView('coding');
      fetchAllData();
    } catch (err) {
      console.error('Failed to create code file:', err);
    }
  };

  const handleUpdateCode = async (fileId: string, data: Partial<CodeFile> & { commitMessage?: string }) => {
    try {
      const updated = await api.codeFiles.update(fileId, data);
      setCodeFiles(codeFiles.map((f) => (f.id === fileId ? updated : f)));
      fetchAllData();
    } catch (err) {
      console.error('Failed to update code file:', err);
    }
  };

  const handleRestoreVersion = async (fileId: string, versionId: string) => {
    try {
      const updated = await api.codeFiles.restoreVersion(fileId, versionId);
      setCodeFiles(codeFiles.map((f) => (f.id === fileId ? updated : f)));
      fetchAllData();
    } catch (err) {
      console.error('Failed to restore code version:', err);
    }
  };

  const handleDeleteCode = async (fileId: string) => {
    try {
      await api.codeFiles.delete(fileId);
      setCodeFiles(codeFiles.filter((f) => f.id !== fileId));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete code file:', err);
    }
  };

  const handleCreatePrint = async (data: Partial<PrintRecord>) => {
    try {
      const created = await api.prints.create(data);
      setPrints([created, ...prints]);
      fetchAllData();
    } catch (err) {
      console.error('Failed to create print record:', err);
    }
  };

  const handleUpdatePrint = async (id: string, data: Partial<PrintRecord>) => {
    try {
      const updated = await api.prints.update(id, data);
      setPrints(prints.map((p) => (p.id === id ? updated : p)));
      fetchAllData();
    } catch (err) {
      console.error('Failed to update print record:', err);
    }
  };

  const handleDeletePrint = async (id: string) => {
    try {
      await api.prints.delete(id);
      setPrints(prints.filter((p) => p.id !== id));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete print record:', err);
    }
  };

  const handleCreateNote = async (data: Partial<Note>) => {
    try {
      const created = await api.notes.create(data);
      setNotes([created, ...notes]);
      fetchAllData();
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.notes.delete(id);
      setNotes(notes.filter((n) => n.id !== id));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleCreateExperiment = async (data: Partial<Experiment>) => {
    try {
      const created = await api.experiments.create(data);
      setExperiments([created, ...experiments]);
      fetchAllData();
    } catch (err) {
      console.error('Failed to record experiment:', err);
    }
  };

  const handleDeleteExperiment = async (id: string) => {
    try {
      await api.experiments.delete(id);
      setExperiments(experiments.filter((e) => e.id !== id));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete experiment:', err);
    }
  };

  const handleCreateIdea = async (data: Partial<Idea>) => {
    try {
      const created = await api.ideas.create(data);
      setIdeas([created, ...ideas]);
      fetchAllData();
    } catch (err) {
      console.error('Failed to create idea:', err);
    }
  };

  const handleConvertToProject = async (ideaId: string) => {
    try {
      const res = await api.ideas.convertToProject(ideaId);
      setProjects([res.project, ...projects]);
      setIdeas(ideas.map((i) => (i.id === ideaId ? res.idea : i)));
      setSelectedProjectId(res.project.id);
      setCurrentView('projects');
      fetchAllData();
    } catch (err) {
      console.error('Failed to convert idea to project:', err);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await api.ideas.delete(ideaId);
      setIdeas(ideas.filter((i) => i.id !== ideaId));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  const handleUploadFile = async (data: {
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    projectId?: string;
  }) => {
    try {
      const created = await api.files.create(data);
      setFiles([created, ...files]);
      fetchAllData();
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await api.files.delete(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const handleCreateBomSubmit = async (data: any) => {
    try {
      await api.boms.create(data);
      fetchAllData();
    } catch (err) {
      console.error('Failed to add BOM item:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-[#111111] font-sans antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Navigation
          currentView={currentView}
          onSelectView={handleSelectView}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenCreate={(type) => handleOpenCreate(type)}
          onOpenAuth={() => setAuthModalOpen(true)}
          lowStockCount={lowStockItems.length}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#111111]/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64">
            <Navigation
              currentView={currentView}
              isMobileDrawer={true}
              onSelectView={handleSelectView}
              onOpenCommandPalette={() => {
                setMobileMenuOpen(false);
                setCommandPaletteOpen(true);
              }}
              onOpenCreate={(type) => {
                setMobileMenuOpen(false);
                handleOpenCreate(type);
              }}
              onOpenAuth={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              lowStockCount={lowStockItems.length}
            />
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          currentView={currentView}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenCreate={(type) => handleOpenCreate(type)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onOpenOnboarding={() => setOnboardingOpen(true)}
          lowStockItems={lowStockItems}
        />

        <main className="flex-1 pb-16">
          {currentView === 'dashboard' && (
            <DashboardView
              projects={projects}
              inventory={inventory}
              analytics={analytics}
              onNavigate={(view, detailId) => {
                if (view === 'projects' && detailId) {
                  setSelectedProjectId(detailId);
                }
                setCurrentView(view);
              }}
              onOpenCreate={(type) => handleOpenCreate(type)}
            />
          )}

          {currentView === 'projects' &&
            (selectedProjectId ? (
              <ProjectDetailView
                projectId={selectedProjectId}
                onBack={() => setSelectedProjectId(null)}
                onUpdateProject={(updated) => {
                  setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
                  fetchAllData();
                }}
                onOpenCreateTask={(projId) => handleOpenCreate('task', projId)}
                onOpenCreateBom={(projId) => {
                  setBomModalProjectId(projId);
                  setBomModalOpen(true);
                }}
                onOpenCreateCircuit={(projId) => handleOpenCreate('circuit', projId)}
                onOpenCreateCode={(projId) => handleOpenCreate('code', projId)}
                onOpenCreatePrint={(projId) => handleOpenCreate('print', projId)}
                onOpenCreateNote={(projId) => handleOpenCreate('note', projId)}
                onNavigateToCode={(fileId) => {
                  setSelectedCodeFileId(fileId);
                  setCurrentView('coding');
                }}
              />
            ) : (
              <ProjectsView
                projects={projects}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onOpenCreateProject={() => handleOpenCreate('project')}
                onDeleteProject={handleDeleteProject}
              />
            ))}

          {currentView === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onOpenCreateItem={() => handleOpenCreate('inventory')}
              onDeleteItem={handleDeleteInventory}
              onUpdateQuantity={handleUpdateInventoryQty}
              onImportCsv={handleImportCsv}
            />
          )}

          {currentView === 'circuits' && (
            <CircuitLabView
              circuits={circuits}
              projects={projects}
              inventoryItems={inventory}
              onOpenCreateCircuit={(projId) => handleOpenCreate('circuit', projId)}
              onUpdateCircuit={handleUpdateCircuit}
              onDeleteCircuit={handleDeleteCircuit}
            />
          )}

          {currentView === 'qr' && (
            <QrCodeMakerView
              inventory={inventory}
              projects={projects}
            />
          )}

          {currentView === 'units' && (
            <UnitChangerView />
          )}

          {currentView === 'coding' && (
            <AiCodingView
              codeFiles={codeFiles}
              projects={projects}
              circuits={circuits}
              initialFileId={selectedCodeFileId}
              onOpenCreateFile={(projId) => handleOpenCreate('code', projId)}
              onUpdateFile={handleUpdateCode}
              onRestoreVersion={handleRestoreVersion}
              onDeleteFile={handleDeleteCode}
            />
          )}

          {currentView === 'prints' && (
            <SliceStudioView
              printers={printers}
              spools={spools}
              sliceProjects={sliceProjects}
              prints={prints}
              projects={projects}
              onRefreshAll={fetchAllData}
              onOpenCreatePrint={() => handleOpenCreate('print')}
              onUpdatePrint={handleUpdatePrint}
              onDeletePrint={handleDeletePrint}
            />
          )}

          {currentView === 'tasks' && (
            <TasksKanbanView
              tasks={tasks}
              projects={projects}
              onOpenCreateTask={(projId) => handleOpenCreate('task', projId)}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentView === 'notes' && (
            <NotesView
              notes={notes}
              experiments={experiments}
              projects={projects}
              onOpenCreateNote={() => handleOpenCreate('note')}
              onOpenCreateExperiment={() => setCreateModalType('experiment')}
              onDeleteNote={handleDeleteNote}
              onDeleteExperiment={handleDeleteExperiment}
            />
          )}

          {currentView === 'ideas' && (
            <IdeasView
              ideas={ideas}
              onOpenCreateIdea={() => handleOpenCreate('idea')}
              onConvertToProject={handleConvertToProject}
              onDeleteIdea={handleDeleteIdea}
            />
          )}

          {currentView === 'files' && (
            <FilesView
              files={files}
              projects={projects}
              onUploadFile={handleUploadFile}
              onDeleteFile={handleDeleteFile}
            />
          )}

          {currentView === 'analytics' && <AnalyticsView analytics={analytics} />}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(view, detailId) => {
          if (view === 'projects' && detailId) {
            setSelectedProjectId(detailId);
          }
          setCurrentView(view as NavView);
        }}
        onOpenCreate={(type) => handleOpenCreate(type)}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Record Creation Modal */}
      <CreateModals
        type={createModalType}
        projects={projects}
        preselectedProjectId={createModalProjectId}
        onClose={() => {
          setCreateModalType(null);
          setCreateModalProjectId(undefined);
        }}
        onSubmitProject={handleCreateProject}
        onSubmitTask={handleCreateTask}
        onSubmitInventory={handleCreateInventory}
        onSubmitNote={handleCreateNote}
        onSubmitPrint={handleCreatePrint}
        onSubmitCircuit={handleCreateCircuit}
        onSubmitCode={handleCreateCode}
        onSubmitIdea={handleCreateIdea}
        onSubmitExperiment={handleCreateExperiment}
      />

      {/* Project BOM Creation Modal */}
      <CreateBomModal
        isOpen={bomModalOpen}
        projectId={bomModalProjectId}
        inventory={inventory}
        onClose={() => setBomModalOpen(false)}
        onSubmit={handleCreateBomSubmit}
      />

      {/* Workshop Onboarding Tour Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onNavigate={(view) => {
          setSelectedProjectId(null);
          setCurrentView(view);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkshopApp />
    </AuthProvider>
  );
}
