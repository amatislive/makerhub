import React, { useState } from 'react';
import {
  X,
  FolderKanban,
  Cpu,
  CheckSquare,
  FileCode2,
  Printer,
  FileText,
  Lightbulb,
  Zap,
  FlaskConical
} from 'lucide-react';
import { Project, ProjectStatus, ComponentCategory, TaskPriority } from '../types';

export type CreateModalType =
  | 'project'
  | 'task'
  | 'inventory'
  | 'note'
  | 'print'
  | 'circuit'
  | 'code'
  | 'idea'
  | 'experiment'
  | null;

interface CreateModalsProps {
  type: CreateModalType;
  projects: Project[];
  preselectedProjectId?: string;
  onClose: () => void;
  onSubmitProject: (data: Partial<Project>) => void;
  onSubmitTask: (data: any) => void;
  onSubmitInventory: (data: any) => void;
  onSubmitNote: (data: any) => void;
  onSubmitPrint: (data: any) => void;
  onSubmitCircuit: (data: any) => void;
  onSubmitCode: (data: any) => void;
  onSubmitIdea: (data: any) => void;
  onSubmitExperiment: (data: any) => void;
}

export const CreateModals: React.FC<CreateModalsProps> = ({
  type,
  projects,
  preselectedProjectId,
  onClose,
  onSubmitProject,
  onSubmitTask,
  onSubmitInventory,
  onSubmitNote,
  onSubmitPrint,
  onSubmitCircuit,
  onSubmitCode,
  onSubmitIdea,
  onSubmitExperiment,
}) => {
  // Project form state
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('planning');
  const [projCategory, setProjCategory] = useState('Electronics');
  const [projTags, setProjTags] = useState('');
  const [projTargetDate, setProjTargetDate] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskProjectId, setTaskProjectId] = useState(preselectedProjectId || '');

  // Inventory form state
  const [invName, setInvName] = useState('');
  const [invCat, setInvCat] = useState<ComponentCategory>('microcontroller');
  const [invQty, setInvQty] = useState(1);
  const [invUnit, setInvUnit] = useState('pcs');
  const [invLoc, setInvLoc] = useState('');
  const [invMfr, setInvMfr] = useState('');
  const [invPartNo, setInvPartNo] = useState('');
  const [invCost, setInvCost] = useState('');
  const [invMinStock, setInvMinStock] = useState('');
  const [invDatasheet, setInvDatasheet] = useState('');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteProjectId, setNoteProjectId] = useState(preselectedProjectId || '');
  const [noteTags, setNoteTags] = useState('');

  // Print form state
  const [printModel, setPrintModel] = useState('');
  const [printPrinter, setPrintPrinter] = useState('Prusa MK4 / Ender 3');
  const [printMaterial, setPrintMaterial] = useState('PLA');
  const [printDuration, setPrintDuration] = useState('');
  const [printFilament, setPrintFilament] = useState('');
  const [printProjectId, setPrintProjectId] = useState(preselectedProjectId || '');

  // Circuit form state
  const [circName, setCircName] = useState('');
  const [circDesc, setCircDesc] = useState('');
  const [circMcu, setCircMcu] = useState('ESP32 DevKit V1');
  const [circPower, setCircPower] = useState('5V USB / 3.3V LDO');
  const [circProjectId, setCircProjectId] = useState(preselectedProjectId || '');

  // Code form state
  const [codeName, setCodeName] = useState('');
  const [codeLang, setCodeLang] = useState('cpp');
  const [codeContent, setCodeContent] = useState('// Embedded firmware code\n\nvoid setup() {\n  // initialize\n}\n\nvoid loop() {\n  // main cycle\n}');
  const [codeProjectId, setCodeProjectId] = useState(preselectedProjectId || '');

  // Idea form state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaTags, setIdeaTags] = useState('');

  // Experiment form state
  const [expTitle, setExpTitle] = useState('');
  const [expObj, setExpObj] = useState('');
  const [expHyp, setExpHyp] = useState('');
  const [expProc, setExpProc] = useState('');
  const [expProjectId, setExpProjectId] = useState(preselectedProjectId || '');

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'project') {
      onSubmitProject({
        name: projName,
        description: projDesc,
        status: projStatus,
        category: projCategory,
        tags: projTags ? projTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        targetDate: projTargetDate || undefined,
        visibility: 'private',
      });
    } else if (type === 'task') {
      onSubmitTask({
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        projectId: taskProjectId || undefined,
        status: 'todo',
      });
    } else if (type === 'inventory') {
      onSubmitInventory({
        name: invName,
        category: invCat,
        quantity: Number(invQty) || 1,
        unit: invUnit,
        storageLocation: invLoc || undefined,
        manufacturer: invMfr || undefined,
        partNumber: invPartNo || undefined,
        purchaseCost: invCost ? parseFloat(invCost) : null,
        minStockLevel: invMinStock ? parseInt(invMinStock) : null,
        datasheetUrl: invDatasheet || undefined,
      });
    } else if (type === 'note') {
      onSubmitNote({
        title: noteTitle,
        content: noteContent,
        projectId: noteProjectId || undefined,
        tags: noteTags ? noteTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
    } else if (type === 'print') {
      onSubmitPrint({
        modelName: printModel,
        printer: printPrinter,
        material: printMaterial,
        printDurationMinutes: printDuration ? parseInt(printDuration) : null,
        filamentUsageGrams: printFilament ? parseFloat(printFilament) : null,
        projectId: printProjectId || undefined,
        status: 'queued',
      });
    } else if (type === 'circuit') {
      onSubmitCircuit({
        name: circName,
        description: circDesc,
        boardMcu: circMcu,
        powerRequirements: circPower,
        projectId: circProjectId || undefined,
        pins: [],
      });
    } else if (type === 'code') {
      onSubmitCode({
        name: codeName,
        language: codeLang,
        content: codeContent,
        projectId: codeProjectId || undefined,
      });
    } else if (type === 'idea') {
      onSubmitIdea({
        title: ideaTitle,
        description: ideaDesc,
        tags: ideaTags ? ideaTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        status: 'new',
      });
    } else if (type === 'experiment') {
      onSubmitExperiment({
        title: expTitle,
        objective: expObj,
        hypothesis: expHyp,
        procedure: expProc,
        materials: [],
        results: '',
        observations: '',
        conclusion: '',
        projectId: expProjectId || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#fe5029]/10 text-[#fe5029] flex items-center justify-center">
              {type === 'project' && <FolderKanban className="w-4 h-4" />}
              {type === 'task' && <CheckSquare className="w-4 h-4" />}
              {type === 'inventory' && <Cpu className="w-4 h-4" />}
              {type === 'note' && <FileText className="w-4 h-4" />}
              {type === 'print' && <Printer className="w-4 h-4" />}
              {type === 'circuit' && <Zap className="w-4 h-4" />}
              {type === 'code' && <FileCode2 className="w-4 h-4" />}
              {type === 'idea' && <Lightbulb className="w-4 h-4" />}
              {type === 'experiment' && <FlaskConical className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-neutral-900 capitalize">
              {type === 'code' ? 'New Firmware / Code File' : `Create ${type}`}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* PROJECT FIELDS */}
          {type === 'project' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quadruped Robot Mk1"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Goals, target hardware architecture, mechanics, and design intentions..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                    className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="idea">Idea</option>
                    <option value="planning">Planning</option>
                    <option value="sourcing">Sourcing</option>
                    <option value="building">Building</option>
                    <option value="testing">Testing</option>
                    <option value="documenting">Documenting</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Robotics, IoT, Audio, CNC..."
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="esp32, lidar, 3d-print"
                    value={projTags}
                    onChange={(e) => setProjTags(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={projTargetDate}
                    onChange={(e) => setProjTargetDate(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>
            </>
          )}

          {/* TASK FIELDS */}
          {type === 'task' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solder motor driver headers"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific details, pin numbers, or verification criteria..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                {projects.length > 0 && (
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Assign to Project</label>
                    <select
                      value={taskProjectId}
                      onChange={(e) => setTaskProjectId(e.target.value)}
                      className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                    >
                      <option value="">None (Standalone)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {/* INVENTORY FIELDS */}
          {type === 'inventory' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Component Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raspberry Pi Pico W"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Category</label>
                  <select
                    value={invCat}
                    onChange={(e) => setInvCat(e.target.value as ComponentCategory)}
                    className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="microcontroller">Microcontroller</option>
                    <option value="dev_board">Dev Board</option>
                    <option value="sensor">Sensor</option>
                    <option value="resistor">Resistor</option>
                    <option value="capacitor">Capacitor</option>
                    <option value="motor">Motor / Servo</option>
                    <option value="display">Display / Screen</option>
                    <option value="connector">Connector</option>
                    <option value="wire">Wire / Cable</option>
                    <option value="filament">Filament / Resin</option>
                    <option value="tool">Workshop Tool</option>
                    <option value="custom">Custom Part</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Quantity & Unit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      required
                      value={invQty}
                      onChange={(e) => setInvQty(parseInt(e.target.value) || 0)}
                      className="w-24 p-2 border border-neutral-200 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="pcs, m, g"
                      value={invUnit}
                      onChange={(e) => setInvUnit(e.target.value)}
                      className="flex-1 p-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Storage Location</label>
                  <input
                    type="text"
                    placeholder="Bin A4, Drawer 2"
                    value={invLoc}
                    onChange={(e) => setInvLoc(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty if not entered"
                    value={invCost}
                    onChange={(e) => setInvCost(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Part Number / MPN</label>
                  <input
                    type="text"
                    placeholder="e.g. RP2040-PICO-W"
                    value={invPartNo}
                    onChange={(e) => setInvPartNo(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 2"
                    value={invMinStock}
                    onChange={(e) => setInvMinStock(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Datasheet URL / Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={invDatasheet}
                  onChange={(e) => setInvDatasheet(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg"
                />
              </div>
            </>
          )}

          {/* NOTE FIELDS */}
          {type === 'note' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Note Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. I2C Bus Pullup Calculations"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Content (Markdown supported)</label>
                <textarea
                  rows={6}
                  placeholder="Write testing observations, pinouts, wiring instructions..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg font-mono text-xs"
                />
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Project</label>
                  <select
                    value={noteProjectId}
                    onChange={(e) => setNoteProjectId(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">General Workshop Note</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* 3D PRINT FIELDS */}
          {type === 'print' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sensor Bracket V2"
                  value={printModel}
                  onChange={(e) => setPrintModel(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Printer</label>
                  <input
                    type="text"
                    value={printPrinter}
                    onChange={(e) => setPrintPrinter(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Material</label>
                  <input
                    type="text"
                    placeholder="PLA, PETG, ABS, TPU"
                    value={printMaterial}
                    onChange={(e) => setPrintMaterial(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Filament Used (Grams)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 42.5"
                    value={printFilament}
                    onChange={(e) => setPrintFilament(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Print Duration (Minutes)</label>
                  <input
                    type="number"
                    placeholder="e.g. 95"
                    value={printDuration}
                    onChange={(e) => setPrintDuration(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Project</label>
                  <select
                    value={printProjectId}
                    onChange={(e) => setPrintProjectId(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">General Print</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* CIRCUIT FIELDS */}
          {type === 'circuit' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Circuit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Controller & Power Rail"
                  value={circName}
                  onChange={(e) => setCircName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Microcontroller / Board</label>
                  <input
                    type="text"
                    placeholder="ESP32, RP2040, Arduino Uno"
                    value={circMcu}
                    onChange={(e) => setCircMcu(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Power Requirements</label>
                  <input
                    type="text"
                    placeholder="3.3V, 5V USB, 12V Battery"
                    value={circPower}
                    onChange={(e) => setCircPower(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Circuit topology, protection diodes, regulators..."
                  value={circDesc}
                  onChange={(e) => setCircDesc(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg"
                />
              </div>

              {projects.length > 0 && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Project</label>
                  <select
                    value={circProjectId}
                    onChange={(e) => setCircProjectId(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="">Standalone Circuit</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* CODE FILE FIELDS */}
          {type === 'code' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">File Name *</label>
                <input
                  type="text"
                  required
                  placeholder="main.ino, firmware.cpp, robot.py"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Language</label>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="cpp">C++ (.cpp / .ino)</option>
                    <option value="c">C (.c)</option>
                    <option value="python">Python / MicroPython (.py)</option>
                    <option value="rust">Rust (.rs)</option>
                    <option value="typescript">TypeScript (.ts)</option>
                    <option value="json">JSON (.json)</option>
                    <option value="yaml">YAML (.yaml)</option>
                  </select>
                </div>
                {projects.length > 0 && (
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Project</label>
                    <select
                      value={codeProjectId}
                      onChange={(e) => setCodeProjectId(e.target.value)}
                      className="w-full p-2 border border-neutral-200 rounded-lg bg-white"
                    >
                      <option value="">Standalone File</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {/* IDEA FIELDS */}
          {type === 'idea' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Idea Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar-powered weather station with LoRa"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Description / Concept</label>
                <textarea
                  rows={3}
                  placeholder="Initial spark, sensors needed, purpose, mechanical constraints..."
                  value={ideaDesc}
                  onChange={(e) => setIdeaDesc(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="solar, lora, esp32, outdoor"
                  value={ideaTags}
                  onChange={(e) => setIdeaTags(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg"
                />
              </div>
            </>
          )}

          {/* EXPERIMENT FIELDS */}
          {type === 'experiment' && (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Experiment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Low-Power Deep Sleep Current Benchmark"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full p-2.5 border border-neutral-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Objective</label>
                <input
                  type="text"
                  placeholder="Measure quiescent current draw with ADC disabled"
                  value={expObj}
                  onChange={(e) => setExpObj(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Hypothesis</label>
                <input
                  type="text"
                  placeholder="Current should drop below 15 microamps in deep sleep"
                  value={expHyp}
                  onChange={(e) => setExpHyp(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Procedure</label>
                <textarea
                  rows={3}
                  placeholder="1. Wire multimeter in series with 3.3V rail... 2. Flash sleep script..."
                  value={expProc}
                  onChange={(e) => setExpProc(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg"
                />
              </div>
            </>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#fe5029] text-white hover:bg-[#e4421d] shadow-xs"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
