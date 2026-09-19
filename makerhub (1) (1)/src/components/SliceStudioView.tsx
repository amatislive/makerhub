import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Layers,
  Sparkles,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Download,
  Send,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Gauge,
  Thermometer,
  ShieldCheck,
  Zap,
  Info,
  Box,
  FileCode,
  HardDrive,
  Flame,
  Droplets,
  HelpCircle,
  Check,
  Settings
} from 'lucide-react';
import {
  PrinterProfile,
  FilamentSpool,
  SliceSettings,
  SliceProject,
  SliceResult,
  PrintRecord,
  Project,
  PrintStatus
} from '../types';
import { BUILTIN_MODELS, ModelPreset, computeSlice } from '../utils/sliceEngine';
import { api } from '../api';

interface SliceStudioViewProps {
  printers: PrinterProfile[];
  spools: FilamentSpool[];
  sliceProjects: SliceProject[];
  prints: PrintRecord[];
  projects: Project[];
  onRefreshAll: () => void;
  onOpenCreatePrint: () => void;
  onUpdatePrint: (id: string, data: Partial<PrintRecord>) => void;
  onDeletePrint: (id: string) => void;
}

type SubTab = 'slicer' | 'printers' | 'spools' | 'history';
type CanvasMode = 'toolpath' | 'gcode' | 'plate';

