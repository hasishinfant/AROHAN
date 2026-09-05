import { SHIPMENT_MAP_CONFIGS } from '../config/shipmentRoutes';

export interface GPSUpdate {
  shipmentId: number;
  shipmentCode: string;
  truckId: string;
  containerId: string;
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
  hazard_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hazard_approach_state: 'NORMAL' | 'UPCOMING' | 'WARNING' | 'CRITICAL_DECISION';
  reroute_recommended: boolean;
  active_route_label: 'A' | 'B';
  simulated_status: 'SCHEDULED' | 'DEPARTED' | 'IN_TRANSIT' | 'APPROACHING_DESTINATION' | 'DELIVERED';
  source: 'SIMULATION' | 'LIVE_WEBSOCKET';
}

type GPSCallback = (update: GPSUpdate) => void;

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

class GPSSimulationService {
  private activeShipmentId: number = 1;
  private currentDistanceKm: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private simSpeedMultiplier: number = 20; // Whitelisted: 1, 5, 10, 20, 50, 100
  private activeRouteLabel: 'A' | 'B' = 'A';
  private rerouteAccepted: boolean = false;

  private animFrameId: number | null = null;
  private lastTimestamp: number | null = null;

  private subscribers: Set<GPSCallback> = new Set();
  private lastUpdate: GPSUpdate | null = null;

  constructor() {
    this.reset(1);
  }

  public setShipment(shipmentId: number) {
    if (this.activeShipmentId !== shipmentId) {
      this.activeShipmentId = shipmentId;
      this.reset(shipmentId);
    }
  }

  public setSpeedMultiplier(multiplier: number) {
    // Whitelisted valid speed multipliers: 1, 5, 10, 20, 50, 100
    const validSpeeds = [1, 5, 10, 20, 50, 100];
    if (validSpeeds.includes(multiplier)) {
      this.simSpeedMultiplier = multiplier;
    } else {
      this.simSpeedMultiplier = 20;
    }

    if (this.lastUpdate) {
      this.emitUpdate();
    }
  }

  public getSpeedMultiplier(): number {
    return this.simSpeedMultiplier;
  }

  public acceptReroute() {
    this.activeRouteLabel = 'B';
    this.rerouteAccepted = true;
    this.emitUpdate();
  }

  public keepCurrentRoute() {
    this.activeRouteLabel = 'A';
    this.rerouteAccepted = false;
    this.emitUpdate();
  }

  public subscribe(callback: GPSCallback): () => void {
    this.subscribers.add(callback);
    if (this.lastUpdate) {
      callback(this.lastUpdate);
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

    // Cancel any old animation loop to prevent duplicate frames
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.animFrameId = requestAnimationFrame((ts) => this.loop(ts));
    this.emitUpdate();
  }

  public pause() {
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.lastTimestamp = null;
    this.emitUpdate();
  }

  public resume() {
    if (this.isRunning && this.isPaused) {
      this.start();
    }
  }

  public reset(shipmentId?: number) {
    if (shipmentId) {
      this.activeShipmentId = shipmentId;
    }

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.isRunning = false;
    this.isPaused = false;
    this.currentDistanceKm = 0;
    this.activeRouteLabel = 'A';
    this.rerouteAccepted = false;
    this.lastTimestamp = null;

    this.emitUpdate();
  }

  public getLastUpdate(): GPSUpdate | null {
    return this.lastUpdate;
  }

  public isSimulating(): boolean {
    return this.isRunning && !this.isPaused;
  }

  public getStatus(): { isRunning: boolean; isPaused: boolean; progress: number } {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      progress: this.lastUpdate ? this.lastUpdate.progress_pct : 0,
    };
  }

  private loop(timestamp: number) {
    if (!this.isRunning || this.isPaused) {
      this.animFrameId = null;
      return;
    }

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    // Delta time in seconds (capped at 0.1s max to prevent large jumps if tab was backgrounded)
    const deltaSeconds = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    const config = SHIPMENT_MAP_CONFIGS[this.activeShipmentId] || SHIPMENT_MAP_CONFIGS[1];
    const coords = this.activeRouteLabel === 'B' ? config.routeBCoords : config.routeACoords;
    const totalDistKm = this.calculateTotalDistance(coords);

    // Base simulated speed: 60 km/h
    // Speed in km/sec = (60 / 3600) * multiplier
    const kmPerSecond = (60 / 3600) * this.simSpeedMultiplier;
    const stepDistance = kmPerSecond * deltaSeconds;

    this.currentDistanceKm += stepDistance;

    // Finite route completion check
    if (this.currentDistanceKm >= totalDistKm) {
      this.currentDistanceKm = totalDistKm;
      this.isRunning = false;
      this.isPaused = false;
      this.animFrameId = null;
      this.emitUpdate();
      return; // STOP! Absolutely NO looping or modulo wrapping!
    }

    this.emitUpdate();

    // Schedule next animation frame
    this.animFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  private calculateTotalDistance(coords: [number, number][]): number {
    let dist = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      dist += getHaversineDistanceKm(coords[i], coords[i + 1]);
    }
    return Math.max(dist, 0.001);
  }

