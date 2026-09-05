import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useArohanStore } from '../stores/arohanStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layers,
  Search,
  Crosshair,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Compass,
  X,
  Zap,
  Sliders,
  MessageSquare,
  RefreshCw,
  Eye,
  EyeOff,
  Truck,
  Shield,
  CheckCircle2,
  Navigation
} from 'lucide-react';

// ── 1. Strategic NER Logistics Hubs ──────────────────────────────────────────
export interface NerHub {
  id: string;
  name: string;
  state: string;
  coords: [number, number];
  type: 'SURPLUS' | 'SHORTAGE' | 'LOW' | 'ADEQUATE';
  resource: string;
  status: string;
  contactAgency: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
}

const NER_HUBS: NerHub[] = [
  {
    id: 'kamrup',
    name: 'Kamrup Metro (Guwahati)',
    state: 'Assam',
    coords: [91.7362, 26.1445],
    type: 'SURPLUS',
    resource: 'Rice & Food Grains (4,500 MT Buffer)',
    status: 'Surplus Central Buffer Depot',
    contactAgency: 'FCI Regional Warehouse Guwahati',
    priority: 'NORMAL',
  },
  {
    id: 'shillong',
    name: 'East Khasi Hills (Shillong)',
    state: 'Meghalaya',
    coords: [91.8933, 25.5788],
    type: 'SHORTAGE',
    resource: 'Food Grains (-1,200 MT Deficit)',
    status: 'Critical Shortage — Convoy En Route',
    contactAgency: 'Meghalaya State Disaster Management (SDMA)',
    priority: 'CRITICAL',
  },
  {
    id: 'silchar',
    name: 'Cachar (Silchar)',
    state: 'Assam',
    coords: [92.7989, 24.8166],
    type: 'SHORTAGE',
    resource: 'Emergency Medical Kits (-1,080 Deficit)',
    status: 'Flood Risk Shortage Alert',
    contactAgency: 'District Emergency Operations Center Cachar',
    priority: 'CRITICAL',
  },
  {
    id: 'aizawl',
    name: 'Aizawl Strategic Hub',
    state: 'Mizoram',
    coords: [92.7176, 23.7271],
    type: 'LOW',
    resource: 'Disaster Recovery Fuel (48,000 L Reserve)',
    status: 'Low Buffer Warning (NH-306 Slowdown)',
    contactAgency: 'Mizoram Civil Supplies & Disaster Dept',
    priority: 'HIGH',
  },
  {
    id: 'agartala',
    name: 'West Tripura (Agartala)',
    state: 'Tripura',
    coords: [91.2868, 23.8315],
    type: 'SHORTAGE',
    resource: 'Medical Oxygen (-140 Cylinders)',
    status: 'Shortage Warning',
    contactAgency: 'Tripura Health Logistics Directorate',
    priority: 'HIGH',
  },
  {
    id: 'itanagar',
    name: 'Papum Pare (Itanagar)',
    state: 'Arunachal Pradesh',
    coords: [93.6053, 27.0844],
    type: 'ADEQUATE',
    resource: 'Potable Drinking Water & Emergency Kits',
    status: 'Adequate Buffer',
    contactAgency: 'Arunachal Relief & Rehabilitation Cell',
    priority: 'NORMAL',
  },
  {
    id: 'imphal',
    name: 'Imphal West',
    state: 'Manipur',
    coords: [93.9368, 24.8170],
    type: 'ADEQUATE',
    resource: 'Emergency Rations & Packets',
    status: 'Stable Reserve',
    contactAgency: 'Manipur SDMA Logistics Cell',
    priority: 'NORMAL',
  },
  {
    id: 'kohima',
    name: 'Kohima Strategic Store',
    state: 'Nagaland',
    coords: [94.1086, 25.6751],
    type: 'ADEQUATE',
    resource: 'Disaster Shelter Gear & Tarpaulins',
    status: 'Stable Operational Reserve',
    contactAgency: 'Nagaland NSDMA Relief Depot',
    priority: 'NORMAL',
  },
  {
    id: 'gangtok',
    name: 'East Sikkim (Gangtok)',
    state: 'Sikkim',
    coords: [88.6065, 27.3389],
    type: 'ADEQUATE',
    resource: 'High-Altitude Blankets & Medical Kits',
    status: 'Operational Mountain Reserve',
    contactAgency: 'Sikkim SSDMA Emergency Warehouse',
    priority: 'NORMAL',
  },
];

// ── 2. Strategic Road Corridors ──────────────────────────────────────────────
export interface Corridor {
  id: string;
  name: string;
  label: string;
  accessibility: number;
  status: 'ACCESSIBLE' | 'AT_RISK' | 'DISRUPTED';
  severity: 'CRITICAL' | 'HIGH' | 'LOW';
  riskType: string;
  riskScore: number;
  color: string;
  width: number;
  dash?: number[];
  coords: [number, number][];
  primaryDrivers: string;
  affectedDistricts: string[];
  resourceImpact: string;
  recommendedRoute: string;
  movementCode?: string;
  destination?: string;
}

