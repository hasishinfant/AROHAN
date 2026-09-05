import { TransportMode, DataStatus } from '../types';

export interface VehicleTelemetry {
  shipmentId: number;
  legId: string | number;
  mode: TransportMode;
  vehicleId: string;
  vehicleName: string;
  latitude: number;
  longitude: number;
  heading: number;
  speedKmh: number;
  progressPct: number;
  distanceCoveredKm: number;
  distanceTotalKm: number;
  eta: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DISRUPTED' | 'ARRIVED';
  dataStatus: DataStatus;
  timestamp: string;
}

export type MultimodalSimulationSubscriber = (telemetry: Record<TransportMode, VehicleTelemetry>) => void;

interface SimulationState {
  mode: TransportMode;
  routeCoords: [number, number][]; // [lat, lng]
  vehicleId: string;
  vehicleName: string;
  baseSpeedKmh: number;
  totalDistanceKm: number;
  currentIndex: number;
  segmentProgress: number; // 0 to 1 within current segment
  speedMultiplier: number;
  isRunning: boolean;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DISRUPTED' | 'ARRIVED';
  dataStatus: DataStatus;
}

// Distance calculation between two [lat, lng] points (Haversine formula in KM)
function getDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLng = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[0] * Math.PI) / 180) *
      Math.cos((coord2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing/heading between two points
function getHeading(coord1: [number, number], coord2: [number, number]): number {
  const dLng = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((coord2[0] * Math.PI) / 180);
  const x =
    Math.cos((coord1[0] * Math.PI) / 180) * Math.sin((coord2[0] * Math.PI) / 180) -
    Math.sin((coord1[0] * Math.PI) / 180) *
      Math.cos((coord2[0] * Math.PI) / 180) *
      Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export class MultimodalSimulationEngine {
  private subscribers: Set<MultimodalSimulationSubscriber> = new Set();
  private timer: number | null = null;

  // Preset route geometries for each mode in NER
  private routes: Record<TransportMode, [number, number][]> = {
    LAND: [
      [26.1445, 91.7362], // Guwahati Depot
      [25.8900, 91.9650], // Nongpoh
      [25.7000, 91.8900], // Umiam Lake Corridor
      [25.5788, 91.8933], // Shillong Hub
    ],
    RAIL: [
      [26.1750, 91.7750], // Guwahati NFR Rail Freight Yard
      [26.1800, 92.4000], // Jagiroad Station Yard
      [25.7500, 92.8000], // Lumding Junction
      [24.8300, 92.7800], // Silchar Railway Goods Yard
    ],
    WATER: [
      [26.1900, 90.5800], // Jogighopa Inland Waterway Terminal (NW-2)
      [26.1700, 90.9500], // Goalpara River Corridor
      [26.1850, 91.7200], // Pandu Port Freight Terminal (Guwahati)
      [26.0200, 89.9800], // Dhubri Port Terminal
    ],
    AIR: [
      [26.1061, 91.5859], // Guwahati LGBI Airport Cargo Terminal
      [25.7042, 91.9786], // Shillong Umroi Airport Runway
      [24.9125, 92.9789], // Silchar Kumbhirgram Airport Base
    ],
  };

  private states: Record<TransportMode, SimulationState> = {
    LAND: {
      mode: 'LAND',
      routeCoords: [],
      vehicleId: 'TRK-007',
      vehicleName: 'Heavy Logistics Volvo FH16 (12-Wheeler)',
      baseSpeedKmh: 45,
      totalDistanceKm: 102,
      currentIndex: 0,
      segmentProgress: 0,
      speedMultiplier: 1,
      isRunning: false,
      status: 'IN_TRANSIT',
      dataStatus: 'CONNECTED',
    },
    RAIL: {
      mode: 'RAIL',
      routeCoords: [],
      vehicleId: 'NFR-708',
      vehicleName: 'Northeast Frontier WAG-9 Freight Rake (42 Containers)',
      baseSpeedKmh: 65,
      totalDistanceKm: 198,
      currentIndex: 0,
      segmentProgress: 0,
      speedMultiplier: 1,
      isRunning: false,
      status: 'IN_TRANSIT',
      dataStatus: 'STATIC_DATA',
    },
    WATER: {
      mode: 'WATER',
      routeCoords: [],
      vehicleId: 'MB-BRAHMAPUTRA-04',
      vehicleName: 'IWAI Self-Propelled Cargo Vessel (Catamaran Barge)',
      baseSpeedKmh: 18,
      totalDistanceKm: 145,
      currentIndex: 0,
      segmentProgress: 0,
      speedMultiplier: 1,
      isRunning: false,
      status: 'IN_TRANSIT',
      dataStatus: 'SIMULATION',
    },
    AIR: {
      mode: 'AIR',
      routeCoords: [],
      vehicleId: 'AI-CARGO-302',
      vehicleName: 'IAF C-130J Super Hercules / BlueDart Boeing 737F',
      baseSpeedKmh: 480,
      totalDistanceKm: 210,
      currentIndex: 0,
      segmentProgress: 0,
      speedMultiplier: 1,
      isRunning: false,
      status: 'IN_TRANSIT',
      dataStatus: 'SIMULATION',
    },
  };

  constructor() {
    // Initialize default routes
    (Object.keys(this.routes) as TransportMode[]).forEach((mode) => {
      this.states[mode].routeCoords = this.routes[mode];
      this.states[mode].totalDistanceKm = this.computeTotalDistance(this.routes[mode]);
    });
  }

  private computeTotalDistance(coords: [number, number][]): number {
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      total += getDistanceKm(coords[i], coords[i + 1]);
    }
    return Math.round(total * 10) / 10;
  }

  public subscribe(subscriber: MultimodalSimulationSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.getAllTelemetry());
    if (this.subscribers.size === 1 && !this.timer) {
      this.startLoop();
    }
    return () => {
      this.subscribers.delete(subscriber);
      if (this.subscribers.size === 0 && this.timer) {
        this.stopLoop();
      }
    };
  }

  public setSpeedMultiplier(mode: TransportMode, multiplier: number) {
    if (this.states[mode]) {
      this.states[mode].speedMultiplier = multiplier;
      this.notifySubscribers();
    }
  }

  public startModeSimulation(mode: TransportMode) {
    if (this.states[mode]) {
      this.states[mode].isRunning = true;
      if (this.states[mode].status === 'ARRIVED') {
        this.resetModeSimulation(mode);
        this.states[mode].isRunning = true;
      }
      this.notifySubscribers();
    }
  }

  public pauseModeSimulation(mode: TransportMode) {
    if (this.states[mode]) {
      this.states[mode].isRunning = false;
      this.notifySubscribers();
    }
  }

  public resetModeSimulation(mode: TransportMode) {
    if (this.states[mode]) {
      this.states[mode].currentIndex = 0;
      this.states[mode].segmentProgress = 0;
      this.states[mode].isRunning = false;
      this.states[mode].status = 'IN_TRANSIT';
      this.notifySubscribers();
    }
  }

  public setCustomRoute(mode: TransportMode, routeCoords: [number, number][]) {
    if (routeCoords.length >= 2 && this.states[mode]) {
      this.states[mode].routeCoords = routeCoords;
      this.states[mode].totalDistanceKm = this.computeTotalDistance(routeCoords);
      this.states[mode].currentIndex = 0;
      this.states[mode].segmentProgress = 0;
      this.notifySubscribers();
    }
  }

  private startLoop() {
    this.timer = window.setInterval(() => {
      this.step();
    }, 1000);
  }

  private stopLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private step() {
    let changed = false;

    (Object.keys(this.states) as TransportMode[]).forEach((mode) => {
      const state = this.states[mode];
      if (!state.isRunning || state.status === 'ARRIVED') return;

      const coords = state.routeCoords;
      if (coords.length < 2) return;

      // Distance to advance per tick (1 second) based on speed and multiplier
      const effSpeed = state.baseSpeedKmh * state.speedMultiplier;
      const stepKm = (effSpeed / 3600) * 1.5; // Adjusted scaling factor for responsive simulation UI

      let p1 = coords[state.currentIndex];
      let p2 = coords[state.currentIndex + 1];
      if (!p1 || !p2) return;

      const segLenKm = Math.max(getDistanceKm(p1, p2), 0.01);
      const stepFraction = stepKm / segLenKm;

      state.segmentProgress += stepFraction;

      if (state.segmentProgress >= 1) {
        state.segmentProgress = 0;
        state.currentIndex += 1;

        if (state.currentIndex >= coords.length - 1) {
          state.currentIndex = coords.length - 1;
          state.segmentProgress = 0;
          state.status = 'ARRIVED';
          state.isRunning = false;
        }
      }
      changed = true;
    });

    if (changed || this.subscribers.size > 0) {
      this.notifySubscribers();
    }
  }

  private notifySubscribers() {
    const telemetry = this.getAllTelemetry();
    this.subscribers.forEach((sub) => sub(telemetry));
  }

  public getModeTelemetry(mode: TransportMode): VehicleTelemetry {
    const state = this.states[mode];
    const coords = state.routeCoords;

    if (!coords || coords.length === 0) {
      return {
        shipmentId: 1,
        legId: `leg-${mode.toLowerCase()}-01`,
        mode,
        vehicleId: state.vehicleId,
        vehicleName: state.vehicleName,
        latitude: 26.1445,
        longitude: 91.7362,
        heading: 0,
        speedKmh: state.baseSpeedKmh,
        progressPct: 0,
        distanceCoveredKm: 0,
        distanceTotalKm: state.totalDistanceKm,
        eta: '12:00 IST',
        status: state.status,
        dataStatus: state.dataStatus,
        timestamp: new Date().toISOString(),
      };
    }

    if (state.status === 'ARRIVED' || state.currentIndex >= coords.length - 1) {
      const last = coords[coords.length - 1];
      return {
        shipmentId: 1,
        legId: `leg-${mode.toLowerCase()}-01`,
        mode,
        vehicleId: state.vehicleId,
        vehicleName: state.vehicleName,
        latitude: last[0],
        longitude: last[1],
        heading: 0,
        speedKmh: 0,
        progressPct: 100,
        distanceCoveredKm: state.totalDistanceKm,
        distanceTotalKm: state.totalDistanceKm,
        eta: 'ARRIVED AT TERMINAL',
        status: 'ARRIVED',
        dataStatus: state.dataStatus,
        timestamp: new Date().toISOString(),
      };
    }

    const p1 = coords[state.currentIndex];
    const p2 = coords[state.currentIndex + 1] || p1;

    const lat = p1[0] + (p2[0] - p1[0]) * state.segmentProgress;
    const lng = p1[1] + (p2[1] - p1[1]) * state.segmentProgress;
    const heading = getHeading(p1, p2);

    // Compute distance covered so far
    let coveredKm = 0;
    for (let i = 0; i < state.currentIndex; i++) {
      coveredKm += getDistanceKm(coords[i], coords[i + 1]);
    }
    coveredKm += getDistanceKm(p1, p2) * state.segmentProgress;

    const totalKm = state.totalDistanceKm || 1;
    const progressPct = Math.min(Math.round((coveredKm / totalKm) * 100), 100);

    const remainingKm = Math.max(totalKm - coveredKm, 0);
    const effSpeed = state.baseSpeedKmh * Math.max(state.speedMultiplier, 1);
    const remainingHours = remainingKm / effSpeed;

    const etaTime = new Date(Date.now() + remainingHours * 3600 * 1000);
    const etaStr = etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';

    return {
      shipmentId: 1,
      legId: `leg-${mode.toLowerCase()}-01`,
      mode,
      vehicleId: state.vehicleId,
      vehicleName: state.vehicleName,
      latitude: lat,
      longitude: lng,
      heading,
      speedKmh: Math.round(state.baseSpeedKmh * (state.isRunning ? state.speedMultiplier : 0)),
      progressPct,
      distanceCoveredKm: Math.round(coveredKm * 10) / 10,
      distanceTotalKm: state.totalDistanceKm,
      eta: etaStr,
      status: state.status,
      dataStatus: state.dataStatus,
      timestamp: new Date().toISOString(),
    };
  }

  public getAllTelemetry(): Record<TransportMode, VehicleTelemetry> {
    return {
      LAND: this.getModeTelemetry('LAND'),
      RAIL: this.getModeTelemetry('RAIL'),
      WATER: this.getModeTelemetry('WATER'),
      AIR: this.getModeTelemetry('AIR'),
    };
  }

  public getState(mode: TransportMode): SimulationState {
    return this.states[mode];
  }
}

export const multimodalSimulationService = new MultimodalSimulationEngine();
