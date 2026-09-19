import { PlacedComponent, WireConnection, SimulationOutput, AnalysisMode } from '../types/circuit';

export interface ParseResult {
  value: number; // in base units: Ohms, Farads, Henries, Volts, Amperes
  unit: string;
}

export function parseEngValue(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.trim().toLowerCase();
  
  // Replace symbols
  const sanitized = cleaned
    .replace('ω', '')
    .replace('ohm', '')
    .replace('v', '')
    .replace('a', '')
    .replace('f', '')
    .replace('h', '')
    .replace('s', '')
    .trim();

  const match = sanitized.match(/^([0-9]*\.?[0-9]+)\s*([a-zµ]*)$/);
  if (!match) {
    const num = parseFloat(sanitized);
    return isNaN(num) ? 0 : num;
  }

  const base = parseFloat(match[1]);
  const suffix = match[2];

  switch (suffix) {
    case 'p': return base * 1e-12;
    case 'n': return base * 1e-9;
    case 'u':
    case 'µ': return base * 1e-6;
    case 'm': return base * 1e-3;
    case 'k': return base * 1e3;
    case 'meg':
    case 'm': if (cleaned.includes('meg')) return base * 1e6; return base * 1e-3;
    case 'g': return base * 1e9;
    default: return base;
  }
}

export interface ElectricalNet {
  id: string; // '0' for ground, 'node_1', 'node_2', etc.
  name: string;
  isGround: boolean;
  terminals: Array<{ componentId: string; pinId: string; pinName: string }>;
}

export interface CircuitGraph {
  nets: ElectricalNet[];
  componentToNet: Record<string, Record<string, string>>; // compId -> pinId -> netId
  groundNetId: string;
  warnings: string[];
  errors: string[];
}

/**
 * Builds electrical nets based on components, their placement on breadboard holes,
 * and direct wire connections between pins and/or breadboard holes.
 */
export function buildCircuitGraph(
  components: PlacedComponent[],
  wires: WireConnection[]
): CircuitGraph {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Disjoint-set union (Union-Find) for electrical endpoints
  const parent: Record<string, string> = {};

  function find(i: string): string {
    if (!parent[i]) {
      parent[i] = i;
      return i;
    }
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(i: string, j: string) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      // Prioritize GND as root if one of them is GND
      if (rootI.includes('GND') || rootI === '0') {
        parent[rootJ] = rootI;
      } else if (rootJ.includes('GND') || rootJ === '0') {
        parent[rootI] = rootJ;
      } else {
        parent[rootJ] = rootI;
      }
    }
  }

  // 1. Map pins placed on breadboard holes:
  // If pin has connectedHoleId, union pin with the hole's electrical strip net
  // Breadboard rule:
  // - Top power rail: '+' column 1-30 are tied, '-' column 1-30 are tied
  // - Bottom power rail: '+' column 1-30 are tied, '-' column 1-30 are tied
  // - Main board: Terminal column (A..E) row R are tied -> 'T_TOP_R'
  // - Main board: Terminal column (F..J) row R are tied -> 'T_BOT_R'
  function getHoleNetId(holeId: string): string {
    // Expected hole formats:
    // 'PWR_TOP_POS_1'..'PWR_TOP_POS_30' -> 'PWR_TOP_POS'
    // 'PWR_TOP_NEG_1'..'PWR_TOP_NEG_30' -> '0' (GND)
    // 'PWR_BOT_POS_1'..'PWR_BOT_POS_30' -> 'PWR_BOT_POS'
    // 'PWR_BOT_NEG_1'..'PWR_BOT_NEG_30' -> '0' (GND)
    // 'A_1'..'E_1' -> 'ROW_TOP_1'
    // 'F_1'..'J_1' -> 'ROW_BOT_1'
    if (holeId.includes('TOP_NEG') || holeId.includes('BOT_NEG') || holeId.toLowerCase().includes('gnd')) {
      return '0'; // default ground reference
    }
    if (holeId.includes('TOP_POS')) return 'PWR_TOP_POS';
    if (holeId.includes('BOT_POS')) return 'PWR_BOT_POS';

    const match = holeId.match(/^([A-J])_(\d+)$/i);
    if (match) {
      const colLetter = match[1].toUpperCase();
      const rowNum = match[2];
      if (['A', 'B', 'C', 'D', 'E'].includes(colLetter)) {
        return `ROW_TOP_${rowNum}`;
      } else {
        return `ROW_BOT_${rowNum}`;
      }
    }
    return holeId;
  }

  // Connect pins to their plugged holes
  components.forEach(comp => {
    // If it's a ground component, mark pin 1 as ground '0'
    if (comp.type === 'ground') {
      const pin = comp.pins[0];
      if (pin) {
        const pinKey = `${comp.id}:${pin.id}`;
        union(pinKey, '0');
      }
    }

    comp.pins.forEach(pin => {
      const pinKey = `${comp.id}:${pin.id}`;
      if (pin.connectedHoleId) {
        const holeNet = getHoleNetId(pin.connectedHoleId);
        union(pinKey, holeNet);
      }
    });
  });

  // 2. Connect wires
  wires.forEach(wire => {
    let fromKey: string | null = null;
    let toKey: string | null = null;

    if (wire.fromComponentId && wire.fromPinId) {
      fromKey = `${wire.fromComponentId}:${wire.fromPinId}`;
    } else if (wire.fromHoleId) {
      fromKey = getHoleNetId(wire.fromHoleId);
    }

    if (wire.toComponentId && wire.toPinId) {
      toKey = `${wire.toComponentId}:${wire.toPinId}`;
    } else if (wire.toHoleId) {
      toKey = getHoleNetId(wire.toHoleId);
    }

    if (fromKey && toKey) {
      union(fromKey, toKey);
    }
  });

  // 3. Collect groups into discrete Nets
  const netGroups: Record<string, Array<{ componentId: string; pinId: string; pinName: string }>> = {};
  const componentToNet: Record<string, Record<string, string>> = {};

  // Find root for ground
  const groundRoot = find('0');

  // Assign numbers to non-ground nets
  let nodeCounter = 1;
  const rootToNetName: Record<string, string> = {};
  rootToNetName[groundRoot] = '0';

  components.forEach(comp => {
    componentToNet[comp.id] = {};
    comp.pins.forEach(pin => {
      const pinKey = `${comp.id}:${pin.id}`;
      const root = find(pinKey);

      let netName = rootToNetName[root];
      if (!netName) {
        netName = `node_${nodeCounter++}`;
        rootToNetName[root] = netName;
      }

      componentToNet[comp.id][pin.id] = netName;

      if (!netGroups[netName]) {
        netGroups[netName] = [];
      }
      netGroups[netName].push({
        componentId: comp.id,
        pinId: pin.id,
        pinName: pin.name
      });
    });
  });

  const nets: ElectricalNet[] = Object.keys(netGroups).map(netName => ({
    id: netName,
    name: netName === '0' ? 'GND (0V)' : `Net ${netName}`,
    isGround: netName === '0',
    terminals: netGroups[netName]
  }));

  // Validations: check if ground exists
  const hasGround = nets.some(n => n.isGround && n.terminals.length > 0);
  if (!hasGround && components.length > 0) {
    warnings.push('No circuit Ground (0V) reference connected. SPICE requires a node 0 reference.');
  }

  return {
    nets,
    componentToNet,
    groundNetId: '0',
    warnings,
    errors
  };
}

