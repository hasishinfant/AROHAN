import { TransportMode, MultimodalJourney, DataStatus } from '../types';

export interface TransportTerminal {
  id: string;
  name: string;
  code: string;
  mode: TransportMode;
  latitude: number;
  longitude: number;
  type: 'WAREHOUSE' | 'RAIL_YARD' | 'INLAND_PORT' | 'AIRPORT' | 'MMLP_HUB';
  city: string;
  state: string;
  operationalStatus: 'OPERATIONAL' | 'CONGESTED' | 'DISRUPTED' | 'DEGRADED';
  capacityPct: number;
}

export interface TransportHazard {
  id: string;
  mode: TransportMode;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'LANDSLIDE' | 'FLOOD' | 'TRACK_DISRUPTION' | 'RIVER_SILTATION' | 'WEATHER_ALERT' | 'ROAD_BLOCK';
  affectedRoute: string;
}

export interface ModeMetadata {
  mode: TransportMode;
  label: string;
  dataStatus: DataStatus;
  primaryProvider: string;
  coverageRegion: string;
  totalNetworkKm: number;
  activeShipmentsCount: number;
}

// 1. Terminals across North Eastern Region
export const TERMINALS_BY_MODE: Record<TransportMode, TransportTerminal[]> = {
  LAND: [
    { id: 't-l1', name: 'Guwahati Logistics Depot', code: 'GAU-DEP', mode: 'LAND', latitude: 26.1445, longitude: 91.7362, type: 'WAREHOUSE', city: 'Guwahati', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 78 },
    { id: 't-l2', name: 'Nongpoh Transit Warehouse', code: 'NGB-WH', mode: 'LAND', latitude: 25.8900, longitude: 91.9650, type: 'WAREHOUSE', city: 'Nongpoh', state: 'Meghalaya', operationalStatus: 'OPERATIONAL', capacityPct: 62 },
    { id: 't-l3', name: 'Shillong Central Hub', code: 'SHL-HUB', mode: 'LAND', latitude: 25.5788, longitude: 91.8933, type: 'WAREHOUSE', city: 'Shillong', state: 'Meghalaya', operationalStatus: 'OPERATIONAL', capacityPct: 84 },
    { id: 't-l4', name: 'Silchar Freight Depot', code: 'SIL-DEP', mode: 'LAND', latitude: 24.8300, longitude: 92.7800, type: 'WAREHOUSE', city: 'Silchar', state: 'Assam', operationalStatus: 'CONGESTED', capacityPct: 91 },
  ],
  RAIL: [
    { id: 't-r1', name: 'Guwahati NFR Rail Goods Yard', code: 'GHY-RGY', mode: 'RAIL', latitude: 26.1750, longitude: 91.7750, type: 'RAIL_YARD', city: 'Guwahati', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 72 },
    { id: 't-r2', name: 'Jagiroad Station Rail Yard', code: 'JID-RY', mode: 'RAIL', latitude: 26.1800, longitude: 92.4000, type: 'RAIL_YARD', city: 'Jagiroad', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 55 },
    { id: 't-r3', name: 'Lumding Railway Junction', code: 'LMG-JNC', mode: 'RAIL', latitude: 25.7500, longitude: 92.8000, type: 'RAIL_YARD', city: 'Lumding', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 80 },
    { id: 't-r4', name: 'Silchar Rail Freight Yard', code: 'SCL-RFY', mode: 'RAIL', latitude: 24.8300, longitude: 92.7800, type: 'RAIL_YARD', city: 'Silchar', state: 'Assam', operationalStatus: 'CONGESTED', capacityPct: 88 },
  ],
  WATER: [
    { id: 't-w1', name: 'Jogighopa MMLP River Terminal (NW-2)', code: 'JGG-MMLP', mode: 'WATER', latitude: 26.1900, longitude: 90.5800, type: 'MMLP_HUB', city: 'Jogighopa', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 48 },
    { id: 't-w2', name: 'Goalpara River Port Terminal', code: 'GLP-PRT', mode: 'WATER', latitude: 26.1700, longitude: 90.9500, type: 'INLAND_PORT', city: 'Goalpara', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 60 },
    { id: 't-w3', name: 'Pandu Port Terminal (Guwahati)', code: 'PND-PRT', mode: 'WATER', latitude: 26.1850, longitude: 91.7200, type: 'INLAND_PORT', city: 'Guwahati', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 79 },
    { id: 't-w4', name: 'Dhubri River Cargo Terminal', code: 'DHB-PRT', mode: 'WATER', latitude: 26.0200, longitude: 89.9800, type: 'INLAND_PORT', city: 'Dhubri', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 52 },
  ],
  AIR: [
    { id: 't-a1', name: 'Guwahati LGBI Airport Air Cargo Complex', code: 'GAU-ACC', mode: 'AIR', latitude: 26.1061, longitude: 91.5859, type: 'AIRPORT', city: 'Guwahati', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 82 },
    { id: 't-a2', name: 'Shillong Umroi Airport Freight Hub', code: 'SHL-AIR', mode: 'AIR', latitude: 25.7042, longitude: 91.9786, type: 'AIRPORT', city: 'Shillong', state: 'Meghalaya', operationalStatus: 'OPERATIONAL', capacityPct: 40 },
    { id: 't-a3', name: 'Silchar Kumbhirgram Airport Base', code: 'IXS-AIR', mode: 'AIR', latitude: 24.9125, longitude: 92.9789, type: 'AIRPORT', city: 'Silchar', state: 'Assam', operationalStatus: 'OPERATIONAL', capacityPct: 65 },
    { id: 't-a4', name: 'Agartala MBB Airport Cargo Terminal', code: 'IXA-AIR', mode: 'AIR', latitude: 23.8870, longitude: 91.2405, type: 'AIRPORT', city: 'Agartala', state: 'Tripura', operationalStatus: 'OPERATIONAL', capacityPct: 70 },
  ],
};

