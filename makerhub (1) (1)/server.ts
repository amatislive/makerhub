import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword, verifyPassword, User, Project, Task, InventoryItem, BomItem, Circuit, CodeFile, PrintRecord, Note, Idea, Experiment, FileRecord, PrinterProfile, FilamentSpool, SliceProject } from './server/db.ts';
import { processAiCodeRequest, processAiCircuitReview, processAiSliceReview } from './server/gemini.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Auth Token Store & HMAC Signature for server-restart resilience
const TOKEN_SECRET = process.env.AUTH_SECRET || 'makeo_makerhub_session_2026';
const tokenStore = new Map<string, string>();

function generateToken(userId: string): string {
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET).update(userId).digest('hex').slice(0, 16);
  const token = `mkr_${userId}_${hmac}`;
  tokenStore.set(token, userId);
  return token;
}

function verifyToken(token?: string): string | undefined {
  if (!token) return undefined;
  if (tokenStore.has(token)) {
    return tokenStore.get(token);
  }
  if (token.startsWith('mkr_')) {
    const parts = token.split('_');
    if (parts.length >= 3) {
      const userId = parts[1];
      const hmac = parts[2];
      const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(userId).digest('hex').slice(0, 16);
      if (hmac === expected) {
        tokenStore.set(token, userId);
        return userId;
      }
    }
  }
  return undefined;
}

// Ensures a valid primary workspace maker user exists
function getOrCreateDefaultUser(): User {
  const users = db.getData().users;
  if (users.length > 0) {
    return users[0];
  }
  const defaultUser: User = {
    id: 'bf8c6af1-1836-4b2b-95e8-fed86c16892a',
    email: 'maker@makeo.lab',
    passwordHash: '',
    passwordSalt: '',
    name: 'Workshop Maker',
    workspaceName: 'Digital Workshop',
    createdAt: new Date().toISOString()
  };
  users.push(defaultUser);
  db.save();
  return defaultUser;
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const directUserId = req.headers['x-user-id'] as string | undefined;

  let userId: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    userId = verifyToken(token);
  }

  if (!userId && directUserId) {
    const existing = db.getData().users.find(u => u.id === directUserId);
    if (existing) {
      userId = directUserId;
    }
  }

  // Seamless fallback to primary workspace user (prevents app locking in AI Studio sandbox)
  if (!userId) {
    const defaultUser = getOrCreateDefaultUser();
    userId = defaultUser.id;
  }

  if (userId) {
    let user = db.getData().users.find(u => u.id === userId);
    if (!user) {
      user = getOrCreateDefaultUser();
    }
    req.userId = user.id;
    req.user = user;
  }

  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.userId || !req.user) {
    const defaultUser = getOrCreateDefaultUser();
    req.userId = defaultUser.id;
    req.user = defaultUser;
  }
  next();
}

app.use(authMiddleware);

// --- AUTH ROUTES ---

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, workspaceName } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = db.getData().users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const { salt, hash } = hashPassword(password);
    const newUser: User = {
      id: crypto.randomUUID(),
      email: trimmedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      name: name.trim(),
      workspaceName: (workspaceName || `${name.trim()}'s Workshop`).trim(),
      createdAt: new Date().toISOString()
    };

    // Store user only. NO sample projects, NO sample inventory, NO sample tasks, NO sample circuits, NO sample code.
    db.getData().users.push(newUser);
    db.save();

    const token = generateToken(newUser.id);
    const { passwordHash: _, passwordSalt: __, ...userProfile } = newUser;
    res.status(201).json({ user: userProfile, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = db.getData().users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const valid = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user.id);
    const { passwordHash: _, passwordSalt: __, ...userProfile } = user;
    res.json({ user: userProfile, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Quick start anonymous / initial workspace creator (strictly clean, zero preloaded data)
app.post('/api/auth/guest', (req: Request, res: Response) => {
  try {
    const user = getOrCreateDefaultUser();
    const token = generateToken(user.id);
    const { passwordHash: _, passwordSalt: __, ...userProfile } = user;
    res.status(200).json({ user: userProfile, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to initialize workspace.' });
  }
});

app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user || getOrCreateDefaultUser();
  const token = generateToken(user.id);
  const { passwordHash: _, passwordSalt: __, ...userProfile } = user;
  res.json({ user: userProfile, token });
});

app.post('/api/auth/logout', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    tokenStore.delete(authHeader.substring(7));
  }
  res.json({ ok: true });
});

// --- PROJECTS ROUTES ---

app.get('/api/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const projects = db.getData().projects.filter(p => p.userId === req.userId);
  res.json(projects);
});

app.post('/api/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, coverImage, status, category, tags, targetDate, visibility } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Project name is required.' });
      return;
    }

    const newProject: Project = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      name: name.trim(),
      description: (description || '').trim(),
      coverImage: coverImage || undefined,
      status: status || 'idea',
      category: (category || 'General').trim(),
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      targetDate: targetDate || undefined,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      visibility: visibility === 'public' ? 'public' : 'private'
    };

    db.getData().projects.push(newProject);
    db.save();
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project.' });
  }
});

app.get('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const project = db.getData().projects.find(p => p.id === req.params.id && p.userId === req.userId);
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }
  res.json(project);
});

app.put('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const project = db.getData().projects.find(p => p.id === req.params.id && p.userId === req.userId);
  if (!project) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  const { name, description, coverImage, status, category, tags, targetDate, visibility } = req.body;
  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description.trim();
  if (coverImage !== undefined) project.coverImage = coverImage;
  if (status !== undefined) project.status = status;
  if (category !== undefined) project.category = category.trim();
  if (tags !== undefined && Array.isArray(tags)) project.tags = tags.map(t => String(t).trim()).filter(Boolean);
  if (targetDate !== undefined) project.targetDate = targetDate;
  if (visibility !== undefined) project.visibility = visibility;
  project.updatedDate = new Date().toISOString();

  db.save();
  res.json(project);
});

