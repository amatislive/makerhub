// MAKEO Circuit & SPICE simulation types

export type AnalysisMode = 'op' | 'transient' | 'ac' | 'sweep';

export type ComponentCategory = 'boards' | 'basic' | 'sensors' | 'output' | 'power' | 'modules' | 'ics' | 'electromechanical';

export interface PinDefinition {
  id: string;
  name: string;
  label: string;
  type: 'power' | 'ground' | 'analog' | 'digital' | 'passive' | 'gpio';
  x: number; // relative to component left (in px or grid units)
  y: number; // relative to component top
  connectedHoleId?: string; // If plugged into breadboard hole
}

export interface PlacedComponent {
  id: string;
  type: string; // e.g. 'resistor', 'capacitor', 'led', 'dc_source', 'ground', 'esp32', 'arduino_uno', 'pushbutton', 'potentiometer', 'diode'
  category: ComponentCategory;
  name: string; // e.g. 'R1', 'C1', 'D1', 'V1'
  value: string; // e.g. '220', '10u', '5', '10k'
  unit?: string; // 'Ω', 'F', 'V', 'H'
  tolerance?: string; // '5%'
  powerRating?: string; // '0.25 W'
  manufacturer?: string;
  partNumber?: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  pins: PinDefinition[];
  spiceModel?: string; // 'RESISTOR', 'CAPACITOR', 'DIODE', 'VSOURCE', 'MCU_GPIO', etc.
  spiceSupported: boolean;
  onBreadboard?: boolean;
}

export interface WireConnection {
  id: string;
  fromComponentId?: string;
  fromPinId?: string;
  fromHoleId?: string; // e.g. 'A_12' or 'PWR_TOP_POS_5'
  toComponentId?: string;
  toPinId?: string;
  toHoleId?: string;
  color: string; // hex or semantic e.g. '#fe5029' (orange/power), '#111111' (GND), '#6ebdf7' (signal), '#75f76e' (valid), '#f7e96e' (yellow)
  netName?: string;
  label?: string;
}

export interface BreadboardHole {
  id: string; // e.g. 'A-1', 'J-30', 'TOP-POS-1', 'BOT-NEG-30'
  row: string; // 'A'..'J' or 'PWR_TOP_POS', 'PWR_TOP_NEG', 'PWR_BOT_POS', 'PWR_BOT_NEG'
  col: number; // 1..30
  x: number;
  y: number;
  section: 'top_power' | 'terminal_top' | 'terminal_bottom' | 'bottom_power';
  netId: string; // electrical net ID that ties holes in the same strip together
}

export interface SpiceDcResult {
  nodeVoltages: Record<string, number>; // node name -> voltage in V
  branchCurrents: Record<string, number>; // component/branch name -> current in A
  componentPowers: Record<string, number>; // component name -> power in W
}

export interface WaveformPoint {
  time: number; // seconds
  [key: string]: number; // net voltages or branch currents
}

export interface SpiceTransientResult {
  timePoints: number[];
  signals: Record<string, number[]>; // signal name (e.g. 'V(node_1)', 'I(R1)') -> array of values
  peaks: Record<string, number>;
  minimums: Record<string, number>;
  maximums: Record<string, number>;
  timeRange: { start: number; stop: number; step: number };
}

export interface SpiceSweepResult {
  parameterName: string; // e.g. 'R1'
  values: number[]; // e.g. [100, 220, 330, 470, 1000]
  results: Array<{
    paramValue: number;
    voltage: number;
    current: number;
    power: number;
  }>;
}

export type SimulationStatus = 'idle' | 'validating' | 'simulating' | 'complete' | 'warnings' | 'failed' | 'limited';

export interface SimulationOutput {
  status: SimulationStatus;
  mode: AnalysisMode;
  timestamp: string;
  netlistText: string;
  dc?: SpiceDcResult;
  transient?: SpiceTransientResult;
  sweep?: SpiceSweepResult;
  logs: string[];
  warnings: string[];
  errors: string[];
  unsupportedComponents: string[];
  highlightNet?: string;
  highlightComponentId?: string;
}

export interface AiCircuitReview {
  verdict: 'SUPPORTS_DESIGN' | 'POTENTIAL_ISSUE' | 'SIMULATION_FAILED' | 'NOT_ENOUGH_INFO';
  overall: string;
  whatHappened: string;
  why: string;
  whatToCheck: string[];
  simulationEvidence: Array<{ metric: string; value: string; assessment: string }>;
  suggestedAction?: {
    componentId?: string;
    componentName?: string;
    parameter?: string;
    currentValue?: string;
    suggestedValue?: string;
    reason?: string;
  };
  highlightIds: string[]; // Component or net IDs to highlight in circuit canvas
  expectedBehaviorComparison?: {
    intended: string;
    simulated: string;
    meetsExpectation: boolean;
    explanation: string;
  };
  mcuCodeMismatch?: string;
}

export interface CircuitRevision {
  id: string;
  timestamp: string;
  summary: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  simulationSummary?: {
    status: SimulationStatus;
    keyValues: Record<string, string>;
  };
}

export type BreadboardSize = 'mini' | 'half' | 'full';

export type MultimeterFunction = 'voltage_dc' | 'voltage_ac' | 'current_dc' | 'resistance' | 'continuity';

export interface TestPoint {
  id: string;
  name: string; // e.g. 'TP1', 'TP2'
  netId: string;
  description?: string;
  x?: number;
  y?: number;
}
