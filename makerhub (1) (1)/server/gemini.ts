import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AiCodeRequest {
  action: 'explain' | 'fix' | 'improve' | 'review' | 'docs' | 'tests' | 'debug' | 'circuit_mismatch';
  code: string;
  language: string;
  fileName?: string;
  errorMessage?: string;
  projectContext?: {
    projectName?: string;
    projectDescription?: string;
    circuits?: Array<{
      name: string;
      boardMcu: string;
      pins: Array<{
        componentName: string;
        pinLabel: string;
        pinNumber: string;
        pinType: string;
        role: string;
        destination: string;
      }>;
    }>;
  };
  customInstruction?: string;
}

export async function processAiCodeRequest(request: AiCodeRequest): Promise<{ result: string }> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add your key in the AI Studio Settings / Secrets panel.');
  }

  const { action, code, language, fileName, errorMessage, projectContext, customInstruction } = request;

  let prompt = '';
  const contextDetails = projectContext?.projectName 
    ? `Project: "${projectContext.projectName}"\nDescription: ${projectContext.projectDescription || 'N/A'}\n`
    : '';

  const circuitDetails = projectContext?.circuits && projectContext.circuits.length > 0
    ? `Configured Hardware Circuits:\n` + projectContext.circuits.map(c => 
        `Circuit "${c.name}" (Board/MCU: ${c.boardMcu || 'unspecified'}):\n` +
        c.pins.map(p => `  - Pin ${p.pinNumber} (${p.pinLabel}): Component ${p.componentName}, Type: ${p.pinType}, Role: ${p.role}, Dest: ${p.destination}`).join('\n')
      ).join('\n') + '\n'
    : 'No hardware circuits documented in project yet.\n';

  switch (action) {
    case 'explain':
      prompt = `You are MakerHub's AI Coding Assistant. Explain the following ${language} code clearly for a maker/engineer:\n\nFile: ${fileName || 'unnamed'}\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:
1. High-level summary of what this code does.
2. Step-by-step breakdown of key functions, pin definitions, and logic.
3. Hardware/timing/memory considerations if applicable.`;
      break;

    case 'fix':
      prompt = `You are MakerHub's AI Coding Assistant. Fix any bugs, memory leaks, invalid pin accesses, or syntax issues in this ${language} code:\n\nFile: ${fileName || 'unnamed'}\n${errorMessage ? `Reported Error: ${errorMessage}\n` : ''}\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:
1. Clear explanation of what was wrong.
2. The corrected code snippet.
3. Recommendations for avoiding this bug.`;
      break;

    case 'improve':
      prompt = `You are MakerHub's AI Coding Assistant. Suggest optimizations and quality improvements for this ${language} code:\n\nFile: ${fileName || 'unnamed'}\n\`\`\`${language}\n${code}\n\`\`\`\n\nFocus on readability, modularity, power efficiency (for microcontrollers), and best practices.`;
      break;

    case 'review':
      prompt = `You are an expert embedded systems and software reviewer. Perform a thorough code review of this ${language} code:\n\nFile: ${fileName || 'unnamed'}\n\`\`\`${language}\n${code}\n\`\`\`\n\nCheck for:
- Logic safety & edge cases
- Hardware timing / delay blocking issues
- Pin configuration correctness
- Resource management`;
      break;

    case 'docs':
      prompt = `Generate comprehensive technical documentation and inline comments for this ${language} code:\n\nFile: ${fileName || 'unnamed'}\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude API descriptions, parameters, return values, setup prerequisites, and hardware wiring expectations.`;
      break;

    case 'tests':
      prompt = `Generate unit tests and hardware simulation test cases for this ${language} code:\n\nFile: ${fileName || 'unnamed'}\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude setup/teardown, normal operations, boundary limits, and edge case assertions.`;
      break;

    case 'debug':
      prompt = `Analyze the following compile error or runtime debugging output for this ${language} file:\n\nFile: ${fileName || 'unnamed'}\nDebug Output / Error:\n${errorMessage || 'None provided'}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nIdentify the root cause and provide the exact fix.`;
      break;

    case 'circuit_mismatch':
      prompt = `You are MakerHub's Hardware-Software Verification Specialist.\n\nCompare this ${language} code against the project's actual recorded circuit pinout:\n\n${circuitDetails}\n\nCode File: ${fileName || 'unnamed'}\n\`\`\`${language}\n${code}\n\`\`\`\n\nIdentify:\n1. Any mismatches between pin assignments in code (e.g. GPIO numbers, analog vs digital, input vs output) and the recorded hardware circuit pin table.\n2. Potential voltage or communication protocol mismatches (e.g. 5V sensor on 3.3V pin, I2C/SPI pin discrepancies).\n3. Exact recommended corrections in the code or circuit.`;
      break;

    default:
      prompt = `You are MakerHub's AI Coding Assistant. Assist with the following ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInstruction: ${customInstruction || 'Provide analysis and recommendations.'}`;
      break;
  }

  if (customInstruction) {
    prompt += `\n\nAdditional user instruction: ${customInstruction}`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: `${contextDetails}${prompt}`,
  });

  return {
    result: response.text || 'No response generated from model.',
  };
}