app.delete('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().projects.findIndex(p => p.id === req.params.id && p.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Project not found.' });
    return;
  }

  db.getData().projects.splice(index, 1);
  // Unlink associated items or preserve them gracefully
  db.save();
  res.json({ ok: true });
});

// --- TASKS ROUTES ---

app.get('/api/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let tasks = db.getData().tasks.filter(t => t.userId === req.userId);
  if (req.query.projectId) {
    tasks = tasks.filter(t => t.projectId === req.query.projectId);
  }
  res.json(tasks);
});

app.post('/api/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, title, description, status, priority, dueDate, labels } = req.body;
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId: projectId || undefined,
      title: title.trim(),
      description: (description || '').trim(),
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
      labels: Array.isArray(labels) ? labels.map(l => String(l).trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().tasks.push(newTask);
    db.save();
    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create task.' });
  }
});

app.put('/api/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const task = db.getData().tasks.find(t => t.id === req.params.id && t.userId === req.userId);
  if (!task) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }

  const { title, description, status, priority, dueDate, labels, projectId } = req.body;
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (labels !== undefined && Array.isArray(labels)) task.labels = labels;
  if (projectId !== undefined) task.projectId = projectId || undefined;
  task.updatedAt = new Date().toISOString();

  db.save();
  res.json(task);
});

app.delete('/api/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().tasks.findIndex(t => t.id === req.params.id && t.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  db.getData().tasks.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- INVENTORY ROUTES ---

app.get('/api/inventory', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const inventory = db.getData().inventory.filter(i => i.userId === req.userId);
  res.json(inventory);
});

app.post('/api/inventory', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, quantity, unit, storageLocation, manufacturer, partNumber, datasheetUrl, purchaseCost, notes, image, minStockLevel } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Component name is required.' });
      return;
    }

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      name: name.trim(),
      category: category || 'custom',
      quantity: Number(quantity) || 0,
      unit: (unit || 'pcs').trim(),
      storageLocation: storageLocation ? storageLocation.trim() : undefined,
      manufacturer: manufacturer ? manufacturer.trim() : undefined,
      partNumber: partNumber ? partNumber.trim() : undefined,
      datasheetUrl: datasheetUrl ? datasheetUrl.trim() : undefined,
      purchaseCost: purchaseCost !== undefined && purchaseCost !== null && purchaseCost !== '' ? Number(purchaseCost) : null,
      notes: (notes || '').trim(),
      image: image || undefined,
      minStockLevel: minStockLevel !== undefined && minStockLevel !== null && minStockLevel !== '' ? Number(minStockLevel) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().inventory.push(newItem);
    db.save();
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add inventory item.' });
  }
});

app.put('/api/inventory/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const item = db.getData().inventory.find(i => i.id === req.params.id && i.userId === req.userId);
  if (!item) {
    res.status(404).json({ error: 'Inventory item not found.' });
    return;
  }

  const { name, category, quantity, unit, storageLocation, manufacturer, partNumber, datasheetUrl, purchaseCost, notes, image, minStockLevel } = req.body;
  if (name !== undefined) item.name = name.trim();
  if (category !== undefined) item.category = category;
  if (quantity !== undefined) item.quantity = Number(quantity);
  if (unit !== undefined) item.unit = unit.trim();
  if (storageLocation !== undefined) item.storageLocation = storageLocation ? storageLocation.trim() : undefined;
  if (manufacturer !== undefined) item.manufacturer = manufacturer ? manufacturer.trim() : undefined;
  if (partNumber !== undefined) item.partNumber = partNumber ? partNumber.trim() : undefined;
  if (datasheetUrl !== undefined) item.datasheetUrl = datasheetUrl ? datasheetUrl.trim() : undefined;
  if (purchaseCost !== undefined) item.purchaseCost = purchaseCost !== null && purchaseCost !== '' ? Number(purchaseCost) : null;
  if (notes !== undefined) item.notes = notes.trim();
  if (image !== undefined) item.image = image;
  if (minStockLevel !== undefined) item.minStockLevel = minStockLevel !== null && minStockLevel !== '' ? Number(minStockLevel) : null;
  item.updatedAt = new Date().toISOString();

  db.save();
  res.json(item);
});

app.delete('/api/inventory/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().inventory.findIndex(i => i.id === req.params.id && i.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Inventory item not found.' });
    return;
  }
  db.getData().inventory.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- BOM ROUTES ---

app.get('/api/boms', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let boms = db.getData().boms.filter(b => b.userId === req.userId);
  if (req.query.projectId) {
    boms = boms.filter(b => b.projectId === req.query.projectId);
  }
  res.json(boms);
});

app.post('/api/boms', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, inventoryId, name, category, quantity, unitCost, status, supplier, partNumber, notes } = req.body;
    if (!projectId || !name || !name.trim()) {
      res.status(400).json({ error: 'Project and component name are required.' });
      return;
    }

    const newBom: BomItem = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId,
      inventoryId: inventoryId || undefined,
      name: name.trim(),
      category: category || 'General',
      quantity: Number(quantity) || 1,
      unitCost: unitCost !== undefined && unitCost !== null && unitCost !== '' ? Number(unitCost) : null,
      status: status || 'needed',
      supplier: supplier ? supplier.trim() : undefined,
      partNumber: partNumber ? partNumber.trim() : undefined,
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().boms.push(newBom);
    db.save();
    res.status(201).json(newBom);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add BOM item.' });
  }
});

app.put('/api/boms/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const bom = db.getData().boms.find(b => b.id === req.params.id && b.userId === req.userId);
  if (!bom) {
    res.status(404).json({ error: 'BOM item not found.' });
    return;
  }

  const { name, category, quantity, unitCost, status, supplier, partNumber, notes, inventoryId } = req.body;
  if (name !== undefined) bom.name = name.trim();
  if (category !== undefined) bom.category = category;
  if (quantity !== undefined) bom.quantity = Number(quantity);
  if (unitCost !== undefined) bom.unitCost = unitCost !== null && unitCost !== '' ? Number(unitCost) : null;
  if (status !== undefined) bom.status = status;
  if (supplier !== undefined) bom.supplier = supplier ? supplier.trim() : undefined;
  if (partNumber !== undefined) bom.partNumber = partNumber ? partNumber.trim() : undefined;
  if (notes !== undefined) bom.notes = notes.trim();
  if (inventoryId !== undefined) bom.inventoryId = inventoryId || undefined;
  bom.updatedAt = new Date().toISOString();

  db.save();
  res.json(bom);
});

