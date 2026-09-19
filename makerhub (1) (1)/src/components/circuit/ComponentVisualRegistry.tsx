// src/components/circuit/ComponentVisualRegistry.tsx
// Component visual renderer registry supporting passives, semiconductors, power sources, sensors, ICs, displays, modules, and full-size development boards

import React from 'react';
import { PlacedComponent, PinDefinition } from '../../types/circuit';
import { FULL_SIZE_BOARDS } from '../../data/boardDimensions';
import { FullSizeBoardSvg } from './FullSizeBoardSvg';

interface ComponentRenderProps {
  component: PlacedComponent;
  hoveredPinId: string | null;
  onPinMouseDown: (pin: PinDefinition, e: React.MouseEvent) => void;
  onPinHover: (pinId: string | null) => void;
}

export const renderComponentByType = ({
  component,
  hoveredPinId,
  onPinMouseDown,
  onPinHover,
}: ComponentRenderProps): React.ReactElement => {
  const type = component.type;

  // 1. Check Full Size Development Boards
  if (FULL_SIZE_BOARDS[type]) {
    return (
      <FullSizeBoardSvg
        component={component}
        spec={FULL_SIZE_BOARDS[type]}
        hoveredPinId={hoveredPinId}
        onPinMouseDown={onPinMouseDown}
        onPinHover={onPinHover}
      />
    );
  }

  // Legacy board alias support
  if (type === 'esp32') {
    return (
      <FullSizeBoardSvg
        component={component}
        spec={FULL_SIZE_BOARDS.esp32_devkit}
        hoveredPinId={hoveredPinId}
        onPinMouseDown={onPinMouseDown}
        onPinHover={onPinHover}
      />
    );
  }

  // 2. Render Component Pins Helper
  const renderPins = (pins: PinDefinition[]) => {
    return pins.map((p) => {
      const isHovered = hoveredPinId === p.id;
      const isPower = p.type === 'power';
      const isGnd = p.type === 'ground';

      return (
        <g
          key={p.id}
          onMouseDown={(e) => {
            e.stopPropagation();
            onPinMouseDown(p, e);
          }}
          onMouseEnter={() => onPinHover(p.id)}
          onMouseLeave={() => onPinHover(null)}
          className="cursor-crosshair group"
        >
          {/* Outer pin socket */}
          <circle
            cx={p.x}
            cy={p.y}
            r={isHovered ? 5.5 : 4}
            fill={isHovered ? '#fe5029' : isPower ? '#ef4444' : isGnd ? '#111111' : '#c4a000'}
            stroke="#111111"
            strokeWidth={1.5}
            className="transition-all"
          />
          {/* Inner core */}
          <circle cx={p.x} cy={p.y} r={1.5} fill="#ffffff" />
          {/* Silkscreen Pin Label */}
          {p.label && (
            <text
              x={p.x}
              y={p.y > 25 ? p.y + 11 : p.y - 7}
              textAnchor="middle"
              className="font-mono-tech text-[7px] font-bold fill-[#111111] select-none pointer-events-none"
            >
              {p.label}
            </text>
          )}
          {/* Big hover target */}
          <circle cx={p.x} cy={p.y} r={8} fill="transparent">
            <title>{p.name}</title>
          </circle>
        </g>
      );
    });
  };

  // 3. Specialized Graphic Visuals for all Component Families
  // Resistors
  if (type === 'resistor' || type.startsWith('resistor_')) {
    return (
      <g>
        <line x1={0} y1={15} x2={16} y2={15} stroke="#888888" strokeWidth={2} />
        <line x1={44} y1={15} x2={60} y2={15} stroke="#888888" strokeWidth={2} />
        <rect x={16} y={8} width={28} height={14} rx={3} fill="#d2b48c" stroke="#111111" strokeWidth={1.5} />
        {/* Color Bands */}
        <line x1={22} y1={8} x2={22} y2={22} stroke="#8B4513" strokeWidth={2} />
        <line x1={27} y1={8} x2={27} y2={22} stroke="#000000" strokeWidth={2} />
        <line x1={32} y1={8} x2={32} y2={22} stroke="#fe5029" strokeWidth={2} />
        <line x1={38} y1={8} x2={38} y2={22} stroke="#ffd700" strokeWidth={2} />
        <text x={30} y={32} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.value}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Capacitors
  if (type === 'capacitor' || type.startsWith('capacitor_')) {
    const isElectrolytic = component.value.includes('u') || component.value.includes('F');
    return (
      <g>
        <line x1={0} y1={15} x2={20} y2={15} stroke="#888888" strokeWidth={2} />
        <line x1={40} y1={15} x2={60} y2={15} stroke="#888888" strokeWidth={2} />
        {isElectrolytic ? (
          // Radial Electrolytic Aluminum Can
          <g>
            <rect x={20} y={4} width={20} height={22} rx={4} fill="#1e3a8a" stroke="#111111" strokeWidth={1.5} />
            <rect x={34} y={4} width={6} height={22} fill="#d1d5db" />
            <text x={37} y={17} textAnchor="middle" fill="#111111" fontSize="9" fontWeight="bold">-</text>
          </g>
        ) : (
          // Ceramic Disc (Orange/Yellow)
          <circle cx={30} cy={15} r={12} fill="#ea580c" stroke="#111111" strokeWidth={1.5} />
        )}
        <text x={30} y={34} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.value}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Inductors
  if (type === 'inductor') {
    return (
      <g>
        <line x1={0} y1={15} x2={16} y2={15} stroke="#888888" strokeWidth={2} />
        <line x1={44} y1={15} x2={60} y2={15} stroke="#888888" strokeWidth={2} />
        <rect x={16} y={7} width={28} height={16} rx={4} fill="#15803d" stroke="#111111" strokeWidth={1.5} />
        <text x={30} y={18} textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="monospace">100µH</text>
        <text x={30} y={32} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.value}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Potentiometers
  if (type === 'potentiometer') {
    return (
      <g>
        <rect x={8} y={5} width={44} height={26} rx={4} fill="#0284c7" stroke="#111111" strokeWidth={1.5} />
        <circle cx={30} cy={18} r={9} fill="#f1f5f9" stroke="#111111" strokeWidth={1.5} />
        <line x1={30} y1={18} x2={36} y2={12} stroke="#fe5029" strokeWidth={2.5} strokeLinecap="round" />
        <text x={30} y={45} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.value}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // LEDs (Red, Green, Blue, Yellow, White, Orange, UV, IR)
  if (type.startsWith('led') || type === 'ir_emitter' || type === 'uv_led') {
    let bulbColor = '#ef4444'; // Red default
    if (type.includes('green')) bulbColor = '#22c55e';
    if (type.includes('blue')) bulbColor = '#3b82f6';
    if (type.includes('yellow')) bulbColor = '#eab308';
    if (type.includes('white')) bulbColor = '#f8fafc';
    if (type.includes('orange')) bulbColor = '#f97316';
    if (type.includes('uv')) bulbColor = '#a855f7';
    if (type.includes('ir')) bulbColor = '#475569';

    // RGB LEDs (4 Pins)
    if (type === 'led_rgb_ca' || type === 'led_rgb_cc' || type === 'neopixel_ws2812b') {
      return (
        <g>
          <rect x={5} y={4} width={58} height={24} rx={4} fill="#1e293b" stroke="#111111" strokeWidth={1.5} />
          <circle cx={34} cy={16} r={8} fill="url(#rgbGradient)" stroke="#ffffff" strokeWidth={1} />
          <defs>
            <linearGradient id="rgbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <text x={34} y={19} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">RGB</text>
          {renderPins(component.pins)}
        </g>
      );
    }

    return (
      <g>
        <line x1={0} y1={15} x2={22} y2={15} stroke="#888888" strokeWidth={2} />
        <line x1={38} y1={15} x2={60} y2={15} stroke="#888888" strokeWidth={2} />
        {/* LED 5mm Dome with Flat Cathode Lip */}
        <circle cx={30} cy={15} r={11} fill={bulbColor} stroke="#111111" strokeWidth={1.5} fillOpacity={0.9} />
        <path d="M 37 6 L 37 24" stroke="#111111" strokeWidth={2} />
        <circle cx={27} cy={12} r={3} fill="#ffffff" fillOpacity={0.6} />
        {/* Emitted Light Rays */}
        <path d="M 34 6 L 39 2 M 38 9 L 43 5" stroke="#fe5029" strokeWidth={1.5} strokeLinecap="round" />
        <text x={30} y={34} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.name}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Ultrasonic Distance Sensor (HC-SR04)
  if (type === 'sensor_hcsr04') {
    return (
      <g>
        <rect x={6} y={0} width={64} height={30} rx={4} fill="#0284c7" stroke="#111111" strokeWidth={1.5} />
        {/* Dual Ultrasonic Transducers */}
        <circle cx={22} cy={14} r={9} fill="#cbd5e1" stroke="#111111" strokeWidth={1.5} />
        <circle cx={22} cy={14} r={5} fill="#475569" />
        <text x={22} y={16} textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">T</text>
        <circle cx={54} cy={14} r={9} fill="#cbd5e1" stroke="#111111" strokeWidth={1.5} />
        <circle cx={54} cy={14} r={5} fill="#475569" />
        <text x={54} y={16} textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">R</text>
        <text x={38} y={27} textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="monospace">HC-SR04</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // OLED & LCD Displays
  if (type.startsWith('display_')) {
    const isOled = type.includes('oled');
    const isLcd = type.includes('lcd');
    return (
      <g>
        <rect x={4} y={-4} width={68} height={36} rx={3} fill="#1e293b" stroke="#111111" strokeWidth={1.5} />
        {/* Glass Screen */}
        <rect
          x={8}
          y={0}
          width={60}
          height={26}
          rx={2}
          fill={isOled ? '#020617' : isLcd ? '#047857' : '#1e1b4b'}
          stroke="#475569"
          strokeWidth={1}
        />
        <text
          x={38}
          y={12}
          textAnchor="middle"
          fill={isOled ? '#38bdf8' : isLcd ? '#a7f3d0' : '#f8fafc'}
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {isOled ? 'SSD1306 128x64' : isLcd ? 'LCD 16x2 I2C' : 'TFT DISPLAY'}
        </text>
        <text
          x={38}
          y={21}
          textAnchor="middle"
          fill={isOled ? '#38bdf8' : isLcd ? '#a7f3d0' : '#f8fafc'}
          fontSize="6"
          fontFamily="monospace"
        >
          MAKERHUB V3
        </text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Servos & Actuators
  if (type.startsWith('servo_')) {
    return (
      <g>
        {/* Blue Servo Body */}
        <rect x={8} y={2} width={54} height={28} rx={3} fill="#0284c7" stroke="#111111" strokeWidth={1.5} />
        {/* Output Shaft Horn */}
        <circle cx={20} cy={16} r={9} fill="#ffffff" stroke="#111111" strokeWidth={1.5} />
        <circle cx={20} cy={16} r={3} fill="#fe5029" />
        <rect x={18} y={4} width={4} height={24} rx={1} fill="#ffffff" stroke="#111111" strokeWidth={1} />
        <text x={44} y={15} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">SERVO</text>
        <text x={44} y={24} textAnchor="middle" fill="#ffffff" fontSize="6">SG90 9G</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Stepper Motors (NEMA 17)
  if (type === 'stepper_nema17') {
    return (
      <g>
        <rect x={8} y={-2} width={60} height={34} rx={4} fill="#475569" stroke="#111111" strokeWidth={1.5} />
        <circle cx={38} cy={15} r={11} fill="#cbd5e1" stroke="#111111" strokeWidth={1.5} />
        <circle cx={38} cy={15} r={4} fill="#1e293b" />
        <text x={38} y={30} textAnchor="middle" fill="#ffffff" fontSize="6" fontFamily="monospace">NEMA 17 STEPPER</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // DC Motors
  if (type.startsWith('dc_motor') || type.startsWith('brushless')) {
    return (
      <g>
        <circle cx={36} cy={16} r={15} fill="#cbd5e1" stroke="#111111" strokeWidth={1.5} />
        <circle cx={36} cy={16} r={4} fill="#fe5029" stroke="#111111" strokeWidth={1} />
        <text x={36} y={19} textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">M</text>
        <text x={36} y={35} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.name}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Relays (SPDT Blue Cube)
  if (type.startsWith('relay_') || type === 'ssr_solid_state_relay') {
    return (
      <g>
        <rect x={6} y={2} width={60} height={30} rx={3} fill="#1d4ed8" stroke="#111111" strokeWidth={1.5} />
        <text x={36} y={14} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">RELAY</text>
        <text x={36} y={24} textAnchor="middle" fill="#bfdbfe" fontSize="7" fontFamily="monospace">{component.value}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Diodes & Zener Diodes
  if (type === 'diode' || type === 'zener' || type === 'bridge_rectifier') {
    const isZener = type === 'zener';
    if (type === 'bridge_rectifier') {
      return (
        <g>
          <rect x={8} y={4} width={54} height={28} rx={3} fill="#1e293b" stroke="#111111" strokeWidth={1.5} />
          <text x={35} y={16} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">RECTIFIER</text>
          <text x={35} y={26} textAnchor="middle" fill="#94a3b8" fontSize="7">AC-DC 2A</text>
          {renderPins(component.pins)}
        </g>
      );
    }
    return (
      <g>
        <line x1={0} y1={15} x2={18} y2={15} stroke="#888888" strokeWidth={2} />
        <line x1={42} y1={15} x2={60} y2={15} stroke="#888888" strokeWidth={2} />
        <rect x={18} y={9} width={24} height={12} rx={2} fill={isZener ? '#3b82f6' : '#111111'} stroke="#111111" strokeWidth={1.5} />
        {/* Cathode Line */}
        <line x1={36} y1={9} x2={36} y2={21} stroke="#ffffff" strokeWidth={3} />
        <text x={30} y={32} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.value}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Transistors & MOSFETs (TO-92 / TO-220 Package)
  if (type.startsWith('bjt_') || type.startsWith('mosfet_') || type.startsWith('darlington_') || type.startsWith('scr_') || type.startsWith('triac_')) {
    return (
      <g>
        {/* TO-92 Semi-circle body */}
        <path d="M 12 8 C 12 -4, 48 -4, 48 8 L 48 24 L 12 24 Z" fill="#1e293b" stroke="#111111" strokeWidth={1.5} />
        <text x={30} y={18} textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="monospace" fontWeight="bold">
          {type.includes('npn') ? 'NPN' : type.includes('pnp') ? 'PNP' : type.includes('mosfet') ? 'MOS' : 'TR'}
        </text>
        <text x={30} y={45} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.name}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Voltage Regulators (TO-220 Heatsink)
  if (type.startsWith('regulator_')) {
    return (
      <g>
        {/* Metal Heatsink Tab with mounting hole */}
        <rect x={14} y={-10} width={32} height={14} rx={1} fill="#94a3b8" stroke="#111111" strokeWidth={1.5} />
        <circle cx={30} cy={-3} r={3} fill="#ffffff" stroke="#111111" strokeWidth={1} />
        {/* Plastic Molded Body */}
        <rect x={10} y={4} width={40} height={22} rx={2} fill="#111111" stroke="#333333" strokeWidth={1.5} />
        <text x={30} y={18} textAnchor="middle" fill="#ffffff" fontSize="7" fontFamily="monospace">{component.value}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Momentary Pushbutton / Switches
  if (type === 'pushbutton' || type.startsWith('spst_') || type.startsWith('spdt_') || type.startsWith('reed_') || type.startsWith('mercury_')) {
    return (
      <g>
        <rect x={14} y={4} width={32} height={22} rx={4} fill="#e2e8f0" stroke="#111111" strokeWidth={1.5} />
        <circle cx={30} cy={15} r={7} fill="#fe5029" stroke="#111111" strokeWidth={1.5} />
        <text x={30} y={36} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.name}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // DC Power Supplies & Batteries
  if (type.startsWith('dc_source') || type.startsWith('battery')) {
    return (
      <g>
        <rect x={6} y={2} width={48} height={26} rx={4} fill="#f59e0b" stroke="#111111" strokeWidth={1.5} />
        <rect x={10} y={6} width={40} height={18} rx={2} fill="#ffffff" stroke="#111111" strokeWidth={1} />
        <text x={30} y={18} textAnchor="middle" fill="#fe5029" fontSize="9" fontWeight="bold" fontFamily="monospace">{component.value}V</text>
        <text x={30} y={38} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">{component.name}</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Ground Reference
  if (type === 'ground') {
    return (
      <g>
        <line x1={20} y1={5} x2={20} y2={22} stroke="#111111" strokeWidth={2.5} />
        <line x1={8} y1={22} x2={32} y2={22} stroke="#111111" strokeWidth={2.5} />
        <line x1={12} y1={26} x2={28} y2={26} stroke="#111111" strokeWidth={2} />
        <line x1={16} y1={30} x2={24} y2={30} stroke="#111111" strokeWidth={1.5} />
        <text x={20} y={42} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">GND 0V</text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Sensors (Environmental, Motion, Light, Gas, Sound, Biometric)
  if (type.startsWith('sensor_')) {
    return (
      <g>
        <rect x={8} y={2} width={58} height={30} rx={4} fill="#0f766e" stroke="#111111" strokeWidth={1.5} />
        <rect x={12} y={5} width={50} height={14} rx={2} fill="#134e4a" />
        <text x={37} y={15} textAnchor="middle" fill="#5eead4" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
          {component.name.length > 12 ? component.name.substring(0, 10) + '..' : component.name}
        </text>
        <circle cx={18} cy={24} r={2} fill="#5eead4" />
        <text x={37} y={26} textAnchor="middle" fill="#ccfbf1" fontSize="6.5" fontFamily="monospace">
          {component.value ? component.value.substring(0, 14) : 'SENSOR'}
        </text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Wireless and Communication Modules (nRF24, Bluetooth, LoRa, GPS, RFID)
  if (type.startsWith('module_')) {
    return (
      <g>
        <rect x={6} y={2} width={62} height={30} rx={4} fill="#1e1b4b" stroke="#111111" strokeWidth={1.5} />
        <rect x={10} y={5} width={54} height={13} rx={2} fill="#312e81" />
        <text x={37} y={14} textAnchor="middle" fill="#a5b4fc" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
          {component.name.length > 13 ? component.name.substring(0, 11) + '..' : component.name}
        </text>
        <text x={37} y={25} textAnchor="middle" fill="#e0e7ff" fontSize="6.5" fontFamily="monospace">
          RF MODULE
        </text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Integrated Circuits (DIP Packages with Notch)
  if (type.startsWith('ic_') || type.startsWith('uln') || type.startsWith('l293') || type === 'seven_segment') {
    return (
      <g>
        <rect x={6} y={6} width={76} height={26} rx={3} fill="#0f172a" stroke="#111111" strokeWidth={1.5} />
        {/* Notch on left edge */}
        <circle cx={6} cy={19} r={3} fill="#ffffff" stroke="#111111" strokeWidth={1} />
        <text x={44} y={22} textAnchor="middle" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">
          {component.name.length > 14 ? component.name.substring(0, 12) + '..' : component.name}
        </text>
        {renderPins(component.pins)}
      </g>
    );
  }

  // Generic Module / Default Fallback Visual
  return (
    <g>
      <rect x={4} y={4} width={62} height={28} rx={4} fill="#f1f5f9" stroke="#111111" strokeWidth={1.5} />
      <text x={35} y={20} textAnchor="middle" className="font-mono-tech text-[8px] font-bold fill-[#111111]">
        {component.name}
      </text>
      {renderPins(component.pins)}
    </g>
  );
};
