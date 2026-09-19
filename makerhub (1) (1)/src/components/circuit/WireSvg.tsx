import React from 'react';
import {
  WireConnection,
  PlacedComponent,
  BreadboardHole,
} from '../../types/circuit';

interface WireSvgProps {
  wire: WireConnection;
  components: PlacedComponent[];
  holes: BreadboardHole[];
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const WireSvg: React.FC<WireSvgProps> = ({
  wire,
  components,
  holes,
  isSelected,
  onSelect,
}) => {
  // Compute absolute start coordinate (x1, y1)
  let x1 = 0;
  let y1 = 0;

  if (wire.fromComponentId && wire.fromPinId) {
    const comp = components.find(c => c.id === wire.fromComponentId);
    if (comp) {
      const pin = comp.pins.find(p => p.id === wire.fromPinId);
      if (pin) {
        // Account for rotation around center (80, 80 for dev boards, 30, 15 for standard parts)
        const isBoard = comp.type.includes('arduino') || comp.type.includes('esp') || comp.type.includes('pico') || comp.type.includes('stm32') || comp.type.includes('feather') || comp.type.includes('pi_');
        const rad = (comp.rotation * Math.PI) / 180;
        const cx = isBoard ? 80 : 30;
        const cy = isBoard ? 80 : 15;
        const dx = pin.x - cx;
        const dy = pin.y - cy;
        x1 = comp.x + cx + (dx * Math.cos(rad) - dy * Math.sin(rad));
        y1 = comp.y + cy + (dx * Math.sin(rad) + dy * Math.cos(rad));
      }
    }
  } else if (wire.fromHoleId) {
    const hole = holes.find(h => h.id === wire.fromHoleId);
    if (hole) {
      x1 = hole.x;
      y1 = hole.y;
    }
  }

  // Compute absolute end coordinate (x2, y2)
  let x2 = 0;
  let y2 = 0;

  if (wire.toComponentId && wire.toPinId) {
    const comp = components.find(c => c.id === wire.toComponentId);
    if (comp) {
      const pin = comp.pins.find(p => p.id === wire.toPinId);
      if (pin) {
        const isBoard = comp.type.includes('arduino') || comp.type.includes('esp') || comp.type.includes('pico') || comp.type.includes('stm32') || comp.type.includes('feather') || comp.type.includes('pi_');
        const rad = (comp.rotation * Math.PI) / 180;
        const cx = isBoard ? 80 : 30;
        const cy = isBoard ? 80 : 15;
        const dx = pin.x - cx;
        const dy = pin.y - cy;
        x2 = comp.x + cx + (dx * Math.cos(rad) - dy * Math.sin(rad));
        y2 = comp.y + cy + (dx * Math.sin(rad) + dy * Math.cos(rad));
      }
    }
  } else if (wire.toHoleId) {
    const hole = holes.find(h => h.id === wire.toHoleId);
    if (hole) {
      x2 = hole.x;
      y2 = hole.y;
    }
  }

  // Generate organic arched curve
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Arc bend offset
  const sag = Math.min(60, Math.max(20, dist * 0.25));
  const ctrlX = midX;
  const ctrlY = midY - sag;

  const pathData = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;

  const wireColor = wire.color || '#fe5029';

  return (
    <g
      id={`wire-${wire.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
      className="cursor-pointer group"
    >
      {/* Outer border / shadow for high contrast on white canvas */}
      <path
        d={pathData}
        fill="none"
        stroke="#111111"
        strokeWidth={isSelected ? 6 : 4}
        strokeLinecap="round"
      />

      {/* Main colorful wire core */}
      <path
        d={pathData}
        fill="none"
        stroke={wireColor}
        strokeWidth={isSelected ? 3.5 : 2.5}
        strokeLinecap="round"
        className="group-hover:stroke-white transition-colors"
      />

      {/* Jumper wire metallic end plug caps */}
      <circle cx={x1} cy={y1} r={3} fill="#111111" stroke="#ffffff" strokeWidth={1} />
      <circle cx={x2} cy={y2} r={3} fill="#111111" stroke="#ffffff" strokeWidth={1} />

      {/* Hover hit target */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      >
        <title>Wire: {wire.netName || 'Connection'} (Click to select/delete)</title>
      </path>
    </g>
  );
};