export interface AiCircuitReviewRequest {
  circuitName: string;
  boardMcu?: string;
  components: Array<{
    id: string;
    name: string;
    type: string;
    value: string;
  }>;
  wires: Array<{
    from?: string;
    to?: string;
    color?: string;
  }>;
  simulation: {
    mode: string;
    status: string;
    nodeVoltages: Record<string, number>;
    branchCurrents: Record<string, number>;
    componentPowers: Record<string, number>;
    warnings: string[];
    errors: string[];
    unsupportedComponents: string[];
    netlistText?: string;
  };
  userQuery?: string;
}

export async function processAiCircuitReview(request: AiCircuitReviewRequest): Promise<any> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add your key in the AI Studio Settings / Secrets panel.');
  }

  const { circuitName, boardMcu, components, simulation, userQuery } = request;

  const prompt = `You are MAKEO AI Overview, an expert electronics design and SPICE simulation engineer built directly into the MAKEO Circuit Lab workbench.

You analyze REAL simulated circuit results and netlists. You NEVER fabricate readings or make generic filler statements. Every observation must reference the supplied components, calculated voltages, currents, or power dissipations.

Circuit Name: ${circuitName || 'Untitled'}
Target MCU / Board: ${boardMcu || 'None specified'}

Placed Components:
${components.map(c => ` - ${c.name} (${c.type}): Value = ${c.value} (ID: ${c.id})`).join('\n') || 'None'}

SPICE Simulation Analysis (${simulation.mode.toUpperCase()}):
Status: ${simulation.status}
Calculated Node Voltages:
${Object.entries(simulation.nodeVoltages || {}).map(([node, v]) => ` - Node ${node}: ${v.toFixed(3)} V`).join('\n') || 'None'}

Calculated Branch Currents:
${Object.entries(simulation.branchCurrents || {}).map(([branch, i]) => ` - ${branch}: ${(i * 1000).toFixed(2)} mA (${i} A)`).join('\n') || 'None'}

Calculated Component Power:
${Object.entries(simulation.componentPowers || {}).map(([comp, p]) => ` - ${comp}: ${(p * 1000).toFixed(2)} mW`).join('\n') || 'None'}

Simulation Warnings:
${simulation.warnings.length > 0 ? simulation.warnings.join('\n') : 'None'}

Simulation Errors:
${simulation.errors.length > 0 ? simulation.errors.join('\n') : 'None'}

Unsupported / Unsimulated Components:
${simulation.unsupportedComponents.length > 0 ? simulation.unsupportedComponents.join('\n') : 'None'}

${userQuery ? `User Specific Question / Goal:\n"${userQuery}"\n` : ''}

SPICE Netlist:
\`\`\`spice
${simulation.netlistText || 'N/A'}
\`\`\`

Perform an authoritative, practical review of this circuit based strictly on the simulation data above.
Respond in valid, pure JSON without markdown backticks matching this exact schema:
{
  "verdict": "SUPPORTS_DESIGN" | "POTENTIAL_ISSUE" | "SIMULATION_FAILED" | "NOT_ENOUGH_INFO",
  "overall": "1-2 sentence executive assessment directly addressing if this circuit works as intended",
  "whatHappened": "Clear explanation of circuit behavior under simulation with exact voltages and currents",
  "why": "Engineering root-cause analysis (e.g. Ohm's law, diode forward voltage drop, voltage divider ratio, open circuit)",
  "whatToCheck": ["Array of 2-4 concrete, actionable checks for the user on their workbench"],
  "simulationEvidence": [
    { "metric": "e.g. Node 1 Voltage", "value": "e.g. 1.83 V", "assessment": "Within forward drop range for Red LED" }
  ],
  "suggestedAction": {
    "componentId": "${components[0]?.id || ''}",
    "componentName": "${components[0]?.name || ''}",
    "parameter": "value",
    "currentValue": "${components[0]?.value || ''}",
    "suggestedValue": "e.g. 330",
    "reason": "Clear justification for this modification based on simulation math"
  },
  "highlightIds": ["array of component IDs that the UI should highlight, e.g. '${components[0]?.id || ''}']"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text || '{}';
  try {
    return JSON.parse(rawText);
  } catch (err) {
    // If not clean JSON, attempt extraction
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

export interface AiSliceReviewRequest {
  modelName: string;
  modelDimensions: { x: number; y: number; z: number };
  printer: {
    name: string;
    model: string;
    nozzleDiameterMm: number;
    bedWidthMm: number;
    bedDepthMm: number;
    maxHeightMm: number;
    bedType: string;
  };
  material: {
    name: string;
    materialType: string;
    densityGcm3: number;
    recommendedNozzleTemp: number;
    recommendedBedTemp: number;
  };
  settings: {
    layerHeightMm: number;
    firstLayerHeightMm: number;
    wallLoops: number;
    topBottomLayers: number;
    infillDensity: number;
    infillPattern: string;
    supportsEnabled: boolean;
    supportType: string;
    supportThresholdAngle: number;
    printSpeedMmS: number;
    nozzleTemp: number;
    bedTemp: number;
    brimEnabled: boolean;
  };
  sliceMetrics: {
    layerCount: number;
    estimatedTimeMinutes: number;
    filamentGrams: number;
    filamentMeters: number;
  };
  userQuery?: string;
}

export async function processAiSliceReview(request: AiSliceReviewRequest): Promise<any> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please add your key in the AI Studio Settings / Secrets panel.');
  }

  const { modelName, modelDimensions, printer, material, settings, sliceMetrics, userQuery } = request;

  const prompt = `You are MAKEO Slice AI Overview, a senior additive manufacturing and 3D printing engineer built into the MAKEO digital workshop.