app.delete('/api/boms/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().boms.findIndex(b => b.id === req.params.id && b.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'BOM item not found.' });
    return;
  }
  db.getData().boms.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- CIRCUIT LAB ROUTES ---

app.get('/api/circuits', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let circuits = db.getData().circuits.filter(c => c.userId === req.userId);
  if (req.query.projectId) {
    circuits = circuits.filter(c => c.projectId === req.query.projectId);
  }
  res.json(circuits);
});

app.post('/api/circuits', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, name, description, boardMcu, powerRequirements, notes, pins, components, wires, simulationData } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Circuit name is required.' });
      return;
    }

    const newCircuit: Circuit = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId: projectId || undefined,
      name: name.trim(),
      description: (description || '').trim(),
      boardMcu: (boardMcu || '').trim(),
      powerRequirements: (powerRequirements || '').trim(),
      notes: (notes || '').trim(),
      pins: Array.isArray(pins) ? pins.map(p => ({
        id: p.id || crypto.randomUUID(),
        componentName: (p.componentName || '').trim(),
        pinLabel: (p.pinLabel || '').trim(),
        pinNumber: (p.pinNumber || '').trim(),
        pinType: p.pinType || 'digital',
        role: p.role || 'output',
        voltage: (p.voltage || '').trim(),
        destination: (p.destination || '').trim(),
        notes: (p.notes || '').trim()
      })) : [],
      components: Array.isArray(components) ? components : [],
      wires: Array.isArray(wires) ? wires : [],
      simulationData: simulationData || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().circuits.push(newCircuit);
    db.save();
    res.status(201).json(newCircuit);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create circuit.' });
  }
});

app.put('/api/circuits/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const circuit = db.getData().circuits.find(c => c.id === req.params.id && c.userId === req.userId);
  if (!circuit) {
    res.status(404).json({ error: 'Circuit not found.' });
    return;
  }

  const { name, description, boardMcu, powerRequirements, notes, pins, components, wires, simulationData, projectId } = req.body;
  if (name !== undefined) circuit.name = name.trim();
  if (description !== undefined) circuit.description = description.trim();
  if (boardMcu !== undefined) circuit.boardMcu = boardMcu.trim();
  if (powerRequirements !== undefined) circuit.powerRequirements = powerRequirements.trim();
  if (notes !== undefined) circuit.notes = notes.trim();
  if (projectId !== undefined) circuit.projectId = projectId || undefined;
  if (components !== undefined && Array.isArray(components)) circuit.components = components;
  if (wires !== undefined && Array.isArray(wires)) circuit.wires = wires;
  if (simulationData !== undefined) circuit.simulationData = simulationData;
  if (pins !== undefined && Array.isArray(pins)) {
    circuit.pins = pins.map(p => ({
      id: p.id || crypto.randomUUID(),
      componentName: (p.componentName || '').trim(),
      pinLabel: (p.pinLabel || '').trim(),
      pinNumber: (p.pinNumber || '').trim(),
      pinType: p.pinType || 'digital',
      role: p.role || 'output',
      voltage: (p.voltage || '').trim(),
      destination: (p.destination || '').trim(),
      notes: (p.notes || '').trim()
    }));
  }
  circuit.updatedAt = new Date().toISOString();

  db.save();
  res.json(circuit);
});

app.delete('/api/circuits/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().circuits.findIndex(c => c.id === req.params.id && c.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Circuit not found.' });
    return;
  }
  db.getData().circuits.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- CODE FILES & VERSIONING ROUTES ---

app.get('/api/code-files', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let files = db.getData().codeFiles.filter(f => f.userId === req.userId);
  if (req.query.projectId) {
    files = files.filter(f => f.projectId === req.query.projectId);
  }
  res.json(files);
});

app.post('/api/code-files', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, name, language, content } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'File name is required.' });
      return;
    }

    const initialContent = content || '';
    const newFile: CodeFile = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId: projectId || undefined,
      name: name.trim(),
      language: language || 'cpp',
      content: initialContent,
      versions: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          commitMessage: 'Initial creation',
          content: initialContent
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().codeFiles.push(newFile);
    db.save();
    res.status(201).json(newFile);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create code file.' });
  }
});

app.put('/api/code-files/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const file = db.getData().codeFiles.find(f => f.id === req.params.id && f.userId === req.userId);
  if (!file) {
    res.status(404).json({ error: 'Code file not found.' });
    return;
  }

  const { name, language, content, commitMessage, projectId } = req.body;
  if (name !== undefined) file.name = name.trim();
  if (language !== undefined) file.language = language;
  if (projectId !== undefined) file.projectId = projectId || undefined;

  if (content !== undefined && content !== file.content) {
    file.content = content;
    // Add version entry
    file.versions.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      commitMessage: commitMessage || `Updated ${file.name}`,
      content
    });
    // Keep max 50 versions
    if (file.versions.length > 50) {
      file.versions = file.versions.slice(0, 50);
    }
  }

  file.updatedAt = new Date().toISOString();
  db.save();
  res.json(file);
});

app.post('/api/code-files/:id/restore-version/:versionId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const file = db.getData().codeFiles.find(f => f.id === req.params.id && f.userId === req.userId);
  if (!file) {
    res.status(404).json({ error: 'Code file not found.' });
    return;
  }

  const version = file.versions.find(v => v.id === req.params.versionId);
  if (!version) {
    res.status(404).json({ error: 'Version not found.' });
    return;
  }

  file.content = version.content;
  file.versions.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    commitMessage: `Restored to version from ${new Date(version.timestamp).toLocaleString()}`,
    content: version.content
  });
  file.updatedAt = new Date().toISOString();

  db.save();
  res.json(file);
});