// 2. Mode-Specific Hazards
export const HAZARDS_BY_MODE: Record<TransportMode, TransportHazard[]> = {
  LAND: [
    { id: 'h-l1', mode: 'LAND', title: 'NH-6 Landslide Silt Cut', description: 'Debris flow at km 51 Umiam Bypass sector', latitude: 25.7000, longitude: 91.8900, severity: 'HIGH', type: 'LANDSLIDE', affectedRoute: 'NH-6 Corridor' },
    { id: 'h-l2', mode: 'LAND', title: 'Nongpoh Flash Water Overflow', description: 'Heavy monsoon downpour (38mm/h) waterlogging highway', latitude: 25.8900, longitude: 91.9650, severity: 'MEDIUM', type: 'FLOOD', affectedRoute: 'NH-6 Segment 2' },
  ],
  RAIL: [
    { id: 'h-r1', mode: 'RAIL', title: 'Lumding Hills Track Soil Slumping', description: 'Heavy rain causes track bed saturation in Lumding section', latitude: 25.7500, longitude: 92.8000, severity: 'MEDIUM', type: 'TRACK_DISRUPTION', affectedRoute: 'NFR Lumding-Badarpur Line' },
  ],
  WATER: [
    { id: 'h-w1', mode: 'WATER', title: 'NW-2 Siltation Sandbar Warning', description: 'Brahmaputra river depth drop to 1.8m near Goalpara bend', latitude: 26.1700, longitude: 90.9500, severity: 'LOW', type: 'RIVER_SILTATION', affectedRoute: 'NW-2 Inland Waterway' },
  ],
  AIR: [
    { id: 'h-a1', mode: 'AIR', title: 'Monsoon Cloudbase Elevation Alert', description: 'Low cloudbase & high wind shear at Shillong Umroi Runway', latitude: 25.7042, longitude: 91.9786, severity: 'MEDIUM', type: 'WEATHER_ALERT', affectedRoute: 'Umroi Aviation Approach' },
  ],
};