const CORRIDORS: Corridor[] = [
  {
    id: 'corridor-nh6',
    name: 'NH-6 Guwahati → Shillong Highway',
    label: 'Corridor A (NH-6 via Umiam)',
    accessibility: 38,
    status: 'DISRUPTED',
    severity: 'CRITICAL',
    riskType: 'LANDSLIDE',
    riskScore: 0.74,
    color: '#ef4444',
    width: 5,
    dash: [2, 2],
    coords: [
      [91.7362, 26.1445],
      [91.8012, 26.0820],
      [91.8240, 25.9810],
      [91.8760, 25.8520],
      [91.9050, 25.6820],
      [91.8933, 25.5788],
    ],
    primaryDrivers: 'Active landslide debris at km 48 Umiam escarpment, 38 mm/h intense precipitation, steep cut-slope 42°',
    affectedDistricts: ['Kamrup Metro (Assam)', 'Ri-Bhoi (Meghalaya)', 'East Khasi Hills (Meghalaya)'],
    resourceImpact: 'Direct blockage risk for Convoy REL-001 carrying 4,200 kg Emergency Medical Supplies',
    recommendedRoute: 'Divert convoys to Route B (Sonapur Ridge Highland Corridor) immediately',
    movementCode: 'REL-001',
    destination: 'Shillong Core Relief Hub',
  },
  {
    id: 'corridor-ridge-b',
    name: 'Sonapur Ridge Highland Corridor',
    label: 'Alternative Route B (Resilient Bypass)',
    accessibility: 94,
    status: 'ACCESSIBLE',
    severity: 'LOW',
    riskType: 'ROAD_ACCESSIBILITY',
    riskScore: 0.22,
    color: '#10b981',
    width: 4.5,
    coords: [
      [91.7362, 26.1445],
      [91.9820, 26.1150],
      [92.0540, 25.9650],
      [92.0120, 25.7820],
      [91.9450, 25.6420],
      [91.8933, 25.5788],
    ],
    primaryDrivers: 'Engineered drainage culverts, stable bedrock ridge alignment, low slope gradient (<14°)',
    affectedDistricts: ['Kamrup Metro', 'East Khasi Hills'],
    resourceImpact: 'Guarantees reliable passage for heavy relief trucks with +1.2h transit time',
    recommendedRoute: 'Designated primary resilient lifeline corridor for all heavy relief convoys',
    movementCode: 'REL-001',
    destination: 'Shillong Core Relief Hub',
  },
  {
    id: 'corridor-nh27',
    name: 'NH-27 Guwahati → Lumding → Haflong → Silchar',
    label: 'Barak Valley Trunk Lifeline (NH-27)',
    accessibility: 58,
    status: 'AT_RISK',
    severity: 'HIGH',
    riskType: 'FLOOD',
    riskScore: 0.58,
    color: '#f59e0b',
    width: 4,
    coords: [
      [91.7362, 26.1445],
      [92.8500, 25.7500],
      [93.0250, 25.1780],
      [92.7989, 24.8166],
    ],
    primaryDrivers: 'Barak River rising 0.8m above danger mark; waterlogging approaches near Silchar and Dima Hasao culverts',
    affectedDistricts: ['Hojai', 'Dima Hasao (Haflong)', 'Cachar (Silchar)'],
    resourceImpact: 'Slow transit for 15,000 L potable water and suction pump units',
    recommendedRoute: 'Multimodal Rail-Road Corridor via Lumding Junction + daylight convoy escort',
    movementCode: 'REL-002',
    destination: 'Silchar Flood Relief Center',
  },
  {
    id: 'corridor-nh306',
    name: 'NH-306 Silchar → Kolasib → Aizawl Link',
    label: 'Mizoram Strategic Access Corridor (NH-306)',
    accessibility: 52,
    status: 'AT_RISK',
    severity: 'HIGH',
    riskType: 'LANDSLIDE',
    riskScore: 0.62,
    color: '#f59e0b',
    width: 4,
    coords: [
      [92.7989, 24.8166],
      [92.6850, 24.2250],
      [92.7150, 24.0450],
      [92.7176, 23.7271],
    ],
    primaryDrivers: 'Soil creep along Kolasib pass, heavy rainfall saturation 82%, restricted single-lane passage',
    affectedDistricts: ['Cachar (Assam)', 'Kolasib (Mizoram)', 'Aizawl (Mizoram)'],
    resourceImpact: 'Disaster recovery fuel tankers restricted to daylight convoy windows only',
    recommendedRoute: 'Convoy transit allowed strictly 06:00-17:00 IST with earthmoving equipment on standby',
    movementCode: 'REL-003',
    destination: 'Aizawl Strategic Hub',
  },
  {
    id: 'corridor-nh8',
    name: 'NH-8 Karimganj → Agartala Lifeline',
    label: 'Tripura Inter-State Lifeline (NH-8)',
    accessibility: 88,
    status: 'ACCESSIBLE',
    severity: 'LOW',
    riskType: 'ROAD_ACCESSIBILITY',
    riskScore: 0.18,
    color: '#10b981',
    width: 3.5,
    coords: [
      [92.3500, 24.8600],
      [92.1500, 24.2500],
      [91.2868, 23.8315],
    ],
    primaryDrivers: 'Embankment stable, road surface clear, mild rainfall',
    affectedDistricts: ['Karimganj (Assam)', 'North Tripura', 'West Tripura'],
    resourceImpact: 'Fully passable for medical oxygen carriers TRF-00103',
    recommendedRoute: 'Maintain normal transit speed and routine highway patrolling',
    movementCode: 'REL-004',
    destination: 'Agartala State Hospital Depot',
  },
];