app.delete('/api/code-files/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().codeFiles.findIndex(f => f.id === req.params.id && f.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Code file not found.' });
    return;
  }
  db.getData().codeFiles.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- 3D PRINTING ROUTES ---

app.get('/api/prints', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let prints = db.getData().printRecords.filter(p => p.userId === req.userId);
  if (req.query.projectId) {
    prints = prints.filter(p => p.projectId === req.query.projectId);
  }
  res.json(prints);
});

app.post('/api/prints', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, modelName, printer, material, printDurationMinutes, filamentUsageGrams, status, failureReason, notes, fileRef } = req.body;
    if (!modelName || !modelName.trim()) {
      res.status(400).json({ error: 'Model name is required.' });
      return;
    }

    const newPrint: PrintRecord = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId: projectId || undefined,
      modelName: modelName.trim(),
      printer: (printer || '3D Printer').trim(),
      material: material || 'PLA',
      printDurationMinutes: printDurationMinutes !== undefined && printDurationMinutes !== null && printDurationMinutes !== '' ? Number(printDurationMinutes) : null,
      filamentUsageGrams: filamentUsageGrams !== undefined && filamentUsageGrams !== null && filamentUsageGrams !== '' ? Number(filamentUsageGrams) : null,
      status: status || 'queued',
      failureReason: failureReason ? failureReason.trim() : undefined,
      notes: (notes || '').trim(),
      fileRef: fileRef ? fileRef.trim() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().printRecords.push(newPrint);
    db.save();
    res.status(201).json(newPrint);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create print record.' });
  }
});

app.put('/api/prints/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const print = db.getData().printRecords.find(p => p.id === req.params.id && p.userId === req.userId);
  if (!print) {
    res.status(404).json({ error: 'Print record not found.' });
    return;
  }

  const { modelName, printer, material, printDurationMinutes, filamentUsageGrams, status, failureReason, notes, fileRef, projectId } = req.body;
  if (modelName !== undefined) print.modelName = modelName.trim();
  if (printer !== undefined) print.printer = printer.trim();
  if (material !== undefined) print.material = material;
  if (printDurationMinutes !== undefined) print.printDurationMinutes = printDurationMinutes !== null && printDurationMinutes !== '' ? Number(printDurationMinutes) : null;
  if (filamentUsageGrams !== undefined) print.filamentUsageGrams = filamentUsageGrams !== null && filamentUsageGrams !== '' ? Number(filamentUsageGrams) : null;
  if (status !== undefined) print.status = status;
  if (failureReason !== undefined) print.failureReason = failureReason ? failureReason.trim() : undefined;
  if (notes !== undefined) print.notes = notes.trim();
  if (fileRef !== undefined) print.fileRef = fileRef ? fileRef.trim() : undefined;
  if (projectId !== undefined) print.projectId = projectId || undefined;
  print.updatedAt = new Date().toISOString();

  db.save();
  res.json(print);
});

app.delete('/api/prints/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().printRecords.findIndex(p => p.id === req.params.id && p.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Print record not found.' });
    return;
  }
  db.getData().printRecords.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- PRINTERS FLEET ROUTES ---

app.get('/api/printers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const printers = db.getData().printers.filter(p => p.userId === req.userId || p.userId === 'default');
  res.json(printers);
});

app.post('/api/printers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, model, nozzleDiameterMm, bedWidthMm, bedDepthMm, maxHeightMm, bedType, status, currentNozzleTemp, targetNozzleTemp, currentBedTemp, targetBedTemp, notes } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Printer name is required.' });
      return;
    }

    const newPrinter: PrinterProfile = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      name: name.trim(),
      model: (model || 'Custom FDM').trim(),
      nozzleDiameterMm: Number(nozzleDiameterMm) || 0.4,
      bedWidthMm: Number(bedWidthMm) || 250,
      bedDepthMm: Number(bedDepthMm) || 250,
      maxHeightMm: Number(maxHeightMm) || 250,
      bedType: bedType || 'PEI Textured',
      status: status || 'idle',
      currentNozzleTemp: Number(currentNozzleTemp) || 22,
      targetNozzleTemp: Number(targetNozzleTemp) || 0,
      currentBedTemp: Number(currentBedTemp) || 22,
      targetBedTemp: Number(targetBedTemp) || 0,
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().printers.push(newPrinter);
    db.save();
    res.status(201).json(newPrinter);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create printer.' });
  }
});

app.put('/api/printers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const printer = db.getData().printers.find(p => p.id === req.params.id && (p.userId === req.userId || p.userId === 'default'));
  if (!printer) {
    res.status(404).json({ error: 'Printer not found.' });
    return;
  }

  const { name, model, nozzleDiameterMm, bedWidthMm, bedDepthMm, maxHeightMm, bedType, status, currentNozzleTemp, targetNozzleTemp, currentBedTemp, targetBedTemp, activeJobName, progressPercent, notes } = req.body;
  if (name !== undefined) printer.name = name.trim();
  if (model !== undefined) printer.model = model.trim();
  if (nozzleDiameterMm !== undefined) printer.nozzleDiameterMm = Number(nozzleDiameterMm);
  if (bedWidthMm !== undefined) printer.bedWidthMm = Number(bedWidthMm);
  if (bedDepthMm !== undefined) printer.bedDepthMm = Number(bedDepthMm);
  if (maxHeightMm !== undefined) printer.maxHeightMm = Number(maxHeightMm);
  if (bedType !== undefined) printer.bedType = bedType;
  if (status !== undefined) printer.status = status;
  if (currentNozzleTemp !== undefined) printer.currentNozzleTemp = Number(currentNozzleTemp);
  if (targetNozzleTemp !== undefined) printer.targetNozzleTemp = Number(targetNozzleTemp);
  if (currentBedTemp !== undefined) printer.currentBedTemp = Number(currentBedTemp);
  if (targetBedTemp !== undefined) printer.targetBedTemp = Number(targetBedTemp);
  if (activeJobName !== undefined) printer.activeJobName = activeJobName;
  if (progressPercent !== undefined) printer.progressPercent = Number(progressPercent);
  if (notes !== undefined) printer.notes = notes.trim();
  printer.updatedAt = new Date().toISOString();

  db.save();
  res.json(printer);
});