// 3. Mode Metadata & Status
export const MODE_METADATA: Record<TransportMode, ModeMetadata> = {
  LAND: { mode: 'LAND', label: 'Land / Road Transport', dataStatus: 'CONNECTED', primaryProvider: 'IMD AWS Radar + OpenStreetMap Geometry', coverageRegion: 'Northeast Region (8 States)', totalNetworkKm: 4280, activeShipmentsCount: 6 },
  RAIL: { mode: 'RAIL', label: 'Rail Freight Network', dataStatus: 'STATIC_DATA', primaryProvider: 'Northeast Frontier Railway (NFR) Datasets', coverageRegion: 'Assam, Nagaland, Tripura Rail Corridors', totalNetworkKm: 2650, activeShipmentsCount: 2 },
  WATER: { mode: 'WATER', label: 'Inland Waterways (NW-2)', dataStatus: 'SIMULATION', primaryProvider: 'Inland Waterways Authority of India (IWAI) GIS', coverageRegion: 'Brahmaputra River Corridor (Jogighopa-Pandu-Dhubri)', totalNetworkKm: 891, activeShipmentsCount: 1 },
  AIR: { mode: 'AIR', label: 'Aviation Freight Corridors', dataStatus: 'SIMULATION', primaryProvider: 'AAI Airports Authority GIS Data', coverageRegion: 'Guwahati, Shillong, Silchar, Agartala Airports', totalNetworkKm: 1420, activeShipmentsCount: 1 },
};

// 4. Assam / Jogighopa Multimodal Demonstration Journey
export const JOGIGHOPA_MULTIMODAL_JOURNEY: MultimodalJourney = {
  id: 'j-mm-001',
  shipment_id: 101,
  journey_type: 'MULTIMODAL',
  legs: [
    {
      id: 'leg-01-land',
      leg_number: 1,
      mode: 'LAND',
      origin: 'Guwahati Inland Depot (Assam)',
      destination: 'Jogighopa MMLP Hub (Assam)',
      origin_coords: [26.1445, 91.7362],
      destination_coords: [26.1900, 90.5800],
      route_geometry_geojson: '',
      status: 'COMPLETED',
      scheduled_start: '06:00 IST',
      estimated_arrival: '09:15 IST',
      vehicle_id: 'TRK-007',
      vehicle_name: 'Guwahati Logistics Truck TRK-007',
      terminal_origin: 'Guwahati Logistics Depot',
      terminal_destination: 'Jogighopa MMLP Hub',
      distance_km: 142,
      speed_kmh: 48,
      progress_pct: 100,
      risk_level: 'LOW',
      data_status: 'CONNECTED',
    },
    {
      id: 'leg-02-water',
      leg_number: 2,
      mode: 'WATER',
      origin: 'Jogighopa MMLP River Terminal (NW-2)',
      destination: 'Pandu Port Terminal (Guwahati)',
      origin_coords: [26.1900, 90.5800],
      destination_coords: [26.1850, 91.7200],
      route_geometry_geojson: '',
      status: 'ACTIVE',
      scheduled_start: '09:45 IST',
      estimated_arrival: '15:30 IST',
      vehicle_id: 'MB-BRAHMAPUTRA-04',
      vehicle_name: 'IWAI Self-Propelled Cargo Vessel MB-04',
      terminal_origin: 'Jogighopa MMLP River Terminal',
      terminal_destination: 'Pandu Port Terminal',
      distance_km: 118,
      speed_kmh: 18,
      progress_pct: 42,
      risk_level: 'LOW',
      data_status: 'SIMULATION',
    },
    {
      id: 'leg-03-land',
      leg_number: 3,
      mode: 'LAND',
      origin: 'Pandu Port Terminal (Guwahati)',
      destination: 'Shillong Core Hub (Meghalaya)',
      origin_coords: [26.1850, 91.7200],
      destination_coords: [25.5788, 91.8933],
      route_geometry_geojson: '',
      status: 'PLANNED',
      scheduled_start: '16:00 IST',
      estimated_arrival: '19:15 IST',
      vehicle_id: 'TRK-014',
      vehicle_name: 'Shillong Feeder Truck TRK-014',
      terminal_origin: 'Pandu Port Terminal',
      terminal_destination: 'Shillong Central Hub',
      distance_km: 104,
      speed_kmh: 42,
      progress_pct: 0,
      risk_level: 'MEDIUM',
      data_status: 'CONNECTED',
    },
  ],
};
