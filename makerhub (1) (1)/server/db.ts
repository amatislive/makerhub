import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  name: string;
  workspaceName: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImage?: string;
  status: 'idea' | 'planning' | 'sourcing' | 'building' | 'testing' | 'documenting' | 'finished' | 'archived';
  category: string;
  tags: string[];
  targetDate?: string;
  createdDate: string;
  updatedDate: string;
  visibility: 'private' | 'public';
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: 'resistor' | 'capacitor' | 'sensor' | 'microcontroller' | 'dev_board' | 'motor' | 'display' | 'connector' | 'wire' | 'tool' | 'filament' | 'custom';
  quantity: number;
  unit: string;
  storageLocation?: string;
  manufacturer?: string;
  partNumber?: string;
  datasheetUrl?: string;
  purchaseCost?: number | null;
  notes?: string;
  image?: string;
  minStockLevel?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface BomItem {
  id: string;
  userId: string;
  projectId: string;
  inventoryId?: string;
  name: string;
  category: string;
  quantity: number;
  unitCost?: number | null;
  status: 'needed' | 'ordered' | 'in_stock' | 'used';
  supplier?: string;
  partNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CircuitPin {
  id: string;
  componentName: string;
  pinLabel: string;
  pinNumber: string;
  pinType: 'power' | 'ground' | 'analog' | 'digital' | 'i2c' | 'spi' | 'uart' | 'pwm' | 'other';
  role: 'input' | 'output' | 'bidirectional' | 'power';
  voltage: string;
  destination: string;
  notes: string;
}

export interface Circuit {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  description: string;
  boardMcu: string;
  powerRequirements: string;
  notes: string;
  pins: CircuitPin[];
  components?: any[];
  wires?: any[];
  simulationData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CodeVersion {
  id: string;
  timestamp: string;
  commitMessage: string;
  content: string;
}

export interface CodeFile {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  language: string;
  content: string;
  versions: CodeVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface PrintRecord {
  id: string;
  userId: string;
  projectId?: string;
  modelName: string;
  printer: string;
  material: string;
  printDurationMinutes?: number | null;
  filamentUsageGrams?: number | null;
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';
  failureReason?: string;
  notes?: string;
  fileRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  content: string;
  tags: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  status: 'new' | 'evaluating' | 'promoted' | 'shelved';
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  objective: string;
  hypothesis: string;
  materials: string[];
  procedure: string;
  results: string;
  observations: string;
  conclusion: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  notes?: string;
  uploadedAt: string;
}

export interface PrinterProfile {
  id: string;
  userId: string;
  name: string;
  model: string;
  nozzleDiameterMm: number;
  bedWidthMm: number;
  bedDepthMm: number;
  maxHeightMm: number;
  bedType: 'PEI Textured' | 'PEI Smooth' | 'Satin' | 'Glass' | 'Engineering';
  status: 'idle' | 'printing' | 'paused' | 'maintenance' | 'offline';
  currentNozzleTemp?: number;
  targetNozzleTemp?: number;
  currentBedTemp?: number;
  targetBedTemp?: number;
  activeJobName?: string;
  progressPercent?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilamentSpool {
  id: string;
  userId: string;
  name: string;
  brand: string;
  materialType: 'PLA' | 'PETG' | 'ABS' | 'ASA' | 'TPU' | 'PC' | 'PA-CF';
  colorName: string;
  colorHex: string;
  densityGcm3: number;
  initialWeightG: number;
  remainingWeightG: number;
  diameterMm: number;
  costPerKg: number;
  recommendedNozzleTemp: number;
  recommendedBedTemp: number;
  isDry: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SliceSettings {
  printerId: string;
  spoolId: string;
  layerHeightMm: number;
  firstLayerHeightMm: number;
  wallLoops: number;
  topBottomLayers: number;
  infillDensity: number;
  infillPattern: 'grid' | 'gyroid' | 'honeycomb' | 'rectilinear' | 'concentric';
  supportsEnabled: boolean;
  supportType: 'tree' | 'normal';
  supportThresholdAngle: number;
  printSpeedMmS: number;
  outerWallSpeedMmS: number;
  infillSpeedMmS: number;
  travelSpeedMmS: number;
  nozzleTemp: number;
  bedTemp: number;
  brimEnabled: boolean;
  brimWidthMm: number;
}

export interface SliceProject {
  id: string;
  userId: string;
  name: string;
  modelType: string;
  modelDimensions: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  settings: SliceSettings;
  sliceResult?: {
    layerCount: number;
    estimatedTimeMinutes: number;
    filamentGrams: number;
    filamentMeters: number;
    estimatedCost: number;
    slicedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  inventory: InventoryItem[];
  boms: BomItem[];
  circuits: Circuit[];
  codeFiles: CodeFile[];
  printRecords: PrintRecord[];
  notes: Note[];
  ideas: Idea[];
  experiments: Experiment[];
  files: FileRecord[];
  printers: PrinterProfile[];
  spools: FilamentSpool[];
  sliceProjects: SliceProject[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'makerhub-db.json');

class Database {
  private data: DatabaseSchema;
  private writeTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.init();
  }

  private init(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const defaultPrinters: PrinterProfile[] = [
      {
        id: 'printer-bambu-x1c',
        userId: 'default',
        name: 'Bambu Lab X1-Carbon',
        model: 'Bambu Lab X1-Carbon',
        nozzleDiameterMm: 0.4,
        bedWidthMm: 256,
        bedDepthMm: 256,
        maxHeightMm: 256,
        bedType: 'PEI Textured',
        status: 'idle',
        currentNozzleTemp: 24,
        targetNozzleTemp: 0,
        currentBedTemp: 23,
        targetBedTemp: 0,
        notes: 'Equipped with hardened steel nozzle & AMS 4-slot unit.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'printer-prusa-mk4',
        userId: 'default',
        name: 'Prusa MK4',
        model: 'Prusa MK4',
        nozzleDiameterMm: 0.4,
        bedWidthMm: 250,
        bedDepthMm: 210,
        maxHeightMm: 220,
        bedType: 'Satin',
        status: 'idle',
        currentNozzleTemp: 22,
        targetNozzleTemp: 0,
        currentBedTemp: 22,
        targetBedTemp: 0,
        notes: 'Nextruder with Loadcell automatic first layer calibration.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'printer-voron-24',
        userId: 'default',
        name: 'Voron 2.4 (350mm)',
        model: 'Voron 2.4 350',
        nozzleDiameterMm: 0.6,
        bedWidthMm: 350,
        bedDepthMm: 350,
        maxHeightMm: 330,
        bedType: 'PEI Smooth',
        status: 'idle',
        currentNozzleTemp: 25,
        targetNozzleTemp: 0,
        currentBedTemp: 24,
        targetBedTemp: 0,
        notes: 'Enclosed chamber with Dragon HF hotend & CANbus toolhead.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const defaultSpools: FilamentSpool[] = [
      {
        id: 'spool-polymaker-pla-black',
        userId: 'default',
        name: 'PolyLite Matte Black PLA',
        brand: 'Polymaker',
        materialType: 'PLA',
        colorName: 'Matte Charcoal',
        colorHex: '#1f2022',
        densityGcm3: 1.24,
        initialWeightG: 1000,
        remainingWeightG: 780,
        diameterMm: 1.75,
        costPerKg: 22.0,
        recommendedNozzleTemp: 210,
        recommendedBedTemp: 60,
        isDry: true,
        notes: 'Excellent matte finish for structural electronics enclosures.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'spool-prusament-petg-orange',
        userId: 'default',
        name: 'Prusament Orange PETG',
        brand: 'Prusament',
        materialType: 'PETG',
        colorName: 'Signal Orange',
        colorHex: '#fe5029',
        densityGcm3: 1.27,
        initialWeightG: 1000,
        remainingWeightG: 620,
        diameterMm: 1.75,
        costPerKg: 29.9,
        recommendedNozzleTemp: 245,
        recommendedBedTemp: 85,
        isDry: true,
        notes: 'High impact and chemical resistance. Used for printer functional parts.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'spool-bambu-white-pla',
        userId: 'default',
        name: 'Bambu PLA Basic Jade White',
        brand: 'Bambu Lab',
        materialType: 'PLA',
        colorName: 'Jade White',
        colorHex: '#f5f5f7',
        densityGcm3: 1.24,
        initialWeightG: 1000,
        remainingWeightG: 910,
        diameterMm: 1.75,
        costPerKg: 19.9,
        recommendedNozzleTemp: 220,
        recommendedBedTemp: 55,
        isDry: true,
        notes: 'RFID tagged spool. High flow rate up to 24mm³/s.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'spool-sunlu-tpu95a',
        userId: 'default',
        name: 'Sunlu High-Speed TPU 95A',
        brand: 'Sunlu',
        materialType: 'TPU',
        colorName: 'Clear Blue',
        colorHex: '#6ebdf7',
        densityGcm3: 1.21,
        initialWeightG: 500,
        remainingWeightG: 420,
        diameterMm: 1.75,
        costPerKg: 34.0,
        recommendedNozzleTemp: 225,
        recommendedBedTemp: 50,
        isDry: true,
        notes: 'Flexible gaskets, vibration dampers, and robotic bumper pads.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const emptySchema: DatabaseSchema = {
      users: [],
      projects: [],
      tasks: [],
      inventory: [],
      boms: [],
      circuits: [],
      codeFiles: [],
      printRecords: [],
      notes: [],
      ideas: [],
      experiments: [],
      files: [],
      printers: defaultPrinters,
      spools: defaultSpools,
      sliceProjects: [],
    };

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(emptySchema, null, 2), 'utf-8');
      return emptySchema;
    }

    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
        boms: Array.isArray(parsed.boms) ? parsed.boms : [],
        circuits: Array.isArray(parsed.circuits) ? parsed.circuits : [],
        codeFiles: Array.isArray(parsed.codeFiles) ? parsed.codeFiles : [],
        printRecords: Array.isArray(parsed.printRecords) ? parsed.printRecords : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
        experiments: Array.isArray(parsed.experiments) ? parsed.experiments : [],
        files: Array.isArray(parsed.files) ? parsed.files : [],
        printers: Array.isArray(parsed.printers) && parsed.printers.length > 0 ? parsed.printers : defaultPrinters,
        spools: Array.isArray(parsed.spools) && parsed.spools.length > 0 ? parsed.spools : defaultSpools,
        sliceProjects: Array.isArray(parsed.sliceProjects) ? parsed.sliceProjects : [],
      };
    } catch {
      fs.writeFileSync(DB_FILE, JSON.stringify(emptySchema, null, 2), 'utf-8');
      return emptySchema;
    }
  }

  public save(): void {
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      this.flushSync();
    }, 50);
  }

  public flushSync(): void {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();

// Password hashing utility
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}
