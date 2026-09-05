export type TransportMode = 'LAND' | 'RAIL' | 'WATER' | 'AIR';

export type DataSourceStatus =
  | 'CONNECTED'
  | 'STATIC_DATA'
  | 'SIMULATION'
  | 'NOT_CONFIGURED'
  | 'DEGRADED';

export type LegStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED' | 'DISRUPTED';

export interface MultimodalLeg {
  id: string;
  legNumber: number;
  mode: TransportMode;
  origin: string;
  destination: string;
  originCoords: [number, number];
  destCoords: [number, number];
  routeCoords: [number, number][];
  vehicleId: string;
  vehicleName: string;
  vehicleType: string;
  distance_km: number;
  estimated_duration_h: number;
  status: LegStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  disruptionProbability: number;
  hazardName?: string;
  hazardCoords?: [number, number];
  dataSourceStatus: DataSourceStatus;
  description: string;
}

export interface MultimodalJourney {
  id: string;
  shipmentCode: string;
  corridorName: string;
  origin: string;
  destination: string;
  type: 'ROAD_ONLY' | 'MULTIMODAL';
  activeMode: TransportMode;
  currentLegIndex: number;
  legs: MultimodalLeg[];
  totalDistanceKm: number;
  totalEstimatedHours: number;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface MultimodalNetworkConfig {
  mode: TransportMode;
  title: string;
  subtitle: string;
  iconName: string;
  dataSourceStatus: DataSourceStatus;
  statusDetails: string;
  primaryCorridor: string;
  originHub: string;
  destHub: string;
  centerCoords: [number, number];
  zoom: number;
  routeCoords: [number, number][];
  vehicleId: string;
  vehicleName: string;
  hazardName: string;
  hazardCoords: [number, number];
  hazardType: string;
  terminals: {
    name: string;
    type: 'WAREHOUSE' | 'RAIL_TERMINAL' | 'INLAND_PORT' | 'AIRPORT' | 'MMLP';
    coords: [number, number];
    state: string;
  }[];
}
