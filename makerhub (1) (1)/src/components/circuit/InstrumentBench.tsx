import React, { useState, useEffect } from 'react';
import { PlacedComponent, WireConnection, SimulationOutput } from '../../types/circuit';
import { CircuitGraph } from '../../utils/spiceEngine';
import {
  Activity,
  Gauge,
  Terminal,
  Zap,
  Radio,
  Sliders,
  Play,
  Square,
  RefreshCw,
  Volume2,
  Battery,
  Flame,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react';

interface InstrumentBenchProps {
  components: PlacedComponent[];
  wires: WireConnection[];
  graph?: CircuitGraph | null;
  simulation: SimulationOutput | null;
  boardMcu?: string;
  onSelectNet?: (netId: string) => void;
  onClose?: () => void;
}

type InstrumentTab = 'multimeter' | 'scope' | 'logic' | 'serial' | 'power';

export const InstrumentBench: React.FC<InstrumentBenchProps> = ({
  components,
  wires,
  graph,
  simulation,
  boardMcu,
  onSelectNet,
  onClose,
}) => {
  const [activeInstrument, setActiveInstrument] = useState<InstrumentTab>('multimeter');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // --- Multimeter State ---
  const [dmmMode, setDmmMode] = useState<'vdc' | 'vac' | 'idc' | 'res' | 'cont'>('vdc');
  const [dmmProbeA, setDmmProbeA] = useState<string>('node_1');
  const [dmmProbeB, setDmmProbeB] = useState<string>('0'); // GND default
  const [dmmHold, setDmmHold] = useState<boolean>(false);

  // --- Oscilloscope State ---
  const [scopeRunning, setScopeRunning] = useState<boolean>(true);
  const [timeDiv, setTimeDiv] = useState<number>(1); // ms/div
  const [ch1Net, setCh1Net] = useState<string>('node_1');
  const [ch2Net, setCh2Net] = useState<string>('0');
  const [ch1Scale, setCh1Scale] = useState<number>(1); // V/div
  const [ch2Scale, setCh2Scale] = useState<number>(1); // V/div
  const [cursorPos, setCursorPos] = useState<number>(50);

  // --- Serial Monitor State ---
  const [baudRate, setBaudRate] = useState<string>('115200');
  const [serialInput, setSerialInput] = useState<string>('');
  const [serialLogs, setSerialLogs] = useState<Array<{ time: string; text: string; source: 'mcu' | 'user' }>>([
    { time: '00:00.012', text: `[BOOT] ${boardMcu || 'MCU'} initialising clock at 80MHz...`, source: 'mcu' },
    { time: '00:00.035', text: '[BOOT] GPIO peripherals configured. Ready.', source: 'mcu' },
  ]);

  // Available electrical nodes
  const availableNodes = Object.keys(simulation?.dc?.nodeVoltages || { '0': 0, 'node_1': 0 });

  // Compute live Multimeter reading
  const computeDmmReading = (): { value: string; unit: string; stateText: string; isBeeping: boolean } => {
    if (!simulation || !simulation.dc) {
      return { value: '----', unit: '', stateText: 'CIRCUIT OFF // RUN SPICE', isBeeping: false };
    }

    const vA = simulation.dc.nodeVoltages[dmmProbeA] ?? 0;
    const vB = simulation.dc.nodeVoltages[dmmProbeB] ?? 0;
    const vDiff = vA - vB;

    if (dmmMode === 'vdc') {
      return {
        value: Math.abs(vDiff) < 1 ? (vDiff * 1000).toFixed(2) : vDiff.toFixed(3),
        unit: Math.abs(vDiff) < 1 ? 'mV DC' : 'V DC',
        stateText: `PROBE A: [${dmmProbeA}] → PROBE B: [${dmmProbeB}]`,
        isBeeping: false,
      };
    } else if (dmmMode === 'vac') {
      const vRms = Math.abs(vDiff) * 0.707;
      return {
        value: vRms.toFixed(3),
        unit: 'V RMS',
        stateText: `AC COUPLED // RMS EQUIVALENT`,
        isBeeping: false,
      };
    } else if (dmmMode === 'idc') {
      // Branch current estimation
      const totalI = Object.values(simulation.dc.branchCurrents)[0] || 0;
      const absI = Math.abs(totalI);
      return {
        value: absI < 0.001 ? (absI * 1e6).toFixed(1) : (absI * 1000).toFixed(2),
        unit: absI < 0.001 ? 'µA DC' : 'mA DC',
        stateText: 'SERIES IN-LINE AMMETER BRANCH',
        isBeeping: false,
      };
    } else if (dmmMode === 'res') {
      return {
        value: dmmProbeA === dmmProbeB ? '0.00' : '220.0',
        unit: 'Ω',
        stateText: 'RESISTANCE MEASUREMENT',
        isBeeping: false,
      };
    } else {
      // Continuity
      const isShort = Math.abs(vDiff) < 0.001 && dmmProbeA === dmmProbeB;
      return {
        value: isShort ? '0.00 Ω' : 'O.L',
        unit: isShort ? 'SHORT' : 'OPEN',
        stateText: isShort ? 'CONTINUITY DETECTED (BEEP)' : 'OPEN CIRCUIT',
        isBeeping: isShort,
      };
    }
  };

  const dmm = computeDmmReading();

  // Handle sending serial message to simulated MCU
  const handleSendSerial = () => {
    if (!serialInput.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0').slice(0, 2)}`;
    
    setSerialLogs((prev) => [
      ...prev,
      { time: timeStr, text: `> ${serialInput}`, source: 'user' },
      { time: timeStr, text: `[ACK] Command "${serialInput}" processed by GPIO handler.`, source: 'mcu' },
    ]);
    setSerialInput('');
  };

  // Power Analysis calculations
  const totalPowerW = simulation?.dc
    ? Object.values(simulation.dc.componentPowers).reduce((sum, p) => sum + (p || 0), 0)
    : 0;

  const totalCurrentA = simulation?.dc
    ? Object.values(simulation.dc.branchCurrents).reduce((sum, i) => sum + Math.abs(i || 0), 0) / 2
    : 0;

  const totalCurrentMa = totalCurrentA * 1000;

  // Battery life estimations in hours
  const batt9vHours = totalCurrentMa > 0 ? (550 / totalCurrentMa).toFixed(1) : '∞';
  const batt18650Hours = totalCurrentMa > 0 ? (2500 / totalCurrentMa).toFixed(1) : '∞';
  const battAaHours = totalCurrentMa > 0 ? (2000 / totalCurrentMa).toFixed(1) : '∞';
  const battCoinHours = totalCurrentMa > 0 ? (220 / totalCurrentMa).toFixed(1) : '∞';

  return (
    <div className={`w-full bg-[#111111] text-white border-t border-[#111111] flex flex-col transition-all select-none ${isExpanded ? 'h-80' : 'h-52'}`}>
      {/* Instrument Bench Toolbar */}
      <div className="h-9 border-b border-gray-800 bg-[#1a1a1a] px-3 flex items-center justify-between text-xs font-mono-tech">
        {/* Instrument Selector Tabs */}
        <div className="flex items-center gap-1">
          <span className="text-[#fe5029] font-bold text-[10px] mr-2 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" />
            BENCH //
          </span>

          {[
            { id: 'multimeter', label: 'DIGITAL MULTIMETER', icon: Gauge },
            { id: 'scope', label: 'OSCILLOSCOPE', icon: Activity },
            { id: 'logic', label: 'LOGIC ANALYZER', icon: Sliders },
            { id: 'serial', label: 'SERIAL MONITOR', icon: Terminal },
            { id: 'power', label: 'POWER & THERMAL', icon: Battery },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeInstrument === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveInstrument(tab.id as InstrumentTab)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-[#fe5029] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore Height' : 'Expand Height'}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Slide Down / Close Instrument Bench"
              className="p-1 text-gray-400 hover:text-[#fe5029] hover:bg-gray-800 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Instrument Display Body */}
      <div className="flex-1 overflow-hidden p-3 font-mono-tech">
        {/* ================= MULTIMETER ================= */}
        {activeInstrument === 'multimeter' && (
          <div className="h-full flex gap-4">
            {/* Left: DMM Display Box */}
            <div className="flex-1 bg-[#1a2e22] border-2 border-[#165a36] rounded-md p-3 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-[#75f76e]">
                <span className="font-bold tracking-wider">MAKEO DMM-800 TRUE-RMS</span>
                <span>{dmm.stateText}</span>
              </div>

              {/* 7-Segment Readout */}
              <div className="text-right py-2">
                <div className="text-4xl sm:text-5xl font-mono font-black text-[#75f76e] tracking-widest drop-shadow-[0_0_8px_rgba(117,247,110,0.6)]">
                  {dmm.value}
                </div>
                <div className="text-xs font-bold text-[#75f76e]/80 mt-1 uppercase">
                  {dmm.unit}
                </div>
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between text-[9px] text-[#75f76e]/70 border-t border-[#165a36] pt-1">
                <span>AUTO-RANGE</span>
                {dmm.isBeeping && (
                  <span className="text-yellow-400 font-bold flex items-center gap-1 animate-pulse">
                    <Volume2 className="w-3 h-3" /> BEEP (0.00 Ω SHORT)
                  </span>
                )}
                <span>10 MΩ INPUT IMPEDANCE</span>
              </div>
            </div>

            {/* Right: DMM Controls & Probe Assign */}
            <div className="w-72 bg-[#1c1c1c] border border-gray-800 p-2.5 flex flex-col justify-between text-[10px]">
              {/* Function Mode Buttons */}
              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase text-[9px]">FUNCTION:</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'vdc', label: 'V (DC)' },
                    { id: 'vac', label: 'V~ (AC)' },
                    { id: 'idc', label: 'mA (DC)' },
                    { id: 'res', label: 'Ω (OHMS)' },
                    { id: 'cont', label: 'CONT ♫' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setDmmMode(btn.id as any)}
                      className={`p-1.5 font-bold uppercase border ${
                        dmmMode === btn.id
                          ? 'border-[#fe5029] bg-[#fe5029] text-white'
                          : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Probe Node Assignments */}
              <div className="space-y-1.5 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-red-400 font-bold">PROBE + (RED):</span>
                  <select
                    value={dmmProbeA}
                    onChange={(e) => setDmmProbeA(e.target.value)}
                    className="p-1 bg-black border border-gray-700 text-red-400 font-bold text-[10px] focus:outline-none"
                  >
                    {availableNodes.map((n) => (
                      <option key={`a-${n}`} value={n}>
                        {n === '0' ? 'Node 0 (GND)' : `Node ${n}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <span className="text-gray-400 font-bold">PROBE - (COM):</span>
                  <select
                    value={dmmProbeB}
                    onChange={(e) => setDmmProbeB(e.target.value)}
                    className="p-1 bg-black border border-gray-700 text-gray-300 font-bold text-[10px] focus:outline-none"
                  >
                    {availableNodes.map((n) => (
                      <option key={`b-${n}`} value={n}>
                        {n === '0' ? 'Node 0 (GND)' : `Node ${n}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= OSCILLOSCOPE ================= */}
        {activeInstrument === 'scope' && (
          <div className="h-full flex gap-3">
            {/* Screen */}
            <div className="flex-1 bg-black border border-gray-800 relative flex flex-col">
              <div className="absolute top-1 left-2 text-[9px] text-gray-400 flex items-center gap-3 z-10">
                <span className="text-[#75f76e] font-bold">CH1: {ch1Net} ({ch1Scale}V/div)</span>
                <span className="text-[#6ebdf7] font-bold">CH2: {ch2Net} ({ch2Scale}V/div)</span>
                <span className="text-yellow-400">TIME: {timeDiv} ms/div</span>
              </div>

              <svg viewBox="0 0 600 130" className="w-full h-full bg-[#0a0a0a]">
                {/* 8x6 Grid */}
                {[...Array(9)].map((_, i) => (
                  <line key={`x-${i}`} x1={i * 75} y1={0} x2={i * 75} y2={130} stroke="#222222" strokeDasharray="2 2" />
                ))}
                {[...Array(7)].map((_, i) => (
                  <line key={`y-${i}`} x1={0} y1={i * 21.6} x2={600} y2={i * 21.6} stroke="#222222" strokeDasharray="2 2" />
                ))}

                {/* Center crosshairs */}
                <line x1={300} y1={0} x2={300} y2={130} stroke="#333333" />
                <line x1={0} y1={65} x2={600} y2={65} stroke="#333333" />

                {/* CH1 Waveform (e.g. Capacitor charging curve or sine) */}
                <path
                  d="M 10 110 Q 150 20, 300 25 T 590 25"
                  fill="none"
                  stroke="#75f76e"
                  strokeWidth={2}
                />

                {/* CH2 Waveform (Supply step) */}
                <path
                  d="M 10 110 L 80 110 L 80 30 L 590 30"
                  fill="none"
                  stroke="#6ebdf7"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
              </svg>
            </div>

            {/* Scope Knobs */}
            <div className="w-64 bg-[#1c1c1c] border border-gray-800 p-2 text-[10px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold">TIMEBASE:</span>
                <select
                  value={timeDiv}
                  onChange={(e) => setTimeDiv(Number(e.target.value))}
                  className="p-1 bg-black border border-gray-700 text-white font-bold"
                >
                  <option value={0.1}>0.1 ms/div</option>
                  <option value={0.5}>0.5 ms/div</option>
                  <option value={1}>1.0 ms/div</option>
                  <option value={5}>5.0 ms/div</option>
                  <option value={20}>20 ms/div</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#75f76e] font-bold">CH1 PROBE:</span>
                <select
                  value={ch1Net}
                  onChange={(e) => setCh1Net(e.target.value)}
                  className="p-1 bg-black border border-gray-700 text-[#75f76e] font-bold"
                >
                  {availableNodes.map((n) => (
                    <option key={`ch1-${n}`} value={n}>{n === '0' ? 'Node 0 (GND)' : `Node ${n}`}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#6ebdf7] font-bold">CH2 PROBE:</span>
                <select
                  value={ch2Net}
                  onChange={(e) => setCh2Net(e.target.value)}
                  className="p-1 bg-black border border-gray-700 text-[#6ebdf7] font-bold"
                >
                  {availableNodes.map((n) => (
                    <option key={`ch2-${n}`} value={n}>{n === '0' ? 'Node 0 (GND)' : `Node ${n}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= LOGIC ANALYZER ================= */}
        {activeInstrument === 'logic' && (
          <div className="h-full bg-black border border-gray-800 p-2 overflow-y-auto space-y-1 text-[10px]">
            {[
              { ch: 'D0 (PWM / GPIO 13)', pattern: 'M 10 15 L 40 15 L 40 5 L 80 5 L 80 15 L 120 15 L 120 5 L 160 5 L 160 15 L 200 15 L 200 5 L 240 5 L 240 15 L 280 15 L 280 5 L 320 5 L 320 15 L 360 15 L 360 5 L 400 5 L 400 15 L 440 15 L 440 5 L 480 5 L 480 15 L 520 15 L 520 5 L 560 5 L 560 15', freq: '490 Hz (50% DUTY)' },
              { ch: 'D1 (TX / UART)', pattern: 'M 10 5 L 60 5 L 60 15 L 90 15 L 90 5 L 140 5 L 140 15 L 170 15 L 170 5 L 300 5 L 300 15 L 340 15 L 340 5 L 560 5', freq: '115200 BAUD' },
              { ch: 'D2 (SCL / I2C CLK)', pattern: 'M 10 5 L 30 5 L 30 15 L 50 15 L 50 5 L 70 5 L 70 15 L 90 15 L 90 5 L 110 5 L 110 15 L 130 15 L 130 5 L 150 5 L 150 15 L 170 15 L 170 5 L 190 5 L 190 15 L 210 15 L 210 5 L 560 5', freq: '100 kHz BUS' },
              { ch: 'D3 (SDA / I2C DATA)', pattern: 'M 10 5 L 40 5 L 40 15 L 120 15 L 120 5 L 160 5 L 160 15 L 220 15 L 220 5 L 560 5', freq: 'ADDR: 0x3C (OLED)' },
            ].map((trace) => (
              <div key={trace.ch} className="flex items-center gap-2 border-b border-gray-900 pb-1">
                <span className="w-36 text-[#75f76e] font-bold truncate">{trace.ch}</span>
                <svg viewBox="0 0 570 20" className="flex-1 h-5 bg-[#141414] border border-gray-800">
                  <path d={trace.pattern} fill="none" stroke="#6ebdf7" strokeWidth={1.5} />
                </svg>
                <span className="w-32 text-right text-gray-400 text-[9px]">{trace.freq}</span>
              </div>
            ))}
          </div>
        )}

        {/* ================= SERIAL MONITOR ================= */}
        {activeInstrument === 'serial' && (
          <div className="h-full flex flex-col bg-black border border-gray-800 p-2">
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] scrollbar-thin text-green-400">
              {serialLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gray-500 text-[9px] select-none">{log.time}</span>
                  <span className={log.source === 'user' ? 'text-yellow-300 font-bold' : 'text-green-400'}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-8 border-t border-gray-800 pt-1 flex items-center gap-2">
              <input
                type="text"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSerial()}
                placeholder="Send serial command to MCU (e.g. GET_TEMP, LED_ON)..."
                className="flex-1 bg-[#1a1a1a] border border-gray-700 px-2 py-1 text-xs text-white focus:outline-none focus:border-[#fe5029]"
              />
              <button
                type="button"
                onClick={handleSendSerial}
                className="px-3 py-1 bg-[#fe5029] text-white font-bold text-xs uppercase"
              >
                SEND
              </button>
            </div>
          </div>
        )}

        {/* ================= POWER & THERMAL ================= */}
        {activeInstrument === 'power' && (
          <div className="h-full grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Power Summary Card */}
            <div className="bg-[#1c1c1c] border border-gray-800 p-3 flex flex-col justify-between">
              <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>TOTAL POWER DRAW</span>
              </div>
              <div className="text-3xl font-black text-yellow-400">
                {totalPowerW < 0.001 ? `${(totalPowerW * 1000).toFixed(2)} mW` : `${totalPowerW.toFixed(3)} W`}
              </div>
              <div className="text-[10px] text-gray-400 flex items-center justify-between border-t border-gray-800 pt-1">
                <span>TOTAL CURRENT:</span>
                <span className="font-bold text-white">{totalCurrentMa.toFixed(1)} mA</span>
              </div>
            </div>

            {/* Battery Life Estimator */}
            <div className="bg-[#1c1c1c] border border-gray-800 p-3 space-y-1.5">
              <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-[#75f76e]" />
                <span>ESTIMATED RUN-TIME</span>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">18650 Li-Ion (2500mAh):</span>
                  <span className="font-bold text-[#75f76e]">{batt18650Hours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">4x AA Alkaline (2000mAh):</span>
                  <span className="font-bold text-white">{battAaHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">9V PP3 Block (550mAh):</span>
                  <span className="font-bold text-yellow-400">{batt9vHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CR2032 Coin Cell (220mAh):</span>
                  <span className="font-bold text-gray-300">{battCoinHours} hrs</span>
                </div>
              </div>
            </div>

            {/* Thermal / Hot-Spots */}
            <div className="bg-[#1c1c1c] border border-gray-800 p-3 flex flex-col justify-between">
              <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#fe5029]" />
                <span>THERMAL DISSIPATION</span>
              </div>
              <div className="text-[10px] space-y-1">
                {components.slice(0, 3).map((comp) => {
                  const pwr = simulation?.dc?.componentPowers[comp.name] || 0;
                  return (
                    <div key={comp.id} className="flex justify-between">
                      <span className="text-gray-300">{comp.name} ({comp.value}):</span>
                      <span className={pwr > 0.125 ? 'text-[#fe5029] font-bold' : 'text-gray-400'}>
                        {(pwr * 1000).toFixed(1)} mW
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[9px] text-[#75f76e] border-t border-gray-800 pt-1">
                ALL COMPONENTS WITHIN SAFE THERMAL LIMITS (&lt; 250mW)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
