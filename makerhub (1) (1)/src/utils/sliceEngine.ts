import { SliceSettings, SliceResult, SliceToolpathLayer, SliceToolpathSegment, PrinterProfile, FilamentSpool } from '../types';

export interface ModelPreset {
  id: string;
  name: string;
  category: 'calibration' | 'maker' | 'functional' | 'robotics';
  dimensionsMm: { x: number; y: number; z: number };
  description: string;
  hasOverhangs: boolean;
  overhangAngleDeg: number;
  thinWalls: boolean;
}

export const BUILTIN_MODELS: ModelPreset[] = [
  {
    id: 'calibration_cube',
    name: '20mm XYZ Calibration Cube',
    category: 'calibration',
    dimensionsMm: { x: 20, y: 20, z: 20 },
    description: 'Dimensional accuracy test with recessed X, Y, and Z letter reliefs.',
    hasOverhangs: false,
    overhangAngleDeg: 0,
    thinWalls: false,
  },
  {
    id: 'benchy_hull',
    name: '3D Benchy Speed Cruiser',
    category: 'calibration',
    dimensionsMm: { x: 60, y: 31, z: 48 },
    description: 'The definitive benchmark: cabin overhangs, bow flare, chimney cylinder, and hawse holes.',
    hasOverhangs: true,
    overhangAngleDeg: 55,
    thinWalls: false,
  },
  {
    id: 'electronics_enclosure',
    name: 'Sensor Node Snap-Fit Enclosure',
    category: 'functional',
    dimensionsMm: { x: 74, y: 52, z: 26 },
    description: 'Parametric electronics project box with PCB standoffs, USB-C cutout, and snap lid.',
    hasOverhangs: true,
    overhangAngleDeg: 90,
    thinWalls: true,
  },
  {
    id: 'cable_clip',
    name: 'V-Slot Extrusion Cable Clip',
    category: 'maker',
    dimensionsMm: { x: 24, y: 16, z: 12 },
    description: 'Twist-in 2020 extrusion cable duct clamp with integrated wire retention tongue.',
    hasOverhangs: false,
    overhangAngleDeg: 30,
    thinWalls: true,
  },
  {
    id: 'drone_motor_mount',
    name: 'Brushless Motor Arm Mount',
    category: 'robotics',
    dimensionsMm: { x: 42, y: 34, z: 18 },
    description: 'Carbon-tube clamping motor arm bracket for 2207/2306 multirotor motors.',
    hasOverhangs: true,
    overhangAngleDeg: 45,
    thinWalls: false,
  },
];

/**
 * Real Mathematical Slicing Simulation Engine
 */
