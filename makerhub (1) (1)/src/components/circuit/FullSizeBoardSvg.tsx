// src/components/circuit/FullSizeBoardSvg.tsx
// High-detail SVG rendering for real-world sized Maker Development Boards (Arduino, ESP32, Raspberry Pi Pico, STM32)

import React from 'react';
import { PlacedComponent, PinDefinition } from '../../types/circuit';
import { FULL_SIZE_BOARDS, BoardPhysicalSpec } from '../../data/boardDimensions';

interface FullSizeBoardSvgProps {
  component: PlacedComponent;
  spec: BoardPhysicalSpec;
  hoveredPinId: string | null;
  onPinMouseDown: (pin: PinDefinition, e: React.MouseEvent) => void;
  onPinHover: (pinId: string | null) => void;
}

export const FullSizeBoardSvg: React.FC<FullSizeBoardSvgProps> = ({
  component,
  spec,
  hoveredPinId,
  onPinMouseDown,
  onPinHover,
}) => {
  const { width, height, pcbColor, pins, chipLabel, hasUsbPort, usbType, usbPos, hasDcJack, dcJackPos, mountingHoles } = spec;

  return (
    <g id={`board-${component.id}`} className="select-none">
      {/* PCB Drop Shadow & Base Outline */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill={pcbColor}
        stroke="#111111"
        strokeWidth={2}
        className="filter drop-shadow-[4px_4px_0px_#111111]"
      />

      {/* PCB Gold/Silver Edge Chamfer Traces */}
      <rect
        x={4}
        y={4}
        width={width - 8}
        height={height - 8}
        rx={4}
        fill="none"
        stroke="#c4a000"
        strokeWidth={0.8}
        strokeOpacity={0.6}
        strokeDasharray="6 3"
      />

      {/* Mounting Screwholes with Gold Rings */}
      {mountingHoles?.map((mh, idx) => (
        <g key={`mh-${idx}`}>
          <circle cx={mh.x} cy={mh.y} r={7} fill="#c4a000" stroke="#111111" strokeWidth={1} />
          <circle cx={mh.x} cy={mh.y} r={4.5} fill="#ffffff" stroke="#111111" strokeWidth={1} />
        </g>
      ))}

      {/* USB Connector Shell */}
      {hasUsbPort && usbPos && (
        <g transform={`translate(${usbPos.x}, ${usbPos.y})`}>
          {usbType === 'type-b' ? (
            // Full-size USB Type-B Jack (Arduino Uno/Mega)
            <g>
              <rect x={-20} y={-8} width={38} height={42} rx={2} fill="#d8d8d8" stroke="#111111" strokeWidth={1.5} />
              <rect x={-14} y={-2} width={26} height={30} rx={1} fill="#ffffff" stroke="#111111" strokeWidth={1} />
              <rect x={-10} y={4} width={18} height={18} fill="#00878F" />
              <text x={-5} y={16} fill="#ffffff" fontSize="7" fontFamily="monospace" fontWeight="bold">USB</text>
            </g>
          ) : usbType === 'type-c' ? (
            // Modern Oval USB-C Receptacle
            <g>
              <rect x={-4} y={-6} width={32} height={20} rx={5} fill="#e0e0e0" stroke="#111111" strokeWidth={1.5} />
              <rect x={0} y={-2} width={24} height={12} rx={3} fill="#111111" />
              <line x1={3} y1={4} x2={21} y2={4} stroke="#c4a000" strokeWidth={1.5} />
            </g>
          ) : (
            // Micro-USB Port
            <g>
              <rect x={-2} y={-5} width={28} height={18} rx={2} fill="#cccccc" stroke="#111111" strokeWidth={1.5} />
              <polygon points="2, -2 22, -2 20, 10 4, 10" fill="#222222" />
            </g>
          )}
        </g>
      )}

      {/* DC Barrel Jack (Arduino Uno / Mega) */}
      {hasDcJack && dcJackPos && (
        <g transform={`translate(${dcJackPos.x}, ${dcJackPos.y})`}>
          <rect x={-22} y={-6} width={42} height={34} rx={3} fill="#111111" stroke="#333333" strokeWidth={1.5} />
          <circle cx={-1} cy={11} r={8} fill="#2a2a2a" stroke="#ffffff" strokeWidth={1} />
          <circle cx={-1} cy={11} r={3} fill="#c4a000" />
          <text x={-18} y={-9} fill="#ffffff" fontSize="7" fontFamily="monospace">POWER 7-12V</text>
        </g>
      )}

      {/* Center Microcontroller IC (LQFP or DIP or RF Can) */}
      {spec.type.includes('esp32') ? (
        // ESP32 Metal RF Shield Can
        <g transform={`translate(${width / 2 - 45}, 35)`}>
          <rect x={0} y={0} width={90} height={110} rx={4} fill="#e8e8e8" stroke="#111111" strokeWidth={1.5} />
          {/* PCB Antenna Meander on Top */}
          <rect x={5} y={-25} width={80} height={22} rx={2} fill="#1a1a1a" stroke="#111111" strokeWidth={1} />
          <path d="M 15 -14 H 25 V -8 H 35 V -14 H 45 V -8 H 55 V -14 H 65 V -8 H 75" fill="none" stroke="#c4a000" strokeWidth={1.5} />
          <text x={10} y={20} fill="#111111" fontSize="10" fontFamily="monospace" fontWeight="bold">Espressif</text>
          <text x={10} y={35} fill="#111111" fontSize="9" fontFamily="monospace">{chipLabel}</text>
          <text x={10} y={50} fill="#555555" fontSize="7" fontFamily="monospace">FCC ID: 2AC7Z-ESPWROOM32</text>
          {/* Wi-Fi & BLE Logos */}
          <circle cx={72} cy={85} r={10} fill="#111111" />
          <text x={65} y={89} fill="#ffffff" fontSize="9" fontFamily="monospace">Wi-Fi</text>
        </g>
      ) : spec.type.includes('arduino_uno') ? (
        // DIP-28 socket and IC
        <g transform={`translate(80, 50)`}>
          <rect x={0} y={0} width={115} height={45} rx={2} fill="#1a1a1a" stroke="#111111" strokeWidth={1.5} />
          <circle cx={6} cy={22} r={4} fill="#000000" />
          <text x={20} y={26} fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">{chipLabel}</text>
          {/* IC Lead Pins */}
          {Array.from({ length: 14 }).map((_, i) => (
            <React.Fragment key={`dip-pin-${i}`}>
              <rect x={12 + i * 7} y={-4} width={3} height={4} fill="#c4a000" />
              <rect x={12 + i * 7} y={45} width={3} height={4} fill="#c4a000" />
            </React.Fragment>
          ))}
        </g>
      ) : (
        // QFP SMD Chip with Pins on 4 sides (Mega / Pico / STM32)
        <g transform={`translate(${width / 2 - 30}, ${height / 2 - 30})`}>
          <rect x={0} y={0} width={60} height={60} rx={2} fill="#1c1c1c" stroke="#111111" strokeWidth={1.5} />
          <circle cx={8} cy={8} r={3} fill="#555555" />
          <text x={6} y={32} fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">{chipLabel}</text>
          <text x={6} y={44} fill="#c4a000" fontSize="7" fontFamily="monospace">ARM / RISC</text>
        </g>
      )}

      {/* Crystal Oscillator Silver Can */}
      <rect x={width / 2 + 15} y={height / 2 + 35} width={28} height={14} rx={3} fill="#dcdcdc" stroke="#111111" strokeWidth={1} />
      <text x={width / 2 + 19} y={height / 2 + 45} fill="#111111" fontSize="7" fontFamily="monospace">16.000</text>

      {/* Reset Tactile Button */}
      <g transform={`translate(${width - 45}, 25)`}>
        <rect x={0} y={0} width={16} height={16} rx={2} fill="#d8d8d8" stroke="#111111" strokeWidth={1} />
        <circle cx={8} cy={8} r={5} fill="#fe5029" stroke="#111111" strokeWidth={0.8} />
        <text x={-2} y={24} fill="#ffffff" fontSize="7" fontFamily="monospace" fontWeight="bold">RESET</text>
      </g>

      {/* Board Brand & Silkscreen Label */}
      <text
        x={width / 2}
        y={height - 22}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontFamily="monospace"
        fontWeight="bold"
        className="select-none pointer-events-none"
      >
        {spec.name}
      </text>

      {/* Pin Headers & Labels */}
      {pins.map((pin) => {
        const isHovered = hoveredPinId === pin.id;
        const pinColor = pin.type === 'ground' ? '#111111' : pin.type === 'power' ? '#fe5029' : pin.type === 'analog' ? '#2e7d32' : '#0284c7';

        return (
          <g
            key={pin.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              onPinMouseDown(pin, e);
            }}
            onMouseEnter={() => onPinHover(pin.id)}
            onMouseLeave={() => onPinHover(null)}
            className="cursor-crosshair group"
          >
            {/* Header Outer Square Socket */}
            <rect
              x={pin.x - 5}
              y={pin.y - 5}
              width={10}
              height={10}
              rx={1.5}
              fill="#111111"
              stroke="#333333"
              strokeWidth={1}
            />

            {/* Inner Gold Hole */}
            <circle
              cx={pin.x}
              cy={pin.y}
              r={2.8}
              fill={isHovered ? '#fe5029' : '#c4a000'}
              stroke="#ffffff"
              strokeWidth={0.8}
            />

            {/* Pin Silkscreen Label */}
            <text
              x={pin.x}
              y={pin.y > height / 2 ? pin.y - 8 : pin.y + 14}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="7"
              fontFamily="monospace"
              fontWeight="bold"
              className="pointer-events-none select-none"
            >
              {pin.label}
            </text>

            {/* Hover Target Expansion */}
            <circle
              cx={pin.x}
              cy={pin.y}
              r={9}
              fill="transparent"
            >
              <title>{pin.name} ({pin.type.toUpperCase()})</title>
            </circle>
          </g>
        );
      })}
    </g>
  );
};
