import { BreadboardHole, PlacedComponent, PinDefinition } from '../types/circuit';
export type { BreadboardHole, PlacedComponent, PinDefinition };
import { EXTENDED_COMPONENT_CATALOG, CatalogItem } from '../data/circuitCatalog';
import { createComponentPinsExtended } from '../data/pinGenerators';

export type { CatalogItem };

// Standard Half+ Size Breadboard: 30 columns (1..30)
// Top power rail: row 0 (+), row 1 (-)
// Terminal strip upper: rows A, B, C, D, E
// Center divider (trough)
// Terminal strip lower: rows F, G, H, I, J
// Bottom power rail: row 0 (+), row 1 (-)

export const BREADBOARD_COLS = 30;
export const HOLE_PITCH_PX = 20; // 20px spacing between hole centers
export const BREADBOARD_ORIGIN_X = 60;
export const BREADBOARD_ORIGIN_Y = 60;

export const BREADBOARD_WIDTH = BREADBOARD_COLS * HOLE_PITCH_PX + 80; // ~680px
export const BREADBOARD_HEIGHT = 14 * HOLE_PITCH_PX + 90; // ~370px

export function getBreadboardDimensions(size: 'mini' | 'half' | 'full' = 'half') {
  const cols = size === 'mini' ? 17 : size === 'full' ? 60 : 30;
  const width = cols * HOLE_PITCH_PX + 80;
  const height = size === 'mini' ? 10 * HOLE_PITCH_PX + 70 : 14 * HOLE_PITCH_PX + 90;
  return { cols, width, height };
}

/**
 * Generates all coordinate holes for the interactive breadboard of given size.
 */
export function generateBreadboardHoles(size: 'mini' | 'half' | 'full' = 'half'): BreadboardHole[] {
  const holes: BreadboardHole[] = [];
  const cols = size === 'mini' ? 17 : size === 'full' ? 60 : 30;
  const hasPowerRails = size !== 'mini';

  // Top Power Rails (+ and -) for half and full
  if (hasPowerRails) {
    for (let c = 1; c <= cols; c++) {
      const x = BREADBOARD_ORIGIN_X + c * HOLE_PITCH_PX;

      // + Rail (Red)
      holes.push({
        id: `PWR_TOP_POS_${c}`,
        row: 'PWR_TOP_POS',
        col: c,
        x,
        y: BREADBOARD_ORIGIN_Y + 20,
        section: 'top_power',
        netId: 'PWR_TOP_POS'
      });

      // - Rail (Blue/GND)
      holes.push({
        id: `PWR_TOP_NEG_${c}`,
        row: 'PWR_TOP_NEG',
        col: c,
        x,
        y: BREADBOARD_ORIGIN_Y + 40,
        section: 'top_power',
        netId: '0' // Ground
      });
    }
  }

  const terminalYOffset = hasPowerRails ? 80 : 20;

  // Upper Terminal Rows: A, B, C, D, E (5 rows)
  const upperLetters = ['A', 'B', 'C', 'D', 'E'];
  upperLetters.forEach((letter, rowIdx) => {
    for (let c = 1; c <= cols; c++) {
      const x = BREADBOARD_ORIGIN_X + c * HOLE_PITCH_PX;
      const y = BREADBOARD_ORIGIN_Y + terminalYOffset + rowIdx * HOLE_PITCH_PX;
      holes.push({
        id: `${letter}_${c}`,
        row: letter,
        col: c,
        x,
        y,
        section: 'terminal_top',
        netId: `UP_${c}` // Each column in upper section shares a conductive strip
      });
    }
  });

  const dividerGap = 40;
  const lowerYOffset = terminalYOffset + 5 * HOLE_PITCH_PX + (hasPowerRails ? 20 : 15);

  // Lower Terminal Rows: F, G, H, I, J (5 rows)
  const lowerLetters = ['F', 'G', 'H', 'I', 'J'];
  lowerLetters.forEach((letter, rowIdx) => {
    for (let c = 1; c <= cols; c++) {
      const x = BREADBOARD_ORIGIN_X + c * HOLE_PITCH_PX;
      const y = BREADBOARD_ORIGIN_Y + lowerYOffset + rowIdx * HOLE_PITCH_PX;
      holes.push({
        id: `${letter}_${c}`,
        row: letter,
        col: c,
        x,
        y,
        section: 'terminal_bottom',
        netId: `DN_${c}` // Each column in lower section shares a conductive strip
      });
    }
  });

  // Bottom Power Rails (+ and -) for half and full
  if (hasPowerRails) {
    for (let c = 1; c <= cols; c++) {
      const x = BREADBOARD_ORIGIN_X + c * HOLE_PITCH_PX;

      // + Rail (Red)
      holes.push({
        id: `PWR_BOT_POS_${c}`,
        row: 'PWR_BOT_POS',
        col: c,
        x,
        y: BREADBOARD_ORIGIN_Y + 310,
        section: 'bottom_power',
        netId: 'PWR_BOT_POS'
      });

      // - Rail (Blue/GND)
      holes.push({
        id: `PWR_BOT_NEG_${c}`,
        row: 'PWR_BOT_NEG',
        col: c,
        x,
        y: BREADBOARD_ORIGIN_Y + 330,
        section: 'bottom_power',
        netId: '0' // Ground
      });
    }
  }

  return holes;
}


/**
 * 200+ Component Catalog for Circuit Workbench
 */
export const COMPONENT_CATALOG: CatalogItem[] = EXTENDED_COMPONENT_CATALOG;

/**
 * Creates default pins for a component type.
 */
export function createComponentPins(type: string, compId: string): PinDefinition[] {
  return createComponentPinsExtended(type, compId);
}
