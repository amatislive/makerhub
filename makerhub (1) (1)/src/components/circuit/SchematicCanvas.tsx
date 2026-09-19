import React, { useState, useRef } from 'react';
import { PlacedComponent, WireConnection, SimulationOutput } from '../../types/circuit';
import { CircuitGraph } from '../../utils/spiceEngine';
import { Zap, Eye, RotateCw, Trash2, Cpu, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface SchematicCanvasProps {
  components: PlacedComponent[];
  wires: WireConnection[];
  graph?: CircuitGraph | null;
  simulation: SimulationOutput | null;
  selectedComponentId: string | null;
  selectedWireId: string | null;
  highlightNetId?: string | null;
  onSelectComponent: (id: string | null) => void;
  onSelectWire: (id: string | null) => void;
  onSelectNet?: (netId: string) => void;
  onPinClick?: (pin: any, compId: string) => void;
  onRotateComponent?: (id: string) => void;
  onDeleteComponent?: (id: string) => void;
}

export const SchematicCanvas: React.FC<SchematicCanvasProps> = ({
  components,
  wires,
  graph,
  simulation,
  selectedComponentId,
  selectedWireId,
  highlightNetId,
  onSelectComponent,
  onSelectWire,
  onSelectNet,
  onPinClick,
  onRotateComponent,
  onDeleteComponent,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const dc = simulation?.dc;

  // Render standard schematic symbol for a component
  const renderSymbol = (comp: PlacedComponent) => {
    const isSelected = selectedComponentId === comp.id;
    const isMcu = comp.type.includes('arduino') || comp.type.includes('esp') || comp.type.includes('pico') || comp.type.includes('stm32');
    const isIC = comp.category === 'ics' || comp.type.startsWith('ic_') || comp.type.startsWith('uln') || comp.type.startsWith('l293') || comp.type.startsWith('regulator');
    const compVolt = dc?.nodeVoltages[graph?.componentToNet[comp.id]?.['p1'] || ''];

    return (
      <g
        key={comp.id}
        transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0})`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent(comp.id);
        }}
        className="cursor-pointer group"
      >
        {/* Selection bounding highlight */}
        {isSelected && (
          <rect
            x={-10}
            y={-10}
            width={isMcu ? 160 : isIC ? 100 : 70}
            height={isMcu ? 180 : isIC ? 110 : 50}
            fill="none"
            stroke="#fe5029"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            rx={4}
          />
        )}

        {/* Resistor */}
        {comp.type.startsWith('resistor') && (
          <g>
            <line x1={0} y1={15} x2={10} y2={15} stroke="#111111" strokeWidth={2} />
            <path
              d="M 10 15 L 14 7 L 22 23 L 30 7 L 38 23 L 42 15 L 50 15"
              fill="none"
              stroke={isSelected ? '#fe5029' : '#111111'}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Pins */}
            <circle cx={0} cy={15} r={3} fill="#111111" />
            <circle cx={50} cy={15} r={3} fill="#111111" />
          </g>
        )}

        {/* Capacitor */}
        {comp.type.startsWith('capacitor') && (
          <g>
            <line x1={0} y1={15} x2={20} y2={15} stroke="#111111" strokeWidth={2} />
            <line x1={20} y1={4} x2={20} y2={26} stroke={isSelected ? '#fe5029' : '#111111'} strokeWidth={2.5} />
            <line x1={28} y1={4} x2={28} y2={26} stroke={isSelected ? '#fe5029' : '#111111'} strokeWidth={2.5} />
            <line x1={28} y1={15} x2={48} y2={15} stroke="#111111" strokeWidth={2} />
            <circle cx={0} cy={15} r={3} fill="#111111" />
            <circle cx={48} cy={15} r={3} fill="#111111" />
          </g>
        )}

        {/* Diode / LED */}
        {(comp.type.startsWith('diode') || comp.type.startsWith('led') || comp.type.startsWith('zener')) && (
          <g>
            <line x1={0} y1={15} x2={15} y2={15} stroke="#111111" strokeWidth={2} />
            {/* Triangle */}
            <polygon
              points="15,5 15,25 32,15"
              fill={comp.type.startsWith('led') ? '#fe5029' : '#111111'}
              stroke="#111111"
              strokeWidth={1.5}
            />
            {/* Cathode bar */}
            <line x1={32} y1={5} x2={32} y2={25} stroke="#111111" strokeWidth={2.5} />
            <line x1={32} y1={15} x2={46} y2={15} stroke="#111111" strokeWidth={2} />

            {/* LED arrows */}
            {comp.type.startsWith('led') && (
              <g stroke="#fe5029" strokeWidth={1.5} fill="#fe5029">
                <line x1={24} y1={5} x2={32} y2={-3} />
                <polygon points="32,-3 29,-1 30,-5" />
                <line x1={29} y1={8} x2={37} y2={0} />
                <polygon points="37,0 34,2 35,-2" />
              </g>
            )}
            <circle cx={0} cy={15} r={3} fill="#111111" />
            <circle cx={46} cy={15} r={3} fill="#111111" />
          </g>
        )}

        {/* DC Voltage Source / Battery */}
        {(comp.type.startsWith('dc_source') || comp.type.startsWith('battery')) && (
          <g>
            <circle cx={22} cy={22} r={18} fill="#ffffff" stroke={isSelected ? '#fe5029' : '#111111'} strokeWidth={2} />
            <line x1={22} y1={0} x2={22} y2={4} stroke="#111111" strokeWidth={2} />
            <line x1={22} y1={40} x2={22} y2={44} stroke="#111111" strokeWidth={2} />
            <text x={22} y={16} textAnchor="middle" className="font-mono-tech text-[11px] font-black fill-[#fe5029]">+</text>
            <text x={22} y={34} textAnchor="middle" className="font-mono-tech text-[14px] font-black fill-[#111111]">-</text>
            <circle cx={22} cy={0} r={3} fill="#111111" />
            <circle cx={22} cy={44} r={3} fill="#111111" />
          </g>
        )}

        {/* Ground */}
        {comp.type === 'ground' && (
          <g>
            <line x1={15} y1={0} x2={15} y2={12} stroke="#111111" strokeWidth={2} />
            <line x1={4} y1={12} x2={26} y2={12} stroke="#111111" strokeWidth={2.5} />
            <line x1={8} y1={16} x2={22} y2={16} stroke="#111111" strokeWidth={2} />
            <line x1={12} y1={20} x2={18} y2={20} stroke="#111111" strokeWidth={1.5} />
            <circle cx={15} cy={0} r={3} fill="#111111" />
          </g>
        )}

        {/* Switch / Pushbutton */}
        {(comp.type.startsWith('pushbutton') || comp.type.startsWith('spst') || comp.type.startsWith('spdt')) && (
          <g>
            <line x1={0} y1={15} x2={12} y2={15} stroke="#111111" strokeWidth={2} />
            <circle cx={14} cy={15} r={2.5} fill="#ffffff" stroke="#111111" strokeWidth={1.5} />
            <line x1={16} y1={14} x2={32} y2={5} stroke="#fe5029" strokeWidth={2} strokeLinecap="round" />
            <circle cx={34} cy={15} r={2.5} fill="#ffffff" stroke="#111111" strokeWidth={1.5} />
            <line x1={36} y1={15} x2={48} y2={15} stroke="#111111" strokeWidth={2} />
            <circle cx={0} cy={15} r={3} fill="#111111" />
            <circle cx={48} cy={15} r={3} fill="#111111" />
          </g>
        )}

        {/* Potentiometer */}
        {comp.type.startsWith('potentiometer') && (
          <g>
            <line x1={0} y1={15} x2={10} y2={15} stroke="#111111" strokeWidth={2} />
            <path
              d="M 10 15 L 14 7 L 22 23 L 30 7 L 38 23 L 42 15 L 50 15"
              fill="none"
              stroke="#111111"
              strokeWidth={2}
            />
            {/* Wiper Arrow */}
            <line x1={26} y1={35} x2={26} y2={24} stroke="#fe5029" strokeWidth={1.5} />
            <polygon points="26,20 23,26 29,26" fill="#fe5029" />
            <line x1={50} y1={15} x2={60} y2={15} stroke="#111111" strokeWidth={2} />
            <circle cx={0} cy={15} r={3} fill="#111111" />
            <circle cx={60} cy={15} r={3} fill="#111111" />
            <circle cx={26} cy={35} r={3} fill="#fe5029" />
          </g>
        )}

        {/* Transistor / MOSFET / BJT */}
        {(comp.type.startsWith('bjt') || comp.type.startsWith('mosfet') || comp.type.startsWith('darlington')) && (
          <g>
            <circle cx={25} cy={25} r={22} fill="#ffffff" stroke="#111111" strokeWidth={1.5} />
            <line x1={15} y1={10} x2={15} y2={40} stroke="#111111" strokeWidth={2.5} />
            <line x1={0} y1={25} x2={15} y2={25} stroke="#111111" strokeWidth={2} />
            {/* Collector */}
            <line x1={15} y1={16} x2={35} y2={6} stroke="#111111" strokeWidth={2} />
            <line x1={35} y1={6} x2={35} y2={0} stroke="#111111" strokeWidth={2} />
            {/* Emitter with arrow */}
            <line x1={15} y1={34} x2={35} y2={44} stroke="#111111" strokeWidth={2} />
            <polygon points="35,44 28,40 32,36" fill="#fe5029" />
            <line x1={35} y1={44} x2={35} y2={50} stroke="#111111" strokeWidth={2} />
            <circle cx={0} cy={25} r={3} fill="#111111" />
            <circle cx={35} cy={0} r={3} fill="#111111" />
            <circle cx={35} cy={50} r={3} fill="#111111" />
          </g>
        )}

        {/* Microcontroller / Boards / Large ICs */}
        {(isMcu || isIC || (!comp.type.startsWith('resistor') && !comp.type.startsWith('capacitor') && !comp.type.startsWith('diode') && !comp.type.startsWith('led') && !comp.type.startsWith('dc_source') && !comp.type.startsWith('battery') && comp.type !== 'ground' && !comp.type.startsWith('pushbutton') && !comp.type.startsWith('potentiometer') && !comp.type.startsWith('bjt') && !comp.type.startsWith('mosfet'))) && (
          <g>
            <rect
              x={0}
              y={0}
              width={isMcu ? 140 : 90}
              height={isMcu ? 160 : 90}
              fill="#ffffff"
              stroke={isSelected ? '#fe5029' : '#111111'}
              strokeWidth={2}
              rx={3}
            />
            {/* Top Header Notch */}
            <circle cx={isMcu ? 70 : 45} cy={0} r={6} fill="#eeeeee" stroke="#111111" strokeWidth={1} />
            
            {/* Title / IC Name */}
            <text
              x={isMcu ? 70 : 45}
              y={24}
              textAnchor="middle"
              className="font-mono-tech text-[10px] font-black fill-[#111111] uppercase"
            >
              {comp.name}
            </text>
            <text
              x={isMcu ? 70 : 45}
              y={38}
              textAnchor="middle"
              className="font-mono-tech text-[8px] font-bold fill-[#fe5029]"
            >
              {comp.type.replace(/_/g, ' ').toUpperCase()}
            </text>

            {/* Render Pin Terminals on left and right edges */}
            {comp.pins.slice(0, 16).map((pin, pIdx) => {
              const isLeft = pIdx < 8;
              const slotIdx = isLeft ? pIdx : pIdx - 8;
              const px = isLeft ? 0 : (isMcu ? 140 : 90);
              const py = 50 + slotIdx * 13;

              return (
                <g key={pin.id}>
                  <line
                    x1={px}
                    y1={py}
                    x2={isLeft ? px - 10 : px + 10}
                    y2={py}
                    stroke="#111111"
                    strokeWidth={1.5}
                  />
                  <circle cx={isLeft ? px - 10 : px + 10} cy={py} r={2.5} fill="#111111" />
                  <text
                    x={isLeft ? px + 4 : px - 4}
                    y={py + 3}
                    textAnchor={isLeft ? 'start' : 'end'}
                    className="font-mono-tech text-[7px] font-bold fill-[#111111]/80"
                  >
                    {pin.name}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Labels: RefDes & Value */}
        <g transform={isMcu ? 'translate(0, 175)' : isIC ? 'translate(0, 105)' : 'translate(0, -6)'}>
          <text className="font-mono-tech text-[10px] font-black fill-[#111111]">
            {comp.name}
          </text>
          <text x={26} className="font-mono-tech text-[9px] font-bold fill-[#fe5029]">
            {comp.value} {comp.unit || ''}
          </text>
        </g>
      </g>
    );
  };

  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3.0, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.3, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setStartPan({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(3.0, Math.max(0.3, Number((zoom * factor).toFixed(2))));

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 1200 / rect.width;
      const scaleY = 800 / rect.height;
      const mouseSvgX = (e.clientX - rect.left) * scaleX;
      const mouseSvgY = (e.clientY - rect.top) * scaleY;

      const newPanX = mouseSvgX - ((mouseSvgX - pan.x) / zoom) * newZoom;
      const newPanY = mouseSvgY - ((mouseSvgY - pan.y) / zoom) * newZoom;

      setZoom(newZoom);
      setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
    } else {
      setZoom(newZoom);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#fafafa] select-none">
      {/* Schematic Grid and Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={() => {
          onSelectComponent(null);
          onSelectWire(null);
        }}
      >
        <defs>
          {/* Engineering Dot Grid Pattern */}
          <pattern id="schematic-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#cccccc" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#schematic-dots)" />

        {/* Scalable & Pannable Schematic Elements */}
        <g id="schematic-zoom-group" transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Title Block (Engineering standard) */}
          <g transform="translate(950, 710)">
            <rect x={0} y={0} width={220} height={70} fill="#ffffff" stroke="#111111" strokeWidth={1.5} />
            <line x1={0} y1={25} x2={220} y2={25} stroke="#111111" strokeWidth={1} />
            <line x1={0} y1={48} x2={220} y2={48} stroke="#111111" strokeWidth={1} />
            <line x1={130} y1={25} x2={130} y2={70} stroke="#111111" strokeWidth={1} />
            <text x={8} y={16} className="font-mono-tech text-[10px] font-black fill-[#111111]">
              MAKEO SCHEMATIC CAPTURE
            </text>
            <text x={8} y={38} className="font-mono-tech text-[8px] fill-[#111111]/70">
              PARTS: {components.length} // NETS: {graph?.nets.length || 0}
            </text>
            <text x={8} y={60} className="font-mono-tech text-[8px] font-bold fill-[#fe5029]">
              STATUS: {simulation?.status.toUpperCase() || 'UNVERIFIED'}
            </text>
            <text x={138} y={38} className="font-mono-tech text-[8px] fill-[#111111]/70">
              REV 1.0
            </text>
            <text x={138} y={60} className="font-mono-tech text-[8px] fill-[#111111]/70">
              PAGE 1 / 1
            </text>
          </g>

          {/* Schematic Wires / Nets Layer */}
          {wires.map((wire) => {
            const fromComp = components.find((c) => c.id === wire.fromComponentId);
            const toComp = components.find((c) => c.id === wire.toComponentId);
            if (!fromComp || !toComp) return null;

            const isSelected = selectedWireId === wire.id;
            const x1 = fromComp.x + 30;
            const y1 = fromComp.y + 15;
            const x2 = toComp.x + 10;
            const y2 = toComp.y + 15;
            const midX = (x1 + x2) / 2;

            // Manhattan Orthogonal Routing path
            const pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

            return (
              <g key={wire.id} onClick={(e) => { e.stopPropagation(); onSelectWire(wire.id); }}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? '#fe5029' : wire.color || '#111111'}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeLinecap="round"
                  className="cursor-pointer hover:stroke-[#fe5029] transition-colors"
                />
                {/* Junction dots */}
                <circle cx={x1} cy={y1} r={3.5} fill="#111111" />
                <circle cx={x2} cy={y2} r={3.5} fill="#111111" />
              </g>
            );
          })}

          {/* Placed Components Symbols */}
          {components.map((comp) => renderSymbol(comp))}
        </g>
      </svg>

      {/* Floating View Control HUD */}
      <div className="absolute top-3 left-3 bg-white border border-[#111111] p-1.5 shadow-[2px_2px_0px_#111111] flex items-center gap-2 font-mono-tech text-[10px] pointer-events-none">
        <span className="font-bold text-[#111111] px-1.5 py-0.5 bg-[#eeeeee]">SCHEMATIC CAPTURE</span>
        <span className="text-[#111111]/60 hidden sm:inline">SYNCHRONIZED WITH BREADBOARD & SPICE ENGINE</span>
      </div>

      {/* Floating Zoom Controls Toolbar */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center border border-[#111111] bg-white shadow-[2px_2px_0px_#111111] p-1 gap-1">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="p-1.5 hover:bg-[#eeeeee] text-[#111111] border border-transparent hover:border-[#111111] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset Zoom (100%)"
          className="px-2 py-1 font-mono-tech text-[11px] font-bold text-[#111111] hover:bg-[#eeeeee] transition-colors min-w-[50px] text-center"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="p-1.5 hover:bg-[#eeeeee] text-[#111111] border border-transparent hover:border-[#111111] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-[#dddddd] mx-0.5" />

        <button
          type="button"
          onClick={handleResetZoom}
          title="Fit / Reset View"
          className="p-1.5 hover:bg-[#eeeeee] text-[#111111] border border-transparent hover:border-[#111111] transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