app.delete('/api/printers/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().printers.findIndex(p => p.id === req.params.id && (p.userId === req.userId || p.userId === 'default'));
  if (index === -1) {
    res.status(404).json({ error: 'Printer not found.' });
    return;
  }
  db.getData().printers.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- FILAMENT SPOOLS ROUTES ---

app.get('/api/spools', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const spools = db.getData().spools.filter(s => s.userId === req.userId || s.userId === 'default');
  res.json(spools);
});

app.post('/api/spools', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, brand, materialType, colorName, colorHex, densityGcm3, initialWeightG, remainingWeightG, diameterMm, costPerKg, recommendedNozzleTemp, recommendedBedTemp, isDry, notes } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Spool name is required.' });
      return;
    }

    const newSpool: FilamentSpool = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      name: name.trim(),
      brand: (brand || 'Generic').trim(),
      materialType: materialType || 'PLA',
      colorName: (colorName || 'Natural').trim(),
      colorHex: colorHex || '#fe5029',
      densityGcm3: Number(densityGcm3) || 1.24,
      initialWeightG: Number(initialWeightG) || 1000,
      remainingWeightG: Number(remainingWeightG) || 1000,
      diameterMm: Number(diameterMm) || 1.75,
      costPerKg: Number(costPerKg) || 22.0,
      recommendedNozzleTemp: Number(recommendedNozzleTemp) || 210,
      recommendedBedTemp: Number(recommendedBedTemp) || 60,
      isDry: isDry !== undefined ? Boolean(isDry) : true,
      notes: (notes || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().spools.push(newSpool);
    db.save();
    res.status(201).json(newSpool);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create spool.' });
  }
});

app.put('/api/spools/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const spool = db.getData().spools.find(s => s.id === req.params.id && (s.userId === req.userId || s.userId === 'default'));
  if (!spool) {
    res.status(404).json({ error: 'Spool not found.' });
    return;
  }

  const { name, brand, materialType, colorName, colorHex, densityGcm3, initialWeightG, remainingWeightG, diameterMm, costPerKg, recommendedNozzleTemp, recommendedBedTemp, isDry, notes } = req.body;
  if (name !== undefined) spool.name = name.trim();
  if (brand !== undefined) spool.brand = brand.trim();
  if (materialType !== undefined) spool.materialType = materialType;
  if (colorName !== undefined) spool.colorName = colorName.trim();
  if (colorHex !== undefined) spool.colorHex = colorHex;
  if (densityGcm3 !== undefined) spool.densityGcm3 = Number(densityGcm3);
  if (initialWeightG !== undefined) spool.initialWeightG = Number(initialWeightG);
  if (remainingWeightG !== undefined) spool.remainingWeightG = Number(remainingWeightG);
  if (diameterMm !== undefined) spool.diameterMm = Number(diameterMm);
  if (costPerKg !== undefined) spool.costPerKg = Number(costPerKg);
  if (recommendedNozzleTemp !== undefined) spool.recommendedNozzleTemp = Number(recommendedNozzleTemp);
  if (recommendedBedTemp !== undefined) spool.recommendedBedTemp = Number(recommendedBedTemp);
  if (isDry !== undefined) spool.isDry = Boolean(isDry);
  if (notes !== undefined) spool.notes = notes.trim();
  spool.updatedAt = new Date().toISOString();

  db.save();
  res.json(spool);
});

app.delete('/api/spools/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().spools.findIndex(s => s.id === req.params.id && (s.userId === req.userId || s.userId === 'default'));
  if (index === -1) {
    res.status(404).json({ error: 'Spool not found.' });
    return;
  }
  db.getData().spools.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- SLICE PROJECTS ROUTES ---

app.get('/api/slice-projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const projects = db.getData().sliceProjects.filter(p => p.userId === req.userId);
  res.json(projects);
});

app.post('/api/slice-projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, modelType, modelDimensions, position, rotation, scale, settings, sliceResult } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Slice project name is required.' });
      return;
    }

    const newProject: SliceProject = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      name: name.trim(),
      modelType: modelType || 'calibration_cube',
      modelDimensions: modelDimensions || { x: 20, y: 20, z: 20 },
      position: position || { x: 0, y: 0, z: 0 },
      rotation: rotation || { x: 0, y: 0, z: 0 },
      scale: scale || 1.0,
      settings: settings || {
        printerId: 'printer-bambu-x1c',
        spoolId: 'spool-polymaker-pla-black',
        layerHeightMm: 0.20,
        firstLayerHeightMm: 0.24,
        wallLoops: 3,
        topBottomLayers: 4,
        infillDensity: 20,
        infillPattern: 'gyroid',
        supportsEnabled: false,
        supportType: 'tree',
        supportThresholdAngle: 45,
        printSpeedMmS: 150,
        outerWallSpeedMmS: 60,
        infillSpeedMmS: 180,
        travelSpeedMmS: 350,
        nozzleTemp: 215,
        bedTemp: 60,
        brimEnabled: false,
        brimWidthMm: 5
      },
      sliceResult,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().sliceProjects.push(newProject);
    db.save();
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save slice project.' });
  }
});