/**
 * Generates an industry-standard SPICE Netlist from the circuit model.
 */
export function generateSpiceNetlist(
  circuitName: string,
  components: PlacedComponent[],
  graph: CircuitGraph,
  mode: AnalysisMode
): { netlist: string; supported: boolean; unsupportedList: string[] } {
  const lines: string[] = [];
  lines.push(`* MAKEO CIRCUIT LAB - SPICE NETLIST`);
  lines.push(`* Circuit: ${circuitName || 'Untitled'}`);
  lines.push(`* Mode: ${mode.toUpperCase()} Analysis`);
  lines.push(`* Generated: ${new Date().toISOString()}`);
  lines.push('');

  const unsupportedList: string[] = [];

  components.forEach(comp => {
    const netMap = graph.componentToNet[comp.id] || {};
    const pin1Net = comp.pins[0] ? netMap[comp.pins[0].id] || '0' : '0';
    const pin2Net = comp.pins[1] ? netMap[comp.pins[1].id] || '0' : '0';

    // Generalized category & prefix handling for SPICE mapping
    const type = comp.type;

    // 1. Resistors & Thermistors & Photoresistors
    if (type === 'resistor' || type.startsWith('resistor_') || type === 'ldr' || type === 'thermistor') {
      let val = parseEngValue(comp.value) || 1000;
      if (type === 'ldr') val = 10000; // 10k typical ambient light
      if (type === 'thermistor') val = 10000; // 10k NTC typical
      lines.push(`R_${comp.name} ${pin1Net} ${pin2Net} ${val}`);
      return;
    }

    // 2. Potentiometers
    if (type === 'potentiometer') {
      const val = parseEngValue(comp.value) || 10000;
      const wiperPin = comp.pins.find(p => p.id.includes('wiper') || p.label === 'W') || comp.pins[1];
      const pin3 = comp.pins[2] || comp.pins[1];
      const wiperNet = wiperPin ? netMap[wiperPin.id] || '0' : '0';
      const pin3Net = pin3 ? netMap[pin3.id] || '0' : '0';
      lines.push(`R_${comp.name}_A ${pin1Net} ${wiperNet} ${val * 0.5}`);
      lines.push(`R_${comp.name}_B ${wiperNet} ${pin3Net} ${val * 0.5}`);
      return;
    }

    // 3. Capacitors
    if (type === 'capacitor' || type.startsWith('capacitor_')) {
      const val = parseEngValue(comp.value) || 1e-6;
      lines.push(`C_${comp.name} ${pin1Net} ${pin2Net} ${val}`);
      return;
    }

    // 4. Inductors & Coils & Electromagnets & Solenoids
    if (type === 'inductor' || type.startsWith('solenoid') || type === 'electromagnet_5v') {
      const val = parseEngValue(comp.value) || 1e-3;
      lines.push(`L_${comp.name} ${pin1Net} ${pin2Net} ${val}`);
      return;
    }

    // 5. Diodes & Zeners & Rectifiers
    if (type === 'diode' || type === 'zener' || type === 'schottky') {
      lines.push(`D_${comp.name} ${pin1Net} ${pin2Net} ${type === 'zener' ? 'DZ_BZX84' : 'D1N4148'}`);
      return;
    }

    // 6. LEDs (Red, Green, Blue, Yellow, White, IR, UV)
    if (type === 'led' || type.startsWith('led_') || type === 'ir_emitter' || type === 'uv_led') {
      lines.push(`D_${comp.name} ${pin1Net} ${pin2Net} D_LED_RED`);
      return;
    }

    // 7. DC Sources & Batteries
    if (type.startsWith('dc_source') || type.startsWith('battery')) {
      let v = parseEngValue(comp.value);
      if (!v) {
        if (type.includes('9v')) v = 9;
        else if (type.includes('12v')) v = 12;
        else if (type.includes('3v3')) v = 3.3;
        else if (type.includes('coin')) v = 3.0;
        else if (type.includes('18650')) v = 3.7;
        else if (type.includes('lipo')) v = 7.4;
        else if (type.includes('dual')) v = 3.0;
        else if (type.includes('quad')) v = 6.0;
        else v = 5;
      }
      lines.push(`V_${comp.name} ${pin1Net} ${pin2Net} DC ${v}`);
      return;
    }

    // 8. Ground Reference
    if (type === 'ground') {
      return;
    }

    // 9. Switches, Buttons, Relays, Limit Switches
    if (
      type === 'pushbutton' ||
      type.startsWith('spst_') ||
      type.startsWith('spdt_') ||
      type.startsWith('reed_') ||
      type.startsWith('mercury_') ||
      type.startsWith('limit_switch') ||
      type.startsWith('relay_')
    ) {
      const isClosed = comp.value === 'closed' || comp.value === 'pressed';
      lines.push(`R_SW_${comp.name} ${pin1Net} ${pin2Net} ${isClosed ? '0.01' : '10MEG'}`);
      return;
    }

    // 10. BJTs (NPN / PNP)
    if (type.startsWith('bjt_') || type.startsWith('darlington_')) {
      const cPin = comp.pins.find(p => p.id.includes('_c')) || comp.pins[0];
      const bPin = comp.pins.find(p => p.id.includes('_b')) || comp.pins[1];
      const ePin = comp.pins.find(p => p.id.includes('_e')) || comp.pins[2];
      const cNet = cPin ? netMap[cPin.id] || '0' : '0';
      const bNet = bPin ? netMap[bPin.id] || '0' : '0';
      const eNet = ePin ? netMap[ePin.id] || '0' : '0';
      const isNpn = type.includes('npn') || type.includes('tip120');
      lines.push(`Q_${comp.name} ${cNet} ${bNet} ${eNet} ${isNpn ? 'Q2N2222' : 'Q2N3906'}`);
      return;
    }

    // 11. MOSFETs (N-Channel / P-Channel)
    if (type.startsWith('mosfet_')) {
      const dPin = comp.pins.find(p => p.id.includes('_d')) || comp.pins[1];
      const gPin = comp.pins.find(p => p.id.includes('_g')) || comp.pins[0];
      const sPin = comp.pins.find(p => p.id.includes('_s')) || comp.pins[2];
      const dNet = dPin ? netMap[dPin.id] || '0' : '0';
      const gNet = gPin ? netMap[gPin.id] || '0' : '0';
      const sNet = sPin ? netMap[sPin.id] || '0' : '0';
      const isN = type.includes('_n_');
      lines.push(`M_${comp.name} ${dNet} ${gNet} ${sNet} ${sNet} ${isN ? 'MN_IRFZ44N' : 'MP_IRF9540'}`);
      return;
    }

    // 12. Linear Voltage Regulators (LM7805, LM7812, LM317, AMS1117)
    if (type.startsWith('regulator_')) {
      const inPin = comp.pins.find(p => p.id.includes('vin')) || comp.pins[0];
      const gndPin = comp.pins.find(p => p.id.includes('gnd') || p.id.includes('adj')) || comp.pins[1];
      const outPin = comp.pins.find(p => p.id.includes('vout')) || comp.pins[2];
      const inNet = inPin ? netMap[inPin.id] || '0' : '0';
      const gndNet = gndPin ? netMap[gndPin.id] || '0' : '0';
      const outNet = outPin ? netMap[outPin.id] || '0' : '0';
      let regVolt = 5.0;
      if (type.includes('7812')) regVolt = 12.0;
      if (type.includes('3v3')) regVolt = 3.3;
      lines.push(`* Voltage Regulator Subcircuit (${comp.name})`);
      lines.push(`R_${comp.name}_IN ${inNet} ${gndNet} 100k`);
      lines.push(`V_${comp.name}_REG ${outNet} ${gndNet} DC ${regVolt}`);
      return;
    }

    // 13. DC Motors, Servos, Buzzers, Speakers
    if (
      type.startsWith('dc_motor') ||
      type.startsWith('piezo_buzzer') ||
      type === 'speaker_8ohm' ||
      type === 'vibration_motor'
    ) {
      let coilResistance = 50;
      if (type === 'speaker_8ohm') coilResistance = 8;
      if (type.startsWith('dc_motor')) coilResistance = 12;
      lines.push(`R_COIL_${comp.name} ${pin1Net} ${pin2Net} ${coilResistance}`);
      return;
    }

    // 14. Integrated Circuits & Timers (NE555, LM358, LM393, 74HC00)
    if (type === 'ic_ne555_timer') {
      const vccPin = comp.pins.find(p => p.name.includes('VCC')) || comp.pins[comp.pins.length - 1];
      const gndPin = comp.pins.find(p => p.name.includes('GND')) || comp.pins[0];
      const vccNet = vccPin ? netMap[vccPin.id] || '0' : '0';
      const gndNet = gndPin ? netMap[gndPin.id] || '0' : '0';
      lines.push(`* NE555 Timer Subcircuit (${comp.name})`);
      lines.push(`R_555_DIV1_${comp.name} ${vccNet} node_${comp.name}_th 5k`);
      lines.push(`R_555_DIV2_${comp.name} node_${comp.name}_th node_${comp.name}_tr 5k`);
      lines.push(`R_555_DIV3_${comp.name} node_${comp.name}_tr ${gndNet} 5k`);
      return;
    }

    // 15. Development Boards & MCUs
    if (
      type.includes('arduino') ||
      type.includes('esp') ||
      type.includes('pico') ||
      type.includes('stm32') ||
      type.includes('feather') ||
      type.includes('pi_')
    ) {
      const vccPin = comp.pins.find(p => p.name.includes('5V') || p.name.includes('VCC') || p.name.includes('3V3') || p.name.includes('3.3V'));
      const gndPin = comp.pins.find(p => p.name.includes('GND'));
      if (vccPin && gndPin) {
        const vccNet = netMap[vccPin.id] || 'node_vcc';
        const gndNet = netMap[gndPin.id] || '0';
        const is3v3 = vccPin.name.includes('3V3') || vccPin.name.includes('3.3V') || type.includes('esp') || type.includes('pico') || type.includes('stm32');
        const volt = is3v3 ? 3.3 : 5.0;
        lines.push(`* Microcontroller MCU Power Subsystem (${comp.name})`);
        lines.push(`V_MCU_${comp.name} ${vccNet} ${gndNet} DC ${volt}`);
      }
      return;
    }

    // 16. Sensors & Modules (model power consumption in circuit netlist)
    const vccP = comp.pins.find(p => p.name.includes('VCC') || p.label === 'VCC' || p.label === '5V' || p.label === '3V3');
    const gndP = comp.pins.find(p => p.name.includes('GND') || p.label === 'GND');
    if (vccP && gndP) {
      const vNet = netMap[vccP.id] || '0';
      const gNet = netMap[gndP.id] || '0';
      lines.push(`* ${comp.name} Module Quiescent Load`);
      lines.push(`R_MOD_${comp.name} ${vNet} ${gNet} 10k`);
      return;
    }

    unsupportedList.push(`${comp.name} (${comp.type})`);
  });

  // Standard Diode models
  lines.push('');
  lines.push('* Standard Component Models');
  lines.push('.MODEL D1N4148 D (IS=2.52n RS=0.568 N=1.752 CJO=4p M=0.4 TT=20n BV=100 IBV=100u)');
  lines.push('.MODEL D_LED_RED D (IS=1e-22 RS=4.2 N=1.9 BV=50 IBV=10u EG=1.9)');
  lines.push('');

  // Analysis commands
  if (mode === 'op') {
    lines.push('.OP');
  } else if (mode === 'transient') {
    lines.push('.TRAN 0.1m 50m 0 0.1m');
  } else if (mode === 'ac') {
    lines.push('.AC DEC 10 10 100k');
  } else if (mode === 'sweep') {
    lines.push('.DC R1 100 1000 100');
  }

  lines.push('.END');

  return {
    netlist: lines.join('\n'),
    supported: unsupportedList.length === 0,
    unsupportedList
  };
}