You analyze REAL slicer configurations, model geometry constraints, toolpath kinematics, and material properties. You provide zero fluff, zero generic SaaS boilerplate, and strictly verified manufacturing engineering guidance.

Model: "${modelName}"
Dimensions (W × D × H): ${modelDimensions.x.toFixed(1)} × ${modelDimensions.y.toFixed(1)} × ${modelDimensions.z.toFixed(1)} mm

Target 3D Printer:
- Name: ${printer.name} (${printer.model})
- Build Volume: ${printer.bedWidthMm} × ${printer.bedDepthMm} × ${printer.maxHeightMm} mm
- Nozzle: ${printer.nozzleDiameterMm} mm
- Build Surface: ${printer.bedType}

Filament Material:
- Name: ${material.name} (${material.materialType})
- Recommended Hotend Temp: ${material.recommendedNozzleTemp} °C
- Recommended Bed Temp: ${material.recommendedBedTemp} °C
- Density: ${material.densityGcm3} g/cm³

Active Slicer Settings:
- Layer Height: ${settings.layerHeightMm} mm (First layer: ${settings.firstLayerHeightMm} mm)
- Shell: ${settings.wallLoops} wall perimeters, ${settings.topBottomLayers} top/bottom layers
- Infill: ${settings.infillDensity}% (${settings.infillPattern})
- Supports: ${settings.supportsEnabled ? `Enabled (${settings.supportType} @ ${settings.supportThresholdAngle}° threshold)` : 'DISABLED'}
- Adhesion: Brim ${settings.brimEnabled ? 'Enabled' : 'Disabled'}
- Speeds: Print speed ${settings.printSpeedMmS} mm/s
- Temperatures: Nozzle ${settings.nozzleTemp} °C, Bed ${settings.bedTemp} °C