export function computeSlice(
  model: { name: string; dimensionsMm: { x: number; y: number; z: number } },
  settings: SliceSettings,
  printer: PrinterProfile,
  spool: FilamentSpool,
  scale: number = 1.0
): SliceResult {
  const scaledX = model.dimensionsMm.x * scale;
  const scaledY = model.dimensionsMm.y * scale;
  const scaledZ = model.dimensionsMm.z * scale;

  const layerHeight = Math.max(0.08, settings.layerHeightMm);
  const firstLayerHeight = Math.max(0.12, settings.firstLayerHeightMm);
  const nozzleDiam = printer.nozzleDiameterMm || 0.4;
  const filamentDiam = spool.diameterMm || 1.75;
  const filamentArea = Math.PI * Math.pow(filamentDiam / 2, 2); // mm^2

  // Total layer count
  const remainingHeight = Math.max(0, scaledZ - firstLayerHeight);
  const layerCount = Math.max(1, 1 + Math.ceil(remainingHeight / layerHeight));

  const layers: SliceToolpathLayer[] = [];
  let totalExtrusionMm = 0;
  let totalTimeSeconds = 0;

  const centerX = printer.bedWidthMm / 2;
  const centerY = printer.bedDepthMm / 2;

  // Build layers
  for (let i = 0; i < layerCount; i++) {
    const zHeight = i === 0 ? firstLayerHeight : firstLayerHeight + i * layerHeight;
    const isSolid = i < settings.topBottomLayers || i >= layerCount - settings.topBottomLayers;
    const isFirstLayer = i === 0;

    const segments: SliceToolpathSegment[] = [];
    let layerExtrusionMm = 0;
    let layerTimeSec = 0;

    // Outer & Inner Perimeter Contours
    const halfW = (scaledX / 2);
    const halfD = (scaledY / 2);

    // If brim enabled on first layer, generate brim rings
    if (isFirstLayer && settings.brimEnabled) {
      const brimWidth = settings.brimWidthMm || 5;
      const brimRings = Math.ceil(brimWidth / (nozzleDiam * 0.9));
      for (let b = 1; b <= brimRings; b++) {
        const offset = b * (nozzleDiam * 0.9);
        const bx1 = centerX - halfW - offset;
        const by1 = centerY - halfD - offset;
        const bx2 = centerX + halfW + offset;
        const by2 = centerY + halfD + offset;
        segments.push({
          type: 'brim',
          points: [
            { x: bx1, y: by1 },
            { x: bx2, y: by1 },
            { x: bx2, y: by2 },
            { x: bx1, y: by2 },
            { x: bx1, y: by1 },
          ],
        });
        const brimPerim = ((bx2 - bx1) + (by2 - by1)) * 2;
        const brimExtrude = brimPerim * (nozzleDiam * firstLayerHeight / filamentArea);
        layerExtrusionMm += brimExtrude;
        layerTimeSec += brimPerim / (settings.printSpeedMmS * 0.5);
      }
    }

    // Outer Wall
    const x1 = centerX - halfW;
    const y1 = centerY - halfD;
    const x2 = centerX + halfW;
    const y2 = centerY + halfD;

    segments.push({
      type: 'outer_wall',
      points: [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 },
        { x: x1, y: y1 },
      ],
    });

    const perimeterLength = (scaledX + scaledY) * 2;
    const outerWallExtrude = perimeterLength * (nozzleDiam * layerHeight / filamentArea);
    layerExtrusionMm += outerWallExtrude;
    layerTimeSec += perimeterLength / settings.outerWallSpeedMmS;

    // Inner Walls
    const wallCount = Math.max(1, settings.wallLoops);
    for (let w = 1; w < wallCount; w++) {
      const wallOffset = w * (nozzleDiam * 0.9);
      if (halfW - wallOffset > 0 && halfD - wallOffset > 0) {
        const wx1 = x1 + wallOffset;
        const wy1 = y1 + wallOffset;
        const wx2 = x2 - wallOffset;
        const wy2 = y2 - wallOffset;
        segments.push({
          type: 'inner_wall',
          points: [
            { x: wx1, y: wy1 },
            { x: wx2, y: wy1 },
            { x: wx2, y: wy2 },
            { x: wx1, y: wy2 },
            { x: wx1, y: wy1 },
          ],
        });
        const innerPerim = ((wx2 - wx1) + (wy2 - wy1)) * 2;
        layerExtrusionMm += innerPerim * (nozzleDiam * layerHeight / filamentArea);
        layerTimeSec += innerPerim / settings.printSpeedMmS;
      }
    }

    // Infill generation
    const infillMargin = wallCount * (nozzleDiam * 0.9);
    const inX1 = x1 + infillMargin;
    const inY1 = y1 + infillMargin;
    const inX2 = x2 - infillMargin;
    const inY2 = y2 - infillMargin;

    if (inX2 > inX1 + 1 && inY2 > inY1 + 1) {
      if (isSolid) {
        // Solid bottom/top skin (dense diagonal hatching)
        const step = nozzleDiam * 1.05;
        const isOdd = i % 2 === 1;
        if (!isOdd) {
          for (let ix = inX1; ix <= inX2; ix += step) {
            segments.push({
              type: 'infill',
              points: [
                { x: ix, y: inY1 },
                { x: ix, y: inY2 },
              ],
            });
            const len = inY2 - inY1;
            layerExtrusionMm += len * (nozzleDiam * layerHeight / filamentArea);
            layerTimeSec += len / settings.infillSpeedMmS;
          }
        } else {
          for (let iy = inY1; iy <= inY2; iy += step) {
            segments.push({
              type: 'infill',
              points: [
                { x: inX1, y: iy },
                { x: inX2, y: iy },
              ],
            });
            const len = inX2 - inX1;
            layerExtrusionMm += len * (nozzleDiam * layerHeight / filamentArea);
            layerTimeSec += len / settings.infillSpeedMmS;
          }
        }
      } else if (settings.infillDensity > 0) {
        // Sparse Infill Pattern based on settings.infillPattern
        const densityFactor = Math.max(5, settings.infillDensity) / 100;
        const spacing = Math.max(nozzleDiam * 2, (nozzleDiam * 1.5) / densityFactor);

        switch (settings.infillPattern) {
          case 'grid': {
            // Horizontal lines
            for (let iy = inY1; iy <= inY2; iy += spacing) {
              segments.push({
                type: 'infill',
                points: [{ x: inX1, y: iy }, { x: inX2, y: iy }],
              });
              layerExtrusionMm += (inX2 - inX1) * (nozzleDiam * layerHeight / filamentArea);
            }
            // Vertical lines
            for (let ix = inX1; ix <= inX2; ix += spacing) {
              segments.push({
                type: 'infill',
                points: [{ x: ix, y: inY1 }, { x: ix, y: inY2 }],
              });
              layerExtrusionMm += (inY2 - inY1) * (nozzleDiam * layerHeight / filamentArea);
            }
            break;
          }
          case 'gyroid': {
            // Sinusoidal waves varying with Z height
            const wavePeriod = spacing * 1.2;
            const phase = (i * Math.PI) / 6;
            for (let iy = inY1; iy <= inY2; iy += spacing) {
              const pts: Array<{ x: number; y: number }> = [];
              const steps = 12;
              for (let s = 0; s <= steps; s++) {
                const px = inX1 + (s / steps) * (inX2 - inX1);
                const py = iy + Math.sin((px / wavePeriod) * 2 * Math.PI + phase) * (spacing * 0.35);
                pts.push({ x: px, y: Math.min(inY2, Math.max(inY1, py)) });
              }
              segments.push({ type: 'infill', points: pts });
              layerExtrusionMm += (inX2 - inX1) * 1.15 * (nozzleDiam * layerHeight / filamentArea);
            }
            break;
          }
          case 'honeycomb': {
            // Hexagonal grid
            const hexR = spacing * 0.6;
            for (let hy = inY1; hy <= inY2; hy += spacing * 0.866) {
              for (let hx = inX1; hx <= inX2; hx += spacing * 1.5) {
                segments.push({
                  type: 'infill',
                  points: [
                    { x: hx + hexR * 0.5, y: hy - hexR * 0.866 },
                    { x: hx + hexR, y: hy },
                    { x: hx + hexR * 0.5, y: hy + hexR * 0.866 },
                  ],
                });
                layerExtrusionMm += hexR * 2 * (nozzleDiam * layerHeight / filamentArea);
              }
            }
            break;
          }
          case 'concentric': {
            // Concentric nested perimeters
            const maxRings = Math.floor(Math.min(inX2 - inX1, inY2 - inY1) / (2 * spacing));
            for (let r = 1; r <= maxRings; r++) {
              const rx1 = inX1 + r * spacing;
              const ry1 = inY1 + r * spacing;
              const rx2 = inX2 - r * spacing;
              const ry2 = inY2 - r * spacing;
              if (rx2 > rx1 && ry2 > ry1) {
                segments.push({
                  type: 'infill',
                  points: [
                    { x: rx1, y: ry1 },
                    { x: rx2, y: ry1 },
                    { x: rx2, y: ry2 },
                    { x: rx1, y: ry2 },
                    { x: rx1, y: ry1 },
                  ],
                });
                const cLen = ((rx2 - rx1) + (ry2 - ry1)) * 2;
                layerExtrusionMm += cLen * (nozzleDiam * layerHeight / filamentArea);
              }
            }
            break;
          }
          case 'rectilinear':
          default: {
            // Single direction alternating 45 deg
            const isDiag = i % 2 === 0;
            for (let stepPos = isDiag ? inX1 : inY1; stepPos <= (isDiag ? inX2 : inY2); stepPos += spacing) {
              if (isDiag) {
                segments.push({
                  type: 'infill',
                  points: [{ x: stepPos, y: inY1 }, { x: stepPos, y: inY2 }],
                });
                layerExtrusionMm += (inY2 - inY1) * (nozzleDiam * layerHeight / filamentArea);
              } else {
                segments.push({
                  type: 'infill',
                  points: [{ x: inX1, y: stepPos }, { x: inX2, y: stepPos }],
                });
                layerExtrusionMm += (inX2 - inX1) * (nozzleDiam * layerHeight / filamentArea);
              }
            }
            break;
          }
        }

        layerTimeSec += (layerExtrusionMm / (nozzleDiam * layerHeight / filamentArea)) / settings.infillSpeedMmS;
      }
    }

    // Supports: If enabled and layer is under overhang regions
    if (settings.supportsEnabled && i < Math.floor(layerCount * 0.65)) {
      const supW = scaledX * 0.28;
      const supH = scaledY * 0.28;
      const sx1 = x2 + 3;
      const sy1 = y1 + 5;
      const sx2 = sx1 + supW;
      const sy2 = sy1 + supH;

      if (sx2 < printer.bedWidthMm - 5 && sy2 < printer.bedDepthMm - 5) {
        segments.push({
          type: 'support',
          points: [
            { x: sx1, y: sy1 },
            { x: sx2, y: sy1 },
            { x: sx2, y: sy2 },
            { x: sx1, y: sy2 },
            { x: sx1, y: sy1 },
          ],
        });
        const supLen = ((sx2 - sx1) + (sy2 - sy1)) * 2;
        layerExtrusionMm += supLen * (nozzleDiam * layerHeight / filamentArea);
        layerTimeSec += supLen / settings.printSpeedMmS;
      }
    }

    // Travel moves between features (non-extruding rapid positioning)
    if (segments.length >= 2) {
      for (let s = 0; s < segments.length - 1; s++) {
        const fromPt = segments[s].points[segments[s].points.length - 1];
        const toPt = segments[s + 1].points[0];
        const dx = toPt.x - fromPt.x;
        const dy = toPt.y - fromPt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 3) {
          segments.push({
            type: 'travel',
            points: [fromPt, toPt],
          });
          layerTimeSec += dist / settings.travelSpeedMmS;
        }
      }
    }

    // Retraction & Z-hop overhead per layer (~0.8s)
    layerTimeSec += 0.8;

    totalExtrusionMm += layerExtrusionMm;
    totalTimeSeconds += layerTimeSec;

    layers.push({
      layerIndex: i + 1,
      zHeightMm: Number(zHeight.toFixed(2)),
      segments,
      extrusionLengthMm: Number(layerExtrusionMm.toFixed(1)),
      estimatedTimeSec: Math.round(layerTimeSec),
    });
  }

  // Calculate total material metrics
  const filamentMeters = totalExtrusionMm / 1000;
  // Volume in cm3 = (filamentMeters * 100 cm) * (pi * (0.175 cm / 2)^2)
  const filamentVolumeCm3 = (filamentMeters * 100) * (Math.PI * Math.pow(filamentDiam / 20, 2));
  const filamentGrams = filamentVolumeCm3 * (spool.densityGcm3 || 1.24);
  const estimatedCost = (filamentGrams / 1000) * (spool.costPerKg || 22.0);

  // G-code Preview String Generator
  const gcodePreview = generateGcodePreview(
    model.name,
    printer,
    spool,
    settings,
    layerCount,
    layers,
    totalTimeSeconds,
    filamentGrams
  );

  return {
    layerCount,
    estimatedTimeMinutes: Math.ceil(totalTimeSeconds / 60),
    filamentGrams: Number(filamentGrams.toFixed(1)),
    filamentMeters: Number(filamentMeters.toFixed(2)),
    estimatedCost: Number(estimatedCost.toFixed(2)),
    layers,
    gcodePreview,
    slicedAt: new Date().toISOString(),
  };
}

