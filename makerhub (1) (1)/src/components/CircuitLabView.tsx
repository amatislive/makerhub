import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, Circuit } from '../types';
import {
  PlacedComponent,
  WireConnection,
  SimulationOutput,
  AiCircuitReview,
  AnalysisMode,
  BreadboardHole,
  BreadboardSize,
} from '../types/circuit';
import {
  generateBreadboardHoles,
  CatalogItem,
  createComponentPins,
  BREADBOARD_WIDTH,
  BREADBOARD_HEIGHT,
  BREADBOARD_ORIGIN_X,
  BREADBOARD_ORIGIN_Y,
} from '../utils/breadboardModel';
import {
  buildCircuitGraph,
  runMnaSimulation,
  CircuitGraph,
} from '../utils/spiceEngine';
import { ComponentPalette } from './circuit/ComponentPalette';
import { BreadboardCanvas } from './circuit/BreadboardCanvas';
import { SchematicCanvas } from './circuit/SchematicCanvas';
import { ComponentSvg } from './circuit/ComponentSvg';
import { WireSvg } from './circuit/WireSvg';
import { SimulationInspector } from './circuit/SimulationInspector';
import { AiOverviewPanel } from './circuit/AiOverviewPanel';
import { ComponentProperties } from './circuit/ComponentProperties';
import { InstrumentBench } from './circuit/InstrumentBench';
import { CircuitBomModal } from './circuit/CircuitBomModal';
import { CircuitDocModal } from './circuit/CircuitDocModal';
import { EmptyState } from './EmptyState';
import { api } from '../api';
import {
  Play,
  RotateCw,
  Trash2,
  Save,
  Download,
  Upload,
  Cpu,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  FolderKanban,
  CheckCircle2,
  Sliders,
  Scissors,
  Layers,
  FileText,
  Undo2,
  Redo2,
  Eye,
  Radio,
  Grid,
  Search,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Package
} from 'lucide-react';

interface CircuitLabViewProps {
  circuits: Circuit[];
  projects: Project[];
  inventoryItems?: Array<{ id: string; name: string; quantity: number; location?: string }>;
  onOpenCreateCircuit: (projectId?: string) => void;
  onUpdateCircuit: (id: string, data: Partial<Circuit>) => Promise<void>;
  onDeleteCircuit: (id: string) => Promise<void>;
}

interface HistoryState {
  components: PlacedComponent[];
  wires: WireConnection[];
}