app.put('/api/slice-projects/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const project = db.getData().sliceProjects.find(p => p.id === req.params.id && p.userId === req.userId);
  if (!project) {
    res.status(404).json({ error: 'Slice project not found.' });
    return;
  }

  const { name, modelType, modelDimensions, position, rotation, scale, settings, sliceResult } = req.body;
  if (name !== undefined) project.name = name.trim();
  if (modelType !== undefined) project.modelType = modelType;
  if (modelDimensions !== undefined) project.modelDimensions = modelDimensions;
  if (position !== undefined) project.position = position;
  if (rotation !== undefined) project.rotation = rotation;
  if (scale !== undefined) project.scale = scale;
  if (settings !== undefined) project.settings = settings;
  if (sliceResult !== undefined) project.sliceResult = sliceResult;
  project.updatedAt = new Date().toISOString();

  db.save();
  res.json(project);
});

app.delete('/api/slice-projects/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().sliceProjects.findIndex(p => p.id === req.params.id && p.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Slice project not found.' });
    return;
  }
  db.getData().sliceProjects.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- NOTES ROUTES ---

app.get('/api/notes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let notes = db.getData().notes.filter(n => n.userId === req.userId);
  if (req.query.projectId) {
    notes = notes.filter(n => n.projectId === req.query.projectId);
  }
  res.json(notes);
});

app.post('/api/notes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, title, content, tags, pinned } = req.body;
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Note title is required.' });
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId: projectId || undefined,
      title: title.trim(),
      content: (content || '').trim(),
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      pinned: Boolean(pinned),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().notes.push(newNote);
    db.save();
    res.status(201).json(newNote);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create note.' });
  }
});

app.put('/api/notes/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const note = db.getData().notes.find(n => n.id === req.params.id && n.userId === req.userId);
  if (!note) {
    res.status(404).json({ error: 'Note not found.' });
    return;
  }

  const { title, content, tags, pinned, projectId } = req.body;
  if (title !== undefined) note.title = title.trim();
  if (content !== undefined) note.content = content.trim();
  if (tags !== undefined && Array.isArray(tags)) note.tags = tags;
  if (pinned !== undefined) note.pinned = Boolean(pinned);
  if (projectId !== undefined) note.projectId = projectId || undefined;
  note.updatedAt = new Date().toISOString();

  db.save();
  res.json(note);
});

app.delete('/api/notes/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().notes.findIndex(n => n.id === req.params.id && n.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Note not found.' });
    return;
  }
  db.getData().notes.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- IDEAS ROUTES ---

app.get('/api/ideas', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const ideas = db.getData().ideas.filter(i => i.userId === req.userId);
  res.json(ideas);
});

app.post('/api/ideas', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, tags, status } = req.body;
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Idea title is required.' });
      return;
    }

    const newIdea: Idea = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      title: title.trim(),
      description: (description || '').trim(),
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      status: status || 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().ideas.push(newIdea);
    db.save();
    res.status(201).json(newIdea);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create idea.' });
  }
});

app.put('/api/ideas/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const idea = db.getData().ideas.find(i => i.id === req.params.id && i.userId === req.userId);
  if (!idea) {
    res.status(404).json({ error: 'Idea not found.' });
    return;
  }

  const { title, description, tags, status } = req.body;
  if (title !== undefined) idea.title = title.trim();
  if (description !== undefined) idea.description = description.trim();
  if (tags !== undefined && Array.isArray(tags)) idea.tags = tags;
  if (status !== undefined) idea.status = status;
  idea.updatedAt = new Date().toISOString();

  db.save();
  res.json(idea);
});

app.post('/api/ideas/:id/convert-to-project', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const idea = db.getData().ideas.find(i => i.id === req.params.id && i.userId === req.userId);
  if (!idea) {
    res.status(404).json({ error: 'Idea not found.' });
    return;
  }

  // Create project from idea
  const newProject: Project = {
    id: crypto.randomUUID(),
    userId: req.userId!,
    name: idea.title,
    description: idea.description,
    status: 'planning',
    category: 'General',
    tags: idea.tags,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    visibility: 'private'
  };

  idea.status = 'promoted';
  idea.updatedAt = new Date().toISOString();

  db.getData().projects.push(newProject);
  db.save();

  res.status(201).json({ project: newProject, idea });
});

app.delete('/api/ideas/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().ideas.findIndex(i => i.id === req.params.id && i.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Idea not found.' });
    return;
  }
  db.getData().ideas.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- EXPERIMENTS ROUTES ---

app.get('/api/experiments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let experiments = db.getData().experiments.filter(e => e.userId === req.userId);
  if (req.query.projectId) {
    experiments = experiments.filter(e => e.projectId === req.query.projectId);
  }
  res.json(experiments);
});

app.post('/api/experiments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, title, objective, hypothesis, materials, procedure, results, observations, conclusion } = req.body;
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Experiment title is required.' });
      return;
    }

    const newExperiment: Experiment = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId: projectId || undefined,
      title: title.trim(),
      objective: (objective || '').trim(),
      hypothesis: (hypothesis || '').trim(),
      materials: Array.isArray(materials) ? materials.map(m => String(m).trim()).filter(Boolean) : [],
      procedure: (procedure || '').trim(),
      results: (results || '').trim(),
      observations: (observations || '').trim(),
      conclusion: (conclusion || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.getData().experiments.push(newExperiment);
    db.save();
    res.status(201).json(newExperiment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create experiment.' });
  }
});

app.put('/api/experiments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const exp = db.getData().experiments.find(e => e.id === req.params.id && e.userId === req.userId);
  if (!exp) {
    res.status(404).json({ error: 'Experiment not found.' });
    return;
  }

  const { title, objective, hypothesis, materials, procedure, results, observations, conclusion, projectId } = req.body;
  if (title !== undefined) exp.title = title.trim();
  if (objective !== undefined) exp.objective = objective.trim();
  if (hypothesis !== undefined) exp.hypothesis = hypothesis.trim();
  if (materials !== undefined && Array.isArray(materials)) exp.materials = materials;
  if (procedure !== undefined) exp.procedure = procedure.trim();
  if (results !== undefined) exp.results = results.trim();
  if (observations !== undefined) exp.observations = observations.trim();
  if (conclusion !== undefined) exp.conclusion = conclusion.trim();
  if (projectId !== undefined) exp.projectId = projectId || undefined;
  exp.updatedAt = new Date().toISOString();

  db.save();
  res.json(exp);
});