  private emitUpdate() {
    const config = SHIPMENT_MAP_CONFIGS[this.activeShipmentId] || SHIPMENT_MAP_CONFIGS[1];
    const coords = this.activeRouteLabel === 'B' ? config.routeBCoords : config.routeACoords;

    // Calculate segment cumulative distances along active route
    const cumulativeDistances: number[] = [0];
    for (let i = 0; i < coords.length - 1; i++) {
      const segDist = getHaversineDistanceKm(coords[i], coords[i + 1]);
      cumulativeDistances.push(cumulativeDistances[i] + segDist);
    }

    const totalDistanceKm = cumulativeDistances[cumulativeDistances.length - 1] || 1;
    const coveredKm = Math.min(Math.max(this.currentDistanceKm, 0), totalDistanceKm);
    const remainingKm = Math.max(0, totalDistanceKm - coveredKm);
    const progressPct = Math.min(100, Math.round((coveredKm / totalDistanceKm) * 100));

    // Find current route segment
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

    // Dynamic distance to hazard
    const distToHazardKm = Number(getHaversineDistanceKm([lng, lat], config.hazardCoords).toFixed(1));
    const isRouteA = this.activeRouteLabel === 'A';
    const nearHazard = isRouteA && distToHazardKm < 15;

    const currentSpeedKmh = (nearHazard && isRouteA) ? 36 : 60;

    // Hazard approach state thresholds
    let hazardApproachState: GPSUpdate['hazard_approach_state'] = 'NORMAL';
    if (isRouteA && distToHazardKm <= 35) {
      if (distToHazardKm <= 5) hazardApproachState = 'CRITICAL_DECISION';
      else if (distToHazardKm <= 10) hazardApproachState = 'WARNING';
      else if (distToHazardKm <= 30) hazardApproachState = 'UPCOMING';
    }

    let riskLevel: GPSUpdate['current_risk_level'] = 'LOW';
    let upcomingRisk: string | null = null;
    let rerouteRecommended = false;

    if (isRouteA && distToHazardKm <= 20) {
      riskLevel = distToHazardKm <= 6 ? 'HIGH' : 'MEDIUM';
      upcomingRisk = `⚠ ${config.hazardName} Ahead (${distToHazardKm} km) — Exposure Risk 78%`;
      rerouteRecommended = true;
    } else if (this.activeRouteLabel === 'B') {
      riskLevel = 'LOW';
      upcomingRisk = 'Sonapur Ridge Bypass Active — Exposure 12%';
      rerouteRecommended = false;
    }

    // Status mapping
    let status: GPSUpdate['simulated_status'] = 'IN_TRANSIT';
    if (progressPct === 0) status = 'SCHEDULED';
    else if (progressPct < 5) status = 'DEPARTED';
    else if (progressPct >= 100) status = 'DELIVERED';
    else if (progressPct >= 85) status = 'APPROACHING_DESTINATION';

    // ETA calculation
    const remainingHours = currentSpeedKmh > 0 ? remainingKm / currentSpeedKmh : 0;
    const now = new Date();
    const etaDate = new Date(now.getTime() + remainingHours * 3600 * 1000);
    const etaFormatted = `${String(etaDate.getHours()).padStart(2, '0')}:${String(etaDate.getMinutes()).padStart(2, '0')} IST`;

    let locationName = `${config.corridorLabel} Corridor`;
    if (progressPct < 10) locationName = `${config.originName.split(' ')[0]} Departure Hub`;
    else if (this.activeRouteLabel === 'B') locationName = 'Sonapur Ridge Alternative Bypass';
    else if (nearHazard) locationName = `${config.hazardName.split(' ')[0]} Landslide Sector`;
    else if (progressPct >= 90) locationName = `${config.destName.split(' ')[0]} Arrival Sector`;

    const update: GPSUpdate = {
      shipmentId: config.id,
      shipmentCode: config.shipmentCode,
      truckId: config.truckId,
      containerId: config.containerId,
      timestamp: new Date().toLocaleTimeString(),
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      speed_kmh: currentSpeedKmh,
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
      hazard_severity: config.id === 1 ? 'HIGH' : 'MEDIUM',
      hazard_approach_state: hazardApproachState,
      reroute_recommended: rerouteRecommended,
      active_route_label: this.activeRouteLabel,
      simulated_status: status,
      source: 'SIMULATION',
    };

    this.lastUpdate = update;
    this.subscribers.forEach((cb) => cb(update));
  }
}

export const gpsSimulationService = new GPSSimulationService();
