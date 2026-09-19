export type ProjectStatus = 'idea' | 'planning' | 'sourcing' | 'building' | 'testing' | 'documenting' | 'finished' | 'archived';

export interface UserProfile {
  id: string;
  email: string;
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
  status: ProjectStatus;
  category: string;
  tags: string[];
  targetDate?: string;
  createdDate: string;
  updatedDate: string;
  visibility: 'private' | 'public';
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export type ComponentCategory =
  | 'resistor'
  | 'capacitor'
  | 'sensor'
  | 'microcontroller'
  | 'dev_board'
  | 'motor'
  | 'display'
  | 'connector'
  | 'wire'
  | 'tool'
  | 'filament'
  | 'custom';

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: ComponentCategory;
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

export type BomStatus = 'needed' | 'ordered' | 'in_stock' | 'used';

export interface BomItem {
  id: string;
  userId: string;
  projectId: string;
  inventoryId?: string;
  name: string;
  category: string;
  quantity: number;
  unitCost?: number | null;
  status: BomStatus;
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

export type PrintStatus = 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';

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

export interface SliceToolpathSegment {
  type: 'outer_wall' | 'inner_wall' | 'infill' | 'support' | 'travel' | 'brim';
  points: Array<{ x: number; y: number }>;
}

export interface SliceToolpathLayer {
  layerIndex: number;
  zHeightMm: number;
  segments: SliceToolpathSegment[];
  extrusionLengthMm: number;
  estimatedTimeSec: number;
}

export interface SliceResult {
  layerCount: number;
  estimatedTimeMinutes: number;
  filamentGrams: number;
  filamentMeters: number;
  estimatedCost: number;
  layers: SliceToolpathLayer[];
  gcodePreview: string;
  slicedAt: string;
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

export interface PrintRecord {
  id: string;
  userId: string;
  projectId?: string;
  modelName: string;
  printer: string;
  material: string;
  printDurationMinutes?: number | null;
  filamentUsageGrams?: number | null;
  status: PrintStatus;
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

export interface AnalyticsData {
  hasData: boolean;
  totalRecords: number;
  projects: {
    total: number;
    byStatus: Record<string, number>;
  };
  tasks: {
    total: number;
    completed: number;
    byStatus: Record<string, number>;
  };
  inventory: {
    totalItems: number;
    totalQuantity: number;
    lowStockCount: number;
    totalInventoryCost: number;
    inventoryWithCostCount: number;
  };
  bom: {
    totalItems: number;
    totalCost: number;
    itemsWithCostCount: number;
    itemsWithoutCostCount: number;
  };
  prints: {
    total: number;
    byStatus: Record<string, number>;
    totalDurationMinutes: number;
    totalFilamentGrams: number;
  };
  circuits: {
    total: number;
    totalPins: number;
  };
  notes: {
    total: number;
  };
}
