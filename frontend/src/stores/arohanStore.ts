import { create } from 'zustand';
import {
  AppState,
  ScenarioStatus,
  ShipmentData,
  ResourceStockData,
  ResourceTransferData,
  OperationalAlertData,
  CorridorRiskForecastData,
  NetworkEvent,
  DecisionData,
  KPIs,
  RouteData
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

export interface CommandKpis {
  active_risk_events: number;
  predicted_disruptions: number;
  affected_corridors: number;
  resource_shortages: number;
  ai_recommendations: number;
  high_priority_actions: number;
  resource_transfers: number;
  forecast_horizon: string;
  data_notice: string;
  last_updated: string;
}

export interface FieldReportData {
  id: number;
  driver_id?: number;
  incident_type: 'LANDSLIDE' | 'FLOOD' | 'ROAD_BLOCKAGE' | 'BRIDGE_DAMAGE' | 'ACCESSIBILITY_LOSS' | 'OTHER';
  condition: 'CLEAR' | 'SLOW' | 'PARTIAL' | 'BLOCKED';
  verification_status: 'VERIFIED' | 'CORROBORATED' | 'UNVERIFIED';
  notes: string;
  lat: number;
  lon: number;
  location_name: string;
  created_at: string;
}

export interface DistrictFloodVulnerability {
  district_name: string;
  state_name: string;
  is_ner_region: boolean;
  risk_tier: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  dfsi: number;
  percent_flooded_area: number;
  permanent_water: number;
  corrected_percent_flooded_area: number;
  human_fatality: number;
  human_injured: number;
  population: number;
  mean_flood_duration_days: number;
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
    shipment_code: 'REL-001',
    cargo_type: 'Emergency Medical & Disaster Relief Supplies',
    weight_kg: 4200,
    urgency: 4,
    origin: 'Guwahati Buffer Depot (Kamrup Metro)',
    destination: 'Shillong Core Relief Hub (East Khasi Hills)',
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
    shipment_code: 'REL-002',
    cargo_type: 'Food Grains & Essential Grain Commodities',
    weight_kg: 8500,
    urgency: 5,
    origin: 'Guwahati Buffer Depot (Kamrup Metro)',
    destination: 'Silchar Strategic Depot (Cachar / Barak Valley)',
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
    shipment_code: 'REL-003',
    cargo_type: 'High-Altitude Emergency Oxygen Cylinders',
    weight_kg: 3100,
    urgency: 5,
    origin: 'Shillong Regional Reserve (Meghalaya)',
    destination: 'Agartala Disaster Store (West Tripura)',
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
    shipment_code: 'REL-004',
    cargo_type: 'Cold-Chain Vaccines & Biological Specimen',
    weight_kg: 1800,
    urgency: 4,
    origin: 'Guwahati Health Warehouse (Assam)',
    destination: 'Tezpur Hospital Reserve (Sonitpur)',
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
    shipment_code: 'REL-005',
    cargo_type: 'Infrastructure Bridge & Slope Clearance Gear',
    weight_kg: 12400,
    urgency: 3,
    origin: 'Guwahati Buffer Depot (Assam)',
    destination: 'Itanagar Highland Outpost (Arunachal Pradesh)',
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
    shipment_code: 'REL-006',
    cargo_type: 'Disaster Recovery Fuel (POL) & Micro-Generators',
    weight_kg: 6700,
    urgency: 4,
    origin: 'Silchar Supply Base (Assam)',
    destination: 'Aizawl Emergency Hub (Mizoram)',
    status: 'DISRUPTED',
    assigned_route_id: 2,
    assigned_driver_id: 6,
    planned_departure: '05:30 IST',
    planned_eta: '14:20 IST',
    updated_eta: '18:50 IST',
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_RESOURCE_STOCKS: ResourceStockData[] = [
  {
    id: 1,
    district_name: 'Kamrup Metro (Guwahati Inland Port)',
    state_name: 'Assam',
    resource_type: 'Rice & Food Grains',
    available_qty: 4500,
    required_qty: 2000,
    unit: 'MT',
    status: 'SURPLUS',
    priority: 5,
    storage_facility: 'FCI Central Grain Silos, Amingaon',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    district_name: 'East Khasi Hills (Shillong)',
    state_name: 'Meghalaya',
    resource_type: 'Rice & Food Grains',
    available_qty: 850,
    required_qty: 2400,
    unit: 'MT',
    status: 'SHORTAGE',
    priority: 5,
    storage_facility: 'Mawlai Civil Supply Godown',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    district_name: 'East Khasi Hills (Shillong Central Hub)',
    state_name: 'Meghalaya',
    resource_type: 'High-Altitude Oxygen Cylinders',
    available_qty: 620,
    required_qty: 300,
    unit: 'Cylinders',
    status: 'SURPLUS',
    priority: 5,
    storage_facility: 'NEIGRIHMS Cryogenic Storage Facility',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    district_name: 'West Tripura (Agartala)',
    state_name: 'Tripura',
    resource_type: 'High-Altitude Oxygen Cylinders',
    available_qty: 110,
    required_qty: 450,
    unit: 'Cylinders',
    status: 'CRITICAL',
    priority: 5,
    storage_facility: 'Agartala Government Medical College Store',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    district_name: 'Cachar (Silchar)',
    state_name: 'Assam',
    resource_type: 'Emergency Medical Kits',
    available_qty: 420,
    required_qty: 1500,
    unit: 'Kits',
    status: 'SHORTAGE',
    priority: 4,
    storage_facility: 'Silchar Medical College Emergency Depot',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    district_name: 'Kamrup Metro (Guwahati Medical Depot)',
    state_name: 'Assam',
    resource_type: 'Emergency Medical Kits',
    available_qty: 3800,
    required_qty: 1200,
    unit: 'Kits',
    status: 'SURPLUS',
    priority: 4,
    storage_facility: 'GMCH Central Logistics Reserve',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    district_name: 'Aizawl (Zuangtui)',
    state_name: 'Mizoram',
    resource_type: 'Disaster Recovery Fuel',
    available_qty: 48000,
    required_qty: 95000,
    unit: 'Liters',
    status: 'LOW',
    priority: 4,
    storage_facility: 'IOCL Zuangtui Strategic Depot',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    district_name: 'Papum Pare (Itanagar)',
    state_name: 'Arunachal Pradesh',
    resource_type: 'Potable Drinking Water',
    available_qty: 24000,
    required_qty: 20000,
    unit: 'Liters',
    status: 'ADEQUATE',
    priority: 3,
    storage_facility: 'Naharlagun Public Health Storage',
    data_source: 'PROTOTYPE DATA',
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_RESOURCE_TRANSFERS: ResourceTransferData[] = [
  {
    id: 101,
    transfer_code: 'TRF-00101',
    source_district: 'Kamrup Metro (Guwahati Inland Port)',
    destination_district: 'East Khasi Hills (Shillong Mawlai)',
    resource_type: 'Rice & Food Grains',
    quantity: 1200,
    unit: 'MT',
    distance_km: 128,
    route_risk_level: 'LOW_RISK',
    eta_hours: 4.2,
    recommended_route_label: 'Route B (Ridge Road via Sonapur)',
    transport_mode: 'HEAVY_ROAD_CONVOY',
    status: 'PENDING',
    reason: 'Deficit mitigation matching: Shillong reserve drops below 3-day buffer while Guwahati maintains 4,500 MT surplus.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    approved_at: null,
  },
  {
    id: 102,
    transfer_code: 'TRF-00102',
    source_district: 'Kamrup Metro (Guwahati Medical Depot)',
    destination_district: 'Cachar (Silchar)',
    resource_type: 'Emergency Medical Kits',
    quantity: 800,
    unit: 'Kits',
    distance_km: 295,
    route_risk_level: 'MODERATE',
    eta_hours: 8.5,
    recommended_route_label: 'NH-27 Haflong Bypass Corridor',
    transport_mode: 'REFRIGERATED_VAN',
    status: 'APPROVED',
    reason: 'Advance reinforcement for Silchar monsoon medical emergency reserve.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    approved_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 103,
    transfer_code: 'TRF-00103',
    source_district: 'East Khasi Hills (Shillong Central Hub)',
    destination_district: 'West Tripura (Agartala Civil Hospital)',
    resource_type: 'High-Altitude Oxygen Cylinders',
    quantity: 180,
    unit: 'Cylinders',
    distance_km: 360,
    route_risk_level: 'LOW_RISK',
    eta_hours: 11.2,
    recommended_route_label: 'Inter-State South Corridor via Karimganj',
    transport_mode: 'SPECIALIZED_GAS_CARRIER',
    status: 'DISPATCHED',
    reason: 'Emergency critical rebalance to prevent ICUs running out of oxygen.',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    approved_at: new Date(Date.now() - 12000000).toISOString(),
  },
];

export const DEFAULT_OPERATIONAL_ALERTS: OperationalAlertData[] = [
  {
    id: 1,
    alert_code: 'ALT-NER-0101',
    priority: 'CRITICAL',
    title: 'LANDSLIDE CORRIDOR RISK ALERT — NH-6 JORABAT-UMIAM ESCARPMENT',
    description: 'Continuous heavy rainfall (38.0 mm/h) and 42° slope cut between km 42-54 indicate elevated slope shear failure probability (74%). Lifeline movement at critical risk of entrapment.',
    location_district: 'East Khasi Hills (Shillong)',
    affected_corridor: 'NH-6 Jorabat → Umiam Lifeline Highway km 42–54',
    affected_resource: 'Essential Emergency Medical Supplies & High-Priority Relief Goods',
    suggested_source_district: 'Kamrup Metro (Guwahati Buffer Depot)',
    recommended_route: 'Route B (Sonapur Ridge Highland Corridor)',
    estimated_eta: '4h 15m (vs 12h+ if trapped in debris)',
    recommended_action: 'Execute immediate proactive reroute directive for Convoy REL-001 via Sonapur Ridge Bypass before forecasted slope collapse at 14:00 IST.',
    responsible_department: 'NESAC Disaster Risk Monitoring & NHIDCL Highway Operations',
    status: 'ACTIVE',
    confidence: 'HIGH',
    data_source: 'PROTOTYPE DATA',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 2,
    alert_code: 'ALT-NER-0102',
    priority: 'CRITICAL',
    title: 'INTER-DISTRICT RESOURCE REDISTRIBUTION RECOMMENDATION — FOOD GRAINS DEFICIT',
    description: 'Shillong central reserve grain stock projected to deplete below 48-hour safety buffer. Guwahati Buffer Depot maintains 4,500 MT surplus buffer.',
    location_district: 'East Khasi Hills (Shillong)',
    affected_corridor: 'Inter-State Transit Corridor B (Sonapur Ridge)',
    affected_resource: 'Rice & Staple Food Grains (1,200 MT)',
    suggested_source_district: 'Kamrup Metro (Guwahati Inland Port Silos)',
    recommended_route: 'Route B via Sonapur Ridge Highway',
    estimated_eta: '4h 30m',
    recommended_action: 'Authorize and dispatch Transfer TRF-00101 (1,200 MT Food Grains) from FCI Amingaon to Shillong Mawlai Depot to secure 7-day reserve buffer.',
    responsible_department: 'Food, Civil Supplies & Consumer Affairs / NER Disaster Management',
    status: 'ACTIVE',
    confidence: 'HIGH',
    data_source: 'PROTOTYPE DATA',
    created_at: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 3,
    alert_code: 'ALT-NER-0103',
    priority: 'HIGH',
    title: 'FLOOD DISRUPTION WARNING & DIVERSION — BARAK VALLEY MULTIMODAL CORRIDOR',
    description: 'Upstream catchment discharge has triggered flash flood surge approaching rail-road culverts along Lumding-Badarpur section. Transit risk rated 68%.',
    location_district: 'Cachar (Silchar)',
    affected_corridor: 'NH-27 / Lumding-Badarpur Rail-Road Section',
    affected_resource: 'Potable Water Treatment Consumables & Emergency Rations',
    suggested_source_district: 'Kamrup Metro Central Depot',
    recommended_route: 'Multimodal Freight: Inland Rail to Lumding Junction + Protected Truck Convoy',
    estimated_eta: '9h 40m',
    recommended_action: 'Divert surface convoys to Multimodal Rail-Road Corridor via Lumding Junction. Pre-stage pontoon bridging units at Badarpur ghat.',
    responsible_department: 'State Disaster Response Force (SDRF) Logistics Wing & Northeast Frontier Railway',
    status: 'ACTIVE',
    confidence: 'HIGH',
    data_source: 'PROTOTYPE DATA',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 4,
    alert_code: 'ALT-NER-0104',
    priority: 'HIGH',
    title: 'ROUTE ACCESSIBILITY DEGRADATION NOTICE — NH-27 HAFLONG MOUNTAIN PASS',
    description: 'Mudflow accumulation and shoulder saturation have degraded road friction coefficient by 45%. Heavy multi-axle freight vehicles face severe jackknife risk.',
    location_district: 'Dima Hasao (Haflong)',
    affected_corridor: 'NH-27 km 110–128 Borail Range Incline',
    affected_resource: 'Heavy Infrastructure Equipment & Heavy Bulk Transport',
    suggested_source_district: 'Guwahati Logistics Base',
    recommended_route: 'Daylight Convoy Escort Protocol via Haflong Bypass',
    estimated_eta: '8h 20m',
    recommended_action: 'Restrict heavy convoy transit to designated daylight pilot escorts. Enforce 25 km/h speed governor for relief vehicles above 10 MT payload.',
    responsible_department: 'Border Roads Organisation (BRO) / Assam Public Works Department',
    status: 'REVIEWED',
    confidence: 'HIGH',
    data_source: 'PROTOTYPE DATA',
    created_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 5,
    alert_code: 'ALT-NER-0105',
    priority: 'CRITICAL',
    title: 'RESOURCE SHORTAGE FORECAST & BUFFER DEPLETION — MEDICAL OXYGEN',
    description: 'Agartala Civil Hospital oxygen manifold reserve has dropped to 110 cylinders (threshold: 250 units). Depletion anticipated within 18 hours.',
    location_district: 'West Tripura (Agartala)',
    affected_corridor: 'NH-8 Inter-State Lifeline',
    affected_resource: 'High-Altitude Medical Oxygen Cylinders (180 Units)',
    suggested_source_district: 'East Khasi Hills (NEIGRIHMS Cryogenic Reserve, Shillong)',
    recommended_route: 'Southern Inter-State Highway via Karimganj',
    estimated_eta: '11h 15m',
    recommended_action: 'Approve emergency priority dispatch TRF-00103 of 180 cryogenic oxygen cylinders with armed highway pilot escort to Agartala Civil Hospital.',
    responsible_department: 'Health & Family Welfare Directorate / Emergency Medical Logistics',
    status: 'APPROVED',
    confidence: 'HIGH',
    data_source: 'PROTOTYPE DATA',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 6,
    alert_code: 'ALT-NER-0106',
    priority: 'HIGH',
    title: 'EMERGENCY STOCK PRE-POSITIONING ADVISORY — MONSOON FUEL RESERVE',
    description: 'Aizawl municipal and hospital backup diesel generator stocks are at 48,000 L (below 50% capacity) ahead of forecasted 72-hour isolated storm cycle.',
    location_district: 'Aizawl (Zuangtui Strategic Depot)',
    affected_corridor: 'Silchar-Aizawl Highway NH-306',
    affected_resource: 'Disaster Recovery Fuel (POL - Diesel & Micro-Generators)',
    suggested_source_district: 'Cachar (Silchar Supply Base)',
    recommended_route: 'NH-306 Reinforced Convoy Alignment',
    estimated_eta: '6h 45m',
    recommended_action: 'Pre-position 50,000 Liters of disaster response diesel and 20 mobile micro-generators to Zuangtui Strategic Depot before NH-306 storm window.',
    responsible_department: 'Indian Oil Corporation (Logistics Wing) & Mizoram Disaster Management Authority',
    status: 'ACTIVE',
    confidence: 'HIGH',
    data_source: 'PROTOTYPE DATA',
    created_at: new Date(Date.now() - 9000000).toISOString(),
  },
  {
    id: 7,
    alert_code: 'ALT-NER-0107',
    priority: 'MEDIUM',
    title: 'MULTI-AGENCY EMERGENCY RESPONSE DIRECTIVE — JOINT LIFELINE SECURITY',
    description: 'Simultaneous hazard escalation across NH-6 (Landslide) and NH-27 (Flood approach) necessitates coordinated multi-agency asset staging.',
    location_district: 'Regional Tri-Junction (Assam-Meghalaya-Tripura)',
    affected_corridor: 'Strategic Lifeline Network Nodes (Jorabat, Sonapur, Lumding, Badarpur)',
    affected_resource: 'Heavy Excavators, Bailey Bridge Sections & SDRF Recovery Teams',
    suggested_source_district: 'BRO Tezpur & SDRF Guwahati',
    recommended_route: 'Multi-Node Forward Staging Deployment',
    estimated_eta: '3h 00m Stage-In',
    recommended_action: 'Stage 4 JCB excavators at km 48 Umiam, position mobile Bailey bridge components at Silchar, and activate joint Indian Army-SDRF logistics liaison.',
    responsible_department: 'State Disaster Management Authorities (Assam, Meghalaya, Tripura, Mizoram) & MDoNER',
    status: 'ACTIVE',
    confidence: 'HIGH',
    data_source: 'PROTOTYPE DATA',
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

export const DEFAULT_TERRAIN_RISKS = {
  current_risks: [
    {
      id: 1,
      corridor_name: 'NH-6 Guwahati → Shillong Highway',
      state_name: 'Meghalaya',
      risk_type: 'LANDSLIDE' as const,
      severity: 'CRITICAL' as const,
      time_window: 'CURRENT' as const,
      disruption_probability: 0.74,
      confidence: 'HIGH' as const,
      affected_segment: 'Km 42–54 (Umiam Valley Cut)',
      recommended_action: 'Enforce immediate proactive diversion to Sonapur Ridge Corridor (Route B).',
      data_source: 'PROTOTYPE DATA',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      corridor_name: 'NH-27 Haflong Mountain Pass',
      state_name: 'Assam',
      risk_type: 'ROAD_ACCESSIBILITY' as const,
      severity: 'HIGH' as const,
      time_window: 'CURRENT' as const,
      disruption_probability: 0.52,
      confidence: 'MEDIUM' as const,
      affected_segment: 'Km 110–128 (Borail Range Incline)',
      recommended_action: 'Restrict multi-axle freight to daylight convoy windows.',
      data_source: 'PROTOTYPE DATA',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      corridor_name: 'Lumding → Badarpur Hill Railway Section',
      state_name: 'Assam',
      risk_type: 'FLOOD' as const,
      severity: 'MODERATE' as const,
      time_window: 'CURRENT' as const,
      disruption_probability: 0.38,
      confidence: 'HIGH' as const,
      affected_segment: 'Bridge No. 44 culvert approach',
      recommended_action: 'Maintain caution speed limit (25 km/h) for rake movement.',
      data_source: 'PROTOTYPE DATA',
      created_at: new Date().toISOString(),
    },
  ],
  forecast_risks: [
    {
      id: 4,
      corridor_name: 'NH-6 Jorabat → Umiam Incline',
      state_name: 'Meghalaya',
      risk_type: 'HEAVY_RAINFALL' as const,
      severity: 'CRITICAL' as const,
      time_window: 'FORECAST_6H' as const,
      disruption_probability: 0.86,
      confidence: 'HIGH' as const,
      affected_segment: 'Km 38–48 Escarpment',
      recommended_action: 'Prepare total corridor closure notice and stage recovery plant.',
      data_source: 'PROTOTYPE DATA',
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      corridor_name: 'Sonapur Ridge Bypass (Route B)',
      state_name: 'Assam / Meghalaya',
      risk_type: 'ROAD_ACCESSIBILITY' as const,
      severity: 'LOW' as const,
      time_window: 'FORECAST_12H' as const,
      disruption_probability: 0.22,
      confidence: 'HIGH' as const,
      affected_segment: 'Full 128 km Ridge Alignment',
      recommended_action: 'Designated primary resilient freight lifeline corridor.',
      data_source: 'PROTOTYPE DATA',
      created_at: new Date().toISOString(),
    },
    {
      id: 6,
      corridor_name: 'NW-2 Brahmaputra Riverine Route (Jogighopa → Pandu)',
      state_name: 'Assam',
      risk_type: 'OVERALL_CORRIDOR' as const,
      severity: 'LOW' as const,
      time_window: 'FORECAST_24H' as const,
      disruption_probability: 0.15,
      confidence: 'HIGH' as const,
      affected_segment: 'Inland Waterway Channel 2.5m draft',
      recommended_action: 'Operate scheduled bulk container barges to bypass roadway choke-points.',
      data_source: 'PROTOTYPE DATA',
      created_at: new Date().toISOString(),
    },
  ],
  total_active_hazards: 3,
  total_forecast_windows: 3,
  data_notice: 'Real GIS terrain layers integrated with live IMD telemetry & predictive machine learning.',
};

export const DEFAULT_COMMAND_KPIS: CommandKpis = {
  active_risk_events: 12,
  predicted_disruptions: 8,
  affected_corridors: 6,
  resource_shortages: 4,
  ai_recommendations: 18,
  high_priority_actions: 5,
  resource_transfers: 9,
  forecast_horizon: '48h',
  data_notice: 'SIMULATION / PROTOTYPE DATA',
  last_updated: new Date().toISOString(),
};

export const DEFAULT_FIELD_REPORTS: FieldReportData[] = [
  {
    id: 101,
    driver_id: 1,
    incident_type: 'LANDSLIDE',
    condition: 'BLOCKED',
    verification_status: 'VERIFIED',
    notes: 'Mud & boulder slide blocking northbound carriageway at km 48. Clearance crews deployed with 2 excavators.',
    lat: 25.682,
    lon: 91.905,
    location_name: 'NH-6 km 48 Umiam Lake Escarpment (Meghalaya)',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 102,
    driver_id: 2,
    incident_type: 'FLOOD',
    condition: 'PARTIAL',
    verification_status: 'CORROBORATED',
    notes: 'Water surging 0.4m over low-lying culvert. High-clearance relief trucks passing slowly; light vehicles turned back.',
    lat: 24.816,
    lon: 92.798,
    location_name: 'Silchar Chanderpur Approach (Cachar, Assam)',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 103,
    driver_id: 3,
    incident_type: 'ROAD_BLOCKAGE',
    condition: 'SLOW',
    verification_status: 'UNVERIFIED',
    notes: 'Heavy multi-axle freight stuck on hairpin incline. Single-lane alternating convoy in effect.',
    lat: 25.178,
    lon: 93.025,
    location_name: 'NH-27 Haflong Pass km 114 (Dima Hasao)',
    created_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 104,
    driver_id: 4,
    incident_type: 'BRIDGE_DAMAGE',
    condition: 'PARTIAL',
    verification_status: 'VERIFIED',
    notes: 'Scour observed at pier 2 after flash stream surge. Load limit capped at 12 MT payload.',
    lat: 24.045,
    lon: 92.715,
    location_name: 'Kolasib Mountain Bridge (NH-306, Mizoram)',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const DEFAULT_COMMUNICATION_LOGS = [
  {
    id: 1,
    dispatch_id: 'WA-20260905-REL-001',
    movement_code: 'REL-001',
    recipient_name: 'Rahul Kumar',
    recipient_role: 'DRIVER',
    phone_masked: '+91 98*** ***10',
    message_type: 'ROUTE_CHANGE',
    language_code: 'as',
    language_name: 'Assamese',
    message_body: '⚠️ আৰোহণ জৰুৰী সাহায্য নিৰ্দেশ: নিযুক্ত বাহন REL-001। ভূমিস্খলনৰ বাবে আপোনাৰ পথ সলনি কৰা হৈছে। নতুন পথ: Route B (Sonapur Ridge Highland Corridor)।',
    status: 'ACKNOWLEDGED',
    dispatched_by: 'REGIONAL_COMMAND',
    acknowledged_at: new Date(Date.now() - 1200000).toISOString(),
    delivery_channel: 'WHATSAPP_BUSINESS_SIMULATION',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 2,
    dispatch_id: 'WA-20260905-REL-002',
    movement_code: 'REL-002',
    recipient_name: 'Lalthanga Ralte',
    recipient_role: 'DRIVER',
    phone_masked: '+91 94*** ***44',
    message_type: 'ROAD_DISRUPTION',
    language_code: 'mizo',
    language_name: 'Mizo',
    message_body: '⚠️ AROHAN CHHIATRUP TANPUI HRIATTIRNA: Kolasib Bridge ah tui a lian avangin motor lian tan kawng khar a ni.',
    status: 'DELIVERED_SIMULATED',
    dispatched_by: 'STATE_CONTROL_MIZORAM',
    acknowledged_at: null,
    delivery_channel: 'WHATSAPP_BUSINESS_SIMULATION',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    dispatch_id: 'WA-20260905-REL-003',
    movement_code: 'REL-003',
    recipient_name: 'Baphang Lyngdoh',
    recipient_role: 'DRIVER',
    phone_masked: '+91 97*** ***82',
    message_type: 'ROUTE_CHANGE',
    language_code: 'kha',
    language_name: 'Khasi',
    message_body: '⚠️ AROHAN JINGPYNTHIKNA KYRNGIEH: La pynkylla ia ka lynti namar landslide ha NH-6.',
    status: 'ACKNOWLEDGED',
    dispatched_by: 'DISTRICT_CONTROL_RI_BHOI',
    acknowledged_at: new Date(Date.now() - 5000000).toISOString(),
    delivery_channel: 'WHATSAPP_BUSINESS_SIMULATION',
    created_at: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 4,
    dispatch_id: 'WA-20260905-REL-004',
    movement_code: 'REL-004',
    recipient_name: 'Nanao Singh',
    recipient_role: 'DRIVER',
    phone_masked: '+91 96*** ***19',
    message_type: 'FLOOD_ALERT',
    language_code: 'mni',
    language_name: 'Meitei',
    message_body: '⚠️ অৰোহান ইমর্জেন্সী রিলীফ পাউজেল: ইম্ফাল লম্বীদা ঈচাও থোক্লে, সেফ জোনদা লৈবীয়ু।',
    status: 'DELIVERED_SIMULATED',
    dispatched_by: 'STATE_CONTROL_MANIPUR',
    acknowledged_at: null,
    delivery_channel: 'WHATSAPP_BUSINESS_SIMULATION',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 5,
    dispatch_id: 'WA-20260905-REL-005',
    movement_code: 'REL-005',
    recipient_name: 'Bwrai Boro',
    recipient_role: 'DRIVER',
    phone_masked: '+91 91*** ***65',
    message_type: 'MOVEMENT_SUMMARY',
    language_code: 'brx',
    language_name: 'Bodo',
    message_body: '📋 AROHAN खौरां: थांदै REL-005। नोंथांनि मुवाया रोखा खालामबाय।',
    status: 'DELIVERED_SIMULATED',
    dispatched_by: 'LOGISTICS_COORDINATOR',
    acknowledged_at: null,
    delivery_channel: 'WHATSAPP_BUSINESS_SIMULATION',
    created_at: new Date(Date.now() - 9000000).toISOString(),
  }
];

export const DEFAULT_EVENTS: NetworkEvent[] = [
  {
    id: 1,
    event_type: 'MISSION_INITIALIZED',
    title: 'MISSION INITIALIZED: SHP-001',
    description: 'Guwahati GST Depot → Shillong Core Hub dispatched with 4,200 kg Emergency Medical Supplies.',
    triggered_by: 'Automated Dispatch System',
    scenario_step: 0,
    time_label: '08:00 IST',
    created_at: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: 2,
    event_type: 'RAINFALL_DETECTED',
    title: 'HEAVY RAINFALL INGESTED: 38.0 mm/h',
    description: 'IMD AWS Nongpoh reports intense rain band moving over Ri-Bhoi district corridor.',
    triggered_by: 'IMD AWS Stream',
    scenario_step: 1,
    time_label: '08:45 IST',
    created_at: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: 3,
    event_type: 'RISK_PREDICTED',
    title: 'DISRUPTION RISK PREDICTED: 74% (HIGH)',
    description: 'Machine Learning Risk Engine calculates 74% landslide probability on NH-6 km 42 (Umiam Valley Cut).',
    triggered_by: 'AROHAN ML Risk Engine',
    scenario_step: 2,
    time_label: '09:10 IST',
    created_at: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 4,
    event_type: 'IMPACT_CALCULATED',
    title: 'MISSION LOSS SCORE COMPUTED',
    description: 'Route A Loss Score: 88 pts (+9.4h delay) vs Route B Loss Score: 34 pts (+1.5h delay).',
    triggered_by: 'Logistics Optimization Engine',
    scenario_step: 3,
    time_label: '09:20 IST',
    created_at: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 5,
    event_type: 'RECOMMENDATION_GENERATED',
    title: 'ACTION CARD #102 ISSUED',
    description: 'Proactive rerouting recommended: Divert SHP-001 via Sonapur Ridge Bypass (Route B).',
    triggered_by: 'Decision Engine',
    scenario_step: 4,
    time_label: '09:30 IST',
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 6,
    event_type: 'DECISION_APPROVED',
    title: 'PROACTIVE REROUTE APPROVED',
    description: 'Dispatcher Arjun Sharma approved Action Card #102 for immediate driver notification.',
    triggered_by: 'Dispatcher (Arjun Sharma)',
    scenario_step: 5,
    time_label: '09:42 IST',
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 7,
    event_type: 'DRIVER_NOTIFIED',
    title: 'DRIVER NOTIFIED VIA MOBILE PWA',
    description: 'Turn-by-turn bypass instructions and audio advisory transmitted to driver Rahul Kumar.',
    triggered_by: 'WebSocket Gateway',
    scenario_step: 6,
    time_label: '09:44 IST',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 8,
    event_type: 'DRIVER_ACKNOWLEDGED',
    title: 'DRIVER ACKNOWLEDGED ROUTE B',
    description: 'Driver verified Sonapur Ridge waypoint routing on onboard mobile console.',
    triggered_by: 'Driver (Rahul Kumar)',
    scenario_step: 7,
    time_label: '09:48 IST',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const DEFAULT_CURRENT_DECISION: DecisionData = {
  id: 102,
  shipment_id: 1,
  current_route_id: 1,
  recommended_route_id: 2,
  approved_route_id: 2,
  status: 'PENDING',
  dispatcher_id: 1,
  reason: 'Proactive diversion via Sonapur Ridge Corridor (Route B) bypasses severe landslide threat on NH-6 km 42, avoiding 5.9h estimated delay.',
  mission_score_current: 88,
  mission_score_recommended: 34,
  disruption_probability: 0.74,
  expected_delay_h: 5.9,
  confidence: 'HIGH',
  horizon_h: 18,
  decision_type: 'PROACTIVE',
  modifier_notes: 'Driver acknowledged bypass via Mobile PWA.',
  created_at: new Date(Date.now() - 1800000).toISOString(),
  approved_at: null,
};

export const DEFAULT_KPIS: KPIs = {
  delay_avoided_h: 5.9,
  risk_exposure_reduced_pct: 57,
  decision_latency_sec: 14,
  driver_acknowledged: true,
  replan_count: 1,
  proactive_actions: 2,
  reactive_actions: 0,
};

export const DEFAULT_ROUTES: RouteData[] = [
  {
    id: 1,
    label: 'A',
    name: 'Route A — NH-6 via Jorabat–Umiam',
    origin: 'Guwahati GST Depot',
    destination: 'Shillong Core Hub',
    distance_km: 102.0,
    base_duration_h: 3.0,
    geometry_geojson: '',
    slope_factor: 0.70,
    historical_disruption_index: 0.80,
    vulnerability_score: 0.70,
    via_description: 'Via Khanapara → Jorabat → Byrnihat → Umiam → Nongpoh',
  },
  {
    id: 2,
    label: 'B',
    name: 'Route B — Ridge Road via Sonapur',
    origin: 'Guwahati GST Depot',
    destination: 'Shillong Core Hub',
    distance_km: 128.0,
    base_duration_h: 4.2,
    geometry_geojson: '',
    slope_factor: 0.30,
    historical_disruption_index: 0.20,
    vulnerability_score: 0.30,
    via_description: 'Via Sonapur → Ridge road → Upper Shillong approach',
  }
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
  commandKpis: CommandKpis;
  fieldReports: FieldReportData[];
  corridorRiskForecasts: CorridorRiskForecastData[];
  floodVulnerabilities: DistrictFloodVulnerability[];
  floodSummary: any;

  // Multi-Level Coordination & WhatsApp Dispatch
  activeRoleLevel: number;
  setActiveRoleLevel: (level: number) => void;
  isWhatsAppModalOpen: boolean;
  whatsAppModalContext: any;
  openWhatsAppModal: (context?: any) => void;
  closeWhatsAppModal: () => void;
  communicationLogs: any[];

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
  fetchCommandKpis: () => Promise<void>;
  fetchFieldReports: () => Promise<void>;
  fetchCorridorRiskForecasts: () => Promise<void>;
  fetchFloodVulnerabilities: (nerOnly?: boolean) => Promise<void>;
  fetchCommunicationHistory: () => Promise<void>;
  sendWhatsAppMessage: (data: any) => Promise<any>;
  acknowledgeWhatsAppMessage: (dispatchId: string) => Promise<any>;
  reportDriverIssue: (data: any) => Promise<any>;
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
  shipment: DEFAULT_SHIPMENTS[0],
  routes: DEFAULT_ROUTES,
  current_decision: DEFAULT_CURRENT_DECISION,
  kpis: DEFAULT_KPIS,
  events: DEFAULT_EVENTS,
  gpsUpdate: gpsSimulationService.getLastUpdate(),
  resourceStocks: DEFAULT_RESOURCE_STOCKS,
  resourceTransfers: DEFAULT_RESOURCE_TRANSFERS,
  operationalAlerts: DEFAULT_OPERATIONAL_ALERTS,
  terrainRisks: DEFAULT_TERRAIN_RISKS,
  commandKpis: DEFAULT_COMMAND_KPIS,
  fieldReports: DEFAULT_FIELD_REPORTS,
  corridorRiskForecasts: DEFAULT_TERRAIN_RISKS.current_risks,
  floodVulnerabilities: [],
  floodSummary: null,

  activeRoleLevel: 1,
  setActiveRoleLevel: (level: number) => set({ activeRoleLevel: level }),
  isWhatsAppModalOpen: false,
  whatsAppModalContext: null,
  openWhatsAppModal: (context = null) => set({ isWhatsAppModalOpen: true, whatsAppModalContext: context }),
  closeWhatsAppModal: () => set({ isWhatsAppModalOpen: false, whatsAppModalContext: null }),
  communicationLogs: DEFAULT_COMMUNICATION_LOGS,

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
      get().fetchCommandKpis();
      get().fetchFieldReports();
      get().fetchCorridorRiskForecasts();
      get().fetchFloodVulnerabilities();
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

  fetchCommandKpis: async () => {
    try {
      const data = await patch('/command/kpis', 'GET');
      if (data) {
        set({ commandKpis: data });
      }
    } catch (e) {
      console.warn('Failed to fetch command KPIs:', e);
    }
  },

  fetchFieldReports: async () => {
    try {
      const data = await patch('/field-reports', 'GET');
      if (Array.isArray(data) && data.length > 0) {
        set({ fieldReports: data });
      }
    } catch (e) {
      console.warn('Failed to fetch field reports:', e);
    }
  },

  fetchCorridorRiskForecasts: async () => {
    try {
      const data = await patch('/corridors/risk-forecasts', 'GET');
      if (Array.isArray(data) && data.length > 0) {
        set({ corridorRiskForecasts: data });
      }
    } catch (e) {
      console.warn('Failed to fetch corridor forecasts:', e);
    }
  },

  fetchFloodVulnerabilities: async (nerOnly = true) => {
    try {
      const [listRes, sumRes] = await Promise.all([
        patch(`/data/flood-vulnerability?ner_only=${nerOnly}&limit=200`, 'GET'),
        patch('/data/flood-vulnerability/summary', 'GET'),
      ]);
      set({
        floodVulnerabilities: listRes?.data || [],
        floodSummary: sumRes || null,
      });
    } catch (e) {
      console.warn('Failed to fetch flood vulnerability data:', e);
    }
  },

  fetchCommunicationHistory: async () => {
    try {
      const data = await patch('/communications/history', 'GET');
      if (Array.isArray(data) && data.length > 0) {
        set({ communicationLogs: data });
      }
    } catch (e) {
      console.warn('Failed to fetch communication history:', e);
    }
  },

  sendWhatsAppMessage: async (data: any) => {
    try {
      const res = await patch('/communications/send', 'POST', data);
      await get().fetchCommunicationHistory();
      return res;
    } catch (e) {
      console.warn('Failed to send WhatsApp message:', e);
      throw e;
    }
  },

  acknowledgeWhatsAppMessage: async (dispatchId: string) => {
    try {
      const res = await patch(`/communications/acknowledge/${dispatchId}`, 'POST');
      await get().fetchCommunicationHistory();
      return res;
    } catch (e) {
      console.warn('Failed to acknowledge message:', e);
    }
  },

  reportDriverIssue: async (data: any) => {
    try {
      const res = await patch('/driver/report-issue', 'POST', data);
      await get().fetchFieldReports();
      return res;
    } catch (e) {
      console.warn('Failed to report driver issue:', e);
      throw e;
    }
  },
}));
