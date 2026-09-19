import {
  UserProfile,
  Project,
  Task,
  InventoryItem,
  BomItem,
  Circuit,
  CodeFile,
  PrintRecord,
  Note,
  Idea,
  Experiment,
  FileRecord,
  AnalyticsData,
  PrinterProfile,
  FilamentSpool,
  SliceProject
} from './types';

const TOKEN_KEY = 'makerhub_auth_token';
const USER_ID_KEY = 'makerhub_user_id';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, userId?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (userId) localStorage.setItem(USER_ID_KEY, userId);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const userId = localStorage.getItem(USER_ID_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// Auth API
export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string; workspaceName?: string }) =>
      request<{ user: UserProfile; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: UserProfile; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    guest: () =>
      request<{ user: UserProfile; token: string }>('/api/auth/guest', {
        method: 'POST',
      }),
    me: () => request<{ user: UserProfile; token?: string }>('/api/auth/me'),
    logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  },

  projects: {
    list: () => request<Project[]>('/api/projects'),
    get: (id: string) => request<Project>(`/api/projects/${id}`),
    create: (data: Partial<Project>) =>
      request<Project>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Project>) =>
      request<Project>(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/projects/${id}`, {
        method: 'DELETE',
      }),
  },

  tasks: {
    list: (projectId?: string) =>
      request<Task[]>(projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks'),
    create: (data: Partial<Task>) =>
      request<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Task>) =>
      request<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/tasks/${id}`, {
        method: 'DELETE',
      }),
  },

  inventory: {
    list: () => request<InventoryItem[]>('/api/inventory'),
    create: (data: Partial<InventoryItem>) =>
      request<InventoryItem>('/api/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<InventoryItem>) =>
      request<InventoryItem>(`/api/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/inventory/${id}`, {
        method: 'DELETE',
      }),
  },

  boms: {
    list: (projectId?: string) =>
      request<BomItem[]>(projectId ? `/api/boms?projectId=${projectId}` : '/api/boms'),
    create: (data: Partial<BomItem>) =>
      request<BomItem>('/api/boms', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<BomItem>) =>
      request<BomItem>(`/api/boms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/boms/${id}`, {
        method: 'DELETE',
      }),
  },

  circuits: {
    list: (projectId?: string) =>
      request<Circuit[]>(projectId ? `/api/circuits?projectId=${projectId}` : '/api/circuits'),
    create: (data: Partial<Circuit>) =>
      request<Circuit>('/api/circuits', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Circuit>) =>
      request<Circuit>(`/api/circuits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/circuits/${id}`, {
        method: 'DELETE',
      }),
  },

  codeFiles: {
    list: (projectId?: string) =>
      request<CodeFile[]>(projectId ? `/api/code-files?projectId=${projectId}` : '/api/code-files'),
    get: (id: string) => request<CodeFile>(`/api/code-files/${id}`),
    create: (data: Partial<CodeFile>) =>
      request<CodeFile>('/api/code-files', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<CodeFile> & { commitMessage?: string }) =>
      request<CodeFile>(`/api/code-files/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    restoreVersion: (id: string, versionId: string) =>
      request<CodeFile>(`/api/code-files/${id}/restore-version/${versionId}`, {
        method: 'POST',
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/code-files/${id}`, {
        method: 'DELETE',
      }),
  },

  prints: {
    list: (projectId?: string) =>
      request<PrintRecord[]>(projectId ? `/api/prints?projectId=${projectId}` : '/api/prints'),
    create: (data: Partial<PrintRecord>) =>
      request<PrintRecord>('/api/prints', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<PrintRecord>) =>
      request<PrintRecord>(`/api/prints/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/prints/${id}`, {
        method: 'DELETE',
      }),
  },

  printers: {
    list: () => request<PrinterProfile[]>('/api/printers'),
    create: (data: Partial<PrinterProfile>) =>
      request<PrinterProfile>('/api/printers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<PrinterProfile>) =>
      request<PrinterProfile>(`/api/printers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/printers/${id}`, {
        method: 'DELETE',
      }),
  },

  spools: {
    list: () => request<FilamentSpool[]>('/api/spools'),
    create: (data: Partial<FilamentSpool>) =>
      request<FilamentSpool>('/api/spools', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<FilamentSpool>) =>
      request<FilamentSpool>(`/api/spools/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/spools/${id}`, {
        method: 'DELETE',
      }),
  },

  sliceProjects: {
    list: () => request<SliceProject[]>('/api/slice-projects'),
    create: (data: Partial<SliceProject>) =>
      request<SliceProject>('/api/slice-projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<SliceProject>) =>
      request<SliceProject>(`/api/slice-projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/slice-projects/${id}`, {
        method: 'DELETE',
      }),
  },

  notes: {
    list: (projectId?: string) =>
      request<Note[]>(projectId ? `/api/notes?projectId=${projectId}` : '/api/notes'),
    create: (data: Partial<Note>) =>
      request<Note>('/api/notes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Note>) =>
      request<Note>(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/notes/${id}`, {
        method: 'DELETE',
      }),
  },

  ideas: {
    list: () => request<Idea[]>('/api/ideas'),
    create: (data: Partial<Idea>) =>
      request<Idea>('/api/ideas', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Idea>) =>
      request<Idea>(`/api/ideas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    convertToProject: (id: string) =>
      request<{ project: Project; idea: Idea }>(`/api/ideas/${id}/convert-to-project`, {
        method: 'POST',
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/ideas/${id}`, {
        method: 'DELETE',
      }),
  },

  experiments: {
    list: (projectId?: string) =>
      request<Experiment[]>(projectId ? `/api/experiments?projectId=${projectId}` : '/api/experiments'),
    create: (data: Partial<Experiment>) =>
      request<Experiment>('/api/experiments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Experiment>) =>
      request<Experiment>(`/api/experiments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/experiments/${id}`, {
        method: 'DELETE',
      }),
  },

  files: {
    list: (projectId?: string) =>
      request<FileRecord[]>(projectId ? `/api/files?projectId=${projectId}` : '/api/files'),
    create: (data: Partial<FileRecord>) =>
      request<FileRecord>('/api/files', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/files/${id}`, {
        method: 'DELETE',
      }),
  },

  analytics: {
    get: () => request<AnalyticsData>('/api/analytics'),
  },

  search: {
    query: (q: string) =>
      request<{
        results: Array<{
          id: string;
          type: string;
          title: string;
          subtitle: string;
          link: string;
          matchDetail?: string;
        }>;
      }>(`/api/search?q=${encodeURIComponent(q)}`),
  },

  ai: {
    runCodeAction: (data: {
      action: 'explain' | 'fix' | 'improve' | 'review' | 'docs' | 'tests' | 'debug' | 'circuit_mismatch';
      code: string;
      language: string;
      fileName?: string;
      errorMessage?: string;
      projectContext?: any;
      customInstruction?: string;
    }) =>
      request<{ result: string }>('/api/ai/code-action', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    runCircuitReview: (data: {
      circuitName: string;
      boardMcu?: string;
      components: any[];
      wires: any[];
      simulation: any;
      userQuery?: string;
    }) =>
      request<any>('/api/ai/circuit-review', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    runSliceReview: (data: {
      modelName: string;
      modelDimensions: { x: number; y: number; z: number };
      printer: any;
      material: any;
      settings: any;
      sliceMetrics: any;
      userQuery?: string;
    }) =>
      request<any>('/api/ai/slice-review', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
