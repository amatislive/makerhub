// src/components/circuit/ComponentSvg.tsx
// Modular component SVG renderer with support for standard parts and full-size development boards

import React, { useState } from 'react';
import { PlacedComponent, PinDefinition } from '../../types/circuit';
import { renderComponentByType } from './ComponentVisualRegistry';

interface ComponentSvgProps {
  component: PlacedComponent;
  isSelected: boolean;
  isSimHighlighted?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onPinClick: (pin: PinDefinition, e: React.MouseEvent) => void;
  activePinId?: string | null;
}

export const ComponentSvg: React.FC<ComponentSvgProps> = ({
  component,
  isSelected,
  isSimHighlighted,
  onSelect,
  onPinClick,
  activePinId,
}) => {
  const { x, y, rotation, name, value, unit } = component;
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Rotation center: standard components use (30, 15), boards rotate about their center
  const isBoard = component.type.includes('arduino') || component.type.includes('esp') || component.type.includes('pico') || component.type.includes('stm32') || component.type.includes('feather') || component.type.includes('pi_');
  const rotOriginX = isBoard ? 80 : 30;
  const rotOriginY = isBoard ? 80 : 15;

  return (
    <g
      id={`comp-${component.id}`}
      transform={`translate(${x}, ${y}) rotate(${rotation} ${rotOriginX} ${rotOriginY})`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
      className="cursor-move group"
    >
      {/* Simulation Probe Halo / Glow Highlight */}
      {isSimHighlighted && (
        <circle
          cx={rotOriginX}
          cy={rotOriginY}
          r={isBoard ? 90 : 38}
          fill="none"
          stroke="#fe5029"
          strokeWidth={4}
          strokeDasharray="4 2"
          className="animate-pulse"
        />
      )}

      {/* Selected Box Bounding Outline */}
      {isSelected && (
        <rect
          x={-6}
          y={-14}
          width={isBoard ? 280 : 72}
          height={isBoard ? 230 : 54}
          fill="none"
          stroke="#fe5029"
          strokeWidth={2}
          strokeDasharray="4 2"
          className="pointer-events-none"
        />
      )}

      {/* Render Component Body and Pins via the Extensible Visual Registry */}
      {renderComponentByType({
        component,
        hoveredPinId: activePinId || hoveredPinId,
        onPinMouseDown: (pin, e) => onPinClick(pin, e),
        onPinHover: (pinId) => setHoveredPinId(pinId),
      })}

      {/* Component Title Header on Canvas (for non-board parts) */}
      {!isBoard && (
        <g transform="translate(0, -6)" className="pointer-events-none select-none">
          <text
            x={10}
            y={0}
            className="font-mono-tech text-[9px] font-bold fill-[#111111] group-hover:fill-[#fe5029]"
          >
            {name}
          </text>
          {value && (
            <text
              x={10 + name.length * 6 + 4}
              y={0}
              className="font-mono-tech text-[8px] font-semibold fill-[#111111]/70"
            >
              {value} {unit}
            </text>
          )}
        </g>
      )}
    </g>
  );
};