Calculated Slice Metrics:
- Total Layers: ${sliceMetrics.layerCount}
- Estimated Print Time: ${Math.floor(sliceMetrics.estimatedTimeMinutes / 60)}h ${Math.round(sliceMetrics.estimatedTimeMinutes % 60)}m
- Filament Consumed: ${sliceMetrics.filamentGrams.toFixed(1)} g (${sliceMetrics.filamentMeters.toFixed(1)} m)

${userQuery ? `User Specific Question / Maker Goal:\n"${userQuery}"\n` : ''}

Perform a rigorous physical review of this print setup. Check for:
1. Bed fit and height limits.
2. Layer height vs nozzle diameter ratio (e.g., layer height should generally be <= 80% of nozzle diameter).
3. Overhang support necessity given model height, geometry, and support status.
4. Warping and bed adhesion risk on ${printer.bedType} with ${material.materialType} (especially at ${settings.bedTemp}°C bed and brim status).
5. Thermal suitability: Is ${settings.nozzleTemp}°C hot enough / too hot for ${material.materialType}?
6. Infill pattern suitability: e.g. Gyroid provides isotropic strength and eliminates nozzle crossing; Grid can cause nozzle dragging at high speeds.
7. Speed vs flow rate feasibility.

Respond in pure JSON matching this exact structure:
{
  "printableScore": <number between 0 and 100>,
  "verdict": "PRINT_READY" | "READY_WITH_OPTIMIZATIONS" | "HIGH_FAILURE_RISK",
  "summary": "1-2 sentence executive assessment of slice readiness",
  "analysis": {
    "overhangsAndSupports": "Concrete evaluation of overhangs and whether current support settings are adequate",
    "adhesionAndBedContact": "Evaluation of first layer adhesion risk given model footprint, bed type, and brim",
    "thermalAndSpeed": "Check if temperatures and speeds match the material and nozzle size",
    "strengthAndInfill": "Assessment of wall loops and infill pattern/density for mechanical strength"
  },
  "riskFactors": [
    { "severity": "warning" | "error" | "info", "title": "Brief title", "description": "Specific explanation" }
  ],
  "suggestedFixes": [
    {
      "settingKey": "supportsEnabled" | "infillPattern" | "infillDensity" | "nozzleTemp" | "bedTemp" | "brimEnabled" | "layerHeightMm" | "wallLoops" | "printSpeedMmS",
      "currentValue": <current value>,
      "suggestedValue": <recommended value>,
      "label": "Button label for 1-click apply, e.g. 'Enable Tree Supports' or 'Switch to Gyroid Infill'",
      "reason": "Clear mechanical justification"
    }
  ],
  "estimatedQuality": "High" | "Standard" | "Draft"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text || '{}';
  try {
    return JSON.parse(rawText);
  } catch (err) {
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}