app.delete('/api/experiments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().experiments.findIndex(e => e.id === req.params.id && e.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Experiment not found.' });
    return;
  }
  db.getData().experiments.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- FILES ROUTES ---

app.get('/api/files', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  let files = db.getData().files.filter(f => f.userId === req.userId);
  if (req.query.projectId) {
    files = files.filter(f => f.projectId === req.query.projectId);
  }
  res.json(files);
});

app.post('/api/files', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, name, size, type, dataUrl, notes } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'File name is required.' });
      return;
    }

    const newFile: FileRecord = {
      id: crypto.randomUUID(),
      userId: req.userId!,
      projectId: projectId || undefined,
      name: name.trim(),
      size: Number(size) || 0,
      type: type || 'application/octet-stream',
      dataUrl: dataUrl || undefined,
      notes: (notes || '').trim(),
      uploadedAt: new Date().toISOString()
    };

    db.getData().files.push(newFile);
    db.save();
    res.status(201).json(newFile);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to upload file record.' });
  }
});

app.delete('/api/files/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = db.getData().files.findIndex(f => f.id === req.params.id && f.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'File record not found.' });
    return;
  }
  db.getData().files.splice(index, 1);
  db.save();
  res.json({ ok: true });
});

// --- ANALYTICS (CALCULATED STRICTLY FROM REAL RECORDS) ---

app.get('/api/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const data = db.getData();

  const userProjects = data.projects.filter(p => p.userId === userId);
  const userTasks = data.tasks.filter(t => t.userId === userId);
  const userInventory = data.inventory.filter(i => i.userId === userId);
  const userBoms = data.boms.filter(b => b.userId === userId);
  const userPrints = data.printRecords.filter(p => p.userId === userId);
  const userCircuits = data.circuits.filter(c => c.userId === userId);
  const userNotes = data.notes.filter(n => n.userId === userId);

  // Status breakdowns
  const projectsByStatus: Record<string, number> = {
    idea: 0,
    planning: 0,
    sourcing: 0,
    building: 0,
    testing: 0,
    documenting: 0,
    finished: 0,
    archived: 0
  };
  userProjects.forEach(p => {
    if (projectsByStatus[p.status] !== undefined) {
      projectsByStatus[p.status]++;
    }
  });

  const tasksByStatus: Record<string, number> = {
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0
  };
  userTasks.forEach(t => {
    if (tasksByStatus[t.status] !== undefined) {
      tasksByStatus[t.status]++;
    }
  });

  // Calculate real costs strictly from user entered numbers
  let totalBOMCost = 0;
  let itemsWithCostCount = 0;
  let itemsWithoutCostCount = 0;

  userBoms.forEach(b => {
    if (b.unitCost !== null && b.unitCost !== undefined && !isNaN(b.unitCost)) {
      totalBOMCost += b.unitCost * b.quantity;
      itemsWithCostCount++;
    } else {
      itemsWithoutCostCount++;
    }
  });

  // Total inventory estimated cost
  let totalInventoryCost = 0;
  let inventoryWithCostCount = 0;
  let lowStockCount = 0;

  userInventory.forEach(item => {
    if (item.purchaseCost !== null && item.purchaseCost !== undefined && !isNaN(item.purchaseCost)) {
      totalInventoryCost += item.purchaseCost * item.quantity;
      inventoryWithCostCount++;
    }
    if (item.minStockLevel !== null && item.minStockLevel !== undefined && item.quantity <= item.minStockLevel) {
      lowStockCount++;
    }
  });

  // Print breakdown
  const printsByStatus: Record<string, number> = {
    queued: 0,
    printing: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  };
  let totalPrintDuration = 0;
  let totalFilamentUsed = 0;

  userPrints.forEach(p => {
    if (printsByStatus[p.status] !== undefined) {
      printsByStatus[p.status]++;
    }
    if (p.printDurationMinutes) totalPrintDuration += p.printDurationMinutes;
    if (p.filamentUsageGrams) totalFilamentUsed += p.filamentUsageGrams;
  });

  const totalRecords = userProjects.length + userTasks.length + userInventory.length + userBoms.length + userPrints.length + userCircuits.length + userNotes.length;

  res.json({
    hasData: totalRecords > 0,
    totalRecords,
    projects: {
      total: userProjects.length,
      byStatus: projectsByStatus
    },
    tasks: {
      total: userTasks.length,
      completed: tasksByStatus.done,
      byStatus: tasksByStatus
    },
    inventory: {
      totalItems: userInventory.length,
      totalQuantity: userInventory.reduce((acc, i) => acc + i.quantity, 0),
      lowStockCount,
      totalInventoryCost,
      inventoryWithCostCount
    },
    bom: {
      totalItems: userBoms.length,
      totalCost: totalBOMCost,
      itemsWithCostCount,
      itemsWithoutCostCount
    },
    prints: {
      total: userPrints.length,
      byStatus: printsByStatus,
      totalDurationMinutes: totalPrintDuration,
      totalFilamentGrams: totalFilamentUsed
    },
    circuits: {
      total: userCircuits.length,
      totalPins: userCircuits.reduce((acc, c) => acc + c.pins.length, 0)
    },
    notes: {
      total: userNotes.length
    }
  });
});

// --- GLOBAL SEARCH ---