export const SliceStudioView: React.FC<SliceStudioViewProps> = ({
  printers,
  spools,
  sliceProjects,
  prints,
  projects,
  onRefreshAll,
  onOpenCreatePrint,
  onUpdatePrint,
  onDeletePrint,
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('slicer');

  // --- Slicer State ---
  const [selectedModel, setSelectedModel] = useState<ModelPreset>(BUILTIN_MODELS[0]);
  const [modelScale, setModelScale] = useState<number>(1.0);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(
    printers[0]?.id || 'printer-bambu-x1c'
  );
  const [selectedSpoolId, setSelectedSpoolId] = useState<string>(
    spools[0]?.id || 'spool-polymaker-pla-black'
  );

  const [settings, setSettings] = useState<SliceSettings>({
    printerId: printers[0]?.id || 'printer-bambu-x1c',
    spoolId: spools[0]?.id || 'spool-polymaker-pla-black',
    layerHeightMm: 0.20,
    firstLayerHeightMm: 0.24,
    wallLoops: 3,
    topBottomLayers: 4,
    infillDensity: 20,
    infillPattern: 'gyroid',
    supportsEnabled: false,
    supportType: 'tree',
    supportThresholdAngle: 45,
    printSpeedMmS: 150,
    outerWallSpeedMmS: 60,
    infillSpeedMmS: 180,
    travelSpeedMmS: 350,
    nozzleTemp: 215,
    bedTemp: 60,
    brimEnabled: false,
    brimWidthMm: 5,
  });

  // Current slice calculation
  const [sliceResult, setSliceResult] = useState<SliceResult | null>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('toolpath');

  // AI Review state
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiReview, setAiReview] = useState<any | null>(null);
  const [aiUserQuery, setAiUserQuery] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);

  // Status notification
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Printer & Spool
  const currentPrinter = printers.find((p) => p.id === selectedPrinterId) || printers[0] || {
    id: 'default-printer',
    userId: 'default',
    name: 'Bambu Lab X1-Carbon',
    model: 'Bambu X1-Carbon',
    nozzleDiameterMm: 0.4,
    bedWidthMm: 256,
    bedDepthMm: 256,
    maxHeightMm: 256,
    bedType: 'PEI Textured' as const,
    status: 'idle' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const currentSpool = spools.find((s) => s.id === selectedSpoolId) || spools[0] || {
    id: 'default-spool',
    userId: 'default',
    name: 'Polymaker PolyLite Black',
    brand: 'Polymaker',
    materialType: 'PLA' as const,
    colorName: 'Black',
    colorHex: '#111111',
    densityGcm3: 1.24,
    initialWeightG: 1000,
    remainingWeightG: 820,
    diameterMm: 1.75,
    costPerKg: 22.0,
    recommendedNozzleTemp: 215,
    recommendedBedTemp: 60,
    isDry: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Perform initial or triggered slice
  const handleRunSlice = () => {
    try {
      const result = computeSlice(
        { name: selectedModel.name, dimensionsMm: selectedModel.dimensionsMm },
        settings,
        currentPrinter,
        currentSpool,
        modelScale
      );
      setSliceResult(result);
      setCurrentLayerIndex(Math.min(currentLayerIndex, result.layerCount));
      showMessage(`Slice computed: ${result.layerCount} layers (${result.filamentGrams}g, ~${Math.floor(result.estimatedTimeMinutes / 60)}h ${result.estimatedTimeMinutes % 60}m)`);
    } catch (err: any) {
      console.error('Slice calculation failed:', err);
      showMessage(`Slice error: ${err.message}`);
    }
  };

  // Run initial slice when model or printer changes
  useEffect(() => {
    handleRunSlice();
  }, [selectedModel.id, selectedPrinterId, selectedSpoolId, modelScale]);

  // Autoplay through layers
  useEffect(() => {
    let timer: any;
    if (isPlaying && sliceResult) {
      timer = setInterval(() => {
        setCurrentLayerIndex((prev) => {
          if (prev >= sliceResult.layerCount) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 1;
        });
      }, 140);
    }
    return () => clearInterval(timer);
  }, [isPlaying, sliceResult]);

  // Draw toolpath layer on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sliceResult) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Bed background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);

    // Bed millimeter grid
    const bedW = currentPrinter.bedWidthMm || 250;
    const bedD = currentPrinter.bedDepthMm || 250;
    const padding = 30;
    const renderW = width - padding * 2;
    const renderH = height - padding * 2;
    const scaleFactor = Math.min(renderW / bedW, renderH / bedD);

    const originX = padding + (renderW - bedW * scaleFactor) / 2;
    const originY = padding + (renderH - bedD * scaleFactor) / 2;

    // Draw Bed plate boundary
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(originX, originY, bedW * scaleFactor, bedD * scaleFactor);
    ctx.strokeRect(originX, originY, bedW * scaleFactor, bedD * scaleFactor);

    // Grid lines (every 20mm)
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.08)';
    ctx.lineWidth = 0.8;
    for (let gx = 0; gx <= bedW; gx += 20) {
      const px = originX + gx * scaleFactor;
      ctx.beginPath();
      ctx.moveTo(px, originY);
      ctx.lineTo(px, originY + bedD * scaleFactor);
      ctx.stroke();
    }
    for (let gy = 0; gy <= bedD; gy += 20) {
      const py = originY + gy * scaleFactor;
      ctx.beginPath();
      ctx.moveTo(originX, py);
      ctx.lineTo(originX + bedW * scaleFactor, py);
      ctx.stroke();
    }

    // Origin marker (0, 0)
    ctx.fillStyle = '#fe5029';
    ctx.beginPath();
    ctx.arc(originX, originY + bedD * scaleFactor, 4, 0, Math.PI * 2);
    ctx.fill();

    // Corner coordinates label
    ctx.font = '9px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText(`(0,0)`, originX + 6, originY + bedD * scaleFactor - 4);
    ctx.fillText(`${bedW}×${bedD}mm [${currentPrinter.bedType}]`, originX + 6, originY + 14);

    // Draw Toolpath segments of current layer
    const layer = sliceResult.layers[currentLayerIndex - 1];
    if (layer) {
      // Draw travel moves first (behind extrusions)
      layer.segments
        .filter((s) => s.type === 'travel')
        .forEach((seg) => {
          if (seg.points.length >= 2) {
            ctx.strokeStyle = 'rgba(110, 189, 247, 0.4)';
            ctx.lineWidth = 0.8;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            const p0 = toCanvas(seg.points[0].x, seg.points[0].y, originX, originY, scaleFactor, bedD);
            ctx.moveTo(p0.x, p0.y);
            for (let i = 1; i < seg.points.length; i++) {
              const pi = toCanvas(seg.points[i].x, seg.points[i].y, originX, originY, scaleFactor, bedD);
              ctx.lineTo(pi.x, pi.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });

      // Draw extrusion lines
      layer.segments
        .filter((s) => s.type !== 'travel')
        .forEach((seg) => {
          if (seg.points.length < 2) return;

          switch (seg.type) {
            case 'outer_wall':
              ctx.strokeStyle = '#fe5029'; // MAKEO primary accent orange
              ctx.lineWidth = 2.4;
              break;
            case 'inner_wall':
              ctx.strokeStyle = '#f7e96e'; // Amber/Yellow
              ctx.lineWidth = 2.0;
              break;
            case 'infill':
              ctx.strokeStyle = '#6ebdf7'; // Cyan/Blue
              ctx.lineWidth = 1.4;
              break;
            case 'support':
              ctx.strokeStyle = '#75f76e'; // Green
              ctx.lineWidth = 1.8;
              break;
            case 'brim':
              ctx.strokeStyle = '#c084fc'; // Purple
              ctx.lineWidth = 1.6;
              break;
            default:
              ctx.strokeStyle = '#111111';
              ctx.lineWidth = 1.5;
          }

          ctx.beginPath();
          const p0 = toCanvas(seg.points[0].x, seg.points[0].y, originX, originY, scaleFactor, bedD);
          ctx.moveTo(p0.x, p0.y);
          for (let i = 1; i < seg.points.length; i++) {
            const pi = toCanvas(seg.points[i].x, seg.points[i].y, originX, originY, scaleFactor, bedD);
            ctx.lineTo(pi.x, pi.y);
          }
          ctx.stroke();
        });
    }

    // Overlay Crosshair at center
    const cx = originX + (bedW / 2) * scaleFactor;
    const cy = originY + (bedD / 2) * scaleFactor;
    ctx.strokeStyle = 'rgba(254, 80, 41, 0.25)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();
  }, [sliceResult, currentLayerIndex, currentPrinter.id]);

  function toCanvas(
    x: number,
    y: number,
    ox: number,
    oy: number,
    scale: number,
    bedDepth: number
  ) {
    return {
      x: ox + x * scale,
      // Invert Y coordinate so 0 is front-left on build plate
      y: oy + (bedDepth - y) * scale,
    };
  }

  function showMessage(msg: string) {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  }

  // AI Review Trigger
  const handleTriggerAiReview = async () => {
    if (!sliceResult) return;
    setIsAnalyzingAi(true);
    setAiError(null);

    try {
      const response = await api.ai.runSliceReview({
        modelName: selectedModel.name,
        modelDimensions: {
          x: selectedModel.dimensionsMm.x * modelScale,
          y: selectedModel.dimensionsMm.y * modelScale,
          z: selectedModel.dimensionsMm.z * modelScale,
        },
        printer: {
          name: currentPrinter.name,
          model: currentPrinter.model,
          nozzleDiameterMm: currentPrinter.nozzleDiameterMm,
          bedWidthMm: currentPrinter.bedWidthMm,
          bedDepthMm: currentPrinter.bedDepthMm,
          maxHeightMm: currentPrinter.maxHeightMm,
          bedType: currentPrinter.bedType,
        },
        material: {
          name: currentSpool.name,
          materialType: currentSpool.materialType,
          densityGcm3: currentSpool.densityGcm3,
          recommendedNozzleTemp: currentSpool.recommendedNozzleTemp,
          recommendedBedTemp: currentSpool.recommendedBedTemp,
        },
        settings,
        sliceMetrics: {
          layerCount: sliceResult.layerCount,
          estimatedTimeMinutes: sliceResult.estimatedTimeMinutes,
          filamentGrams: sliceResult.filamentGrams,
          filamentMeters: sliceResult.filamentMeters,
        },
        userQuery: aiUserQuery.trim() || undefined,
      });

      setAiReview(response);
      showMessage('Slice AI Overview completed.');
    } catch (err: any) {
      console.error('Slice AI Review failed:', err);
      setAiError(err.message || 'AI review could not be completed. Check server logs.');
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // Apply 1-click suggested fix from AI
  const handleApplySuggestedFix = (fix: any) => {
    if (!fix.settingKey) return;
    const newSettings = { ...settings, [fix.settingKey]: fix.suggestedValue };
    setSettings(newSettings);

    // Re-compute slice immediately
    const updatedResult = computeSlice(
      { name: selectedModel.name, dimensionsMm: selectedModel.dimensionsMm },
      newSettings,
      currentPrinter,
      currentSpool,
      modelScale
    );
    setSliceResult(updatedResult);
    showMessage(`Applied fix: ${fix.label}. Re-sliced successfully.`);
  };

  // Download G-Code file
  const handleDownloadGcode = () => {
    if (!sliceResult?.gcodePreview) return;
    const blob = new Blob([sliceResult.gcodePreview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedModel.id}_${settings.layerHeightMm}mm_${currentPrinter.model.replace(/\s+/g, '_')}.gcode`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage('G-Code file downloaded.');
  };

  // Send to Print Queue
  const handleSendToQueue = async () => {
    if (!sliceResult) return;
    try {
      await api.prints.create({
        modelName: `${selectedModel.name} (${modelScale !== 1 ? `${Math.round(modelScale * 100)}%` : `${settings.layerHeightMm}mm`})`,
        printer: currentPrinter.name,
        material: `${currentSpool.materialType} (${currentSpool.colorName})`,
        printDurationMinutes: sliceResult.estimatedTimeMinutes,
        filamentUsageGrams: sliceResult.filamentGrams,
        status: 'queued',
        notes: `Sliced in MAKEO Slice Studio: ${sliceResult.layerCount} layers, ${settings.infillPattern} infill (${settings.infillDensity}%), ${settings.supportsEnabled ? 'supports enabled' : 'no supports'}.`,
      });
      onRefreshAll();
      showMessage('Job added to print queue.');
      setActiveTab('history');
    } catch (err: any) {
      console.error('Failed to queue print job:', err);
      showMessage(`Failed to queue job: ${err.message}`);
    }
  };

  // Save Slice Project Preset
  const handleSaveSliceProject = async () => {
    if (!sliceResult) return;
    try {
      await api.sliceProjects.create({
        name: `${selectedModel.name} - ${settings.layerHeightMm}mm`,
        modelType: selectedModel.id,
        modelDimensions: {
          x: selectedModel.dimensionsMm.x * modelScale,
          y: selectedModel.dimensionsMm.y * modelScale,
          z: selectedModel.dimensionsMm.z * modelScale,
        },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: modelScale,
        settings,
        sliceResult: {
          layerCount: sliceResult.layerCount,
          estimatedTimeMinutes: sliceResult.estimatedTimeMinutes,
          filamentGrams: sliceResult.filamentGrams,
          filamentMeters: sliceResult.filamentMeters,
          estimatedCost: sliceResult.estimatedCost,
          slicedAt: new Date().toISOString(),
        },
      });
      onRefreshAll();
      showMessage('Slice preset project saved.');
    } catch (err: any) {
      console.error('Failed to save slice project:', err);
      showMessage(`Save error: ${err.message}`);
    }
  };

  // Modal states for Printers and Spools
  const [isAddPrinterOpen, setIsAddPrinterOpen] = useState<boolean>(false);
  const [newPrinterName, setNewPrinterName] = useState<string>('');
  const [newPrinterModel, setNewPrinterModel] = useState<string>('Custom CoreXY');
  const [newPrinterNozzle, setNewPrinterNozzle] = useState<number>(0.4);
  const [newPrinterBedW, setNewPrinterBedW] = useState<number>(250);
  const [newPrinterBedD, setNewPrinterBedD] = useState<number>(250);
  const [newPrinterHeight, setNewPrinterHeight] = useState<number>(250);
  const [newPrinterBedType, setNewPrinterBedType] = useState<any>('PEI Textured');

  const [isAddSpoolOpen, setIsAddSpoolOpen] = useState<boolean>(false);
  const [newSpoolName, setNewSpoolName] = useState<string>('');
  const [newSpoolBrand, setNewSpoolBrand] = useState<string>('Polymaker');
  const [newSpoolType, setNewSpoolType] = useState<any>('PLA');
  const [newSpoolColorName, setNewSpoolColorName] = useState<string>('Signal Orange');
  const [newSpoolColorHex, setNewSpoolColorHex] = useState<string>('#fe5029');
  const [newSpoolWeight, setNewSpoolWeight] = useState<number>(1000);
  const [newSpoolCost, setNewSpoolCost] = useState<number>(22.0);

  const handleCreatePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName.trim()) return;
    try {
      await api.printers.create({
        name: newPrinterName.trim(),
        model: newPrinterModel.trim(),
        nozzleDiameterMm: Number(newPrinterNozzle),
        bedWidthMm: Number(newPrinterBedW),
        bedDepthMm: Number(newPrinterBedD),
        maxHeightMm: Number(newPrinterHeight),
        bedType: newPrinterBedType,
        status: 'idle',
      });
      setIsAddPrinterOpen(false);
      setNewPrinterName('');
      onRefreshAll();
      showMessage('New 3D printer added to fleet.');
    } catch (err: any) {
      console.error('Failed to create printer:', err);
    }
  };

  const handleCreateSpool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpoolName.trim()) return;
    try {
      await api.spools.create({
        name: newSpoolName.trim(),
        brand: newSpoolBrand.trim(),
        materialType: newSpoolType,
        colorName: newSpoolColorName.trim(),
        colorHex: newSpoolColorHex,
        initialWeightG: Number(newSpoolWeight),
        remainingWeightG: Number(newSpoolWeight),
        costPerKg: Number(newSpoolCost),
        diameterMm: 1.75,
        densityGcm3: newSpoolType === 'PLA' ? 1.24 : newSpoolType === 'PETG' ? 1.27 : 1.05,
        recommendedNozzleTemp: newSpoolType === 'PLA' ? 210 : newSpoolType === 'PETG' ? 240 : 255,
        recommendedBedTemp: newSpoolType === 'PLA' ? 60 : newSpoolType === 'PETG' ? 75 : 100,
        isDry: true,
      });
      setIsAddSpoolOpen(false);
      setNewSpoolName('');
      onRefreshAll();
      showMessage('Filament spool added to inventory.');
    } catch (err: any) {
      console.error('Failed to create spool:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Top Header / Sub-Nav */}
      <div className="bg-white border-b border-[#111111] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#111111] bg-[#fe5029] flex items-center justify-center text-white shadow-[2px_2px_0px_#111111]">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-base sm:text-lg text-[#111111] tracking-tight">
                MAKEO SLICE STUDIO
              </h1>
              <span className="tech-tag bg-[#75f76e]/20 text-[#111111] border-[#111111]">
                v2.0 KINEMATICS
              </span>
            </div>
            <p className="font-mono-tech text-[10px] text-neutral-500 uppercase tracking-wider">
              Additive Manufacturing Workbench • Toolpaths • G-Code • Thermal Analysis
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-[#eeeeee] p-1 border border-[#111111] text-xs font-mono-tech">
          <button
            type="button"
            onClick={() => setActiveTab('slicer')}
            className={`px-3 py-1.5 font-bold transition-all ${
              activeTab === 'slicer'
                ? 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] border border-[#111111]'
                : 'text-neutral-600 hover:text-[#111111]'
            }`}
          >
            SLICE WORKBENCH
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('printers')}
            className={`px-3 py-1.5 font-bold transition-all ${
              activeTab === 'printers'
                ? 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] border border-[#111111]'
                : 'text-neutral-600 hover:text-[#111111]'
            }`}
          >
            FLEET ({printers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spools')}
            className={`px-3 py-1.5 font-bold transition-all ${
              activeTab === 'spools'
                ? 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] border border-[#111111]'
                : 'text-neutral-600 hover:text-[#111111]'
            }`}
          >
            SPOOL VAULT ({spools.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] border border-[#111111]'
                : 'text-neutral-600 hover:text-[#111111]'
            }`}
          >
            PRINT LOGS ({prints.length})
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div className="bg-[#111111] text-white font-mono-tech text-xs px-4 py-1.5 flex items-center justify-between border-b border-[#fe5029]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#75f76e] animate-ping" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'slicer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            {/* Left Parameter Panel (3 cols) */}
            <div className="lg:col-span-3 border-r border-[#111111] bg-white overflow-y-auto p-4 space-y-5">
              {/* Target Printer & Material Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-[#fe5029]" />
                    Target Hardware
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('printers')}
                    className="text-[10px] font-mono-tech text-neutral-500 hover:text-[#fe5029] underline"
                  >
                    Edit Fleet
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-mono-tech text-neutral-500 mb-1">
                      3D Printer Profile
                    </label>
                    <select
                      value={selectedPrinterId}
                      onChange={(e) => setSelectedPrinterId(e.target.value)}
                      className="w-full text-xs font-mono-tech p-2 border border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-hidden"
                    >
                      {printers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.bedWidthMm}×{p.bedDepthMm}mm, {p.nozzleDiameterMm}mm)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-tech text-neutral-500 mb-1">
                      Active Spool Material
                    </label>
                    <select
                      value={selectedSpoolId}
                      onChange={(e) => {
                        setSelectedSpoolId(e.target.value);
                        const s = spools.find((sp) => sp.id === e.target.value);
                        if (s) {
                          setSettings((prev) => ({
                            ...prev,
                            spoolId: s.id,
                            nozzleTemp: s.recommendedNozzleTemp,
                            bedTemp: s.recommendedBedTemp,
                          }));
                        }
                      }}
                      className="w-full text-xs font-mono-tech p-2 border border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_#111111] focus:outline-hidden"
                    >
                      {spools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.materialType} • {s.remainingWeightG}g left)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Model Geometry Selector */}
              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-[#fe5029]" />
                  Model Geometry
                </span>

                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-1.5">
                    {BUILTIN_MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m)}
                        className={`text-left p-2 border text-xs font-mono-tech transition-all flex items-center justify-between ${
                          selectedModel.id === m.id
                            ? 'border-[#111111] bg-[#fe5029]/10 font-bold shadow-[2px_2px_0px_#111111]'
                            : 'border-neutral-200 hover:border-[#111111] bg-white'
                        }`}
                      >
                        <span className="truncate pr-2">{m.name}</span>
                        <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                          {m.dimensionsMm.x}×{m.dimensionsMm.y}×{m.dimensionsMm.z}mm
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Scale Factor */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-mono-tech mb-1">
                      <span>Scale Factor</span>
                      <span className="font-bold">{Math.round(modelScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={modelScale}
                      onChange={(e) => setModelScale(parseFloat(e.target.value))}
                      className="w-full accent-[#fe5029]"
                    />
                  </div>
                </div>
              </div>

              {/* Slicer Settings Parameters */}
              <div className="space-y-4 pt-3 border-t border-neutral-200">
                <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#fe5029]" />
                  Print Parameters
                </span>

                {/* Layer Height */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono-tech">
                    <span>Layer Height</span>
                    <span className="font-bold text-[#fe5029]">{settings.layerHeightMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0.08"
                    max="0.28"
                    step="0.04"
                    value={settings.layerHeightMm}
                    onChange={(e) =>
                      setSettings({ ...settings, layerHeightMm: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#fe5029]"
                  />
                  <div className="flex justify-between text-[9px] font-mono-tech text-neutral-400">
                    <span>0.08mm (Ultra)</span>
                    <span>0.20mm (Std)</span>
                    <span>0.28mm (Draft)</span>
                  </div>
                </div>

                {/* Shells: Wall Loops */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono-tech text-neutral-500 mb-1">
                      Wall Loops
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={settings.wallLoops}
                      onChange={(e) =>
                        setSettings({ ...settings, wallLoops: parseInt(e.target.value) || 2 })
                      }
                      className="w-full text-xs font-mono-tech p-1.5 border border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-tech text-neutral-500 mb-1">
                      Top/Bottom Layers
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="8"
                      value={settings.topBottomLayers}
                      onChange={(e) =>
                        setSettings({ ...settings, topBottomLayers: parseInt(e.target.value) || 3 })
                      }
                      className="w-full text-xs font-mono-tech p-1.5 border border-[#111111]"
                    />
                  </div>
                </div>

                {/* Infill */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono-tech">
                    <span>Infill Density</span>
                    <span className="font-bold">{settings.infillDensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={settings.infillDensity}
                    onChange={(e) =>
                      setSettings({ ...settings, infillDensity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-[#fe5029]"
                  />

                  <div>
                    <label className="block text-[10px] font-mono-tech text-neutral-500 mb-1">
                      Infill Pattern
                    </label>
                    <select
                      value={settings.infillPattern}
                      onChange={(e) =>
                        setSettings({ ...settings, infillPattern: e.target.value as any })
                      }
                      className="w-full text-xs font-mono-tech p-1.5 border border-[#111111] bg-white"
                    >
                      <option value="gyroid">Gyroid (Isotropic & Rigid)</option>
                      <option value="grid">Grid (High Speed Orthogonal)</option>
                      <option value="honeycomb">Honeycomb (Aviation Strength)</option>
                      <option value="rectilinear">Rectilinear (Quick Skin)</option>
                      <option value="concentric">Concentric (Radial Flow)</option>
                    </select>
                  </div>
                </div>

                {/* Supports & Adhesion */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.supportsEnabled}
                      onChange={(e) =>
                        setSettings({ ...settings, supportsEnabled: e.target.checked })
                      }
                      className="w-3.5 h-3.5 accent-[#fe5029]"
                    />
                    <span className="text-xs font-mono-tech font-bold text-[#111111]">
                      Enable Overhang Supports
                    </span>
                  </label>

                  {settings.supportsEnabled && (
                    <div className="pl-5 space-y-1.5 text-xs font-mono-tech">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500">Type:</span>
                        <select
                          value={settings.supportType}
                          onChange={(e) =>
                            setSettings({ ...settings, supportType: e.target.value as any })
                          }
                          className="border border-[#111111] p-1 text-[11px] bg-white"
                        >
                          <option value="tree">Organic Tree</option>
                          <option value="normal">Snug Normal</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span>Threshold Angle:</span>
                        <span>{settings.supportThresholdAngle}°</span>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={settings.brimEnabled}
                      onChange={(e) =>
                        setSettings({ ...settings, brimEnabled: e.target.checked })
                      }
                      className="w-3.5 h-3.5 accent-[#fe5029]"
                    />
                    <span className="text-xs font-mono-tech font-bold text-[#111111]">
                      Enable First Layer Brim
                    </span>
                  </label>
                </div>

                {/* Temperatures & Speeds */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
                  <div>
                    <label className="block text-[10px] font-mono-tech text-neutral-500 mb-1">
                      Nozzle Temp (°C)
                    </label>
                    <input
                      type="number"
                      value={settings.nozzleTemp}
                      onChange={(e) =>
                        setSettings({ ...settings, nozzleTemp: parseInt(e.target.value) || 200 })
                      }
                      className="w-full text-xs font-mono-tech p-1.5 border border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-tech text-neutral-500 mb-1">
                      Bed Temp (°C)
                    </label>
                    <input
                      type="number"
                      value={settings.bedTemp}
                      onChange={(e) =>
                        setSettings({ ...settings, bedTemp: parseInt(e.target.value) || 60 })
                      }
                      className="w-full text-xs font-mono-tech p-1.5 border border-[#111111]"
                    />
                  </div>
                </div>

                {/* SLICE ACTION BUTTON */}
                <button
                  type="button"
                  onClick={handleRunSlice}
                  className="w-full py-2.5 bg-[#fe5029] text-white font-mono-tech font-bold text-xs uppercase tracking-wider border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>RE-SLICE MODEL</span>
                </button>
              </div>
            </div>

            {/* Center Canvas / Slicer Workspace (6 cols) */}
            <div className="lg:col-span-6 flex flex-col h-full bg-[#f4f4f4] border-r border-[#111111]">
              {/* Workspace Top Bar */}
              <div className="bg-white border-b border-[#111111] p-2 px-3 flex items-center justify-between text-xs font-mono-tech shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCanvasMode('toolpath')}
                    className={`px-2.5 py-1 border transition-all ${
                      canvasMode === 'toolpath'
                        ? 'border-[#111111] bg-[#fe5029] text-white font-bold'
                        : 'border-neutral-200 hover:border-[#111111] text-neutral-700'
                    }`}
                  >
                    Toolpaths (2D)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCanvasMode('gcode')}
                    className={`px-2.5 py-1 border transition-all ${
                      canvasMode === 'gcode'
                        ? 'border-[#111111] bg-[#111111] text-white font-bold'
                        : 'border-neutral-200 hover:border-[#111111] text-neutral-700'
                    }`}
                  >
                    G-Code Output
                  </button>
                </div>

                {/* Slicer HUD Telemetry */}
                {sliceResult && (
                  <div className="hidden sm:flex items-center gap-3 text-[11px]">
                    <span className="text-neutral-500">
                      Time: <strong className="text-[#111111]">{Math.floor(sliceResult.estimatedTimeMinutes / 60)}h {sliceResult.estimatedTimeMinutes % 60}m</strong>
                    </span>
                    <span className="text-neutral-500">
                      Mass: <strong className="text-[#fe5029]">{sliceResult.filamentGrams}g</strong>
                    </span>
                    <span className="text-neutral-500">
                      Cost: <strong className="text-emerald-700">${sliceResult.estimatedCost}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Main Visualizer Area */}
              <div className="flex-1 relative overflow-hidden flex items-center justify-center p-3">
                {canvasMode === 'toolpath' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={520}
                      className="border border-[#111111] shadow-[3px_3px_0px_#111111] bg-white max-w-full max-h-full aspect-square object-contain"
                    />

                    {/* Color Legend Badge */}
                    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-xs border border-[#111111] p-2 text-[10px] font-mono-tech space-y-1 shadow-[2px_2px_0px_#111111]">
                      <div className="font-bold border-b border-neutral-200 pb-0.5">TOOLPATH LEGEND</div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#fe5029] inline-block" />
                        <span>Outer Wall</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#f7e96e] inline-block" />
                        <span>Inner Perimeters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#6ebdf7] inline-block" />
                        <span>Infill ({settings.infillPattern})</span>
                      </div>
                      {settings.supportsEnabled && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-[#75f76e] inline-block" />
                          <span>Support Material</span>
                        </div>
                      )}
                      {settings.brimEnabled && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-[#c084fc] inline-block" />
                          <span>Adhesion Brim</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-2 bg-[#111111] text-emerald-400 font-mono-tech text-xs overflow-auto border border-[#111111] shadow-[3px_3px_0px_#111111]">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-400 text-[11px]">
                      <span>STANDARDS-COMPLIANT G-CODE (Marlin / Klipper / RepRap)</span>
                      <button
                        type="button"
                        onClick={handleDownloadGcode}
                        className="text-white hover:text-[#fe5029] underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Save .gcode
                      </button>
                    </div>
                    <pre className="pt-2 text-[11px] leading-relaxed whitespace-pre-wrap selection:bg-[#fe5029] selection:text-white">
                      {sliceResult?.gcodePreview || '; No slice computed yet'}
                    </pre>
                  </div>
                )}
              </div>

              {/* Layer Scrubber Controls Bar */}
              {sliceResult && canvasMode === 'toolpath' && (
                <div className="bg-white border-t border-[#111111] p-3 shrink-0 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-tech">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-7 h-7 border border-[#111111] bg-white hover:bg-neutral-100 flex items-center justify-center shadow-[1px_1px_0px_#111111]"
                        title={isPlaying ? 'Pause Layer Scrub' : 'Play Layer Progression'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        disabled={currentLayerIndex <= 1}
                        onClick={() => setCurrentLayerIndex((p) => Math.max(1, p - 1))}
                        className="w-7 h-7 border border-[#111111] bg-white hover:bg-neutral-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={currentLayerIndex >= sliceResult.layerCount}
                        onClick={() => setCurrentLayerIndex((p) => Math.min(sliceResult.layerCount, p + 1))}
                        className="w-7 h-7 border border-[#111111] bg-white hover:bg-neutral-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <span>
                        Layer <strong>{currentLayerIndex}</strong> of {sliceResult.layerCount}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500">
                      Z-Height: <strong className="text-[#111111]">{sliceResult.layers[currentLayerIndex - 1]?.zHeightMm || 0} mm</strong>
                      {' • '}
                      Extrusion: <strong className="text-[#fe5029]">{sliceResult.layers[currentLayerIndex - 1]?.extrusionLengthMm || 0} mm</strong>
                    </div>
                  </div>

                  {/* Scrubber slider */}
                  <input
                    type="range"
                    min="1"
                    max={sliceResult.layerCount}
                    value={currentLayerIndex}
                    onChange={(e) => setCurrentLayerIndex(parseInt(e.target.value))}
                    className="w-full accent-[#fe5029]"
                  />
                </div>
              )}

              {/* Bottom Slicer Action Bar */}
              <div className="bg-[#f0f0f0] border-t border-[#111111] p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendToQueue}
                    disabled={!sliceResult}
                    className="px-3 py-1.5 bg-[#fe5029] text-white font-mono-tech text-xs font-bold border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    SEND TO QUEUE
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadGcode}
                    disabled={!sliceResult}
                    className="px-3 py-1.5 bg-white text-[#111111] font-mono-tech text-xs font-bold border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-neutral-100 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    DOWNLOAD G-CODE
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSliceProject}
                    disabled={!sliceResult}
                    className="px-3 py-1.5 bg-white text-neutral-700 font-mono-tech text-xs border border-neutral-300 hover:border-[#111111] flex items-center gap-1.5 disabled:opacity-40"
                  >
                    SAVE PRESET
                  </button>
                </div>

                <span className="font-mono-tech text-[10px] text-neutral-500">
                  Toolpath Engine: Deterministic Vector Simulation
                </span>
              </div>
            </div>

            {/* Right Panel: Slice AI Overview (3 cols) */}
            <div className="lg:col-span-3 bg-white overflow-y-auto p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#fe5029]" />
                    Slice AI Overview
                  </span>
                  <span className="tech-tag bg-[#6ebdf7]/20 text-[#111111]">GEMINI 3.8</span>
                </div>

                <p className="font-mono-tech text-[11px] text-neutral-600 leading-relaxed">
                  Real additive manufacturing intelligence. Evaluates overhang deflection, bed adhesion risk, layer adhesion, and mechanical rigidity based on the sliced toolpath math.
                </p>

                {/* User Specific Question / Maker Goal */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono-tech text-neutral-500">
                    Specific Manufacturing Goal / Inquiries (Optional)
                  </label>
                  <input
                    type="text"
                    value={aiUserQuery}
                    onChange={(e) => setAiUserQuery(e.target.value)}
                    placeholder="e.g. Will this survive outdoor UV? or Is 20% infill stiff enough?"
                    className="w-full text-xs font-mono-tech p-2 border border-neutral-300 focus:border-[#111111] focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTriggerAiReview}
                  disabled={isAnalyzingAi || !sliceResult}
                  className="w-full py-2 bg-[#111111] text-white font-mono-tech text-xs font-bold border border-[#111111] shadow-[2px_2px_0px_#fe5029] hover:bg-neutral-800 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isAnalyzingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#75f76e]" />
                      <span>ANALYZING TOOLPATHS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#f7e96e]" />
                      <span>RUN SLICE AUDIT</span>
                    </>
                  )}
                </button>

                {/* Error Banner if any */}
                {aiError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-xs font-mono-tech text-red-700">
                    <div className="font-bold flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Analysis Error
                    </div>
                    <span>{aiError}</span>
                  </div>
                )}

                {/* AI Review Results Display */}
                {aiReview && (
                  <div className="space-y-4 pt-2 border-t border-neutral-200">
                    {/* Verdict & Score */}
                    <div className="p-3 border border-[#111111] bg-[#fafafa] shadow-[2px_2px_0px_#111111] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tech text-xs uppercase font-bold text-neutral-500">
                          Printability Score
                        </span>
                        <span
                          className={`font-mono-tech font-extrabold text-sm px-2 py-0.5 border border-[#111111] ${
                            aiReview.printableScore >= 80
                              ? 'bg-[#75f76e] text-[#111111]'
                              : aiReview.printableScore >= 60
                              ? 'bg-[#f7e96e] text-[#111111]'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {aiReview.printableScore} / 100
                        </span>
                      </div>

                      <div className="text-xs font-bold font-mono-tech">
                        Status: <span className="text-[#fe5029]">{aiReview.verdict}</span>
                      </div>

                      <p className="text-xs font-sans text-neutral-700 leading-normal">
                        {aiReview.summary}
                      </p>
                    </div>

                    {/* Mechanical Analysis Breakdown */}
                    {aiReview.analysis && (
                      <div className="space-y-2 text-xs font-mono-tech">
                        <span className="font-bold uppercase text-neutral-600 block text-[10px]">
                          Engineering Breakdown
                        </span>
                        <div className="p-2 border border-neutral-200 bg-white space-y-1.5">
                          <div>
                            <span className="font-bold text-[#fe5029] block text-[11px]">
                              Overhangs & Supports:
                            </span>
                            <span className="text-neutral-600 text-[11px] font-sans">
                              {aiReview.analysis.overhangsAndSupports}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-[#111111] block text-[11px]">
                              Bed Adhesion & Footprint:
                            </span>
                            <span className="text-neutral-600 text-[11px] font-sans">
                              {aiReview.analysis.adhesionAndBedContact}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-[#111111] block text-[11px]">
                              Thermal Kinematics:
                            </span>
                            <span className="text-neutral-600 text-[11px] font-sans">
                              {aiReview.analysis.thermalAndSpeed}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {aiReview.riskFactors && aiReview.riskFactors.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-mono-tech text-[10px] font-bold uppercase text-neutral-600 block">
                          Identified Risks
                        </span>
                        {aiReview.riskFactors.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2 text-xs font-mono-tech border ${
                              r.severity === 'error'
                                ? 'bg-red-50 border-red-300 text-red-800'
                                : r.severity === 'warning'
                                ? 'bg-[#f7e96e]/20 border-[#111111] text-[#111111]'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}
                          >
                            <span className="font-bold block">{r.title}</span>
                            <span className="text-[11px] font-sans text-neutral-700">
                              {r.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 1-Click Suggested Fixes */}
                    {aiReview.suggestedFixes && aiReview.suggestedFixes.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-neutral-200">
                        <span className="font-mono-tech text-xs font-bold uppercase text-[#fe5029] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Recommended Fixes (1-Click)
                        </span>

                        <div className="space-y-2">
                          {aiReview.suggestedFixes.map((fix: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 border border-[#111111] bg-white shadow-[2px_2px_0px_#111111] space-y-1.5 text-xs font-mono-tech"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#111111]">{fix.label}</span>
                                <button
                                  type="button"
                                  onClick={() => handleApplySuggestedFix(fix)}
                                  className="px-2 py-1 bg-[#75f76e] text-[#111111] font-bold text-[10px] border border-[#111111] hover:bg-[#60e058] active:translate-x-[1px] active:translate-y-[1px]"
                                >
                                  APPLY FIX
                                </button>
                              </div>
                              <p className="text-[11px] font-sans text-neutral-600">
                                {fix.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-2 bg-[#eeeeee] border border-neutral-300 text-[10px] font-mono-tech text-neutral-500">
                MAKEO slice calculations use kinematic volumetric flow rate equations: Q = v × w × h.
              </div>
            </div>
          </div>
        )}

        {/* --- PRINTERS FLEET TAB --- */}
        {activeTab === 'printers' && (
          <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#111111] pb-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-[#111111]">
                  WORKSHOP 3D PRINTER FLEET
                </h2>
                <p className="font-mono-tech text-xs text-neutral-500">
                  Manage physical 3D printers, nozzle diameters, kinematics build volumes, and live telemetry status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddPrinterOpen(true)}
                className="px-4 py-2 bg-[#fe5029] text-white font-mono-tech text-xs font-bold border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>ADD 3D PRINTER</span>
              </button>
            </div>

            {/* Printer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {printers.map((p) => (
                <div
                  key={p.id}
                  className="tech-card p-5 space-y-4 flex flex-col justify-between bg-white"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono-tech text-neutral-400 uppercase">
                          {p.model}
                        </span>
                        <h3 className="font-display font-bold text-base text-[#111111]">
                          {p.name}
                        </h3>
                      </div>
                      <span
                        className={`tech-tag text-[10px] ${
                          p.status === 'printing'
                            ? 'bg-[#6ebdf7] text-[#111111]'
                            : p.status === 'idle'
                            ? 'bg-[#75f76e] text-[#111111]'
                            : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech pt-2 border-t border-neutral-100">
                      <div>
                        <span className="text-neutral-400 text-[10px] block">BUILD VOLUME</span>
                        <span className="font-bold text-[#111111]">
                          {p.bedWidthMm}×{p.bedDepthMm}×{p.maxHeightMm} mm
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[10px] block">NOZZLE</span>
                        <span className="font-bold text-[#fe5029]">{p.nozzleDiameterMm} mm</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[10px] block">BUILD SURFACE</span>
                        <span className="font-bold text-[#111111]">{p.bedType}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[10px] block">TEMPERATURES</span>
                        <span className="font-bold text-[#111111]">
                          {p.currentNozzleTemp || 22}°C / {p.currentBedTemp || 22}°C
                        </span>
                      </div>
                    </div>

                    {p.status === 'printing' && p.activeJobName && (
                      <div className="p-2.5 bg-[#f0f9ff] border border-blue-200 text-xs font-mono-tech space-y-1">
                        <div className="flex justify-between text-[10px] text-blue-800">
                          <span>Active Job: {p.activeJobName}</span>
                          <span>{p.progressPercent || 0}%</span>
                        </div>
                        <div className="w-full bg-blue-100 h-1.5 overflow-hidden">
                          <div
                            className="bg-[#6ebdf7] h-full"
                            style={{ width: `${p.progressPercent || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-mono-tech">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrinterId(p.id);
                        setActiveTab('slicer');
                      }}
                      className="text-[#fe5029] hover:underline font-bold"
                    >
                      Select For Slicing →
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete printer profile "${p.name}"?`)) {
                          await api.printers.delete(p.id);
                          onRefreshAll();
                        }
                      }}
                      className="p-1 text-neutral-400 hover:text-red-600"
                      title="Delete Printer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Printer Modal */}
            {isAddPrinterOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="tech-card bg-white p-6 max-w-md w-full space-y-4">
                  <div className="flex items-center justify-between border-b border-[#111111] pb-2">
                    <h3 className="font-display font-bold text-base text-[#111111]">
                      ADD 3D PRINTER PROFILE
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddPrinterOpen(false)}
                      className="text-neutral-500 hover:text-[#111111] font-mono-tech"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreatePrinter} className="space-y-3 font-mono-tech text-xs">
                    <div>
                      <label className="block text-neutral-600 mb-1">Custom Display Name *</label>
                      <input
                        type="text"
                        required
                        value={newPrinterName}
                        onChange={(e) => setNewPrinterName(e.target.value)}
                        placeholder="e.g. Voron 2.4 StealthBurner"
                        className="w-full p-2 border border-[#111111]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 mb-1">Kinematics Model</label>
                        <input
                          type="text"
                          value={newPrinterModel}
                          onChange={(e) => setNewPrinterModel(e.target.value)}
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 mb-1">Nozzle Diameter (mm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newPrinterNozzle}
                          onChange={(e) => setNewPrinterNozzle(parseFloat(e.target.value))}
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-neutral-600 mb-1">Bed X (mm)</label>
                        <input
                          type="number"
                          value={newPrinterBedW}
                          onChange={(e) => setNewPrinterBedW(parseInt(e.target.value))}
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 mb-1">Bed Y (mm)</label>
                        <input
                          type="number"
                          value={newPrinterBedD}
                          onChange={(e) => setNewPrinterBedD(parseInt(e.target.value))}
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-600 mb-1">Height Z (mm)</label>
                        <input
                          type="number"
                          value={newPrinterHeight}
                          onChange={(e) => setNewPrinterHeight(parseInt(e.target.value))}
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-600 mb-1">Build Plate Surface</label>
                      <select
                        value={newPrinterBedType}
                        onChange={(e) => setNewPrinterBedType(e.target.value as any)}
                        className="w-full p-2 border border-[#111111] bg-white"
                      >
                        <option value="PEI Textured">PEI Textured Sheet</option>
                        <option value="PEI Smooth">PEI Smooth Sheet</option>
                        <option value="Satin">Satin Powder-Coated</option>
                        <option value="Glass">Borosilicate Glass</option>
                        <option value="Engineering">Engineering High-Temp Plate</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setIsAddPrinterOpen(false)}
                        className="px-3 py-1.5 border border-neutral-300 hover:border-[#111111]"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#fe5029] text-white font-bold border border-[#111111] shadow-[2px_2px_0px_#111111]"
                      >
                        SAVE PRINTER
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- FILAMENT SPOOL VAULT TAB --- */}
        {activeTab === 'spools' && (
          <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#111111] pb-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-[#111111]">
                  FILAMENT SPOOL VAULT
                </h2>
                <p className="font-mono-tech text-xs text-neutral-500">
                  Track physical filament inventory, remaining spool mass in grams, color formulations, and desiccant drying status.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddSpoolOpen(true)}
                className="px-4 py-2 bg-[#fe5029] text-white font-mono-tech text-xs font-bold border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>ADD FILAMENT SPOOL</span>
              </button>
            </div>

            {/* Spool Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {spools.map((s) => {
                const percentLeft = Math.round((s.remainingWeightG / s.initialWeightG) * 100);
                return (
                  <div
                    key={s.id}
                    className="tech-card p-5 space-y-4 flex flex-col justify-between bg-white"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full border border-[#111111] shrink-0"
                            style={{ backgroundColor: s.colorHex }}
                          />
                          <div>
                            <span className="text-[10px] font-mono-tech text-neutral-400 uppercase">
                              {s.brand} • {s.colorName}
                            </span>
                            <h3 className="font-display font-bold text-base text-[#111111]">
                              {s.name}
                            </h3>
                          </div>
                        </div>
                        <span className="tech-tag bg-[#111111] text-white text-[10px]">
                          {s.materialType}
                        </span>
                      </div>

                      {/* Weight Progress Bar */}
                      <div className="space-y-1 font-mono-tech text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-neutral-500">Remaining Weight</span>
                          <span className="font-bold text-[#fe5029]">
                            {s.remainingWeightG}g / {s.initialWeightG}g ({percentLeft}%)
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 border border-[#111111] h-2.5 p-0.5">
                          <div
                            className="h-full bg-[#fe5029]"
                            style={{ width: `${Math.min(100, Math.max(0, percentLeft))}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech pt-2 border-t border-neutral-100">
                        <div>
                          <span className="text-neutral-400 text-[10px] block">HOTEND TEMP</span>
                          <span className="font-bold">{s.recommendedNozzleTemp}°C</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-[10px] block">BED TEMP</span>
                          <span className="font-bold">{s.recommendedBedTemp}°C</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-[10px] block">COST / KG</span>
                          <span className="font-bold">${s.costPerKg.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 text-[10px] block">DRY STATUS</span>
                          <span
                            className={`font-bold ${
                              s.isDry ? 'text-emerald-700' : 'text-amber-600'
                            }`}
                          >
                            {s.isDry ? 'Dry & Ready' : 'Bake Needed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-mono-tech">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSpoolId(s.id);
                          setSettings((prev) => ({
                            ...prev,
                            spoolId: s.id,
                            nozzleTemp: s.recommendedNozzleTemp,
                            bedTemp: s.recommendedBedTemp,
                          }));
                          setActiveTab('slicer');
                        }}
                        className="text-[#fe5029] hover:underline font-bold"
                      >
                        Load in Slicer →
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Delete spool "${s.name}"?`)) {
                            await api.spools.delete(s.id);
                            onRefreshAll();
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-600"
                        title="Delete Spool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Spool Modal */}
            {isAddSpoolOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="tech-card bg-white p-6 max-w-md w-full space-y-4">
                  <div className="flex items-center justify-between border-b border-[#111111] pb-2">
                    <h3 className="font-display font-bold text-base text-[#111111]">
                      ADD FILAMENT SPOOL
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsAddSpoolOpen(false)}
                      className="text-neutral-500 hover:text-[#111111] font-mono-tech"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateSpool} className="space-y-3 font-mono-tech text-xs">
                    <div>
                      <label className="block text-neutral-600 mb-1">Spool Name / Brand *</label>
                      <input
                        type="text"
                        required
                        value={newSpoolName}
                        onChange={(e) => setNewSpoolName(e.target.value)}
                        placeholder="e.g. Polymaker PolyLite PLA Pro"
                        className="w-full p-2 border border-[#111111]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-600 mb-1">Material Polymer</label>
                        <select
                          value={newSpoolType}
                          onChange={(e) => setNewSpoolType(e.target.value as any)}
                          className="w-full p-2 border border-[#111111] bg-white"
                        >
                          <option value="PLA">PLA (Polylactic Acid)</option>
                          <option value="PETG">PETG (Copolymer)</option>
                          <option value="ABS">ABS (Acrylonitrile)</option>
                          <option value="ASA">ASA (UV Exterior)</option>
                          <option value="TPU">TPU (Flex 95A)</option>
                          <option value="PC">Polycarbonate</option>
                          <option value="PA-CF">Nylon Carbon Fiber</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">Color Name</label>
                        <input
                          type="text"
                          value={newSpoolColorName}
                          onChange={(e) => setNewSpoolColorName(e.target.value)}
                          placeholder="e.g. Signal Orange"
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-neutral-600 mb-1">Color Hex</label>
                        <input
                          type="color"
                          value={newSpoolColorHex}
                          onChange={(e) => setNewSpoolColorHex(e.target.value)}
                          className="w-full h-9 p-1 border border-[#111111] bg-white cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">Weight (g)</label>
                        <input
                          type="number"
                          value={newSpoolWeight}
                          onChange={(e) => setNewSpoolWeight(parseInt(e.target.value))}
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-600 mb-1">Cost / kg ($)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={newSpoolCost}
                          onChange={(e) => setNewSpoolCost(parseFloat(e.target.value))}
                          className="w-full p-2 border border-[#111111]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setIsAddSpoolOpen(false)}
                        className="px-3 py-1.5 border border-neutral-300 hover:border-[#111111]"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#fe5029] text-white font-bold border border-[#111111] shadow-[2px_2px_0px_#111111]"
                      >
                        SAVE SPOOL
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PRINT HISTORY & LOGS TAB --- */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 overflow-y-auto h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#111111] pb-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-[#111111]">
                  3D PRINT LOGS & BENCHMARK RESULTS
                </h2>
                <p className="font-mono-tech text-xs text-neutral-500">
                  Track actual physical print jobs, print times, grams extruded, and failure diagnoses.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenCreatePrint}
                className="px-4 py-2 bg-[#fe5029] text-white font-mono-tech text-xs font-bold border border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4421d] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>LOG PRINT RUN</span>
              </button>
            </div>

            {prints.length === 0 ? (
              <div className="tech-card p-12 text-center space-y-3 bg-white">
                <Printer className="w-10 h-10 text-neutral-400 mx-auto" />
                <h3 className="font-display font-bold text-base text-[#111111]">
                  No print jobs logged yet
                </h3>
                <p className="font-mono-tech text-xs text-neutral-500 max-w-md mx-auto">
                  Slice a model in the workbench and click &quot;Send to Queue&quot;, or log a physical print result manually.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {prints.map((print) => {
                  const proj = projects.find((p) => p.id === print.projectId);
                  return (
                    <div
                      key={print.id}
                      className="tech-card p-5 space-y-4 flex flex-col justify-between bg-white"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono-tech text-neutral-400 uppercase tracking-wider block">
                              {proj ? proj.name : 'Workshop Job'}
                            </span>
                            <h4 className="font-display font-bold text-base text-[#111111]">
                              {print.modelName}
                            </h4>
                          </div>

                          <span
                            className={`tech-tag text-[10px] ${
                              print.status === 'completed'
                                ? 'bg-[#75f76e] text-[#111111]'
                                : print.status === 'failed'
                                ? 'bg-red-500 text-white'
                                : print.status === 'printing'
                                ? 'bg-[#6ebdf7] text-[#111111] animate-pulse'
                                : 'bg-[#f7e96e] text-[#111111]'
                            }`}
                          >
                            {print.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech pt-2 border-t border-neutral-100">
                          <div>
                            <span className="text-neutral-400 text-[10px] block">PRINTER</span>
                            <span className="font-bold text-[#111111]">{print.printer}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 text-[10px] block">MATERIAL</span>
                            <span className="font-bold text-[#111111]">{print.material}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 text-[10px] block">FILAMENT</span>
                            <span className="font-bold text-[#fe5029]">
                              {print.filamentUsageGrams ? `${print.filamentUsageGrams}g` : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-400 text-[10px] block">PRINT TIME</span>
                            <span className="font-bold text-[#111111]">
                              {print.printDurationMinutes ? `${print.printDurationMinutes} mins` : '—'}
                            </span>
                          </div>
                        </div>

                        {print.failureReason && print.status === 'failed' && (
                          <div className="p-2.5 bg-red-50 border border-red-200 text-xs font-mono-tech text-red-700 space-y-1">
                            <span className="font-bold block">ROOT CAUSE OF FAILURE:</span>
                            <span>{print.failureReason}</span>
                          </div>
                        )}

                        {print.notes && (
                          <p className="text-xs font-mono-tech text-neutral-600 bg-neutral-50 p-2 border border-neutral-200">
                            {print.notes}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-mono-tech">
                        <span className="text-neutral-400 text-[10px]">
                          {new Date(print.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {print.status === 'queued' && (
                            <button
                              type="button"
                              onClick={() => onUpdatePrint(print.id, { status: 'printing' })}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Start
                            </button>
                          )}
                          {print.status === 'printing' && (
                            <button
                              type="button"
                              onClick={() => onUpdatePrint(print.id, { status: 'completed' })}
                              className="text-xs font-bold text-emerald-600 hover:underline"
                            >
                              Mark Done
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeletePrint(print.id)}
                            className="p-1 text-neutral-400 hover:text-red-600"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
