import { create } from 'zustand';
import { AppState, ScenarioStatus } from '../types';

const API = '/api';

export interface AuthUser {
  id: number;
  name: string;
  role: 'ADMIN' | 'DRIVER';
  email: string;
  avatarText: string;
}

const STORAGE_KEY = 'arohan_auth_user';

const getInitialUser = (): AuthUser | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // fallback
  }
  // Default to Admin logged in for smooth demo experience
  return {
    id: 1,
    name: 'Arjun Sharma',
    role: 'ADMIN',
    email: 'admin@arohan.gov.in',
    avatarText: 'AS',
  };
};

interface ArohanStore extends Partial<AppState> {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthUser | null;

  // Actions
  fetchState: () => Promise<void>;
  scenarioStart: () => Promise<void>;
  scenarioNext: () => Promise<void>;
  scenarioPause: () => Promise<void>;
  scenarioResume: () => Promise<void>;
  scenarioReset: () => Promise<void>;
  scenarioLowConfidence: () => Promise<void>;
  approveDecision: (id: number) => Promise<void>;
  rejectDecision: (id: number, reason: string) => Promise<void>;
  driverAcknowledge: () => Promise<void>;
  driverReport: (condition: string, notes?: string) => Promise<void>;
  setConnected: (v: boolean) => void;
  applyWsUpdate: (data: Partial<AppState>) => void;
  login: (role: 'ADMIN' | 'DRIVER', email?: string) => AuthUser;
  logout: () => void;
}

const patch = async (url: string, method = 'POST', body?: object) => {
  const res = await fetch(`${API}${url}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}`);
  return res.json();
};

export const useArohanStore = create<ArohanStore>((set, get) => ({
  isConnected: false,
  isLoading: false,
  error: null,
  user: getInitialUser(),

  setConnected: (v) => set({ isConnected: v }),

  applyWsUpdate: (data) => set((s) => ({ ...s, ...data, error: null })),

  login: (role, email) => {
    const newUser: AuthUser =
      role === 'ADMIN'
        ? {
            id: 1,
            name: 'Arjun Sharma',
            role: 'ADMIN',
            email: email || 'admin@arohan.gov.in',
            avatarText: 'AS',
          }
        : {
            id: 2,
            name: 'Rahul Kumar',
            role: 'DRIVER',
            email: email || 'driver.rahul@arohan.gov.in',
            avatarText: 'RK',
          };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    set({ user: newUser });
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },

  fetchState: async () => {
    set({ isLoading: true });
    try {
      const data = await patch('/state', 'GET');
      set({ ...data, isLoading: false, error: null });
    } catch (e) {
      set({ isLoading: false, error: String(e) });
    }
  },

  scenarioStart: async () => {
    const data = await patch('/scenario/start');
    set((s) => ({ ...s, ...data }));
    await get().fetchState();
  },

  scenarioNext: async () => {
    const data = await patch('/scenario/next');
    set((s) => ({ ...s, ...data }));
    await get().fetchState();
  },

  scenarioPause: async () => {
    await patch('/scenario/pause');
    set({ scenario_status: 'PAUSED' as ScenarioStatus });
  },

  scenarioResume: async () => {
    await patch('/scenario/resume');
    set({ scenario_status: 'RUNNING' as ScenarioStatus });
  },

  scenarioReset: async () => {
    const data = await patch('/scenario/reset');
    set({ ...data });
    await get().fetchState();
  },

  scenarioLowConfidence: async () => {
    const data = await patch('/scenario/low-confidence');
    set({ ...data });
    await get().fetchState();
  },

  approveDecision: async (id: number) => {
    await patch(`/decisions/${id}/approve`, 'POST', { dispatcher_id: 1 });
    await get().fetchState();
  },

  rejectDecision: async (id: number, reason: string) => {
    await patch(`/decisions/${id}/reject`, 'POST', { dispatcher_id: 1, reason });
    await get().fetchState();
  },

  driverAcknowledge: async () => {
    await patch('/driver/acknowledge');
    set({ driver_status: 'ACKNOWLEDGED' });
    await get().fetchState();
  },

  driverReport: async (condition: string, notes?: string) => {
    const { routes } = get();
    const routeA = routes?.find((r) => r.label === 'A');
    await patch('/driver/report', 'POST', {
      driver_id: 1,
      shipment_id: 1,
      route_id: routeA?.id ?? 1,
      condition,
      notes,
      lat: 25.89,
      lon: 91.965,
    });
    set({ driver_status: 'REPORTING' });
    await get().fetchState();
  },
}));