// ── 3. Active Hazard Points ──────────────────────────────────────────────────
export interface HazardPoint {
  id: string;
  name: string;
  type: 'LANDSLIDE' | 'FLOOD' | 'HEAVY_RAINFALL';
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  coords: [number, number];
  district: string;
  forecast: string;
  impact: string;
  action: string;
  source: string;
}

const HAZARD_POINTS: HazardPoint[] = [
  {
    id: 'hz-1',
    name: 'NH-6 km 48 Umiam Lake Escarpment',
    type: 'LANDSLIDE',
    severity: 'CRITICAL',
    coords: [91.9050, 25.6820],
    district: 'Ri-Bhoi / East Khasi Hills border',
    forecast: 'Active failure probability 74% within next 12 hours',
    impact: 'Complete physical obstruction of primary dual-carriageway',
    action: 'Divert all Shillong-bound relief convoys to Route B Sonapur Ridge Bypass',
    source: 'NESAC Landslide Studies Division & IMD Doppler Stream',
  },
  {
    id: 'hz-2',
    name: 'Silchar Low-Lying Flood Plain (Barak River)',
    type: 'FLOOD',
    severity: 'HIGH',
    coords: [92.7989, 24.8166],
    district: 'Cachar, Assam',
    forecast: 'River level 0.8m above danger mark; inundation spreading to road approaches',
    impact: 'Vehicles below 4x4 clearance submerged; low-lying highway approaches flooded',
    action: 'Activate railway transshipment at Badarpur; stage inflatable rescue boats',
    source: 'Central Water Commission (CWC) & NESAC Flood Early Warning',
  },
  {
    id: 'hz-3',
    name: 'Kolasib Mountain Incline km 45',
    type: 'LANDSLIDE',
    severity: 'HIGH',
    coords: [92.7150, 24.0450],
    district: 'Kolasib, Mizoram',
    forecast: 'Soil creep detected; rain saturation index 82%',
    impact: 'Slow transit; single-lane alternating movement permitted',
    action: 'Deploy BRO quick-clearance bulldozer; enforce 06:00-17:00 IST convoy window',
    source: 'Mizoram Disaster Management Authority',
  },
  {
    id: 'hz-4',
    name: 'Byrnihat Heavy Runoff Basin',
    type: 'HEAVY_RAINFALL',
    severity: 'HIGH',
    coords: [91.8500, 25.9200],
    district: 'Ri-Bhoi (Meghalaya)',
    forecast: 'Localized cloudburst band: 42 mm/h precipitation recorded',
    impact: 'Waterlogging across culverts km 24-38; reduced braking friction',
    action: 'Post traffic marshals; deploy dewatering suction pump units',
    source: 'IMD AWS Telemetry Station Nongpoh',
  },
];

// ── 4. Active Relief Convoys ────────────────────────────────────────────────
export interface ReliefConvoy {
  id: string;
  code: string;
  driverName: string;
  driverPhone: string;
  origin: string;
  destination: string;
  cargo: string;
  coords: [number, number];
  status: 'REROUTED' | 'EN_ROUTE' | 'STANDBY';
  vehicleCount: number;
}

const RELIEF_CONVOYS: ReliefConvoy[] = [
  {
    id: 'conv-1',
    code: 'REL-001',
    driverName: 'Suresh Das',
    driverPhone: '+91 94350 12345',
    origin: 'Guwahati Buffer Depot',
    destination: 'Shillong Core Relief Hub',
    cargo: '4,200 kg Emergency Medical Supplies',
    coords: [91.9200, 25.8800],
    status: 'REROUTED',
    vehicleCount: 6,
  },
  {
    id: 'conv-2',
    code: 'REL-002',
    driverName: 'Bipul Baruah',
    driverPhone: '+91 94351 98765',
    origin: 'Lumding Relief Depot',
    destination: 'Silchar Flood Relief Center',
    cargo: '15,000 L Potable Water & Suction Units',
    coords: [92.9500, 25.3500],
    status: 'EN_ROUTE',
    vehicleCount: 4,
  },
  {
    id: 'conv-3',
    code: 'REL-003',
    driverName: 'Lalrinsanga',
    driverPhone: '+91 98623 44120',
    origin: 'Silchar Depot',
    destination: 'Aizawl Strategic Hub',
    cargo: '48,000 L Disaster Recovery Fuel',
    coords: [92.7000, 24.1500],
    status: 'EN_ROUTE',
    vehicleCount: 3,
  },
];

