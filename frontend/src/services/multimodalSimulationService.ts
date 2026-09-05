import { TransportMode, DataSourceStatus } from '../types/multimodalTypes';
import { MULTIMODAL_NETWORKS } from '../config/multimodalRoutes';

export interface MultimodalGPSUpdate {
  mode: TransportMode;
  shipmentCode: string;
  vehicleId: string;
  vehicleName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  heading_deg: number;
  heading_cardinal: string;
  progress_pct: number;
  distance_covered_km: number;
  distance_remaining_km: number;
  total_distance_km: number;
  eta_formatted: string;
  current_location_name: string;
  current_risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  upcoming_risk: string | null;
  distance_to_hazard_km: number;
  hazard_name: string;
  hazard_approach_state: 'NORMAL' | 'UPCOMING' | 'WARNING' | 'CRITICAL_DECISION';
  simulated_status: 'SCHEDULED' | 'DEPARTED' | 'IN_TRANSIT' | 'APPROACHING_DESTINATION' | 'DELIVERED';
  dataSourceStatus: DataSourceStatus;
}

type MultimodalGPSCallback = (update: MultimodalGPSUpdate) => void;

function getHaversineDistanceKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371;
  const dLat = (coord2[1] - coord1[1]) * (Math.PI / 180);
  const dLng = (coord2[0] - coord1[0]) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[1] * (Math.PI / 180)) *
      Math.cos(coord2[1] * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getBearingDeg(coord1: [number, number], coord2: [number, number]): number {
  const lat1 = coord1[1] * (Math.PI / 180);
  const lat2 = coord2[1] * (Math.PI / 180);
  const dLng = (coord2[0] - coord1[0]) * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function getCardinalDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  return directions[idx];
}

class MultimodalSimulationService {
  private activeMode: TransportMode = 'LAND';
  private currentDistanceKm: Record<TransportMode, number> = {
    LAND: 0,
    RAIL: 0,
    WATER: 0,
    AIR: 0,
  };
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private simSpeedMultiplier: number = 20; // Valid: 1, 5, 10, 20, 50, 100

  private animFrameId: number | null = null;
  private lastTimestamp: number | null = null;

  private subscribers: Set<MultimodalGPSCallback> = new Set();
  private lastUpdates: Record<TransportMode, MultimodalGPSUpdate | null> = {
    LAND: null,
    RAIL: null,
    WATER: null,
    AIR: null,
  };

  constructor() {
    this.reset('LAND');
  }

  public setMode(mode: TransportMode) {
    if (this.activeMode !== mode) {
      this.activeMode = mode;
      if (!this.lastUpdates[mode]) {
        this.emitUpdate(mode);
      } else {
        this.emitUpdate(mode);
      }
    }
  }

  public getActiveMode(): TransportMode {
    return this.activeMode;
  }

  public setSpeedMultiplier(multiplier: number) {
    const validSpeeds = [1, 5, 10, 20, 50, 100];
    if (validSpeeds.includes(multiplier)) {
      this.simSpeedMultiplier = multiplier;
    } else {
      this.simSpeedMultiplier = 20;
    }
    this.emitUpdate(this.activeMode);
  }

  public getSpeedMultiplier(): number {
    return this.simSpeedMultiplier;
  }

  public subscribe(callback: MultimodalGPSCallback): () => void {
    this.subscribers.add(callback);
    const update = this.lastUpdates[this.activeMode];
    if (update) {
      callback(update);
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public start() {
    if (this.isRunning && !this.isPaused) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.animFrameId = requestAnimationFrame((ts) => this.loop(ts));
    this.emitUpdate(this.activeMode);
  }

  public pause() {
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.lastTimestamp = null;
    this.emitUpdate(this.activeMode);
  }

  public resume() {
    if (this.isRunning && this.isPaused) {
      this.start();
    }
  }

  public reset(mode?: TransportMode) {
    const targetMode = mode || this.activeMode;

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.isRunning = false;
    this.isPaused = false;
    this.currentDistanceKm[targetMode] = 0;
    this.lastTimestamp = null;

    this.emitUpdate(targetMode);
  }

  public getLastUpdate(mode?: TransportMode): MultimodalGPSUpdate | null {
    return this.lastUpdates[mode || this.activeMode];
  }

  public isSimulating(): boolean {
    return this.isRunning && !this.isPaused;
  }

  private loop(timestamp: number) {
    if (!this.isRunning || this.isPaused) {
      this.animFrameId = null;
      return;
    }

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const deltaSeconds = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    const mode = this.activeMode;
    const config = MULTIMODAL_NETWORKS[mode] || MULTIMODAL_NETWORKS.LAND;
    const coords = config.routeCoords;
    const totalDistKm = this.calculateTotalDistance(coords);

    // Mode-specific base speeds in km/h
    let baseSpeedKmh = 60;
    if (mode === 'RAIL') baseSpeedKmh = 50;
    else if (mode === 'WATER') baseSpeedKmh = 24;
    else if (mode === 'AIR') baseSpeedKmh = 450;

    const kmPerSecond = (baseSpeedKmh / 3600) * this.simSpeedMultiplier;
    const stepDistance = kmPerSecond * deltaSeconds;

    this.currentDistanceKm[mode] += stepDistance;

    if (this.currentDistanceKm[mode] >= totalDistKm) {
      this.currentDistanceKm[mode] = totalDistKm;
      this.isRunning = false;
      this.isPaused = false;
      this.animFrameId = null;
      this.emitUpdate(mode);
      return; // Finite completion - stop cleanly!
    }

    this.emitUpdate(mode);
    this.animFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  private calculateTotalDistance(coords: [number, number][]): number {
    let dist = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      dist += getHaversineDistanceKm(coords[i], coords[i + 1]);
    }
    return Math.max(dist, 0.001);
  }

  private emitUpdate(mode: TransportMode) {
    const config = MULTIMODAL_NETWORKS[mode] || MULTIMODAL_NETWORKS.LAND;
    const coords = config.routeCoords;

    const cumulativeDistances: number[] = [0];
    for (let i = 0; i < coords.length - 1; i++) {
      const segDist = getHaversineDistanceKm(coords[i], coords[i + 1]);
      cumulativeDistances.push(cumulativeDistances[i] + segDist);
    }

    const totalDistanceKm = cumulativeDistances[cumulativeDistances.length - 1] || 1;
    const coveredKm = Math.min(Math.max(this.currentDistanceKm[mode] || 0, 0), totalDistanceKm);
    const remainingKm = Math.max(0, totalDistanceKm - coveredKm);
    const progressPct = Math.min(100, Math.round((coveredKm / totalDistanceKm) * 100));

    let segIdx = 0;
    while (segIdx < cumulativeDistances.length - 2 && cumulativeDistances[segIdx + 1] <= coveredKm) {
      segIdx++;
    }

    const segStartDist = cumulativeDistances[segIdx];
    const segEndDist = cumulativeDistances[segIdx + 1] || segStartDist + 0.0001;
    const segLen = Math.max(segEndDist - segStartDist, 0.0001);
    const fraction = Math.min(1, Math.max(0, (coveredKm - segStartDist) / segLen));

    const p1 = coords[segIdx];
    const p2 = coords[Math.min(segIdx + 1, coords.length - 1)];

    const lng = p1[0] + fraction * (p2[0] - p1[0]);
    const lat = p1[1] + fraction * (p2[1] - p1[1]);

    const headingDeg = Math.round(getBearingDeg(p1, p2));
    const cardinalDir = getCardinalDirection(headingDeg);

    const distToHazardKm = Number(getHaversineDistanceKm([lng, lat], config.hazardCoords).toFixed(1));

    let baseSpeedKmh = 60;
    if (mode === 'RAIL') baseSpeedKmh = 50;
    else if (mode === 'WATER') baseSpeedKmh = 24;
    else if (mode === 'AIR') baseSpeedKmh = 450;

    let hazardApproachState: MultimodalGPSUpdate['hazard_approach_state'] = 'NORMAL';
    if (distToHazardKm <= 30) {
      if (distToHazardKm <= 5) hazardApproachState = 'CRITICAL_DECISION';
      else if (distToHazardKm <= 10) hazardApproachState = 'WARNING';
      else if (distToHazardKm <= 25) hazardApproachState = 'UPCOMING';
    }

    let riskLevel: MultimodalGPSUpdate['current_risk_level'] = 'LOW';
    let upcomingRisk: string | null = null;

    if (distToHazardKm <= 15) {
      riskLevel = distToHazardKm <= 5 ? 'HIGH' : 'MEDIUM';
      upcomingRisk = `⚠ ${config.hazardName} (${distToHazardKm} km) — ${config.hazardType}`;
    }

    let status: MultimodalGPSUpdate['simulated_status'] = 'IN_TRANSIT';
    if (progressPct === 0) status = 'SCHEDULED';
    else if (progressPct < 5) status = 'DEPARTED';
    else if (progressPct >= 100) status = 'DELIVERED';
    else if (progressPct >= 85) status = 'APPROACHING_DESTINATION';

    const remainingHours = baseSpeedKmh > 0 ? remainingKm / baseSpeedKmh : 0;
    const now = new Date();
    const etaDate = new Date(now.getTime() + remainingHours * 3600 * 1000);
    const etaFormatted = `${String(etaDate.getHours()).padStart(2, '0')}:${String(etaDate.getMinutes()).padStart(2, '0')} IST`;

    let locationName = `${config.primaryCorridor}`;
    if (progressPct < 10) locationName = `${config.originHub} Departure`;
    else if (distToHazardKm <= 5) locationName = `${config.hazardName} Hazard Zone`;
    else if (progressPct >= 90) locationName = `${config.destHub} Arrival Sector`;

    const update: MultimodalGPSUpdate = {
      mode,
      shipmentCode: `SHP-${mode}-001`,
      vehicleId: config.vehicleId,
      vehicleName: config.vehicleName,
      timestamp: new Date().toLocaleTimeString(),
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      speed_kmh: baseSpeedKmh,
      heading_deg: headingDeg,
      heading_cardinal: cardinalDir,
      progress_pct: progressPct,
      distance_covered_km: Number(coveredKm.toFixed(1)),
      distance_remaining_km: Number(remainingKm.toFixed(1)),
      total_distance_km: Number(totalDistanceKm.toFixed(1)),
      eta_formatted: etaFormatted,
      current_location_name: locationName,
      current_risk_level: riskLevel,
      upcoming_risk: upcomingRisk,
      distance_to_hazard_km: distToHazardKm,
      hazard_name: config.hazardName,
      hazard_approach_state: hazardApproachState,
      simulated_status: status,
      dataSourceStatus: config.dataSourceStatus,
    };

    this.lastUpdates[mode] = update;
    if (mode === this.activeMode) {
      this.subscribers.forEach((cb) => cb(update));
    }
  }
}

export const multimodalSimulationService = new MultimodalSimulationService();
