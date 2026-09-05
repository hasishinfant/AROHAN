import { create } from 'zustand';
import {
  AppState,
  ScenarioStatus,
  ShipmentData,
  ResourceStockData,
  ResourceTransferData,
  OperationalAlertData,
  CorridorRiskForecastData
} from '../types';
import { GPSUpdate, gpsSimulationService } from '../services/gpsSimulationService';

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
  return {
    id: 1,
    name: 'Arjun Sharma',
    role: 'ADMIN',
    email: 'admin@arohan.gov.in',
    avatarText: 'AS',
  };
};

const DEFAULT_SHIPMENTS: ShipmentData[] = [
  {
    id: 1,
    shipment_code: 'SHP-001',
    cargo_type: 'Emergency Medical & Disaster Relief Supplies',
    weight_kg: 4200,
    urgency: 4,
    origin: 'Guwahati GST Depot (Assam)',
    destination: 'Shillong Core Hub (Meghalaya)',
    status: 'IN_TRANSIT',
    assigned_route_id: 1,
    assigned_driver_id: 1,
    planned_departure: '08:00 IST',
    planned_eta: '11:00 IST',
    updated_eta: '13:12 IST',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    shipment_code: 'SHP-002',
    cargo_type: 'Food Grains & Essential Grain Commodities',
    weight_kg: 8500,
    urgency: 5,
    origin: 'Guwahati Inland Port (Assam)',
    destination: 'Silchar Freight Terminal (Assam - Barak Valley)',
    status: 'IN_TRANSIT',
    assigned_route_id: 2,
    assigned_driver_id: 2,
    planned_departure: '06:00 IST',
    planned_eta: '17:30 IST',
    updated_eta: '18:45 IST',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    shipment_code: 'SHP-003',
    cargo_type: 'High-Altitude Emergency Oxygen Cylinders',
    weight_kg: 3100,
    urgency: 5,
    origin: 'Shillong Central Depot (Meghalaya)',
    destination: 'Agartala Civil Hospital Hub (Tripura)',
    status: 'DISPATCHED',
    assigned_route_id: 1,
    assigned_driver_id: 3,
    planned_departure: '07:30 IST',
    planned_eta: '19:45 IST',
    updated_eta: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    shipment_code: 'SHP-004',
    cargo_type: 'Cold-Chain Vaccines & Biological Specimen',
    weight_kg: 1800,
    urgency: 4,
    origin: 'Guwahati Medical Depot (Assam)',
    destination: 'Tezpur Regional Hospital (Assam)',
    status: 'IN_TRANSIT',
    assigned_route_id: 2,
    assigned_driver_id: 4,
    planned_departure: '09:00 IST',
    planned_eta: '13:15 IST',
    updated_eta: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    shipment_code: 'SHP-005',
    cargo_type: 'Infrastructure Heavy Cable & Road Repair Gear',
    weight_kg: 12400,
    urgency: 3,
    origin: 'Guwahati Industrial Park (Assam)',
    destination: 'Itanagar Capital Depot (Arunachal Pradesh)',
    status: 'PLANNED',
    assigned_route_id: 1,
    assigned_driver_id: 5,
    planned_departure: '11:00 IST',
    planned_eta: '21:00 IST',
    updated_eta: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    shipment_code: 'SHP-006',
    cargo_type: 'Disaster Recovery Fuel & Silent Power Generators',
    weight_kg: 6700,
    urgency: 4,
    origin: 'Silchar Distribution Hub (Assam)',
    destination: 'Aizawl Zuangtui Logistics Hub (Mizoram)',
    status: 'DISRUPTED',
    assigned_route_id: 2,
    assigned_driver_id: 6,
    planned_departure: '05:30 IST',
    planned_eta: '14:20 IST',
    updated_eta: '18:50 IST',
    created_at: new Date().toISOString(),
  },
];

interface ArohanStore extends Partial<AppState> {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthUser | null;
  shipmentsList: ShipmentData[];
  selectedShipmentId: number;
  gpsUpdate: GPSUpdate | null;

  // Institutional State
  resourceStocks: ResourceStockData[];
  resourceTransfers: ResourceTransferData[];
  operationalAlerts: OperationalAlertData[];
  terrainRisks: {
    current_risks: CorridorRiskForecastData[];
    forecast_risks: CorridorRiskForecastData[];
    total_active_hazards: number;
    total_forecast_windows: number;
    data_notice?: string;
  } | null;