export const CircuitLabView: React.FC<CircuitLabViewProps> = ({
  circuits,
  projects,
  inventoryItems = [],
  onOpenCreateCircuit,
  onUpdateCircuit,
  onDeleteCircuit,
}) => {
  // Active selected circuit record
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(
    circuits.length > 0 ? circuits[0].id : null
  );

  const activeCircuit = circuits.find((c) => c.id === selectedCircuitId) || null;

  // View Modes: 'breadboard' (physical breadboard) vs 'schematic' (engineering schematic)
  const [viewMode, setViewMode] = useState<'breadboard' | 'schematic'>('breadboard');
  const [breadboardSize, setBreadboardSize] = useState<BreadboardSize>('half');

  // Circuit Workbench state
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<WireConnection[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [highlightNetId, setHighlightNetId] = useState<string | null>(null);

  // Undo / Redo History Stack
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  // Push state to undo history
  const recordHistory = useCallback((newComps: PlacedComponent[], newWires: WireConnection[]) => {
    setUndoStack((prev) => [...prev.slice(-30), { components, wires }]);
    setRedoStack([]);
  }, [components, wires]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, { components, wires }]);
    setComponents(previous.components);
    setWires(previous.wires);
  }, [undoStack, components, wires]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, { components, wires }]);
    setComponents(next.components);
    setWires(next.wires);
  }, [redoStack, components, wires]);

  // Sliding Panels Visibility States
  const [isPartBinOpen, setIsPartBinOpen] = useState(true);
  const [isSpiceDataOpen, setIsSpiceDataOpen] = useState(true);
  const [isBenchOpen, setIsBenchOpen] = useState(true);

  // Canvas Zoom & Pan State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(3.0, Number((prev + 0.15).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(0.35, Number((prev - 0.15).toFixed(2))));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard Shortcuts: Ctrl+Z / Ctrl+Y, [, ], \, +, -, 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger panel shortcuts if user is typing in an input/textarea/select
      const target = e.target as HTMLElement | null;
      const isInput = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        handleRedo();
      } else if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === '[') {
          setIsPartBinOpen((prev) => !prev);
        } else if (e.key === ']') {
          setIsSpiceDataOpen((prev) => !prev);
        } else if (e.key === '\\') {
          setIsBenchOpen((prev) => !prev);
        } else if (e.key === '+' || e.key === '=') {
          handleZoomIn();
        } else if (e.key === '-' || e.key === '_') {
          handleZoomOut();
        } else if (e.key === '0') {
          handleResetZoom();
        }
      }
    };

    const handleKeyStatus = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (isInput) return;
      if (e.code === 'Space') {
        if (e.type === 'keydown') setIsSpacePressed(true);
        if (e.type === 'keyup') setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleKeyStatus);
    window.addEventListener('keyup', handleKeyStatus);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleKeyStatus);
      window.removeEventListener('keyup', handleKeyStatus);
    };
  }, [handleUndo, handleRedo, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Modals
  const [isBomOpen, setIsBomOpen] = useState(false);
  const [isDocOpen, setIsDocOpen] = useState(false);

  // Wiring tool state
  const [wireColor, setWireColor] = useState<string>('#fe5029'); // Default Maker Orange
  const [wireStart, setWireStart] = useState<{
    componentId?: string;
    pinId?: string;
    holeId?: string;
    x: number;
    y: number;
  } | null>(null);

  // Simulation state
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('op');
  const [simulation, setSimulation] = useState<SimulationOutput | null>(null);
  const [simulating, setSimulating] = useState(false);

  // AI Overview state
  const [aiReview, setAiReview] = useState<AiCircuitReview | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Right sidebar tab: 'inspector' (SPICE results) or 'ai' (AI Overview)
  const [rightTab, setRightTab] = useState<'inspector' | 'ai'>('inspector');

  // SVG Canvas ref & drag state
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generate breadboard holes dynamically for chosen size
  const breadboardHoles = React.useMemo(() => generateBreadboardHoles(breadboardSize), [breadboardSize]);

  // Computed Circuit Graph
  const circuitGraph: CircuitGraph = React.useMemo(() => {
    return buildCircuitGraph(components, wires);
  }, [components, wires]);

  // When selected circuit changes, load its structured components and wires
  useEffect(() => {
    if (activeCircuit) {
      if (Array.isArray(activeCircuit.components)) {
        setComponents(activeCircuit.components);
      } else {
        setComponents([]);
      }

      if (Array.isArray(activeCircuit.wires)) {
        setWires(activeCircuit.wires);
      } else {
        setWires([]);
      }

      if (activeCircuit.simulationData) {
        setSimulation(activeCircuit.simulationData);
      } else {
        setSimulation(null);
      }
      setAiReview(null);
      setSelectedComponentId(null);
      setSelectedWireId(null);
      setUndoStack([]);
      setRedoStack([]);
    } else {
      setComponents([]);
      setWires([]);
      setSimulation(null);
      setAiReview(null);
    }
  }, [activeCircuit?.id]);

  // Keep selectedCircuitId valid
  useEffect(() => {
    if (!selectedCircuitId && circuits.length > 0) {
      setSelectedCircuitId(circuits[0].id);
    } else if (selectedCircuitId && !circuits.some((c) => c.id === selectedCircuitId)) {
      setSelectedCircuitId(circuits.length > 0 ? circuits[0].id : null);
    }
  }, [circuits, selectedCircuitId]);

  // Save current workbench layout back to database
  const handleSaveCircuit = async () => {
    if (!activeCircuit) return;
    try {
      await onUpdateCircuit(activeCircuit.id, {
        components,
        wires,
        simulationData: simulation,
      });
    } catch (err) {
      console.error('Failed to save circuit layout:', err);
    }
  };

  // Add component to workbench
  const handleAddComponent = (item: CatalogItem) => {
    recordHistory(components, wires);
    const compId = crypto.randomUUID();
    const countOfType = components.filter((c) => c.type === item.type).length + 1;
    let prefix = 'U';
    if (item.type.startsWith('resistor')) prefix = 'R';
    else if (item.type.startsWith('capacitor')) prefix = 'C';
    else if (item.type.startsWith('inductor')) prefix = 'L';
    else if (item.type.startsWith('diode') || item.type.startsWith('zener')) prefix = 'D';
    else if (item.type.startsWith('led') || item.type === 'ir_emitter' || item.type === 'uv_led') prefix = 'LED';
    else if (item.type.startsWith('dc_source')) prefix = 'V';
    else if (item.type.startsWith('battery')) prefix = 'BAT';
    else if (item.type === 'ground') prefix = 'GND';
    else if (item.type === 'potentiometer') prefix = 'POT';
    else if (item.type.startsWith('pushbutton') || item.type.startsWith('spst') || item.type.startsWith('spdt')) prefix = 'SW';
    else if (item.type.startsWith('bjt') || item.type.startsWith('darlington')) prefix = 'Q';
    else if (item.type.startsWith('mosfet')) prefix = 'M';
    else if (item.type.startsWith('sensor')) prefix = 'SEN';
    else if (item.type.startsWith('ic_') || item.type.startsWith('uln') || item.type.startsWith('l293')) prefix = 'IC';
    else if (item.type.startsWith('regulator')) prefix = 'REG';
    else if (item.type.startsWith('module')) prefix = 'MOD';
    else if (item.type.includes('arduino') || item.type.includes('esp') || item.type.includes('pico') || item.type.includes('stm32')) prefix = 'MCU';

    const isBoard = item.category === 'boards' || item.type.includes('arduino') || item.type.includes('esp') || item.type.includes('pico') || item.type.includes('stm32');

    const newComp: PlacedComponent = {
      id: compId,
      type: item.type,
      category: item.category,
      name: `${prefix}${countOfType}`,
      value: item.defaultVal,
      unit: item.unit,
      x: isBoard ? 40 + (components.length % 3) * 50 : BREADBOARD_ORIGIN_X + 40 + (components.length % 5) * 40,
      y: isBoard ? 420 : BREADBOARD_ORIGIN_Y + 100 + (components.length % 3) * 30,
      rotation: 0,
      pins: createComponentPins(item.type, compId),
      spiceSupported: item.spiceSupported,
    };

    const updated = [...components, newComp];
    setComponents(updated);
    setSelectedComponentId(compId);
  };

  // Rotate component
  const handleRotate = (id: string) => {
    recordHistory(components, wires);
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c))
    );
  };

  // Delete component
  const handleDeleteComp = (id: string) => {
    recordHistory(components, wires);
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) =>
      prev.filter((w) => w.fromComponentId !== id && w.toComponentId !== id)
    );
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

  // Delete wire
  const handleDeleteWire = (id: string) => {
    recordHistory(components, wires);
    setWires((prev) => prev.filter((w) => w.id !== id));
    if (selectedWireId === id) setSelectedWireId(null);
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    if (window.confirm('Clear all components and wires from the current breadboard?')) {
      recordHistory(components, wires);
      setComponents([]);
      setWires([]);
      setSimulation(null);
      setAiReview(null);
    }
  };

  // Click on pin to start/end wire
  const handlePinClick = (pin: any, compId: string) => {
    if (!wireStart) {
      setWireStart({
        componentId: compId,
        pinId: pin.id,
        x: pin.x,
        y: pin.y,
      });
    } else {
      if (wireStart.componentId === compId && wireStart.pinId === pin.id) {
        setWireStart(null); // Cancel
        return;
      }
      recordHistory(components, wires);
      const newWire: WireConnection = {
        id: crypto.randomUUID(),
        fromComponentId: wireStart.componentId,
        fromPinId: wireStart.pinId,
        fromHoleId: wireStart.holeId,
        toComponentId: compId,
        toPinId: pin.id,
        color: wireColor,
      };
      setWires((prev) => [...prev, newWire]);
      setWireStart(null);
    }
  };

  // Click on breadboard hole to start/end wire or snap
  const handleHoleClick = (hole: BreadboardHole) => {
    if (!wireStart) {
      setWireStart({
        holeId: hole.id,
        x: hole.x,
        y: hole.y,
      });
    } else {
      if (wireStart.holeId === hole.id) {
        setWireStart(null);
        return;
      }
      recordHistory(components, wires);
      const newWire: WireConnection = {
        id: crypto.randomUUID(),
        fromComponentId: wireStart.componentId,
        fromPinId: wireStart.pinId,
        fromHoleId: wireStart.holeId,
        toHoleId: hole.id,
        color: wireColor,
      };
      setWires((prev) => [...prev, newWire]);
      setWireStart(null);
    }
  };

  // Dragging components on SVG canvas
  const handleMouseDownOnComp = (comp: PlacedComponent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedComponentId(comp.id);
    setSelectedWireId(null);
    setDraggingCompId(comp.id);

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setDragOffset({
        x: e.clientX - svgRect.left - comp.x,
        y: e.clientY - svgRect.top - comp.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingCompId || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(BREADBOARD_WIDTH + 80, e.clientX - svgRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(BREADBOARD_HEIGHT + 140, e.clientY - svgRect.top - dragOffset.y));

    // Snap to nearest 10px grid
    const snappedX = Math.round(newX / 10) * 10;
    const snappedY = Math.round(newY / 10) * 10;

    setComponents((prev) =>
      prev.map((c) => (c.id === draggingCompId ? { ...c, x: snappedX, y: snappedY } : c))
    );
  };

  const handleMouseUp = () => {
    if (draggingCompId) {
      setDraggingCompId(null);
    }
  };

  // Run SPICE Simulation Engine
  const handleRunSimulation = () => {
    setSimulating(true);
    try {
      const graph = buildCircuitGraph(components, wires);
      const result = runMnaSimulation(components, graph, analysisMode);
      setSimulation(result);
      setRightTab('inspector');
    } catch (err: any) {
      console.error('Simulation execution failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  // Request AI Review
  const handleRequestAiReview = async (customQuery?: string) => {
    if (!simulation) {
      handleRunSimulation();
    }
    setAiLoading(true);
    setRightTab('ai');
    try {
      const simToReview = simulation || runMnaSimulation(components, buildCircuitGraph(components, wires), analysisMode);
      const review = await api.ai.runCircuitReview({
        circuitName: activeCircuit?.name || 'Circuit Lab',
        boardMcu: activeCircuit?.boardMcu,
        components: components.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          value: c.value,
        })),
        wires: wires.map((w) => ({
          from: w.fromComponentId || w.fromHoleId,
          to: w.toComponentId || w.toHoleId,
          color: w.color,
        })),
        simulation: {
          mode: simToReview.mode,
          status: simToReview.status,
          nodeVoltages: simToReview.dc?.nodeVoltages || {},
          branchCurrents: simToReview.dc?.branchCurrents || {},
          componentPowers: simToReview.dc?.componentPowers || {},
          warnings: simToReview.warnings || [],
          errors: simToReview.errors || [],
          unsupportedComponents: simToReview.unsupportedComponents || [],
          netlistText: simToReview.netlistText,
        },
        userQuery: customQuery,
      });

      setAiReview(review);
    } catch (err: any) {
      console.error('AI Review failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI Fix action
  const handleApplyFix = (action: AiCircuitReview['suggestedAction']) => {
    if (!action || !action.componentId || !action.suggestedValue) return;
    recordHistory(components, wires);
    setComponents((prev) =>
      prev.map((c) =>
        c.id === action.componentId ? { ...c, value: action.suggestedValue! } : c
      )
    );
    // Re-simulate
    setTimeout(() => {
      handleRunSimulation();
    }, 100);
  };

  const selectedComp = components.find((c) => c.id === selectedComponentId) || null;

  // If user has zero circuits, show strict empty state
  if (circuits.length === 0) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <EmptyState
          icon={Cpu}
          title="ZERO CIRCUITS CONFIGURED"
          description="A new Circuit Lab workspace contains zero demo circuits. Create your first real circuit to start placing components on the interactive breadboard, running SPICE simulations, and reviewing with AI."
          accentColor="orange"
          badge="ZERO PRELOADED RECORDS"
          primaryAction={{
            label: 'CREATE NEW CIRCUIT',
            icon: Plus,
            onClick: () => onOpenCreateCircuit(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      {/* Top Workbench Main Toolbar */}
      <div className="h-12 border-b border-[#111111] bg-white px-3 flex items-center justify-between gap-2 z-20">
        {/* Left: Circuit Selector & Mode Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-display font-black text-sm text-[#111111]">
            <Cpu className="w-4 h-4 text-[#fe5029]" />
            <span className="hidden lg:inline">CIRCUIT_LAB //</span>
          </div>

          <select
            value={selectedCircuitId || ''}
            onChange={(e) => setSelectedCircuitId(e.target.value)}
            className="p-1 text-xs font-mono-tech font-bold border border-[#111111] bg-white text-[#111111] focus:outline-none"
          >
            {circuits.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.boardMcu ? `(${c.boardMcu})` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onOpenCreateCircuit()}
            title="Create New Circuit"
            className="p-1 border border-[#111111] bg-white hover:bg-[#eeeeee] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* View Mode Toggle: [BREADBOARD] / [SCHEMATIC] */}
          <div className="flex items-center border border-[#111111] bg-[#eeeeee] p-0.5 ml-2">
            <button
              type="button"
              onClick={() => setViewMode('breadboard')}
              className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase transition-all flex items-center gap-1 ${
                viewMode === 'breadboard'
                  ? 'bg-[#111111] text-white shadow-[1px_1px_0px_#111111]'
                  : 'text-[#111111]/70 hover:text-[#111111]'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>BREADBOARD</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('schematic')}
              className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase transition-all flex items-center gap-1 ${
                viewMode === 'schematic'
                  ? 'bg-[#111111] text-white shadow-[1px_1px_0px_#111111]'
                  : 'text-[#111111]/70 hover:text-[#111111]'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>SCHEMATIC</span>
            </button>
          </div>

          {/* Breadboard Size Toggle (Only when in breadboard view) */}
          {viewMode === 'breadboard' && (
            <select
              value={breadboardSize}
              onChange={(e) => setBreadboardSize(e.target.value as BreadboardSize)}
              className="p-1 text-[9px] font-mono-tech font-bold border border-[#111111] bg-white hidden xl:inline-block"
              title="Select Breadboard Size"
            >
              <option value="mini">MINI (170-PIN)</option>
              <option value="half">HALF-SIZE (400-PIN)</option>
              <option value="full">FULL-SIZE (830-PIN)</option>
            </select>
          )}
        </div>

        {/* Center: SPICE Engine Controls */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border border-[#111111] p-0.5 bg-white">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo (Ctrl+Z)"
              className="p-1 hover:bg-[#eeeeee] disabled:opacity-30 transition-colors"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Y)"
              className="p-1 hover:bg-[#eeeeee] disabled:opacity-30 transition-colors"
            >
              <Redo2 className="w-3 h-3" />
            </button>
          </div>

          {/* Analysis Mode Selector */}
          <div className="flex items-center border border-[#111111] bg-[#eeeeee] p-0.5">
            {(['op', 'transient', 'ac', 'sweep'] as AnalysisMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAnalysisMode(mode)}
                className={`px-2 py-0.5 text-[9px] font-mono-tech font-bold uppercase transition-all ${
                  analysisMode === mode
                    ? 'bg-[#111111] text-white shadow-[1px_1px_0px_#111111]'
                    : 'text-[#111111]/70 hover:text-[#111111]'
                }`}
              >
                {mode === 'op' ? 'DC OP' : mode}
              </button>
            ))}
          </div>

          {/* RUN SPICE Button */}
          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={simulating || components.length === 0}
            className="px-3 py-1 bg-[#fe5029] hover:bg-[#e4421d] disabled:opacity-40 text-white border border-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'SOLVING...' : 'RUN SPICE'}</span>
          </button>

          {/* AI REVIEW Button */}
          <button
            type="button"
            onClick={() => handleRequestAiReview()}
            disabled={aiLoading}
            className="px-3 py-1 bg-[#111111] hover:bg-[#333333] disabled:opacity-40 text-white border border-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Zap className={`w-3.5 h-3.5 text-[#f7e96e] ${aiLoading ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{aiLoading ? 'ANALYZING...' : 'AI REVIEW'}</span>
          </button>
        </div>

        {/* Right: Tools (BOM, Docs, Bench toggle, Save) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* BOM Report Button */}
          <button
            type="button"
            onClick={() => setIsBomOpen(true)}
            title="View Bill of Materials"
            className="px-2 py-1 border border-[#111111] bg-white hover:bg-[#eeeeee] text-[#111111] font-mono-tech text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#fe5029]" />
            <span className="hidden md:inline">BOM</span>
          </button>

          {/* Datasheet / Docs */}
          <button
            type="button"
            onClick={() => setIsDocOpen(true)}
            title="Generate Engineering Datasheet"
            className="px-2 py-1 border border-[#111111] bg-white hover:bg-[#eeeeee] text-[#111111] font-mono-tech text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">DOCS</span>
          </button>

          {/* Wire Color Switcher (in Breadboard mode) */}
          {viewMode === 'breadboard' && (
            <div className="flex items-center gap-1 border border-[#111111] p-1 bg-white">
              {[
                { color: '#fe5029', label: 'Orange / Power' },
                { color: '#111111', label: 'Black / GND' },
                { color: '#6ebdf7', label: 'Blue / Signal' },
                { color: '#75f76e', label: 'Green / Bus' },
                { color: '#f7e96e', label: 'Yellow / Clock' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setWireColor(c.color)}
                  title={c.label}
                  className={`w-3.5 h-3.5 border ${
                    wireColor === c.color ? 'border-[#111111] scale-125' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveCircuit}
            title="Save Circuit State"
            className="px-2.5 py-1 border border-[#111111] bg-white hover:bg-[#eeeeee] text-[#111111] font-mono-tech text-xs font-bold flex items-center gap-1 transition-colors shadow-[1px_1px_0px_#111111]"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SAVE</span>
          </button>

          {/* Clear Workspace */}
          <button
            type="button"
            onClick={handleClearWorkspace}
            title="Clear Workspace"
            className="p-1 border border-[#111111] bg-white hover:bg-red-50 text-red-600 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Workspace with Sliding Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Component Part Bin (Slides Left to close, Right to open) */}
        <div
          className={`h-full overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
            isPartBinOpen
              ? 'w-64 sm:w-72 md:w-80 opacity-100 translate-x-0'
              : 'w-0 opacity-0 -translate-x-full pointer-events-none'
          }`}
        >
          <ComponentPalette
            onAddComponent={handleAddComponent}
            onClose={() => setIsPartBinOpen(false)}
          />
        </div>

        {/* Center: Canvas Workspace + Bottom Instrument Bench */}
        <div className="flex-1 h-full flex flex-col bg-[#fdfdfd] relative overflow-hidden">
          {/* Floating Slide-Back Tab: Left Part Bin */}
          {!isPartBinOpen && (
            <button
              type="button"
              onClick={() => setIsPartBinOpen(true)}
              title="Slide Right / Open Part Bin (Shortcut: [)"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-[#111111] hover:bg-[#fe5029] text-white py-3 px-1 border-y border-r border-[#111111] shadow-[2px_2px_0px_#fe5029] flex flex-col items-center gap-1.5 transition-all group"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#fe5029] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              <span className="font-mono-tech text-[9px] font-bold tracking-widest [writing-mode:vertical-lr] uppercase">
                PART BIN
              </span>
            </button>
          )}

          {/* Floating Slide-Back Tab: Right SPICE Data */}
          {!isSpiceDataOpen && (
            <button
              type="button"
              onClick={() => setIsSpiceDataOpen(true)}
              title="Slide Left / Open SPICE Data & AI Overview (Shortcut: ])"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-[#111111] hover:bg-[#fe5029] text-white py-3 px-1 border-y border-l border-[#111111] shadow-[-2px_2px_0px_#fe5029] flex flex-col items-center gap-1.5 transition-all group"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#fe5029] group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
              <span className="font-mono-tech text-[9px] font-bold tracking-widest [writing-mode:vertical-lr] uppercase">
                SPICE DATA
              </span>
            </button>
          )}

          {/* Floating Slide-Back Tab: Bottom Instrument Bench */}
          {!isBenchOpen && (
            <button
              type="button"
              onClick={() => setIsBenchOpen(true)}
              title="Slide Up / Open Virtual Instrument Bench (Shortcut: \)"
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 bg-[#111111] hover:bg-[#222222] text-white px-4 py-1.5 border-t border-x border-[#111111] shadow-[0px_-2px_0px_#75f76e] font-mono-tech text-[10px] font-bold flex items-center gap-2 transition-all group"
            >
              <Radio className="w-3.5 h-3.5 text-[#75f76e]" />
              <span>VIRTUAL INSTRUMENT BENCH</span>
              <ChevronUp className="w-3.5 h-3.5 text-[#75f76e] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}

          {/* Status HUD Bar */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2 font-mono-tech text-[10px]">
            <span className="px-2 py-0.5 bg-white border border-[#111111] font-bold shadow-[1px_1px_0px_#111111]">
              PARTS: {components.length}
            </span>
            <span className="px-2 py-0.5 bg-white border border-[#111111] font-bold shadow-[1px_1px_0px_#111111]">
              WIRES: {wires.length}
            </span>
            <span className="px-2 py-0.5 bg-white border border-[#111111] font-bold shadow-[1px_1px_0px_#111111]">
              NETS: {circuitGraph.nets.length}
            </span>
            {wireStart && (
              <span className="px-2 py-0.5 bg-[#fe5029] text-white border border-[#111111] font-bold animate-pulse">
                WIRING ACTIVE // CLICK DESTINATION PIN/HOLE (OR CLICK TO CANCEL)
              </span>
            )}
          </div>

          {/* Active Canvas Mode View */}
          <div className="flex-1 overflow-auto circuit-grid relative">
            {viewMode === 'breadboard' ? (
              <div className="p-4 min-w-[900px] min-h-[550px]">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  viewBox="0 0 1100 780"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={() => {
                    setSelectedComponentId(null);
                    setSelectedWireId(null);
                    if (wireStart) setWireStart(null);
                  }}
                  className="select-none"
                >
                  {/* Breadboard Body and Sockets */}
                  <BreadboardCanvas
                    holes={breadboardHoles}
                    onHoleClick={handleHoleClick}
                    activeWiringHoleId={wireStart?.holeId}
                  />

                  {/* Placed Components Layer */}
                  {components.map((comp) => (
                    <ComponentSvg
                      key={comp.id}
                      component={comp}
                      isSelected={selectedComponentId === comp.id}
                      isSimHighlighted={aiReview?.highlightIds?.includes(comp.id)}
                      onSelect={(e) => handleMouseDownOnComp(comp, e)}
                      onPinClick={(pin) => handlePinClick(pin, comp.id)}
                      activePinId={wireStart?.componentId === comp.id ? wireStart.pinId : null}
                    />
                  ))}

                  {/* Jumper Wires Layer */}
                  {wires.map((wire) => (
                    <WireSvg
                      key={wire.id}
                      wire={wire}
                      components={components}
                      holes={breadboardHoles}
                      isSelected={selectedWireId === wire.id}
                      onSelect={(e) => {
                        setSelectedWireId(wire.id);
                        setSelectedComponentId(null);
                      }}
                    />
                  ))}
                </svg>
              </div>
            ) : (
              /* Synchronized Schematic View */
              <SchematicCanvas
                components={components}
                wires={wires}
                graph={circuitGraph}
                simulation={simulation}
                selectedComponentId={selectedComponentId}
                selectedWireId={selectedWireId}
                highlightNetId={highlightNetId}
                onSelectComponent={(id) => setSelectedComponentId(id)}
                onSelectWire={(id) => setSelectedWireId(id)}
                onSelectNet={(netId) => setHighlightNetId(netId)}
                onRotateComponent={handleRotate}
                onDeleteComponent={handleDeleteComp}
              />
            )}

            {/* Floating Selected Component Quick Toolbar / Properties */}
            {selectedComp && (
              <div className="absolute bottom-4 left-4 z-20 w-72">
                <ComponentProperties
                  component={selectedComp}
                  onUpdateComponent={(updated) => {
                    recordHistory(components, wires);
                    setComponents((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                  }}
                  onDeleteComponent={handleDeleteComp}
                  onRotateComponent={handleRotate}
                />
              </div>
            )}

            {/* Floating Selected Wire Action */}
            {selectedWireId && (
              <div className="absolute bottom-4 left-4 z-20 p-2 bg-white border border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center gap-2 font-mono-tech text-xs">
                <span className="font-bold">WIRE SELECTED</span>
                <button
                  type="button"
                  onClick={() => handleDeleteWire(selectedWireId)}
                  className="px-2 py-1 bg-red-600 text-white border border-[#111111] flex items-center gap-1 font-bold text-[10px]"
                >
                  <Trash2 className="w-3 h-3" />
                  DELETE WIRE
                </button>
              </div>
            )}
          </div>

          {/* Bottom Dockable Instrument Bench (Slides Down to close, Up to open) */}
          <div
            className={`w-full overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
              isBenchOpen
                ? 'opacity-100 translate-y-0'
                : 'h-0 max-h-0 opacity-0 translate-y-full pointer-events-none'
            }`}
          >
            <InstrumentBench
              components={components}
              wires={wires}
              graph={circuitGraph}
              simulation={simulation}
              boardMcu={activeCircuit?.boardMcu}
              onSelectNet={(netId) => setHighlightNetId(netId)}
              onClose={() => setIsBenchOpen(false)}
            />
          </div>
        </div>

        {/* Right Sidebar: SPICE Inspector & AI Overview (Slides Right to close, Left to open) */}
        <div
          className={`h-full border-l border-[#111111] flex flex-col bg-white overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
            isSpiceDataOpen
              ? 'w-80 sm:w-96 opacity-100 translate-x-0'
              : 'w-0 opacity-0 translate-x-full pointer-events-none border-l-0'
          }`}
        >
          {/* Tab Switcher with Collapse Button */}
          <div className="h-10 border-b border-[#111111] bg-white flex items-stretch">
            <button
              type="button"
              onClick={() => setRightTab('inspector')}
              className={`flex-1 flex items-center justify-center gap-1.5 font-mono-tech text-xs font-bold uppercase transition-colors ${
                rightTab === 'inspector'
                  ? 'bg-white text-[#111111] border-b-2 border-b-[#fe5029]'
                  : 'bg-[#eeeeee]/60 text-[#111111]/70 hover:text-[#111111]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#fe5029]" />
              <span>SPICE DATA</span>
            </button>

            <button
              type="button"
              onClick={() => setRightTab('ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 font-mono-tech text-xs font-bold uppercase transition-colors ${
                rightTab === 'ai'
                  ? 'bg-white text-[#111111] border-b-2 border-b-[#fe5029]'
                  : 'bg-[#eeeeee]/60 text-[#111111]/70 hover:text-[#111111]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#f7e96e]" />
              <span>AI OVERVIEW</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSpiceDataOpen(false)}
              title="Slide Right / Close SPICE Data"
              className="px-2.5 border-l border-[#111111] hover:bg-[#fe5029] hover:text-white text-[#111111] flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {rightTab === 'inspector' ? (
              <SimulationInspector
                simulation={simulation}
                components={components}
                onSelectComponent={(name) => {
                  const comp = components.find((c) => c.name === name);
                  if (comp) setSelectedComponentId(comp.id);
                }}
              />
            ) : (
              <AiOverviewPanel
                circuitName={activeCircuit?.name || 'Circuit'}
                simulation={simulation}
                aiReview={aiReview}
                loading={aiLoading}
                onRequestReview={handleRequestAiReview}
                onApplyFix={handleApplyFix}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bill of Materials (BOM) Modal */}
      <CircuitBomModal
        isOpen={isBomOpen}
        onClose={() => setIsBomOpen(false)}
        components={components}
        inventoryItems={inventoryItems}
      />

      {/* Circuit Datasheet / Documentation Modal */}
      <CircuitDocModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
        circuitName={activeCircuit?.name || 'Circuit Workbench'}
        circuitDescription={activeCircuit?.description || ''}
        components={components}
        wires={wires}
        graph={circuitGraph}
        simulation={simulation}
      />
    </div>
  );
};