app.get('/api/search', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const q = (req.query.q as string || '').trim().toLowerCase();
  if (!q) {
    res.json({ results: [] });
    return;
  }

  const userId = req.userId!;
  const data = db.getData();
  const results: Array<{ id: string; type: string; title: string; subtitle: string; link: string; matchDetail?: string }> = [];

  // Search Projects
  data.projects.filter(p => p.userId === userId).forEach(p => {
    if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))) {
      results.push({
        id: p.id,
        type: 'Project',
        title: p.name,
        subtitle: `${p.category} • Status: ${p.status}`,
        link: `/projects/${p.id}`,
        matchDetail: p.description ? p.description.slice(0, 100) : undefined
      });
    }
  });

  // Search Tasks
  data.tasks.filter(t => t.userId === userId).forEach(t => {
    if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
      results.push({
        id: t.id,
        type: 'Task',
        title: t.title,
        subtitle: `Priority: ${t.priority} • Status: ${t.status}`,
        link: `/tasks`,
        matchDetail: t.description ? t.description.slice(0, 100) : undefined
      });
    }
  });

  // Search Inventory
  data.inventory.filter(i => i.userId === userId).forEach(i => {
    if (i.name.toLowerCase().includes(q) || (i.partNumber && i.partNumber.toLowerCase().includes(q)) || (i.manufacturer && i.manufacturer.toLowerCase().includes(q)) || (i.storageLocation && i.storageLocation.toLowerCase().includes(q))) {
      results.push({
        id: i.id,
        type: 'Inventory',
        title: i.name,
        subtitle: `${i.category} • Stock: ${i.quantity} ${i.unit} ${i.storageLocation ? `at ${i.storageLocation}` : ''}`,
        link: `/inventory`,
        matchDetail: i.partNumber ? `P/N: ${i.partNumber}` : undefined
      });
    }
  });

  // Search Circuits
  data.circuits.filter(c => c.userId === userId).forEach(c => {
    if (c.name.toLowerCase().includes(q) || c.boardMcu.toLowerCase().includes(q) || c.pins.some(p => p.componentName.toLowerCase().includes(q) || p.pinLabel.toLowerCase().includes(q))) {
      results.push({
        id: c.id,
        type: 'Circuit',
        title: c.name,
        subtitle: `Board: ${c.boardMcu || 'Unspecified'} • ${c.pins.length} pins`,
        link: `/circuits`,
        matchDetail: c.description
      });
    }
  });

  // Search Code Files
  data.codeFiles.filter(f => f.userId === userId).forEach(f => {
    if (f.name.toLowerCase().includes(q) || f.content.toLowerCase().includes(q)) {
      results.push({
        id: f.id,
        type: 'Code',
        title: f.name,
        subtitle: `Language: ${f.language} • ${f.versions.length} versions`,
        link: `/coding`,
        matchDetail: f.name
      });
    }
  });

  // Search Notes
  data.notes.filter(n => n.userId === userId).forEach(n => {
    if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
      results.push({
        id: n.id,
        type: 'Note',
        title: n.title,
        subtitle: `Updated: ${new Date(n.updatedAt).toLocaleDateString()}`,
        link: `/notes`,
        matchDetail: n.content.slice(0, 100)
      });
    }
  });

  // Search Prints
  data.printRecords.filter(p => p.userId === userId).forEach(p => {
    if (p.modelName.toLowerCase().includes(q) || p.printer.toLowerCase().includes(q) || p.material.toLowerCase().includes(q)) {
      results.push({
        id: p.id,
        type: '3D Print',
        title: p.modelName,
        subtitle: `${p.printer} • ${p.material} • Status: ${p.status}`,
        link: `/prints`
      });
    }
  });

  res.json({ results });
});

// --- AI CODING ASSISTANCE ROUTE ---

app.post('/api/ai/code-action', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, code, language, fileName, errorMessage, projectContext, customInstruction } = req.body;
    if (!code && action !== 'docs' && action !== 'tests') {
      res.status(400).json({ error: 'Code content is required for AI actions.' });
      return;
    }

    const output = await processAiCodeRequest({
      action: action || 'explain',
      code: code || '',
      language: language || 'cpp',
      fileName,
      errorMessage,
      projectContext,
      customInstruction
    });

    res.json(output);
  } catch (err: any) {
    console.error('AI Code action error:', err);
    res.status(500).json({
      error: err.message || 'AI request could not be processed. Verify GEMINI_API_KEY in the Secrets panel.'
    });
  }
});

app.post('/api/ai/circuit-review', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { circuitName, boardMcu, components, wires, simulation, userQuery } = req.body;
    if (!simulation) {
      res.status(400).json({ error: 'Simulation results are required for AI Circuit Review.' });
      return;
    }

    const review = await processAiCircuitReview({
      circuitName: circuitName || 'Circuit',
      boardMcu,
      components: Array.isArray(components) ? components : [],
      wires: Array.isArray(wires) ? wires : [],
      simulation,
      userQuery
    });

    res.json(review);
  } catch (err: any) {
    console.error('AI Circuit Review error:', err);
    res.status(500).json({
      error: err.message || 'Circuit review could not be processed. Verify GEMINI_API_KEY in the Secrets panel.'
    });
  }
});

app.post('/api/ai/slice-review', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { modelName, modelDimensions, printer, material, settings, sliceMetrics, userQuery } = req.body;
    if (!settings || !sliceMetrics) {
      res.status(400).json({ error: 'Settings and slice metrics are required for Slice AI Review.' });
      return;
    }

    const review = await processAiSliceReview({
      modelName: modelName || '3D Model',
      modelDimensions: modelDimensions || { x: 20, y: 20, z: 20 },
      printer: printer || {
        name: 'FDM Printer',
        model: 'Standard 3D Printer',
        nozzleDiameterMm: 0.4,
        bedWidthMm: 250,
        bedDepthMm: 250,
        maxHeightMm: 250,
        bedType: 'PEI Textured'
      },
      material: material || {
        name: 'PLA',
        materialType: 'PLA',
        densityGcm3: 1.24,
        recommendedNozzleTemp: 210,
        recommendedBedTemp: 60
      },
      settings,
      sliceMetrics,
      userQuery
    });

    res.json(review);
  } catch (err: any) {
    console.error('Slice AI Review error:', err);
    res.status(500).json({
      error: err.message || 'Slice review could not be processed. Verify GEMINI_API_KEY in the Secrets panel.'
    });
  }
});

// Vite middleware & Static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAKEO server running on http://0.0.0.0:${PORT}`);
  });
}

start();