  // Actions
  setGpsUpdate: (update: GPSUpdate | null) => void;
  selectShipment: (id: number) => void;
  fetchState: () => Promise<void>;
  fetchResources: () => Promise<void>;
  matchResources: () => Promise<void>;
  approveTransfer: (id: number) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  reviewAlert: (id: number) => Promise<void>;
  approveAlert: (id: number) => Promise<void>;
  dismissAlert: (id: number, reason: string) => Promise<void>;
  fetchTerrainRisks: () => Promise<void>;
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
  shipmentsList: DEFAULT_SHIPMENTS,
  selectedShipmentId: 1,
  gpsUpdate: gpsSimulationService.getLastUpdate(),
  resourceStocks: [],
  resourceTransfers: [],
  operationalAlerts: [],
  terrainRisks: null,

  setGpsUpdate: (update) => set({ gpsUpdate: update }),

  selectShipment: (id: number) => {
    const list = get().shipmentsList;
    const target = list.find((s) => s.id === id);
    if (target) {
      gpsSimulationService.setShipment(id);
      set({ selectedShipmentId: id, shipment: target, gpsUpdate: gpsSimulationService.getLastUpdate() });
    }
  },

  setConnected: (v) => set({ isConnected: v }),

  applyWsUpdate: (data) => set((s) => {
    let updatedList = s.shipmentsList;
    if (data.shipment) {
      updatedList = updatedList.map((item) =>
        item.id === 1 ? { ...item, ...data.shipment } : item
      );
    }
    const currentSelectedId = s.selectedShipmentId || 1;
    const activeShipment = currentSelectedId === 1 && data.shipment ? data.shipment : updatedList.find(x => x.id === currentSelectedId) || data.shipment || updatedList[0];

    return {
      ...s,
      ...data,
      shipmentsList: updatedList,
      shipment: activeShipment,
      error: null,
    };
  }),

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
      const s = get();
      let updatedList = s.shipmentsList;
      if (data.shipment) {
        updatedList = updatedList.map((item) =>
          item.id === 1 ? { ...item, ...data.shipment } : item
        );
      }
      const currentSelectedId = s.selectedShipmentId || 1;
      const activeShipment = currentSelectedId === 1 && data.shipment ? data.shipment : updatedList.find(x => x.id === currentSelectedId) || data.shipment || updatedList[0];

      set({
        ...data,
        shipmentsList: updatedList,
        shipment: activeShipment,
        isLoading: false,
        error: null,
      });

      // Synchronously load institutional modules
      get().fetchResources();
      get().fetchAlerts();
      get().fetchTerrainRisks();
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

  fetchResources: async () => {
    try {
      const data = await patch('/resources', 'GET');
      const transfers = await patch('/resources/transfers', 'GET');
      set({ resourceStocks: data.stocks || [], resourceTransfers: transfers || [] });
    } catch (e) {
      console.warn('Failed to fetch resources:', e);
    }
  },

  matchResources: async () => {
    try {
      const res = await patch('/resources/match', 'POST');
      if (res.transfers) {
        set((s) => ({ resourceTransfers: [...res.transfers, ...s.resourceTransfers] }));
      }
      await get().fetchResources();
    } catch (e) {
      console.warn('Failed to match resources:', e);
    }
  },

  approveTransfer: async (id: number) => {
    await patch(`/resources/transfers/${id}/approve`, 'POST', { dispatcher_id: 1 });
    await get().fetchResources();
    await get().fetchState();
  },

  fetchAlerts: async () => {
    try {
      const data = await patch('/alerts', 'GET');
      set({ operationalAlerts: data || [] });
    } catch (e) {
      console.warn('Failed to fetch alerts:', e);
    }
  },

  reviewAlert: async (id: number) => {
    await patch(`/alerts/${id}/review`, 'POST', { officer_id: 1 });
    await get().fetchAlerts();
  },

  approveAlert: async (id: number) => {
    await patch(`/alerts/${id}/approve`, 'POST', {
      officer_id: 1,
      department: 'Disaster Management Authority'
    });
    await get().fetchAlerts();
    await get().fetchState();
  },

  dismissAlert: async (id: number, reason: string) => {
    await patch(`/alerts/${id}/dismiss`, 'POST', { officer_id: 1, reason });
    await get().fetchAlerts();
  },

  fetchTerrainRisks: async () => {
    try {
      const data = await patch('/risks/terrain', 'GET');
      set({ terrainRisks: data });
    } catch (e) {
      console.warn('Failed to fetch terrain risks:', e);
    }
  },
}));