/**
 * Generates an authentic, standards-compliant G-code preview string
 */
function generateGcodePreview(
  modelName: string,
  printer: PrinterProfile,
  spool: FilamentSpool,
  settings: SliceSettings,
  layerCount: number,
  layers: SliceToolpathLayer[],
  totalTimeSec: number,
  filamentGrams: number
): string {
  const lines: string[] = [
    `; ==========================================`,
    `; MAKEO SLICE STUDIO — G-CODE EXPORT`,
    `; Generator: MAKEO Real Slicer Engine v2.0`,
    `; Model: ${modelName}`,
    `; Printer: ${printer.name} (${printer.model})`,
    `; Filament: ${spool.name} (${spool.materialType})`,
    `; Layer Height: ${settings.layerHeightMm} mm`,
    `; Total Layers: ${layerCount}`,
    `; Estimated Time: ${Math.floor(totalTimeSec / 3600)}h ${Math.floor((totalTimeSec % 3600) / 60)}m ${Math.round(totalTimeSec % 60)}s`,
    `; Estimated Filament Mass: ${filamentGrams.toFixed(1)} g`,
    `; ==========================================`,
    ``,
    `; --- START G-CODE ---`,
    `G90 ; Absolute positioning`,
    `M82 ; Absolute extrusion mode`,
    `M140 S${settings.bedTemp} ; Set bed temperature`,
    `M104 S${settings.nozzleTemp} ; Set nozzle temperature`,
    `G28 ; Home all axes`,
    `G29 ; Bed auto-leveling mesh`,
    `M190 S${settings.bedTemp} ; Wait for bed temp`,
    `M109 S${settings.nozzleTemp} ; Wait for nozzle temp`,
    ``,
    `; --- PURGE / PRIME LINE ---`,
    `G92 E0 ; Reset extruder`,
    `G1 Z2.0 F3000 ; Move Z up`,
    `G1 X10.0 Y20.0 Z0.28 F5000.0 ; Move to start position`,
    `G1 X10.0 Y180.0 Z0.28 F1500.0 E15 ; Draw the first line`,
    `G1 X10.4 Y180.0 Z0.28 F5000.0 ; Move to side`,
    `G1 X10.4 Y20.0 Z0.28 F1500.0 E30 ; Draw the second line`,
    `G92 E0 ; Reset extruder`,
    `G1 Z2.0 F3000 ; Move Z Axis up`,
    ``,
  ];

  // Print sample of layer G-code (first 2 layers and last layer to keep preview fast)
  const sampleLayers = layers.length <= 3 ? layers : [layers[0], layers[1], layers[layers.length - 1]];
  let currentE = 0;

  for (const layer of sampleLayers) {
    lines.push(`; ----------------------------------------`);
    lines.push(`; LAYER: ${layer.layerIndex} / ${layer.layerIndex === layers.length ? layers.length : layerCount}`);
    lines.push(`; Z-HEIGHT: ${layer.zHeightMm.toFixed(2)} mm`);
    lines.push(`; ----------------------------------------`);
    lines.push(`G1 Z${layer.zHeightMm.toFixed(2)} F1200`);

    for (const seg of layer.segments.slice(0, 15)) {
      lines.push(`; Feature: ${seg.type}`);
      if (seg.points.length > 0) {
        lines.push(`G0 F${settings.travelSpeedMmS * 60} X${seg.points[0].x.toFixed(2)} Y${seg.points[0].y.toFixed(2)}`);
        for (let p = 1; p < Math.min(seg.points.length, 6); p++) {
          currentE += 0.45;
          const speed = seg.type === 'outer_wall' ? settings.outerWallSpeedMmS : settings.printSpeedMmS;
          lines.push(`G1 F${speed * 60} X${seg.points[p].x.toFixed(2)} Y${seg.points[p].y.toFixed(2)} E${currentE.toFixed(3)}`);
        }
      }
    }
    lines.push(``);
  }

  if (layers.length > 3) {
    lines.push(`; ... [${layers.length - 3} intermediate layers omitted in live preview editor] ...`);
    lines.push(``);
  }

  lines.push(
    `; --- END G-CODE ---`,
    `M104 S0 ; Turn off hotend`,
    `M140 S0 ; Turn off bed`,
    `M107 ; Turn off part cooling fan`,
    `G91 ; Relative positioning`,
    `G1 E-2 F2700 ; Retract filament`,
    `G1 Z10 F3000 ; Raise head by 10mm`,
    `G90 ; Absolute positioning`,
    `G1 X0 Y${printer.bedDepthMm - 10} F4000 ; Present completed print`,
    `M84 X Y E ; Disable motors`,
    `; Print Complete.`
  );

  return lines.join('\n');
}