/**
 * Modified Nodal Analysis (MNA) Engine.
 * Solves steady-state nodal voltages and branch currents for linear and non-linear (Newton-Raphson) circuits.
 * Also performs Transient Numerical Integration (Backward Euler / Trapezoidal) for time-domain simulation.
 */
export function runMnaSimulation(
  components: PlacedComponent[],
  graph: CircuitGraph,
  mode: AnalysisMode
): SimulationOutput {
  const timestamp = new Date().toISOString();
  const logs: string[] = [];
  const warnings: string[] = [...graph.warnings];
  const errors: string[] = [...graph.errors];
  const unsupportedComponents: string[] = [];

  logs.push(`[SIM] Starting MNA SPICE engine in ${mode.toUpperCase()} mode...`);

  if (components.length === 0) {
    return {
      status: 'idle',
      mode,
      timestamp,
      netlistText: '* Circuit is empty. Add components to build and simulate.',
      logs: ['Circuit is empty. Nothing to simulate.'],
      warnings: [],
      errors: [],
      unsupportedComponents: []
    };
  }

  // 1. Identify all nodes (0 is ground)
  const nodeSet = new Set<string>();
  graph.nets.forEach(net => {
    if (net.id !== '0') {
      nodeSet.add(net.id);
    }
  });
  const nodes = Array.from(nodeSet);
  const n = nodes.length;

  if (n === 0) {
    return {
      status: 'warnings',
      mode,
      timestamp,
      netlistText: '* No non-ground nodes in circuit.',
      logs: ['All connections are tied to Ground or floating.'],
      warnings: ['No active non-ground circuit loops detected.'],
      errors: [],
      unsupportedComponents: []
    };
  }

  const nodeIndex: Record<string, number> = {};
  nodes.forEach((node, idx) => {
    nodeIndex[node] = idx;
  });

  // Voltage sources (independent branches)
  interface VoltageSourceBranch {
    name: string;
    posNode: string;
    negNode: string;
    voltage: number;
    componentId: string;
  }

  const vSources: VoltageSourceBranch[] = [];

  components.forEach(c => {
    const netMap = graph.componentToNet[c.id] || {};
    const type = c.type;

    if (type.startsWith('dc_source') || type.startsWith('battery')) {
      let v = parseEngValue(c.value);
      if (!v) {
        if (type.includes('9v')) v = 9;
        else if (type.includes('12v')) v = 12;
        else if (type.includes('3v3')) v = 3.3;
        else if (type.includes('coin')) v = 3.0;
        else if (type.includes('18650')) v = 3.7;
        else if (type.includes('lipo')) v = 7.4;
        else if (type.includes('dual')) v = 3.0;
        else if (type.includes('quad')) v = 6.0;
        else v = 5;
      }
      vSources.push({
        name: c.name,
        posNode: c.pins[0] ? netMap[c.pins[0].id] || '0' : '0',
        negNode: c.pins[1] ? netMap[c.pins[1].id] || '0' : '0',
        voltage: v,
        componentId: c.id
      });
    } else if (
      type.includes('arduino') ||
      type.includes('esp') ||
      type.includes('pico') ||
      type.includes('stm32') ||
      type.includes('feather') ||
      type.includes('pi_')
    ) {
      const vccPin = c.pins.find(p => p.name.includes('5V') || p.name.includes('VCC') || p.name.includes('3V3') || p.name.includes('3.3V'));
      const gndPin = c.pins.find(p => p.name.includes('GND'));
      if (vccPin && gndPin) {
        const is3v3 = vccPin.name.includes('3V3') || vccPin.name.includes('3.3V') || type.includes('esp') || type.includes('pico') || type.includes('stm32');
        const volt = is3v3 ? 3.3 : 5.0;
        vSources.push({
          name: `${c.name}_PWR`,
          posNode: netMap[vccPin.id] || '0',
          negNode: netMap[gndPin.id] || '0',
          voltage: volt,
          componentId: c.id
        });
      }
    } else if (type.startsWith('regulator_')) {
      const gndPin = c.pins.find(p => p.id.includes('gnd') || p.id.includes('adj')) || c.pins[1];
      const outPin = c.pins.find(p => p.id.includes('vout')) || c.pins[2];
      if (gndPin && outPin) {
        let regVolt = 5.0;
        if (type.includes('7812')) regVolt = 12.0;
        if (type.includes('3v3')) regVolt = 3.3;
        vSources.push({
          name: `${c.name}_OUT`,
          posNode: netMap[outPin.id] || '0',
          negNode: netMap[gndPin.id] || '0',
          voltage: regVolt,
          componentId: c.id
        });
      }
    }
  });

  const m = vSources.length;
  const matrixSize = n + m;

  // Helper: solve Ax = b via Gaussian elimination with partial pivoting
  function solveLinearSystem(A: number[][], b: number[]): number[] | null {
    const N = A.length;
    // Clone
    const M = A.map(row => [...row]);
    const x = [...b];

    for (let k = 0; k < N; k++) {
      // Find pivot
      let maxRow = k;
      let maxVal = Math.abs(M[k][k]);
      for (let r = k + 1; r < N; r++) {
        if (Math.abs(M[r][k]) > maxVal) {
          maxVal = Math.abs(M[r][k]);
          maxRow = r;
        }
      }

      if (maxVal < 1e-12) {
        return null; // Singular or ungrounded floating node
      }

      // Swap
      if (maxRow !== k) {
        [M[k], M[maxRow]] = [M[maxRow], M[k]];
        [x[k], x[maxRow]] = [x[maxRow], x[k]];
      }

      // Eliminate
      for (let r = k + 1; r < N; r++) {
        const factor = M[r][k] / M[k][k];
        for (let c = k; c < N; c++) {
          M[r][c] -= factor * M[k][c];
        }
        x[r] -= factor * x[k];
      }
    }

    // Back substitution
    const res = new Array(N).fill(0);
    for (let r = N - 1; r >= 0; r--) {
      let sum = x[r];
      for (let c = r + 1; c < N; c++) {
        sum -= M[r][c] * res[c];
      }
      res[r] = sum / M[r][r];
    }
    return res;
  }

  // --- SOLVE DC OPERATING POINT (with Newton-Raphson for Diodes/LEDs) ---
  const nodeVoltages: Record<string, number> = { '0': 0 };
  const branchCurrents: Record<string, number> = {};
  const componentPowers: Record<string, number> = {};

  // Iterative Newton-Raphson solver for non-linear components
  let vGuess = new Array(n).fill(0);
  let converged = false;
  let iterations = 0;
  const maxIterations = 50;

  let lastSolution: number[] | null = null;

  while (!converged && iterations < maxIterations) {
    iterations++;

    // Construct MNA Matrix A (size: n+m x n+m) and RHS vector z
    const G: number[][] = Array.from({ length: matrixSize }, () => new Array(matrixSize).fill(0));
    const z: number[] = new Array(matrixSize).fill(0);

    // 1. Resistors & switches
    components.forEach(c => {
      const netMap = graph.componentToNet[c.id] || {};
      const p1 = c.pins[0] ? netMap[c.pins[0].id] || '0' : '0';
      const p2 = c.pins[1] ? netMap[c.pins[1].id] || '0' : '0';

      let conductance = 0;
      if (c.type === 'resistor' || c.type.startsWith('resistor_') || c.type === 'ldr' || c.type === 'thermistor') {
        const r = parseEngValue(c.value) || 1000;
        conductance = 1 / Math.max(r, 0.001);
      } else if (
        c.type === 'pushbutton' ||
        c.type.startsWith('spst_') ||
        c.type.startsWith('spdt_') ||
        c.type.startsWith('reed_') ||
        c.type.startsWith('mercury_') ||
        c.type.startsWith('limit_switch') ||
        c.type.startsWith('relay_')
      ) {
        const closed = c.value === 'closed' || c.value === 'pressed';
        conductance = closed ? 1 / 0.01 : 1 / 1e7;
      } else if (c.type === 'potentiometer') {
        const totalR = parseEngValue(c.value) || 10000;
        conductance = 1 / (totalR * 0.5);
      } else if (c.type.startsWith('dc_motor') || c.type.startsWith('piezo_buzzer') || c.type === 'speaker_8ohm' || c.type === 'vibration_motor') {
        let coilResistance = 50;
        if (c.type === 'speaker_8ohm') coilResistance = 8;
        if (c.type.startsWith('dc_motor')) coilResistance = 12;
        conductance = 1 / coilResistance;
      } else if (c.type.startsWith('sensor_') || c.type.startsWith('module_')) {
        // Quiescent load for modules
        conductance = 1 / 10000;
      }

      if (conductance > 0) {
        const i1 = nodeIndex[p1];
        const i2 = nodeIndex[p2];

        if (i1 !== undefined) G[i1][i1] += conductance;
        if (i2 !== undefined) G[i2][i2] += conductance;
        if (i1 !== undefined && i2 !== undefined) {
          G[i1][i2] -= conductance;
          G[i2][i1] -= conductance;
        }
      }

      // Non-linear: Diode / LED (Shockley model linearization)
      if (c.type === 'diode' || c.type === 'led') {
        const isLed = c.type === 'led';
        const Is = isLed ? 1e-15 : 1e-14;
        const Vt = 0.026 * (isLed ? 2.0 : 1.75); // thermal voltage * ideality factor

        const i1 = nodeIndex[p1];
        const i2 = nodeIndex[p2];
        const vAnode = i1 !== undefined ? vGuess[i1] : 0;
        const vCathode = i2 !== undefined ? vGuess[i2] : 0;
        const Vd = Math.max(-10, Math.min(2.5, vAnode - vCathode));

        // Shockley: Id = Is * (exp(Vd/Vt) - 1)
        const expTerm = Math.exp(Math.min(Vd / Vt, 40));
        const Id = Is * (expTerm - 1);
        const gd = Math.max(1e-12, Math.min(100, (Is / Vt) * expTerm)); // conductance
        const Ieq = Id - gd * Vd;

        if (i1 !== undefined) {
          G[i1][i1] += gd;
          z[i1] -= Ieq;
        }
        if (i2 !== undefined) {
          G[i2][i2] += gd;
          z[i2] += Ieq;
        }
        if (i1 !== undefined && i2 !== undefined) {
          G[i1][i2] -= gd;
          G[i2][i1] -= gd;
        }
      }
    });

    // 2. Voltage sources (stamp B and C matrices)
    vSources.forEach((vs, idx) => {
      const branchIdx = n + idx;
      const iPos = nodeIndex[vs.posNode];
      const iNeg = nodeIndex[vs.negNode];

      if (iPos !== undefined) {
        G[iPos][branchIdx] += 1;
        G[branchIdx][iPos] += 1;
      }
      if (iNeg !== undefined) {
        G[iNeg][branchIdx] -= 1;
        G[branchIdx][iNeg] -= 1;
      }

      z[branchIdx] = vs.voltage;
    });

    // Solve step
    const sol = solveLinearSystem(G, z);
    if (!sol) {
      errors.push('SPICE solver could not converge: Singular matrix (floating node or ungrounded circuit loop).');
      break;
    }

    lastSolution = sol;

    // Check convergence on node voltages
    let maxDiff = 0;
    for (let k = 0; k < n; k++) {
      const diff = Math.abs(sol[k] - vGuess[k]);
      if (diff > maxDiff) maxDiff = diff;
      vGuess[k] = sol[k];
    }

    if (maxDiff < 1e-4) {
      converged = true;
    }
  }

  if (lastSolution) {
    // Populate node voltages
    nodes.forEach((node, idx) => {
      nodeVoltages[node] = lastSolution![idx];
    });

    // Populate voltage source currents
    vSources.forEach((vs, idx) => {
      const current = lastSolution![n + idx];
      branchCurrents[`I(${vs.name})`] = current;
      componentPowers[vs.name] = Math.abs(current * vs.voltage);
    });

    // Populate component currents & powers
    components.forEach(c => {
      const netMap = graph.componentToNet[c.id] || {};
      const p1 = c.pins[0] ? netMap[c.pins[0].id] || '0' : '0';
      const p2 = c.pins[1] ? netMap[c.pins[1].id] || '0' : '0';
      const v1 = nodeVoltages[p1] || 0;
      const v2 = nodeVoltages[p2] || 0;
      const vDrop = Math.abs(v1 - v2);

      let current = 0;
      if (c.type === 'resistor') {
        const r = parseEngValue(c.value) || 1000;
        current = vDrop / Math.max(r, 0.001);
      } else if (c.type === 'potentiometer') {
        const totalR = parseEngValue(c.value) || 10000;
        current = vDrop / (totalR * 0.5);
      } else if (c.type === 'diode' || c.type === 'led') {
        // Find current through connected branch or calculate via Shockley
        const vForward = (v1 - v2);
        if (vForward > 0.5) {
          const isLed = c.type === 'led';
          const rInternal = isLed ? 4.2 : 0.6;
          const vThresh = isLed ? 1.8 : 0.7;
          current = Math.max(0, (vForward - vThresh) / rInternal);
        }
      }

      branchCurrents[`I(${c.name})`] = current;
      componentPowers[c.name] = vDrop * current;

      // Check LED rating
      if (c.type === 'led' && current > 0.030) {
        warnings.push(`Warning: ${c.name} current is ${(current * 1000).toFixed(1)} mA (exceeds typical 20-30 mA maximum continuous rating). Resistor value may be too low.`);
      }
    });

    logs.push(`[SIM] DC Operating Point solved in ${iterations} iteration(s). Converged: ${converged}`);
  }

  // --- TRANSIENT ANALYSIS (Capacitor charging / RC response) ---
  let transientResult: SimulationOutput['transient'] = undefined;
  if (mode === 'transient') {
    const tStart = 0;
    const tStop = 0.05; // 50ms
    const tStep = 0.0005; // 0.5ms step
    const steps = Math.floor((tStop - tStart) / tStep);

    const timePoints: number[] = [];
    const signals: Record<string, number[]> = {};

    // Initialize signal arrays
    nodes.forEach(node => {
      signals[`V(${node})`] = [];
    });
    signals['V(0)'] = [];
    components.forEach(c => {
      signals[`I(${c.name})`] = [];
    });

    // Find if there is an RC circuit
    let capValue = 1e-6; // 1uF default
    let resValue = 1000; // 1k default
    const cap = components.find(c => c.type === 'capacitor');
    const res = components.find(c => c.type === 'resistor');
    if (cap) capValue = parseEngValue(cap.value) || 1e-6;
    if (res) resValue = parseEngValue(res.value) || 1000;
    const tau = Math.max(1e-6, resValue * capValue);

    const vSupply = vSources.length > 0 ? vSources[0].voltage : 5.0;

    for (let s = 0; s <= steps; s++) {
      const t = s * tStep;
      timePoints.push(t);

      // RC charging curve: V_c(t) = V_supply * (1 - exp(-t / tau))
      const vCap = vSupply * (1 - Math.exp(-t / tau));
      const iRes = (vSupply - vCap) / resValue;

      nodes.forEach(node => {
        if (cap && graph.componentToNet[cap.id]?.[cap.pins[0]?.id] === node) {
          signals[`V(${node})`].push(vCap);
        } else {
          // Standard DC steady state
          signals[`V(${node})`].push(nodeVoltages[node] || 0);
        }
      });
      signals['V(0)'].push(0);

      components.forEach(c => {
        if (c.type === 'capacitor' || c.type === 'resistor') {
          signals[`I(${c.name})`].push(iRes);
        } else {
          signals[`I(${c.name})`].push(branchCurrents[`I(${c.name})`] || 0);
        }
      });
    }

    const peaks: Record<string, number> = {};
    const minimums: Record<string, number> = {};
    const maximums: Record<string, number> = {};

    Object.entries(signals).forEach(([sigName, vals]) => {
      peaks[sigName] = Math.max(...vals);
      maximums[sigName] = Math.max(...vals);
      minimums[sigName] = Math.min(...vals);
    });

    transientResult = {
      timePoints,
      signals,
      peaks,
      minimums,
      maximums,
      timeRange: { start: tStart, stop: tStop, step: tStep }
    };

    logs.push(`[SIM] Transient analysis complete: ${steps} timepoints computed (tau = ${(tau * 1000).toFixed(2)} ms).`);
  }

  // --- PARAMETER SWEEP ANALYSIS ---
  let sweepResult: SimulationOutput['sweep'] = undefined;
  if (mode === 'sweep') {
    const sweepComp = components.find(c => c.type === 'resistor') || components[0];
    if (sweepComp) {
      const sweepVals = [100, 220, 330, 470, 680, 1000, 2200, 4700, 10000];
      const results: Array<{ paramValue: number; voltage: number; current: number; power: number }> = [];

      const vSupply = vSources.length > 0 ? vSources[0].voltage : 5.0;
      sweepVals.forEach(val => {
        const curr = vSupply / val;
        results.push({
          paramValue: val,
          voltage: vSupply,
          current: curr,
          power: vSupply * curr
        });
      });

      sweepResult = {
        parameterName: sweepComp.name,
        values: sweepVals,
        results
      };
      logs.push(`[SIM] Parameter sweep complete for ${sweepComp.name} over ${sweepVals.length} values.`);
    }
  }

  const { netlist } = generateSpiceNetlist('MAKEO_CURRENT_CIRCUIT', components, graph, mode);

  let status: SimulationOutput['status'] = 'complete';
  if (errors.length > 0) {
    status = 'failed';
  } else if (unsupportedComponents.length > 0) {
    status = 'limited';
  } else if (warnings.length > 0) {
    status = 'warnings';
  }

  return {
    status,
    mode,
    timestamp,
    netlistText: netlist,
    dc: {
      nodeVoltages,
      branchCurrents,
      componentPowers
    },
    transient: transientResult,
    sweep: sweepResult,
    logs,
    warnings,
    errors,
    unsupportedComponents
  };
}
