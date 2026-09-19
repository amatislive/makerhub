import React, { useState } from 'react';
import {
  Scale,
  Zap,
  Gauge,
  Printer,
  Compass,
  Thermometer,
  Activity,
  Maximize2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Search,
  ArrowRightLeft,
  Cpu,
  Boxes,
  HelpCircle,
  Hash
} from 'lucide-react';

type UnitCategory =
  | 'electronics'
  | 'resistor_color'
  | 'smd_resistor'
  | 'capacitors'
  | 'wire_gauge'
  | 'print_flow'
  | 'length_dimensions'
  | 'torque_motor'
  | 'temperature'
  | 'tap_drill';

export const UnitChangerView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('electronics');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#111111] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-[#111111] bg-[#111111] text-white flex items-center justify-center shadow-[2px_2px_0px_#fe5029]">
              <ArrowRightLeft className="w-5 h-5 text-[#fe5029]" />
            </div>
            <h1 className="font-display font-black text-2xl tracking-tight text-[#111111]">
              MAKER UNIT CHANGER & ENGINEERING CONVERTER
            </h1>
          </div>
          <p className="font-mono-tech text-xs text-[#111111]/70 mt-1 uppercase">
            Live multi-unit conversion matrix for electronics, resistor codes, AWG wire sizing, 3D printing flow, stepper torque & machining
          </p>
        </div>

        {/* Quick Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#f7e96e] border border-[#111111] font-mono-tech text-xs font-bold text-[#111111] shadow-[2px_2px_0px_#111111]">
            10 MAKER CALCULATORS ACTIVE
          </span>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="bg-white border border-[#111111] p-1.5 shadow-[3px_3px_0px_#111111] overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'electronics', label: 'ELECTRONICS & OHMS', icon: Zap },
            { id: 'resistor_color', label: 'RESISTOR COLOR CODES', icon: Activity },
            { id: 'smd_resistor', label: 'SMD & EIA-96 CODES', icon: Cpu },
            { id: 'capacitors', label: 'CAPACITANCE & 3-DIGIT', icon: Boxes },
            { id: 'wire_gauge', label: 'AWG WIRE GAUGE', icon: Gauge },
            { id: 'print_flow', label: '3D PRINT FLOW & CNC', icon: Printer },
            { id: 'length_dimensions', label: 'LENGTH / MIL / THOU', icon: Scale },
            { id: 'torque_motor', label: 'STEPPER TORQUE', icon: Compass },
            { id: 'temperature', label: 'TEMPERATURE (°C/°F/K)', icon: Thermometer },
            { id: 'tap_drill', label: 'TAP & DRILL SIZES', icon: Hash },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as UnitCategory)}
                className={`px-3 py-2 border border-[#111111] font-mono-tech text-xs font-bold uppercase flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-[2px_2px_0px_#fe5029]'
                    : 'bg-white text-[#111111] hover:bg-[#eeeeee]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#fe5029]' : 'text-[#111111]'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-[#111111] p-5 shadow-[4px_4px_0px_#111111]">
        {activeCategory === 'electronics' && <ElectronicsOhmConverter onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'resistor_color' && <ResistorColorCodeDecoder onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'smd_resistor' && <SmdResistorCalculator onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'capacitors' && <CapacitorCalculator onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'wire_gauge' && <AwgWireGaugeTable onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'print_flow' && <PrintFlowAndCncCalculator onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'length_dimensions' && <LengthDimensionsConverter onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'torque_motor' && <TorqueMotorConverter onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'temperature' && <TemperatureConverter onCopy={copyToClipboard} copiedKey={copiedKey} />}
        {activeCategory === 'tap_drill' && <TapDrillReferenceTable onCopy={copyToClipboard} copiedKey={copiedKey} />}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 1. Electronics & Ohm's Law Calculator & Multi-Unit Converter               */
/* -------------------------------------------------------------------------- */
const ElectronicsOhmConverter: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  // Resistance multi-unit state (base: Ohms)
  const [ohms, setOhms] = useState<number>(4700);

  // Ohm's Law triangle state
  const [calcVoltage, setCalcVoltage] = useState<string>('5');
  const [calcCurrent, setCalcCurrent] = useState<string>('0.02'); // 20mA
  const [calcResistance, setCalcResistance] = useState<string>('250');
  const [calcPower, setCalcPower] = useState<string>('0.1'); // 100mW

  // Frequency / Wavelength state (base: Hz)
  const [freqHz, setFreqHz] = useState<number>(2400000000); // 2.4 GHz

  // Speed of light (m/s)
  const c = 299792458;
  const wavelengthM = c / (freqHz || 1);

  // Handle Ohm's law input changes
  const handleOhmUpdate = (type: 'V' | 'I' | 'R' | 'P', val: string) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;

    if (type === 'V') {
      setCalcVoltage(val);
      const cur = parseFloat(calcCurrent) || 0.02;
      setCalcResistance((num / cur).toFixed(2));
      setCalcPower((num * cur).toFixed(4));
    } else if (type === 'I') {
      setCalcCurrent(val);
      const volt = parseFloat(calcVoltage) || 5;
      setCalcResistance((volt / num).toFixed(2));
      setCalcPower((volt * num).toFixed(4));
    } else if (type === 'R') {
      setCalcResistance(val);
      const volt = parseFloat(calcVoltage) || 5;
      const cur = volt / num;
      setCalcCurrent(cur.toFixed(4));
      setCalcPower((volt * cur).toFixed(4));
    } else if (type === 'P') {
      setCalcPower(val);
      const volt = parseFloat(calcVoltage) || 5;
      const cur = num / volt;
      setCalcCurrent(cur.toFixed(4));
      setCalcResistance((volt / cur).toFixed(2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Resistance Scaling */}
      <div>
        <h3 className="font-display font-black text-sm text-[#111111] uppercase mb-2 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-[#fe5029]" />
          RESISTANCE UNIT CONVERSION (LIVE SYNCHRONIZED)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'MILLIOHMS (mΩ)', factor: 1000, unit: 'mΩ' },
            { label: 'OHMS (Ω)', factor: 1, unit: 'Ω' },
            { label: 'KILOHMS (kΩ)', factor: 0.001, unit: 'kΩ' },
            { label: 'MEGOHMS (MΩ)', factor: 0.000001, unit: 'MΩ' },
            { label: 'GIGAOHMS (GΩ)', factor: 0.000000001, unit: 'GΩ' },
          ].map((u) => {
            const currentVal = (ohms * u.factor);
            const formatted = currentVal >= 1000000 || (currentVal < 0.001 && currentVal > 0)
              ? currentVal.toExponential(3)
              : parseFloat(currentVal.toPrecision(6)).toString();

            return (
              <div key={u.unit} className="p-2.5 border border-[#111111] bg-[#fdfdfd]">
                <span className="block font-mono-tech text-[9px] font-bold text-[#111111]/70 uppercase mb-1">
                  {u.label}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={formatted}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) setOhms(v / u.factor);
                    }}
                    className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => onCopy(`${formatted} ${u.unit}`, `res-${u.unit}`)}
                    className="p-1 border border-[#111111] hover:bg-[#eeeeee]"
                    title="Copy value"
                  >
                    {copiedKey === `res-${u.unit}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ohm's Law Calculator */}
      <div className="p-4 border border-[#111111] bg-[#f9f9f9]">
        <h4 className="font-display font-black text-xs text-[#111111] uppercase mb-3 flex items-center justify-between">
          <span>OHM'S LAW & DISSIPATED POWER (V = I × R | P = V × I)</span>
          <span className="font-mono-tech text-[10px] text-[#fe5029] font-bold">INTERACTIVE SOLVER</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2 border border-[#111111] bg-white">
            <span className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
              VOLTAGE (V)
            </span>
            <input
              type="number"
              value={calcVoltage}
              onChange={(e) => handleOhmUpdate('V', e.target.value)}
              className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold"
            />
          </div>

          <div className="p-2 border border-[#111111] bg-white">
            <span className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
              CURRENT (A / AMPS)
            </span>
            <input
              type="number"
              step="0.001"
              value={calcCurrent}
              onChange={(e) => handleOhmUpdate('I', e.target.value)}
              className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold"
            />
            <span className="font-mono-tech text-[9px] text-[#111111]/60 block mt-0.5">
              = {(parseFloat(calcCurrent) * 1000 || 0).toFixed(1)} mA
            </span>
          </div>

          <div className="p-2 border border-[#111111] bg-white">
            <span className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
              RESISTANCE (Ω)
            </span>
            <input
              type="number"
              value={calcResistance}
              onChange={(e) => handleOhmUpdate('R', e.target.value)}
              className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold"
            />
            <span className="font-mono-tech text-[9px] text-[#111111]/60 block mt-0.5">
              = {(parseFloat(calcResistance) / 1000 || 0).toFixed(2)} kΩ
            </span>
          </div>

          <div className="p-2 border border-[#111111] bg-[#fe5029]/10">
            <span className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
              POWER (W / WATTS)
            </span>
            <input
              type="number"
              step="0.01"
              value={calcPower}
              onChange={(e) => handleOhmUpdate('P', e.target.value)}
              className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold bg-white"
            />
            <span className="font-mono-tech text-[9px] text-[#111111]/80 block mt-0.5 font-bold">
              = {(parseFloat(calcPower) * 1000 || 0).toFixed(1)} mW
            </span>
          </div>
        </div>
      </div>

      {/* Frequency & RF Wavelength */}
      <div>
        <h3 className="font-display font-black text-sm text-[#111111] uppercase mb-2 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#fe5029]" />
          FREQUENCY, PERIOD & ELECTROMAGNETIC WAVELENGTH (λ = c / f)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 border border-[#111111] bg-white">
            <span className="block font-mono-tech text-[9px] font-bold text-[#111111]/70 uppercase mb-1">
              FREQUENCY (Hz / MHz / GHz)
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={freqHz}
                onChange={(e) => setFreqHz(parseFloat(e.target.value) || 0)}
                className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold"
              />
              <span className="font-mono-tech text-[10px] font-bold">Hz</span>
            </div>
            <div className="font-mono-tech text-[9px] text-[#111111]/70 mt-1">
              = {(freqHz / 1e6).toFixed(3)} MHz ({(freqHz / 1e9).toFixed(3)} GHz)
            </div>
          </div>

          <div className="p-2.5 border border-[#111111] bg-white">
            <span className="block font-mono-tech text-[9px] font-bold text-[#111111]/70 uppercase mb-1">
              PERIOD (T = 1 / f)
            </span>
            <div className="font-mono-tech text-xs font-black text-[#111111]">
              {(1 / (freqHz || 1) * 1e9).toFixed(3)} ns
            </div>
            <div className="font-mono-tech text-[9px] text-[#111111]/70 mt-1">
              = {(1 / (freqHz || 1) * 1e6).toFixed(4)} µs
            </div>
          </div>

          <div className="p-2.5 border border-[#111111] bg-white">
            <span className="block font-mono-tech text-[9px] font-bold text-[#111111]/70 uppercase mb-1">
              FREE-SPACE WAVELENGTH (λ)
            </span>
            <div className="font-mono-tech text-xs font-black text-[#111111]">
              {(wavelengthM * 1000).toFixed(2)} mm
            </div>
            <div className="font-mono-tech text-[9px] text-[#111111]/70 mt-1">
              = {(wavelengthM * 100).toFixed(2)} cm ({(wavelengthM * 39.3701).toFixed(2)} in)
            </div>
          </div>

          <div className="p-2.5 border border-[#111111] bg-[#75f76e]/20">
            <span className="block font-mono-tech text-[9px] font-bold text-[#111111] uppercase mb-1">
              QUARTER-WAVE ANTENNA (λ/4)
            </span>
            <div className="font-mono-tech text-xs font-black text-[#111111]">
              {((wavelengthM * 1000) / 4).toFixed(2)} mm
            </div>
            <div className="font-mono-tech text-[9px] text-[#111111]/80 mt-1 font-bold">
              Standard 2.4G / 868M wire element
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. 4-Band & 5-Band Resistor Color Code Decoder                            */
/* -------------------------------------------------------------------------- */
const COLOR_CODES: Array<{ name: string; hex: string; textDark: boolean; digit: number; mult: number; tol?: number }> = [
  { name: 'Black', hex: '#000000', textDark: false, digit: 0, mult: 1 },
  { name: 'Brown', hex: '#8B4513', textDark: false, digit: 1, mult: 10, tol: 1 },
  { name: 'Red', hex: '#FF0000', textDark: false, digit: 2, mult: 100, tol: 2 },
  { name: 'Orange', hex: '#FFA500', textDark: true, digit: 3, mult: 1000 },
  { name: 'Yellow', hex: '#FFFF00', textDark: true, digit: 4, mult: 10000 },
  { name: 'Green', hex: '#008000', textDark: false, digit: 5, mult: 100000, tol: 0.5 },
  { name: 'Blue', hex: '#0000FF', textDark: false, digit: 6, mult: 1000000, tol: 0.25 },
  { name: 'Violet', hex: '#8A2BE2', textDark: false, digit: 7, mult: 10000000, tol: 0.1 },
  { name: 'Gray', hex: '#808080', textDark: false, digit: 8, mult: 100000000, tol: 0.05 },
  { name: 'White', hex: '#FFFFFF', textDark: true, digit: 9, mult: 1000000000 },
  { name: 'Gold', hex: '#D4AF37', textDark: true, digit: -1, mult: 0.1, tol: 5 },
  { name: 'Silver', hex: '#C0C0C0', textDark: true, digit: -2, mult: 0.01, tol: 10 },
];

const ResistorColorCodeDecoder: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  const [bandCount, setBandCount] = useState<4 | 5>(4);
  const [band1, setBand1] = useState(1); // Brown (1)
  const [band2, setBand2] = useState(0); // Black (0)
  const [band3, setBand3] = useState(2); // Red (mult 100 for 4-band, or digit 2 for 5-band)
  const [bandMult, setBandMult] = useState(2); // Red (*100)
  const [bandTol, setBandTol] = useState(10); // Gold (5%)

  // Compute 4-Band value: (d1*10 + d2) * mult
  // Compute 5-Band value: (d1*100 + d2*10 + d3) * mult
  const c1 = COLOR_CODES[band1] || COLOR_CODES[1];
  const c2 = COLOR_CODES[band2] || COLOR_CODES[0];
  const c3 = COLOR_CODES[band3] || COLOR_CODES[2];
  const cm = COLOR_CODES[bandCount === 4 ? band3 : bandMult] || COLOR_CODES[2];
  const ct = COLOR_CODES[bandTol] || COLOR_CODES[10];

  const calculatedOhms =
    bandCount === 4
      ? (c1.digit * 10 + c2.digit) * cm.mult
      : (c1.digit * 100 + c2.digit * 10 + c3.digit) * cm.mult;

  const tolerancePercent = ct.tol || 5;

  const formatResValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)} MΩ`;
    if (val >= 1000) return `${(val / 1000).toFixed(2)} kΩ`;
    return `${val.toFixed(2)} Ω`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-3">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#fe5029]" />
          THROUGH-HOLE RESISTOR COLOR BAND DECODER
        </h3>

        {/* 4-Band vs 5-Band toggle */}
        <div className="flex items-center border border-[#111111] p-0.5 bg-[#eeeeee]">
          <button
            type="button"
            onClick={() => setBandCount(4)}
            className={`px-3 py-1 font-mono-tech text-xs font-bold ${
              bandCount === 4 ? 'bg-[#111111] text-white' : 'text-[#111111]'
            }`}
          >
            4-BAND (5% STANDARD)
          </button>
          <button
            type="button"
            onClick={() => setBandCount(5)}
            className={`px-3 py-1 font-mono-tech text-xs font-bold ${
              bandCount === 5 ? 'bg-[#111111] text-white' : 'text-[#111111]'
            }`}
          >
            5-BAND (1% PRECISION)
          </button>
        </div>
      </div>

      {/* Visual Resistor Graphic */}
      <div className="p-6 bg-[#f3f3f3] border-2 border-[#111111] shadow-inner flex flex-col items-center justify-center">
        <div className="relative w-72 h-16 bg-[#d2b48c] border-2 border-[#111111] rounded-full flex items-center justify-between px-8 shadow-md">
          {/* Wire leads */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-1.5 bg-[#a0a0a0] border border-[#111111]" />
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-1.5 bg-[#a0a0a0] border border-[#111111]" />

          {/* Color bands */}
          <div className="w-4 h-full border-x border-[#111111]" style={{ backgroundColor: c1.hex }} />
          <div className="w-4 h-full border-x border-[#111111]" style={{ backgroundColor: c2.hex }} />
          {bandCount === 5 && (
            <div className="w-4 h-full border-x border-[#111111]" style={{ backgroundColor: c3.hex }} />
          )}
          <div className="w-4 h-full border-x border-[#111111]" style={{ backgroundColor: cm.hex }} />
          <div className="w-4 h-full border-x border-[#111111] ml-4" style={{ backgroundColor: ct.hex }} />
        </div>

        {/* Readout */}
        <div className="mt-4 text-center">
          <div className="font-display font-black text-2xl text-[#111111] tracking-tight">
            {formatResValue(calculatedOhms)} ±{tolerancePercent}%
          </div>
          <div className="font-mono-tech text-xs text-[#111111]/70 mt-0.5">
            Range: {formatResValue(calculatedOhms * (1 - tolerancePercent / 100))} to{' '}
            {formatResValue(calculatedOhms * (1 + tolerancePercent / 100))}
          </div>
        </div>
      </div>

      {/* Band Selectors */}
      <div className={`grid grid-cols-2 ${bandCount === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-5'} gap-3`}>
        {/* Band 1 */}
        <div className="p-2 border border-[#111111] bg-white">
          <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
            BAND 1 (1ST DIGIT)
          </label>
          <select
            value={band1}
            onChange={(e) => setBand1(parseInt(e.target.value))}
            className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
          >
            {COLOR_CODES.slice(1, 10).map((c, idx) => (
              <option key={c.name} value={idx + 1}>
                {c.digit} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Band 2 */}
        <div className="p-2 border border-[#111111] bg-white">
          <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
            BAND 2 (2ND DIGIT)
          </label>
          <select
            value={band2}
            onChange={(e) => setBand2(parseInt(e.target.value))}
            className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
          >
            {COLOR_CODES.slice(0, 10).map((c, idx) => (
              <option key={c.name} value={idx}>
                {c.digit} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Band 3 (Only in 5-band) */}
        {bandCount === 5 && (
          <div className="p-2 border border-[#111111] bg-white">
            <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
              BAND 3 (3RD DIGIT)
            </label>
            <select
              value={band3}
              onChange={(e) => setBand3(parseInt(e.target.value))}
              className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
            >
              {COLOR_CODES.slice(0, 10).map((c, idx) => (
                <option key={c.name} value={idx}>
                  {c.digit} - {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multiplier */}
        <div className="p-2 border border-[#111111] bg-white">
          <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
            MULTIPLIER (×)
          </label>
          <select
            value={bandCount === 4 ? band3 : bandMult}
            onChange={(e) => {
              if (bandCount === 4) setBand3(parseInt(e.target.value));
              else setBandMult(parseInt(e.target.value));
            }}
            className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
          >
            {COLOR_CODES.map((c, idx) => (
              <option key={c.name} value={idx}>
                ×{c.mult >= 1 ? c.mult : c.mult} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tolerance */}
        <div className="p-2 border border-[#111111] bg-white">
          <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
            TOLERANCE (±%)
          </label>
          <select
            value={bandTol}
            onChange={(e) => setBandTol(parseInt(e.target.value))}
            className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
          >
            {COLOR_CODES.filter((c) => c.tol !== undefined).map((c) => {
              const realIdx = COLOR_CODES.findIndex((x) => x.name === c.name);
              return (
                <option key={c.name} value={realIdx}>
                  ±{c.tol}% - {c.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. SMD 3-Digit, 4-Digit & EIA-96 Code Decoder                              */
/* -------------------------------------------------------------------------- */
const EIA96_TABLE: { [key: string]: number } = {
  '01': 100, '02': 102, '03': 105, '04': 107, '05': 110, '06': 113, '07': 115, '08': 118, '09': 121,
  '10': 124, '11': 127, '12': 130, '13': 133, '14': 137, '15': 140, '16': 143, '17': 147, '18': 150,
  '19': 154, '20': 158, '21': 162, '22': 165, '23': 169, '24': 174, '25': 178, '26': 182, '27': 187,
  '28': 191, '29': 196, '30': 200, '31': 205, '32': 210, '33': 215, '34': 221, '35': 226, '36': 232,
  '37': 237, '38': 243, '39': 249, '40': 255, '41': 261, '42': 267, '43': 274, '44': 280, '45': 287,
  '46': 294, '47': 301, '48': 309, '49': 316, '50': 324, '51': 332, '52': 340, '53': 348, '54': 357,
  '55': 365, '56': 374, '57': 383, '58': 392, '59': 402, '60': 412, '61': 422, '62': 432, '63': 442,
  '64': 453, '65': 464, '66': 475, '67': 487, '68': 499, '69': 511, '70': 523, '71': 536, '72': 549,
  '73': 562, '74': 576, '75': 590, '76': 604, '77': 619, '78': 634, '79': 649, '80': 665, '81': 681,
  '82': 698, '83': 715, '84': 732, '85': 750, '86': 768, '87': 787, '88': 806, '89': 825, '90': 845,
  '91': 866, '92': 887, '93': 909, '94': 931, '95': 953, '96': 976
};

const EIA96_MULT: { [key: string]: number } = {
  'Z': 0.001, 'Y': 0.01, 'R': 0.01, 'X': 0.1, 'S': 0.1, 'A': 1, 'B': 10, 'H': 10, 'C': 100, 'D': 1000, 'E': 10000, 'F': 100000
};

const SmdResistorCalculator: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  const [smdInput, setSmdInput] = useState('472');

  const decodeSmd = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { valid: false, value: 0, text: 'N/A' };

    // 1. EIA-96 1% 3-character format: 2 digits + 1 letter (e.g. 01Y, 68X)
    if (/^\d{2}[A-Z]$/.test(clean)) {
      const digits = clean.slice(0, 2);
      const letter = clean.slice(2);
      const base = EIA96_TABLE[digits];
      const mult = EIA96_MULT[letter];
      if (base !== undefined && mult !== undefined) {
        const val = base * mult;
        return { valid: true, value: val, text: `${val >= 1000 ? (val/1000) + ' kΩ' : val + ' Ω'} (EIA-96 1%)` };
      }
    }

    // 2. R notation (e.g. 4R7, 0R22, R05)
    if (clean.includes('R')) {
      const val = parseFloat(clean.replace('R', '.'));
      if (!isNaN(val)) return { valid: true, value: val, text: `${val} Ω` };
    }

    // 3. 3-digit standard (e.g. 472 = 47 * 10^2 = 4700 Ω = 4.7 kΩ)
    if (/^\d{3}$/.test(clean)) {
      const d1 = parseInt(clean[0]);
      const d2 = parseInt(clean[1]);
      const exp = parseInt(clean[2]);
      const val = (d1 * 10 + d2) * Math.pow(10, exp);
      return { valid: true, value: val, text: `${val >= 1000000 ? (val/1e6)+' MΩ' : val >= 1000 ? (val/1e3)+' kΩ' : val+' Ω'} (5% Tol)` };
    }

    // 4. 4-digit precision (e.g. 1002 = 100 * 10^2 = 10000 Ω = 10 kΩ)
    if (/^\d{4}$/.test(clean)) {
      const d1 = parseInt(clean[0]);
      const d2 = parseInt(clean[1]);
      const d3 = parseInt(clean[2]);
      const exp = parseInt(clean[3]);
      const val = (d1 * 100 + d2 * 10 + d3) * Math.pow(10, exp);
      return { valid: true, value: val, text: `${val >= 1000000 ? (val/1e6)+' MΩ' : val >= 1000 ? (val/1e3)+' kΩ' : val+' Ω'} (1% Tol)` };
    }

    return { valid: false, value: 0, text: 'Unrecognized SMD code format' };
  };

  const result = decodeSmd(smdInput);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-[#fe5029]" />
          SMD CHIP RESISTOR CODE CALCULATOR (3-DIGIT / 4-DIGIT / EIA-96)
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 border border-[#111111] bg-[#f9f9f9] space-y-3">
          <label className="block font-mono-tech text-xs font-bold text-[#111111] uppercase">
            ENTER SMD RESISTOR CODE (e.g. 472, 1002, 4R7, 01Y, 68X)
          </label>
          <input
            type="text"
            value={smdInput}
            onChange={(e) => setSmdInput(e.target.value)}
            className="w-full p-2 border-2 border-[#111111] font-mono-tech text-lg font-black uppercase tracking-wider bg-white"
          />

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {['103', '472', '221', '0R5', '1002', '49R9', '01Y', '68X'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setSmdInput(preset)}
                className="px-2 py-0.5 border border-[#111111] bg-white hover:bg-[#eeeeee] font-mono-tech text-[10px] font-bold"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* SMD Chip Visualizer */}
        <div className="p-4 border-2 border-[#111111] bg-[#111111] text-white flex flex-col items-center justify-center relative">
          {/* Chip Solder Terminals */}
          <div className="w-48 h-24 bg-[#222222] border border-[#444444] rounded relative flex items-center justify-between px-3">
            <div className="w-4 h-full bg-[#a0a0a0] -ml-3 rounded-l" />
            <div className="font-mono-tech text-xl font-black text-white tracking-widest uppercase">
              {smdInput.trim() || '---'}
            </div>
            <div className="w-4 h-full bg-[#a0a0a0] -mr-3 rounded-r" />
          </div>

          <div className="mt-3 text-center">
            <div className="font-display font-black text-xl text-[#75f76e]">
              {result.text}
            </div>
            <div className="font-mono-tech text-[10px] text-white/70 mt-0.5">
              Exact Ohms: {result.value.toLocaleString()} Ω
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. Capacitor Multi-Unit & 3-Digit Code Calculator                          */
/* -------------------------------------------------------------------------- */
const CapacitorCalculator: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  // Base capacitance in Picofarads (pF)
  const [picofarads, setPicofarads] = useState<number>(100000); // 100 nF = 0.1 uF

  // 3-digit capacitor code (e.g. 104)
  const [capCode, setCapCode] = useState('104');

  const handleCodeChange = (code: string) => {
    setCapCode(code);
    const clean = code.trim();
    if (/^\d{3}$/.test(clean)) {
      const d1 = parseInt(clean[0]);
      const d2 = parseInt(clean[1]);
      const exp = parseInt(clean[2]);
      const pf = (d1 * 10 + d2) * Math.pow(10, exp);
      setPicofarads(pf);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Boxes className="w-4 h-4 text-[#fe5029]" />
          CAPACITANCE MULTI-UNIT & 3-DIGIT MARKING DECODER
        </h3>
      </div>

      {/* 3-Digit Quick Code Input */}
      <div className="p-3 border border-[#111111] bg-[#f9f9f9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="font-mono-tech text-xs font-bold text-[#111111] uppercase">
            3-DIGIT CODE (e.g. 104 = 100nF):
          </label>
          <input
            type="text"
            maxLength={3}
            value={capCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-20 p-1 border-2 border-[#111111] font-mono-tech text-sm font-black text-center bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {['101', '102', '103', '104', '224', '474', '105', '106'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCodeChange(c)}
              className="px-2 py-0.5 border border-[#111111] bg-white hover:bg-[#eeeeee] font-mono-tech text-[10px] font-bold"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Synchronized Units */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'PICOFARADS (pF)', factor: 1, unit: 'pF' },
          { label: 'NANOFARADS (nF)', factor: 0.001, unit: 'nF' },
          { label: 'MICROFARADS (µF)', factor: 0.000001, unit: 'µF' },
          { label: 'MILLIFARADS (mF)', factor: 0.000000001, unit: 'mF' },
          { label: 'FARADS (F)', factor: 0.000000000001, unit: 'F' },
        ].map((u) => {
          const val = picofarads * u.factor;
          const formatted = val >= 1000000 || (val < 0.0001 && val > 0)
            ? val.toExponential(3)
            : parseFloat(val.toPrecision(6)).toString();

          return (
            <div key={u.unit} className="p-2.5 border border-[#111111] bg-white">
              <span className="block font-mono-tech text-[9px] font-bold text-[#111111]/70 uppercase mb-1">
                {u.label}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={formatted}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setPicofarads(v / u.factor);
                  }}
                  className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => onCopy(`${formatted} ${u.unit}`, `cap-${u.unit}`)}
                  className="p-1 border border-[#111111] hover:bg-[#eeeeee]"
                >
                  {copiedKey === `cap-${u.unit}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. AWG Wire Gauge Reference & Current Capacity Calculator                 */
/* -------------------------------------------------------------------------- */
const AWG_DATA = [
  { awg: '0000 (4/0)', d_mm: 11.684, area_mm2: 107.2, res_ohm_km: 0.1608, max_amps: 302 },
  { awg: '00 (2/0)', d_mm: 9.266, area_mm2: 67.4, res_ohm_km: 0.2557, max_amps: 190 },
  { awg: '0 (1/0)', d_mm: 8.252, area_mm2: 53.5, res_ohm_km: 0.3224, max_amps: 150 },
  { awg: '2', d_mm: 6.544, area_mm2: 33.6, res_ohm_km: 0.5127, max_amps: 94 },
  { awg: '4', d_mm: 5.189, area_mm2: 21.2, res_ohm_km: 0.8152, max_amps: 60 },
  { awg: '8', d_mm: 3.264, area_mm2: 8.37, res_ohm_km: 2.061, max_amps: 24 },
  { awg: '10', d_mm: 2.588, area_mm2: 5.26, res_ohm_km: 3.277, max_amps: 15 },
  { awg: '12', d_mm: 2.053, area_mm2: 3.31, res_ohm_km: 5.211, max_amps: 9.3 },
  { awg: '14', d_mm: 1.628, area_mm2: 2.08, res_ohm_km: 8.286, max_amps: 5.9 },
  { awg: '16', d_mm: 1.291, area_mm2: 1.31, res_ohm_km: 13.17, max_amps: 3.7 },
  { awg: '18', d_mm: 1.024, area_mm2: 0.823, res_ohm_km: 20.95, max_amps: 2.3 },
  { awg: '20', d_mm: 0.812, area_mm2: 0.518, res_ohm_km: 33.31, max_amps: 1.5 },
  { awg: '22', d_mm: 0.644, area_mm2: 0.326, res_ohm_km: 52.96, max_amps: 0.92 },
  { awg: '24', d_mm: 0.511, area_mm2: 0.205, res_ohm_km: 84.22, max_amps: 0.577 },
  { awg: '26', d_mm: 0.405, area_mm2: 0.129, res_ohm_km: 133.9, max_amps: 0.361 },
  { awg: '28', d_mm: 0.321, area_mm2: 0.081, res_ohm_km: 212.9, max_amps: 0.226 },
  { awg: '30', d_mm: 0.255, area_mm2: 0.0509, res_ohm_km: 338.6, max_amps: 0.142 },
  { awg: '32', d_mm: 0.202, area_mm2: 0.0324, res_ohm_km: 538.3, max_amps: 0.091 },
];

const AwgWireGaugeTable: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  const [search, setSearch] = useState('');

  const filtered = AWG_DATA.filter((w) => w.awg.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-[#fe5029]" />
          AWG WIRE GAUGE TO METRIC MM & CURRENT CAPACITY TABLE
        </h3>
        <div className="w-48">
          <input
            type="text"
            placeholder="Search AWG (e.g. 24)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-1 border border-[#111111] font-mono-tech text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-[#111111] font-mono-tech text-xs">
          <thead>
            <tr className="bg-[#111111] text-white">
              <th className="p-2 border border-[#111111]">AWG SIZE</th>
              <th className="p-2 border border-[#111111]">DIAMETER (mm)</th>
              <th className="p-2 border border-[#111111]">DIAMETER (inches)</th>
              <th className="p-2 border border-[#111111]">AREA (mm²)</th>
              <th className="p-2 border border-[#111111]">RESISTANCE (Ω/km)</th>
              <th className="p-2 border border-[#111111] bg-[#fe5029] text-white">MAX CHASSIS AMPS (A)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.awg} className="hover:bg-[#f9f9f9] border-b border-[#eeeeee]">
                <td className="p-2 font-black border-r border-[#eeeeee]">{row.awg}</td>
                <td className="p-2 border-r border-[#eeeeee]">{row.d_mm} mm</td>
                <td className="p-2 border-r border-[#eeeeee]">{(row.d_mm / 25.4).toFixed(4)}"</td>
                <td className="p-2 border-r border-[#eeeeee]">{row.area_mm2} mm²</td>
                <td className="p-2 border-r border-[#eeeeee]">{row.res_ohm_km} Ω/km</td>
                <td className="p-2 font-bold text-[#fe5029] bg-[#fe5029]/5">{row.max_amps} A</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 6. 3D Printing Volumetric Flow & Feed Rate Calculator                      */
/* -------------------------------------------------------------------------- */
const PrintFlowAndCncCalculator: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  const [printSpeed, setPrintSpeed] = useState<number>(150); // mm/s
  const [layerHeight, setLayerHeight] = useState<number>(0.2); // mm
  const [lineWidth, setLineWidth] = useState<number>(0.42); // mm

  // Volumetric Flow Rate Q = speed * layer_height * line_width (mm³/s)
  const flowRate = printSpeed * layerHeight * lineWidth;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Printer className="w-4 h-4 text-[#fe5029]" />
          3D PRINTING VOLUMETRIC FLOW RATE & HOTEND LIMITS
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 border border-[#111111] bg-[#f9f9f9] space-y-3">
          <div>
            <label className="block font-mono-tech text-xs font-bold text-[#111111] uppercase mb-1">
              PRINT SPEED ({printSpeed} mm/s = {(printSpeed * 60)} mm/min)
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={printSpeed}
              onChange={(e) => setPrintSpeed(parseFloat(e.target.value))}
              className="w-full accent-[#fe5029]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                LAYER HEIGHT (mm)
              </label>
              <input
                type="number"
                step="0.04"
                value={layerHeight}
                onChange={(e) => setLayerHeight(parseFloat(e.target.value) || 0.2)}
                className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
              />
            </div>
            <div>
              <label className="block font-mono-tech text-[10px] font-bold text-[#111111] uppercase mb-1">
                EXTRUSION LINE WIDTH (mm)
              </label>
              <input
                type="number"
                step="0.02"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseFloat(e.target.value) || 0.4)}
                className="w-full p-1.5 border border-[#111111] font-mono-tech text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* Output Rate & Hotend Compatibility */}
        <div className="p-4 border-2 border-[#111111] bg-white flex flex-col justify-between">
          <div>
            <span className="font-mono-tech text-[10px] font-bold text-[#111111]/70 uppercase">
              REQUIRED VOLUMETRIC EXTRUSION RATE:
            </span>
            <div className="font-display font-black text-3xl text-[#111111] mt-1">
              {flowRate.toFixed(2)} mm³/s
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#eeeeee]">
            <span className="font-mono-tech text-[10px] font-bold text-[#111111] uppercase block">
              HOTEND CLASS COMPATIBILITY:
            </span>
            <div className="grid grid-cols-3 gap-1.5 font-mono-tech text-[9px] text-center">
              <div className={`p-1 border ${flowRate <= 15 ? 'bg-green-100 border-green-600 font-bold' : 'bg-red-50 text-red-700 opacity-50'}`}>
                Standard V6 (≤15 mm³/s)
              </div>
              <div className={`p-1 border ${flowRate <= 30 ? 'bg-green-100 border-green-600 font-bold' : 'bg-red-50 text-red-700 opacity-50'}`}>
                Volcano (≤30 mm³/s)
              </div>
              <div className={`p-1 border ${flowRate <= 45 ? 'bg-green-100 border-green-600 font-bold' : 'bg-red-50 text-red-700 opacity-50'}`}>
                Rapido / Super (≤45 mm³/s)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 7. Length, Mil, Thou, Inches & Distance Converter                          */
/* -------------------------------------------------------------------------- */
const LengthDimensionsConverter: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  // Base length in Millimeters (mm)
  const [mm, setMm] = useState<number>(25.4); // 1 inch

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-[#fe5029]" />
          LENGTH, MIL, THOU & DISTANCE CONVERSION
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'MILLIMETERS (mm)', factor: 1, unit: 'mm' },
          { label: 'CENTIMETERS (cm)', factor: 0.1, unit: 'cm' },
          { label: 'METERS (m)', factor: 0.001, unit: 'm' },
          { label: 'INCHES (in / ")', factor: 1 / 25.4, unit: 'in' },
          { label: 'FEET (ft)', factor: 1 / 304.8, unit: 'ft' },
          { label: 'MILS / THOU (0.001")', factor: 1000 / 25.4, unit: 'mil' },
          { label: 'MICRONS (µm)', factor: 1000, unit: 'µm' },
          { label: 'PCB 1oz COPPER THICKNESS', factor: 1 / 0.035, unit: 'oz copper' },
        ].map((u) => {
          const val = mm * u.factor;
          const formatted = parseFloat(val.toPrecision(6)).toString();

          return (
            <div key={u.unit} className="p-2.5 border border-[#111111] bg-white">
              <span className="block font-mono-tech text-[9px] font-bold text-[#111111]/70 uppercase mb-1">
                {u.label}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={formatted}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setMm(v / u.factor);
                  }}
                  className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => onCopy(`${formatted} ${u.unit}`, `len-${u.unit}`)}
                  className="p-1 border border-[#111111] hover:bg-[#eeeeee]"
                >
                  {copiedKey === `len-${u.unit}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 8. Stepper Motor Torque Converter (NEMA 14, 17, 23)                       */
/* -------------------------------------------------------------------------- */
const TorqueMotorConverter: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  // Base torque in Newton-meters (N·m)
  const [nm, setNm] = useState<number>(0.45); // Standard NEMA 17 ~45 N·cm = 0.45 N·m

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#fe5029]" />
          STEPPER MOTOR TORQUE CONVERSION (NEMA PRESETS)
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {[
          { name: 'NEMA 14 (Pancake)', val: 0.18 },
          { name: 'NEMA 17 (Standard 42mm)', val: 0.45 },
          { name: 'NEMA 17 (High-Torque 48mm)', val: 0.59 },
          { name: 'NEMA 23 (CNC Mill)', val: 1.9 },
          { name: 'NEMA 34 (Heavy Heavy)', val: 4.5 },
        ].map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => setNm(p.val)}
            className="px-2.5 py-1 border border-[#111111] bg-white hover:bg-[#eeeeee] font-mono-tech text-xs font-bold"
          >
            {p.name} ({p.val} N·m)
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'NEWTON-METERS (N·m)', factor: 1, unit: 'N·m' },
          { label: 'NEWTON-CENTIMETERS (N·cm)', factor: 100, unit: 'N·cm' },
          { label: 'OUNCE-INCHES (oz·in)', factor: 141.6119, unit: 'oz·in' },
          { label: 'POUND-INCHES (lb·in)', factor: 8.8507, unit: 'lb·in' },
          { label: 'KILOGRAM-FORCE CM (kgf·cm)', factor: 10.1972, unit: 'kgf·cm' },
          { label: 'POUND-FEET (lb·ft)', factor: 0.73756, unit: 'lb·ft' },
        ].map((u) => {
          const val = nm * u.factor;
          const formatted = parseFloat(val.toPrecision(5)).toString();

          return (
            <div key={u.unit} className="p-2.5 border border-[#111111] bg-white">
              <span className="block font-mono-tech text-[9px] font-bold text-[#111111]/70 uppercase mb-1">
                {u.label}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={formatted}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) setNm(v / u.factor);
                  }}
                  className="w-full p-1 border border-[#111111] font-mono-tech text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => onCopy(`${formatted} ${u.unit}`, `torq-${u.unit}`)}
                  className="p-1 border border-[#111111] hover:bg-[#eeeeee]"
                >
                  {copiedKey === `torq-${u.unit}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 9. Temperature Converter (°C / °F / K)                                    */
/* -------------------------------------------------------------------------- */
const TemperatureConverter: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  // Base Celsius
  const [celsius, setCelsius] = useState<number>(210); // 3D printing nozzle temp

  const fahrenheit = (celsius * 9) / 5 + 32;
  const kelvin = celsius + 273.15;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-[#fe5029]" />
          TEMPERATURE CONVERSION & 3D PRINT / SOLDERING PRESETS
        </h3>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: 'PLA Nozzle (205°C)', c: 205 },
          { label: 'PETG Nozzle (240°C)', c: 240 },
          { label: 'ABS / ASA Nozzle (260°C)', c: 260 },
          { label: 'Bed Temp (60°C)', c: 60 },
          { label: 'Lead-Free Solder (350°C)', c: 350 },
          { label: 'Reflow Oven Peak (245°C)', c: 245 },
        ].map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setCelsius(p.c)}
            className="px-2.5 py-1 border border-[#111111] bg-white hover:bg-[#eeeeee] font-mono-tech text-xs font-bold"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3 border-2 border-[#111111] bg-white">
          <span className="block font-mono-tech text-xs font-bold text-[#111111] uppercase mb-1">
            CELSIUS (°C)
          </span>
          <input
            type="number"
            value={celsius}
            onChange={(e) => setCelsius(parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-[#111111] font-mono-tech text-lg font-black"
          />
        </div>

        <div className="p-3 border-2 border-[#111111] bg-white">
          <span className="block font-mono-tech text-xs font-bold text-[#111111] uppercase mb-1">
            FAHRENHEIT (°F)
          </span>
          <input
            type="number"
            value={fahrenheit.toFixed(1)}
            onChange={(e) => {
              const f = parseFloat(e.target.value);
              if (!isNaN(f)) setCelsius(((f - 32) * 5) / 9);
            }}
            className="w-full p-2 border border-[#111111] font-mono-tech text-lg font-black"
          />
        </div>

        <div className="p-3 border-2 border-[#111111] bg-white">
          <span className="block font-mono-tech text-xs font-bold text-[#111111] uppercase mb-1">
            KELVIN (K)
          </span>
          <input
            type="number"
            value={kelvin.toFixed(2)}
            onChange={(e) => {
              const k = parseFloat(e.target.value);
              if (!isNaN(k)) setCelsius(k - 273.15);
            }}
            className="w-full p-2 border border-[#111111] font-mono-tech text-lg font-black"
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 10. Tap Drill & Bolt Clearance Reference Table                            */
/* -------------------------------------------------------------------------- */
const TAP_DRILL_DATA = [
  { thread: 'M2 × 0.4', tap_drill_mm: 1.6, clearance_close_mm: 2.2, clearance_free_mm: 2.4 },
  { thread: 'M2.5 × 0.45', tap_drill_mm: 2.05, clearance_close_mm: 2.7, clearance_free_mm: 2.9 },
  { thread: 'M3 × 0.5', tap_drill_mm: 2.5, clearance_close_mm: 3.2, clearance_free_mm: 3.4 },
  { thread: 'M4 × 0.7', tap_drill_mm: 3.3, clearance_close_mm: 4.3, clearance_free_mm: 4.5 },
  { thread: 'M5 × 0.8', tap_drill_mm: 4.2, clearance_close_mm: 5.3, clearance_free_mm: 5.5 },
  { thread: 'M6 × 1.0', tap_drill_mm: 5.0, clearance_close_mm: 6.4, clearance_free_mm: 6.6 },
  { thread: 'M8 × 1.25', tap_drill_mm: 6.8, clearance_close_mm: 8.4, clearance_free_mm: 9.0 },
  { thread: '#2-56 UNC', tap_drill_mm: 1.85, clearance_close_mm: 2.3, clearance_free_mm: 2.5 },
  { thread: '#4-40 UNC', tap_drill_mm: 2.3, clearance_close_mm: 3.0, clearance_free_mm: 3.3 },
  { thread: '#6-32 UNC', tap_drill_mm: 2.85, clearance_close_mm: 3.7, clearance_free_mm: 4.0 },
  { thread: '#8-32 UNC', tap_drill_mm: 3.5, clearance_close_mm: 4.3, clearance_free_mm: 4.7 },
  { thread: '1/4"-20 UNC', tap_drill_mm: 5.1, clearance_close_mm: 6.5, clearance_free_mm: 7.0 },
];

const TapDrillReferenceTable: React.FC<{ onCopy: (v: string, k: string) => void; copiedKey: string | null }> = ({
  onCopy,
  copiedKey,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-[#eeeeee] pb-2">
        <h3 className="font-display font-black text-sm text-[#111111] uppercase flex items-center gap-1.5">
          <Hash className="w-4 h-4 text-[#fe5029]" />
          METRIC & IMPERIAL BOLT TAP DRILL & CLEARANCE HOLE GUIDE
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-[#111111] font-mono-tech text-xs">
          <thead>
            <tr className="bg-[#111111] text-white">
              <th className="p-2 border border-[#111111]">THREAD SIZE</th>
              <th className="p-2 border border-[#111111] bg-[#fe5029]">TAP DRILL (75% THREAD)</th>
              <th className="p-2 border border-[#111111]">CLOSE CLEARANCE HOLE</th>
              <th className="p-2 border border-[#111111]">FREE / NORMAL CLEARANCE</th>
            </tr>
          </thead>
          <tbody>
            {TAP_DRILL_DATA.map((row) => (
              <tr key={row.thread} className="hover:bg-[#f9f9f9] border-b border-[#eeeeee]">
                <td className="p-2 font-black border-r border-[#eeeeee]">{row.thread}</td>
                <td className="p-2 font-bold text-[#fe5029] bg-[#fe5029]/5 border-r border-[#eeeeee]">
                  {row.tap_drill_mm} mm
                </td>
                <td className="p-2 border-r border-[#eeeeee]">{row.clearance_close_mm} mm</td>
                <td className="p-2">{row.clearance_free_mm} mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