export function MapOverview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Marker tracking refs for clean updating without leaks
  const hubMarkersRef = useRef<maplibregl.Marker[]>([]);
  const hazardMarkersRef = useRef<maplibregl.Marker[]>([]);
  const convoyMarkersRef = useRef<maplibregl.Marker[]>([]);

  const { openWhatsAppModal } = useArohanStore();

  // Selected feature in right drawer
  const [selectedFeature, setSelectedFeature] = useState<any>(CORRIDORS[0]);
  const [selectedFeatureType, setSelectedFeatureType] = useState<'corridor' | 'hub' | 'hazard' | 'convoy'>('corridor');

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('guwahati-shillong');
  const [mapStyleKey, setMapStyleKey] = useState<'osm' | 'topo'>('osm');
  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(true);

  // Layer Toggles
  const [layers, setLayers] = useState({
    landslides: true,
    floods: true,
    rainfall: true,
    roads: true,
    resourceMovements: true,
    shortageDistricts: true,
    surplusDistricts: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  // Camera FlyTo helper
  const flyToTarget = (coords: [number, number], zoom = 8.5) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: coords,
      zoom,
      essential: true,
      duration: 1400,
    });
  };

  // Preset Focus Handlers
  const handlePresetChange = (key: string) => {
    setActivePreset(key);
    switch (key) {
      case 'all-ner':
        flyToTarget([92.5, 25.8], 7.0);
        break;
      case 'guwahati-shillong':
        flyToTarget([91.85, 25.80], 9.2);
        setSelectedFeature(CORRIDORS[0]);
        setSelectedFeatureType('corridor');
        break;
      case 'barak-valley':
        flyToTarget([92.80, 24.82], 9.2);
        setSelectedFeature(CORRIDORS[2]);
        setSelectedFeatureType('corridor');
        break;
      case 'aizawl-link':
        flyToTarget([92.72, 23.95], 8.8);
        setSelectedFeature(CORRIDORS[3]);
        setSelectedFeatureType('corridor');
        break;
      case 'tripura':
        flyToTarget([91.29, 23.83], 9.0);
        setSelectedFeature(CORRIDORS[4]);
        setSelectedFeatureType('corridor');
        break;
      case 'arunachal':
        flyToTarget([93.61, 27.08], 8.2);
        setSelectedFeature(NER_HUBS[5]);
        setSelectedFeatureType('hub');
        break;
      default:
        flyToTarget([92.5, 25.8], 7.0);
    }
  };

  // Search Results filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matchedCorridors = CORRIDORS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q) ||
      c.affectedDistricts.some(d => d.toLowerCase().includes(q))
    ).map(c => ({ item: c, type: 'corridor' as const, label: c.name, sub: c.label, coords: c.coords[0] }));

    const matchedHubs = NER_HUBS.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.state.toLowerCase().includes(q) ||
      h.resource.toLowerCase().includes(q)
    ).map(h => ({ item: h, type: 'hub' as const, label: h.name, sub: `${h.state} • ${h.resource}`, coords: h.coords }));

    const matchedHazards = HAZARD_POINTS.filter(hz =>
      hz.name.toLowerCase().includes(q) ||
      hz.district.toLowerCase().includes(q) ||
      hz.type.toLowerCase().includes(q)
    ).map(hz => ({ item: hz, type: 'hazard' as const, label: hz.name, sub: `${hz.district} • ${hz.type}`, coords: hz.coords }));

    return [...matchedCorridors, ...matchedHubs, ...matchedHazards].slice(0, 8);
  }, [searchQuery]);

  // Handle URL query parameters (e.g. ?focus=nh6)
  useEffect(() => {
    const focusParam = searchParams.get('focus');
    if (focusParam) {
      const q = focusParam.toLowerCase();
      if (q.includes('nh6') || q.includes('umi') || q.includes('shillong')) {
        setSelectedFeature(CORRIDORS[0]);
        setSelectedFeatureType('corridor');
        flyToTarget([91.8933, 25.6820], 9.5);
      } else if (q.includes('silchar') || q.includes('cachar')) {
        setSelectedFeature(CORRIDORS[2]);
        setSelectedFeatureType('corridor');
        flyToTarget([92.7989, 24.8166], 9);
      }
    }
  }, [searchParams]);

  // Handle Map Window Resizing
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 250);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // ── Initialize MapLibre GL ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'basemap-osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
          'basemap-topo': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, Esri USGS',
          },
        },
        layers: [
          {
            id: 'layer-basemap-osm',
            type: 'raster',
            source: 'basemap-osm',
            layout: { visibility: 'visible' },
          },
          {
            id: 'layer-basemap-topo',
            type: 'raster',
            source: 'basemap-topo',
            layout: { visibility: 'none' },
          },
        ],
      },
      center: [92.5, 25.8],
      zoom: 7.2,
      maxZoom: 16,
      minZoom: 5.5,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    map.on('load', () => {
      map.resize();

      // 1. Add Corridor Polyline Layers
      CORRIDORS.forEach((c) => {
        const sourceId = `source-${c.id}`;
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { id: c.id, name: c.name, accessibility: c.accessibility },
            geometry: {
              type: 'LineString',
              coordinates: c.coords,
            },
          },
        });

        // Background casing for contrast
        map.addLayer({
          id: `casing-${c.id}`,
          type: 'line',
          source: sourceId,
          layout: {
            visibility: 'visible',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': c.width + 4,
            'line-opacity': 0.85,
          },
        });

        // Main colored corridor line
        map.addLayer({
          id: `line-${c.id}`,
          type: 'line',
          source: sourceId,
          layout: {
            visibility: 'visible',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': c.color,
            'line-width': c.width,
            'line-opacity': 0.95,
            ...(c.dash ? { 'line-dasharray': c.dash } : {}),
          },
        });

        // Click handler for corridors
        map.on('click', `line-${c.id}`, () => {
          setSelectedFeature(c);
          setSelectedFeatureType('corridor');
        });

        map.on('mouseenter', `line-${c.id}`, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', `line-${c.id}`, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      // 2. Add Umiam Landslide Zone Polygon
      map.addSource('hazard-zone-umiam', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [91.86, 25.64],
                [91.95, 25.64],
                [91.96, 25.72],
                [91.87, 25.72],
                [91.86, 25.64],
              ],
            ],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: 'hazard-zone-fill',
        type: 'fill',
        source: 'hazard-zone-umiam',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.22,
        },
      });

      map.addLayer({
        id: 'hazard-zone-outline',
        type: 'line',
        source: 'hazard-zone-umiam',
        layout: { visibility: 'visible' },
        paint: {
          'line-color': '#ef4444',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      // 3. Add Cachar River Flood Zone Polygon
      map.addSource('flood-zone-cachar', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [92.70, 24.75],
                [92.88, 24.75],
                [92.90, 24.88],
                [92.72, 24.88],
                [92.70, 24.75],
              ],
            ],
          },
          properties: {},
        },
      });

      map.addLayer({
        id: 'flood-zone-fill',
        type: 'fill',
        source: 'flood-zone-cachar',
        layout: { visibility: 'visible' },
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.20,
        },
      });

      // Render initial markers
      renderHubMarkers(map);
      renderHazardMarkers(map);
      renderConvoyMarkers(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Marker Renderer Helpers ───────────────────────────────────────────────
  const renderHubMarkers = (map: maplibregl.Map) => {
    // Clear existing hub markers
    hubMarkersRef.current.forEach(m => m.remove());
    hubMarkersRef.current = [];

    NER_HUBS.forEach((hub) => {
      const isVisible =
        (hub.type === 'SURPLUS' && layers.surplusDistricts) ||
        (hub.type === 'SHORTAGE' && layers.shortageDistricts) ||
        (hub.type === 'LOW' && layers.shortageDistricts) ||
        (hub.type === 'ADEQUATE' && layers.surplusDistricts);

      if (!isVisible) return;

      const el = document.createElement('div');
      el.className = 'ner-hub-pill';
      const borderColor = hub.type === 'SURPLUS' ? '#10b981' : hub.type === 'SHORTAGE' ? '#ef4444' : '#f59e0b';
      const bgColor = hub.type === 'SHORTAGE' ? '#fef2f2' : '#ffffff';

      el.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: ${bgColor};
        padding: 4px 9px;
        border-radius: 9999px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        border: 2px solid ${borderColor};
        cursor: pointer;
        font-family: Arial, system-ui, sans-serif;
        white-space: nowrap;
        user-select: none;
        transition: transform 0.15s ease;
      `;

      el.onmouseenter = () => { el.style.transform = 'scale(1.08)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

      const dot = document.createElement('span');
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${borderColor};
        flex-shrink: 0;
      `;

      const label = document.createElement('span');
      label.innerText = hub.name.split(' ')[0];
      label.style.cssText = `
        font-size: 11px;
        font-weight: 700;
        color: #0f172a;
      `;

      el.appendChild(dot);
      el.appendChild(label);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedFeature(hub);
        setSelectedFeatureType('hub');
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(hub.coords)
        .addTo(map);

      hubMarkersRef.current.push(marker);
    });
  };

  const renderHazardMarkers = (map: maplibregl.Map) => {
    // Clear existing hazard markers
    hazardMarkersRef.current.forEach(m => m.remove());
    hazardMarkersRef.current = [];

    HAZARD_POINTS.forEach((hz) => {
      const isVisible =
        (hz.type === 'LANDSLIDE' && layers.landslides) ||
        (hz.type === 'FLOOD' && layers.floods) ||
        (hz.type === 'HEAVY_RAINFALL' && layers.rainfall);

      if (!isVisible) return;

      const el = document.createElement('div');
      el.className = 'ner-hazard-marker';
      const bgColor = hz.severity === 'CRITICAL' ? '#dc2626' : '#ea580c';

      el.style.cssText = `
        width: 30px;
        height: 30px;
        background-color: ${bgColor};
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 4px ${hz.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'};
        cursor: pointer;
        font-weight: 800;
        font-size: 14px;
        user-select: none;
        transition: transform 0.15s ease;
      `;

      el.onmouseenter = () => { el.style.transform = 'scale(1.15)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

      el.innerHTML = hz.type === 'LANDSLIDE' ? '⛰️' : hz.type === 'FLOOD' ? '🌊' : '🌧️';

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedFeature(hz);
        setSelectedFeatureType('hazard');
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(hz.coords)
        .addTo(map);

      hazardMarkersRef.current.push(marker);
    });
  };

  const renderConvoyMarkers = (map: maplibregl.Map) => {
    // Clear existing convoy markers
    convoyMarkersRef.current.forEach(m => m.remove());
    convoyMarkersRef.current = [];

    if (!layers.resourceMovements) return;

    RELIEF_CONVOYS.forEach((conv) => {
      const el = document.createElement('div');
      el.className = 'ner-convoy-marker';
      el.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
        background-color: #0f172a;
        color: #ffffff;
        padding: 4px 8px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 1px solid #334155;
        cursor: pointer;
        font-family: Arial, system-ui, sans-serif;
        font-size: 11px;
        font-weight: 700;
        transition: transform 0.15s ease;
      `;

      el.onmouseenter = () => { el.style.transform = 'scale(1.1)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

      el.innerHTML = `<span>🚛</span><span>${conv.code}</span>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedFeature(conv);
        setSelectedFeatureType('convoy');
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(conv.coords)
        .addTo(map);

      convoyMarkersRef.current.push(marker);
    });
  };

  // ── Sync Map Layers & Markers on State Change ──────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // 1. Sync Corridor Layers
    CORRIDORS.forEach((c) => {
      const lineLayer = `line-${c.id}`;
      const casingLayer = `casing-${c.id}`;
      if (map.getLayer(lineLayer)) {
        map.setLayoutProperty(lineLayer, 'visibility', layers.roads ? 'visible' : 'none');
      }
      if (map.getLayer(casingLayer)) {
        map.setLayoutProperty(casingLayer, 'visibility', layers.roads ? 'visible' : 'none');
      }
    });

    // 2. Sync Hazard Polygons
    if (map.getLayer('hazard-zone-fill')) {
      map.setLayoutProperty('hazard-zone-fill', 'visibility', layers.landslides ? 'visible' : 'none');
    }
    if (map.getLayer('hazard-zone-outline')) {
      map.setLayoutProperty('hazard-zone-outline', 'visibility', layers.landslides ? 'visible' : 'none');
    }
    if (map.getLayer('flood-zone-fill')) {
      map.setLayoutProperty('flood-zone-fill', 'visibility', layers.floods ? 'visible' : 'none');
    }

    // 3. Re-render dynamic markers
    renderHubMarkers(map);
    renderHazardMarkers(map);
    renderConvoyMarkers(map);
  }, [layers]);

  // ── Switch Basemap ────────────────────────────────────────────────────────
  const handleBasemapChange = (styleKey: 'osm' | 'topo') => {
    setMapStyleKey(styleKey);
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('layer-basemap-osm')) {
      map.setLayoutProperty('layer-basemap-osm', 'visibility', styleKey === 'osm' ? 'visible' : 'none');
    }
    if (map.getLayer('layer-basemap-topo')) {
      map.setLayoutProperty('layer-basemap-topo', 'visibility', styleKey === 'topo' ? 'visible' : 'none');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative', overflow: 'hidden', fontFamily: 'Arial, -apple-system, sans-serif' }}>
      
      {/* ── TOP CONTROL BAR: TITLE, REGION SELECTOR & GLOBAL SEARCH ─────────────── */}
      <div style={{
        height: 52,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20,
        gap: 12,
        flexShrink: 0,
      }}>
        {/* Left: Module Badge & Region Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
            }}>
              <Compass size={16} />
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                OPERATIONAL GIS MAP
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                LIVE
              </span>
            </div>
          </div>

          <div style={{ height: 20, width: 1, backgroundColor: '#E2E8F0', flexShrink: 0 }} />

          {/* Region Quick Select Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {[
              { id: 'all-ner', label: 'All NER (Overview)' },
              { id: 'guwahati-shillong', label: 'Guwahati–Shillong (NH-6)' },
              { id: 'barak-valley', label: 'Barak Valley (Silchar)' },
              { id: 'aizawl-link', label: 'Mizoram Link (NH-306)' },
              { id: 'tripura', label: 'Tripura Lifeline (NH-8)' },
              { id: 'arunachal', label: 'Arunachal Frontier' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                style={{
                  padding: '4px 9px',
                  borderRadius: 6,
                  fontSize: '0.74rem',
                  fontWeight: activePreset === p.id ? 700 : 500,
                  backgroundColor: activePreset === p.id ? '#059669' : '#F1F5F9',
                  color: activePreset === p.id ? '#ffffff' : '#334155',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search, Basemap, Layer Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          
          {/* Functional Search Bar with Instant Dropdown */}
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: 9, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search corridor, city, hazard..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                fontSize: '0.78rem',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
                backgroundColor: '#F8FAFC',
                outline: 'none',
                color: '#0F172A',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: 7, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={13} />
              </button>
            )}

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 36,
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                zIndex: 100,
                overflow: 'hidden',
              }}>
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => {
                      setSelectedFeature(res.item);
                      setSelectedFeatureType(res.type);
                      flyToTarget(res.coords, 9.5);
                      setSearchQuery('');
                    }}
                    style={{
                      padding: '8px 10px',
                      borderBottom: idx < searchResults.length - 1 ? '1px solid #F1F5F9' : 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      backgroundColor: '#ffffff',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{res.label}</span>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 3,
                        backgroundColor: res.type === 'corridor' ? '#EFF6FF' : res.type === 'hazard' ? '#FEF2F2' : '#ECFDF5',
                        color: res.type === 'corridor' ? '#1D4ED8' : res.type === 'hazard' ? '#DC2626' : '#059669',
                      }}>
                        {res.type.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{res.sub}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basemap Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: 2, borderRadius: 6 }}>
            <button
              onClick={() => handleBasemapChange('osm')}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: '0.72rem',
                fontWeight: mapStyleKey === 'osm' ? 700 : 500,
                backgroundColor: mapStyleKey === 'osm' ? '#ffffff' : 'transparent',
                color: mapStyleKey === 'osm' ? '#0F172A' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: mapStyleKey === 'osm' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Streets (OSM)
            </button>
            <button
              onClick={() => handleBasemapChange('topo')}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: '0.72rem',
                fontWeight: mapStyleKey === 'topo' ? 700 : 500,
                backgroundColor: mapStyleKey === 'topo' ? '#ffffff' : 'transparent',
                color: mapStyleKey === 'topo' ? '#0F172A' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: mapStyleKey === 'topo' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Terrain / Topo
            </button>
          </div>

          {/* Layer Panel Toggle Button */}
          <button
            onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              fontSize: '0.76rem',
              fontWeight: 600,
              backgroundColor: isLayerDrawerOpen ? '#ECFDF5' : '#F8FAFC',
              color: isLayerDrawerOpen ? '#047857' : '#334155',
              border: `1px solid ${isLayerDrawerOpen ? '#A7F3D0' : '#CBD5E1'}`,
              cursor: 'pointer',
            }}
          >
            <Layers size={13} />
            <span>Layers ({activeLayerCount})</span>
          </button>
        </div>
      </div>

      {/* ── MAP CONTAINER & OVERLAY PANELS ──────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: 'calc(100% - 52px)' }}>
        
        {/* Full-bleed Map Canvas */}
        <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />

        {/* ── LEFT FLOATING LAYER DRAWER ────────────────────────────────────────── */}
        {isLayerDrawerOpen && (
          <div style={{
            position: 'absolute',
            top: 14,
            left: 14,
            width: 270,
            maxHeight: 'calc(100% - 80px)',
            backgroundColor: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid #CBD5E1',
            zIndex: 20,
            overflowY: 'auto',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sliders size={15} color="#059669" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>OPERATIONAL LAYERS</span>
              </div>
              <button
                onClick={() => setIsLayerDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* 1. Hazards Layer Group */}
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: 6 }}>
                DISASTER HAZARDS & WEATHER
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { key: 'landslides', label: 'Landslide Vulnerability Points', icon: '⛰️' },
                  { key: 'floods', label: 'Riverine Flood Inundation Zones', icon: '🌊' },
                  { key: 'rainfall', label: 'Heavy Rainfall Runoff Radar', icon: '🌧️' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(layers as any)[item.key]}
                      onChange={() => toggleLayer(item.key as any)}
                      style={{ accentColor: '#059669', cursor: 'pointer' }}
                    />
                    <span>{item.icon}</span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Corridors & Road Network */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: 6 }}>
                NATIONAL HIGHWAYS & CORRIDORS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={layers.roads}
                    onChange={() => toggleLayer('roads')}
                    style={{ accentColor: '#059669', cursor: 'pointer' }}
                  />
                  <span style={{ width: 12, height: 4, backgroundColor: '#059669', borderRadius: 2 }} />
                  <span style={{ fontWeight: 500 }}>Strategic Corridors (NH-6, 27, 306, 8)</span>
                </label>
              </div>
            </div>

            {/* 3. Logistics & Buffers */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', marginBottom: 6 }}>
                RELIEF LOGISTICS & SUPPLIES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { key: 'resourceMovements', label: 'Active Relief Convoys', icon: '🚛' },
                  { key: 'shortageDistricts', label: 'Deficit Shortage Hubs', icon: '🔴' },
                  { key: 'surplusDistricts', label: 'Surplus Buffer Depots', icon: '🟢' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(layers as any)[item.key]}
                      onChange={() => toggleLayer(item.key as any)}
                      style={{ accentColor: '#059669', cursor: 'pointer' }}
                    />
                    <span>{item.icon}</span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── RIGHT FLOATING SELECTED FEATURE INTELLIGENCE CARD ────────────────── */}
        {selectedFeature && (
          <div style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 350,
            maxHeight: 'calc(100% - 80px)',
            backgroundColor: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid #CBD5E1',
            zIndex: 20,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
              <div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '2px 7px',
                  borderRadius: 4,
                  backgroundColor:
                    selectedFeature.severity === 'CRITICAL' || selectedFeature.type === 'SHORTAGE' || selectedFeature.status === 'DISRUPTED'
                      ? '#FEE2E2'
                      : selectedFeature.severity === 'HIGH' || selectedFeature.type === 'LOW' || selectedFeature.status === 'AT_RISK'
                      ? '#FEF3C7'
                      : '#ECFDF5',
                  color:
                    selectedFeature.severity === 'CRITICAL' || selectedFeature.type === 'SHORTAGE' || selectedFeature.status === 'DISRUPTED'
                      ? '#B91C1C'
                      : selectedFeature.severity === 'HIGH' || selectedFeature.type === 'LOW' || selectedFeature.status === 'AT_RISK'
                      ? '#B45309'
                      : '#047857',
                }}>
                  {selectedFeature.severity || selectedFeature.status || selectedFeature.type || 'FEATURE'}
                </span>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 2px' }}>
                  {selectedFeature.name || selectedFeature.label || selectedFeature.code}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {selectedFeature.state || selectedFeature.district || `${selectedFeature.origin || ''} → ${selectedFeature.destination || ''}`}
                </span>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Accessibility Gauge (For Corridors) */}
            {selectedFeature.accessibility !== undefined && (
              <div style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>CORRIDOR ACCESSIBILITY</span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: selectedFeature.accessibility > 75 ? '#10b981' : selectedFeature.accessibility > 45 ? '#f59e0b' : '#ef4444',
                  }}>
                    {selectedFeature.accessibility}% ({selectedFeature.status})
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{
                    width: `${selectedFeature.accessibility}%`,
                    height: '100%',
                    backgroundColor: selectedFeature.accessibility > 75 ? '#10b981' : selectedFeature.accessibility > 45 ? '#f59e0b' : '#ef4444',
                    borderRadius: 9999,
                  }} />
                </div>
              </div>
            )}

            {/* Hub Resource Inventory (For Depots) */}
            {selectedFeature.resource && (
              <div style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: 2 }}>BUFFER INVENTORY</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{selectedFeature.resource}</div>
                {selectedFeature.contactAgency && (
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: 4 }}>Agency: {selectedFeature.contactAgency}</div>
                )}
              </div>
            )}

            {/* Convoy Movement Info (For Convoys) */}
            {selectedFeature.cargo && (
              <div style={{ backgroundColor: '#F8FAFC', padding: 10, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: 2 }}>CONVOY MANIFEST</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>{selectedFeature.cargo}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4 }}>
                  Driver: <b>{selectedFeature.driverName}</b> ({selectedFeature.driverPhone})
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  Fleet: {selectedFeature.vehicleCount} Heavy Trucks • Status: {selectedFeature.status}
                </div>
              </div>
            )}

            {/* Primary Hazard Drivers */}
            {selectedFeature.primaryDrivers && (
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: 2 }}>PRIMARY RISK DRIVERS</div>
                <p style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.4, margin: 0 }}>
                  {selectedFeature.primaryDrivers}
                </p>
              </div>
            )}

            {/* Hazard Forecast Window */}
            {selectedFeature.forecast && (
              <div style={{ backgroundColor: '#FEF3C7', padding: 8, borderRadius: 6, border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={12} />
                  <span>PREDICTIVE FORECAST WINDOW</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: '#78350F', margin: '3px 0 0', lineHeight: 1.35 }}>
                  {selectedFeature.forecast}
                </p>
                {selectedFeature.source && (
                  <span style={{ fontSize: '0.65rem', color: '#B45309', display: 'block', marginTop: 4 }}>
                    Source: {selectedFeature.source}
                  </span>
                )}
              </div>
            )}

            {/* Affected Districts */}
            {selectedFeature.affectedDistricts && (
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', marginBottom: 3 }}>
                  AFFECTED DISTRICTS & RELIEF HUBS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selectedFeature.affectedDistricts.map((d: string, idx: number) => (
                    <span key={idx} style={{
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: '#F1F5F9',
                      color: '#334155',
                      fontWeight: 600,
                    }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Action / Route */}
            {(selectedFeature.recommendedRoute || selectedFeature.action) && (
              <div style={{ backgroundColor: '#ECFDF5', padding: 8, borderRadius: 6, border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#065F46', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} />
                  <span>OPERATIONAL ACTION PLAN</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: '#047857', margin: '3px 0 0', fontWeight: 600, lineHeight: 1.35 }}>
                  {selectedFeature.recommendedRoute || selectedFeature.action}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
              <button
                onClick={() =>
                  openWhatsAppModal({
                    movement_code: selectedFeature.movementCode || selectedFeature.code || 'REL-001',
                    reason: selectedFeature.primaryDrivers || selectedFeature.forecast || `${selectedFeature.name || 'Corridor'}: Road Access Risk`,
                    old_route: selectedFeature.name || selectedFeature.origin || 'NH-6 Corridor via Umiam',
                    new_route: selectedFeature.recommendedRoute || 'Route B (Sonapur Ridge Highland Corridor)',
                    destination: selectedFeature.destination || 'Shillong Core Relief Hub',
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <MessageSquare size={13} />
                <span>SEND DRIVER WHATSAPP ALERT</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  onClick={() => navigate('/action')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                  }}
                >
                  Action Center
                </button>
                <button
                  onClick={() => navigate('/resources')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                  }}
                >
                  District Stocks
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── BOTTOM OPERATIONAL LEGEND BAR ────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: 14,
          right: 14,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(6px)',
          borderRadius: 6,
          border: '1px solid #CBD5E1',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          zIndex: 10,
        }}>
          {/* Legend Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            
            {/* Corridors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>CORRIDORS:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#334155' }}>
                  <span style={{ width: 12, height: 3, backgroundColor: '#10b981', borderRadius: 2 }} /> Accessible
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#334155' }}>
                  <span style={{ width: 12, height: 3, backgroundColor: '#f59e0b', borderRadius: 2 }} /> At Risk
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#334155' }}>
                  <span style={{ width: 12, height: 3, backgroundColor: '#ef4444', borderRadius: 2 }} /> Disrupted
                </span>
              </div>
            </div>

            <div style={{ height: 14, width: 1, backgroundColor: '#CBD5E1' }} />

            {/* Hazards */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>HAZARDS:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: '#334155' }}>
                <span>⛰️ Landslide</span>
                <span>🌊 Flood</span>
                <span>🌧️ Runoff</span>
              </div>
            </div>

            <div style={{ height: 14, width: 1, backgroundColor: '#CBD5E1' }} />

            {/* Depots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>DEPOTS:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#334155' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981' }} /> Surplus
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#334155' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#ef4444' }} /> Shortage
                </span>
              </div>
            </div>

          </div>

          {/* Right: Reset View & Attribution */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => handlePresetChange('all-ner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: '0.68rem',
                fontWeight: 600,
                backgroundColor: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={11} />
              <span>Reset NER View</span>
            </button>
            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
              NESAC · IMD Radar · CWC Telemetry
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
