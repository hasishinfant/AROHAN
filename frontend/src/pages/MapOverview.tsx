import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useArohanStore, FieldReportData } from '../stores/arohanStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  Layers,
  Search,
  Filter,
  Eye,
  EyeOff,
  Crosshair,
  Maximize2,
  Minimize2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Truck,
  MapPin,
  Compass,
  CheckCircle2,
  X,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Sliders,
  Flame,
  CloudRain,
  Navigation,
  MessageSquare
} from 'lucide-react';

// Coordinates of key NER nodes
const NER_HUBS = [
  { id: 'kamrup', name: 'Kamrup Metro (Guwahati)', state: 'Assam', coords: [91.7362, 26.1445] as [number, number], type: 'SURPLUS', resource: 'Rice & Food Grains (4,500 MT)', status: 'Surplus Buffer Depot' },
  { id: 'shillong', name: 'East Khasi Hills (Shillong)', state: 'Meghalaya', coords: [91.8933, 25.5788] as [number, number], type: 'SHORTAGE', resource: 'Food Grains (-1,200 MT Deficit)', status: 'Critical Shortage' },
  { id: 'silchar', name: 'Cachar (Silchar)', state: 'Assam', coords: [92.7989, 24.8166] as [number, number], type: 'SHORTAGE', resource: 'Emergency Medical Kits (-1,080 Deficit)', status: 'Flood Risk Shortage' },
  { id: 'aizawl', name: 'Aizawl Strategic Hub', state: 'Mizoram', coords: [92.7176, 23.7271] as [number, number], type: 'LOW', resource: 'Disaster Recovery Fuel (48,000 L)', status: 'Low Buffer Warning' },
  { id: 'agartala', name: 'West Tripura (Agartala)', state: 'Tripura', coords: [91.2868, 23.8315] as [number, number], type: 'SHORTAGE', resource: 'Medical Oxygen (-140 Cylinders)', status: 'Critical Reserve Need' },
  { id: 'itanagar', name: 'Papum Pare (Itanagar)', state: 'Arunachal Pradesh', coords: [93.6053, 27.0844] as [number, number], type: 'ADEQUATE', resource: 'Potable Drinking Water', status: 'Adequate Buffer' },
  { id: 'imphal', name: 'Imphal West', state: 'Manipur', coords: [93.9368, 24.8170] as [number, number], type: 'ADEQUATE', resource: 'Emergency Rations', status: 'Stable Reserve' },
  { id: 'kohima', name: 'Kohima Regional Reserve', state: 'Nagaland', coords: [94.1086, 25.6751] as [number, number], type: 'ADEQUATE', resource: 'Disaster Shelter Gear', status: 'Stable Reserve' },
  { id: 'gangtok', name: 'East Sikkim (Gangtok)', state: 'Sikkim', coords: [88.6065, 27.3389] as [number, number], type: 'ADEQUATE', resource: 'High-Altitude Blankets', status: 'Operational Reserve' },
];

// Strategic road corridors across NER
const CORRIDORS = [
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
    dash: [1],
    coords: [
      [91.7362, 26.1445],
      [91.8012, 26.0820],
      [91.8240, 25.9810],
      [91.8760, 25.8520],
      [91.9050, 25.6820],
      [91.8933, 25.5788]
    ],
    primaryDrivers: 'Intense precipitation (38 mm/h), 42° steep cut-slope, severe mudflow accumulation',
    affectedDistricts: ['Kamrup Metro (Assam)', 'Ri-Bhoi (Meghalaya)', 'East Khasi Hills (Meghalaya)'],
    resourceImpact: 'Immediate blockage risk for Convoy REL-001 carrying 4,200 kg Emergency Medical Supplies',
    recommendedRoute: 'Alternative Route B (Sonapur Ridge Highland Corridor)',
  },
  {
    id: 'corridor-ridge-b',
    name: 'Sonapur Ridge Highland Corridor',
    label: 'Alternative Corridor B (Resilient Bypass)',
    accessibility: 94,
    status: 'ACCESSIBLE',
    severity: 'LOW',
    riskType: 'ROAD_ACCESSIBILITY',
    riskScore: 0.22,
    color: '#10b981',
    width: 4,
    coords: [
      [91.7362, 26.1445],
      [91.9820, 26.1150],
      [92.0540, 25.9650],
      [92.0120, 25.7820],
      [91.9450, 25.6420],
      [91.8933, 25.5788]
    ],
    primaryDrivers: 'Stable bedrock ridge alignment, engineered drainage culverts, gentle gradient (<14°)',
    affectedDistricts: ['Kamrup Metro', 'East Khasi Hills'],
    resourceImpact: 'Guarantees reliable passage for bulk relief commodities with +1.2h transit time',
    recommendedRoute: 'Designated primary resilient lifeline corridor for all heavy relief convoys',
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
      [92.7989, 24.8166]
    ],
    primaryDrivers: 'Upstream catchment discharge approaching culverts km 110-128; road friction degraded 45%',
    affectedDistricts: ['Hojai', 'Dima Hasao (Haflong)', 'Cachar (Silchar)'],
    resourceImpact: 'Delays in essential water purification supplies and flood relief rations',
    recommendedRoute: 'Multimodal Rail-Road Corridor via Lumding Junction + daylight convoy escort',
  },
  {
    id: 'corridor-nh306',
    name: 'NH-306 Silchar → Kolasib → Aizawl Mountain Link',
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
      [92.7176, 23.7271]
    ],
    primaryDrivers: 'Steep hill cuts along Kolasib pass, night rain saturation, vulnerable boulder formations',
    affectedDistricts: ['Cachar (Assam)', 'Kolasib (Mizoram)', 'Aizawl (Mizoram)'],
    resourceImpact: 'Disaster recovery fuel tankers restricted from night transit',
    recommendedRoute: 'Daylight convoy windows with heavy escort and pre-staged earthmoving units',
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
      [91.2868, 23.8315]
    ],
    primaryDrivers: 'Flat plain embankment, regular road maintenance, moderate rain resistance',
    affectedDistricts: ['Karimganj (Assam)', 'North Tripura', 'West Tripura'],
    resourceImpact: 'Passable for cryogenic oxygen carrier TRF-00103',
    recommendedRoute: 'Standard southern inter-state alignment',
  },
];

// Active hazard points
const HAZARD_POINTS = [
  {
    id: 'hz-1',
    name: 'NH-6 km 48 Umiam Lake Escarpment',
    type: 'LANDSLIDE',
    severity: 'CRITICAL',
    coords: [91.9050, 25.6820] as [number, number],
    district: 'Ri-Bhoi / East Khasi Hills border',
    forecast: 'Active failure probability 74% within next 12 hours',
    impact: 'Complete closure of primary dual-carriageway',
    action: 'Divert convoys to Route B Sonapur Ridge Bypass immediately',
    source: 'NESAC Landslide Studies Division & IMD Doppler Stream',
  },
  {
    id: 'hz-2',
    name: 'Silchar Low-Lying Flood Plain (Barak River)',
    type: 'FLOOD',
    severity: 'HIGH',
    coords: [92.7989, 24.8166] as [number, number],
    district: 'Cachar, Assam',
    forecast: 'River level 0.8m above danger mark; inundation spreading to transit approaches',
    impact: 'Surface vehicles below 4x4 clearance submerged',
    action: 'Activate multimodal railway unloading at Badarpur and pre-position inflatable boats',
    source: 'Central Water Commission (CWC) & NESAC Flood Early Warning',
  },
  {
    id: 'hz-3',
    name: 'Kolasib Mountain Incline km 45',
    type: 'LANDSLIDE',
    severity: 'HIGH',
    coords: [92.7150, 24.0450] as [number, number],
    district: 'Kolasib, Mizoram',
    forecast: 'Soil creep detected; rain saturation index 82%',
    impact: 'Slow transit; single-lane alternating movement',
    action: 'Deploy BRO quick-clearance bulldozer and restrict transit to 06:00-17:00 IST',
    source: 'Mizoram Disaster Management Authority',
  },
  {
    id: 'hz-4',
    name: 'Byrnihat Heavy Runoff Basin',
    type: 'HEAVY_RAINFALL',
    severity: 'HIGH',
    coords: [91.8500, 25.9200] as [number, number],
    district: 'Ri-Bhoi (Meghalaya)',
    forecast: 'Localized cloudburst potential: 42 mm/h precipitation band',
    impact: 'Waterlogging on highway culverts km 24-38',
    action: 'Post traffic marshals and stage suction pump trucks',
    source: 'IMD AWS Telemetry Station Nongpoh',
  }
];

export function MapOverview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const {
    commandKpis,
    operationalAlerts,
    resourceStocks,
    resourceTransfers,
    fieldReports,
    fetchCommandKpis,
    fetchAlerts,
    fetchResources,
    fetchFieldReports,
    fetchFloodVulnerabilities,
    openWhatsAppModal,
  } = useArohanStore();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<any>(CORRIDORS[0]);
  const [mapStyleKey, setMapStyleKey] = useState<'osm' | 'voyager' | 'dark'>('voyager');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string>('all-ner');

  // Layer Toggles
  const [layers, setLayers] = useState({
    // Hazards
    landslides: true,
    floods: true,
    rainfall: true,
    overallRisk: true,
    // Infrastructure
    roads: true,
    bridges: true,
    roadAccessibility: true,
    blockedCorridors: true,
    // Logistics
    resourceMovements: true,
    vehicles: true,
    resourceSources: true,
    shortageDistricts: true,
    surplusDistricts: true,
    // Field Intelligence
    fieldReports: true,
    verifiedIncidents: true,
    unverifiedReports: true,
    // Boundaries
    states: true,
    districts: true,
  });

  // Load initial store data
  useEffect(() => {
    fetchCommandKpis();
    fetchAlerts();
    fetchResources();
    fetchFieldReports();
    fetchFloodVulnerabilities();
  }, []);

  // Handle URL query parameters (e.g. ?focus=nh6 or ?layer=landslides)
  useEffect(() => {
    const focusParam = searchParams.get('focus');
    if (focusParam) {
      if (focusParam.toLowerCase().includes('nh6') || focusParam.toLowerCase().includes('umi')) {
        setSelectedFeature(CORRIDORS[0]);
        flyToTarget([91.8933, 25.6820], 9.5);
      } else if (focusParam.toLowerCase().includes('silchar') || focusParam.toLowerCase().includes('cachar')) {
        setSelectedFeature(CORRIDORS[2]);
        flyToTarget([92.7989, 24.8166], 9);
      }
    }
  }, [searchParams]);

  // Camera FlyTo helper
  const flyToTarget = (coords: [number, number], zoom = 8.5) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: coords,
      zoom,
      essential: true,
      duration: 1800,
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
        flyToTarget([91.82, 25.85], 9.2);
        setSelectedFeature(CORRIDORS[0]);
        break;
      case 'barak-valley':
        flyToTarget([92.80, 24.82], 9.2);
        setSelectedFeature(CORRIDORS[2]);
        break;
      case 'aizawl-link':
        flyToTarget([92.72, 23.95], 8.8);
        setSelectedFeature(CORRIDORS[3]);
        break;
      case 'arunachal':
        flyToTarget([93.61, 27.08], 8.2);
        break;
      case 'tripura':
        flyToTarget([91.29, 23.83], 9.0);
        setSelectedFeature(CORRIDORS[4]);
        break;
      default:
        flyToTarget([92.5, 25.8], 7.0);
    }
  };

  // Toggle single layer
  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Count active layers
  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const tileSources = {
      osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      voyager: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      dark: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: 'raster',
            tiles: [tileSources[mapStyleKey]],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, CartoDB, AROHAN GIS',
          },
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap',
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

        // Background casing
        map.addLayer({
          id: `casing-${c.id}`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#ffffff',
            'line-width': c.width + 3,
            'line-opacity': 0.8,
          },
        });

        // Main colored corridor line
        map.addLayer({
          id: `line-${c.id}`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': c.color,
            'line-width': c.width,
            'line-opacity': 0.95,
            ...(c.dash ? { 'line-dasharray': [3, 2] } : {}),
          },
        });

        // Click handler for corridors
        map.on('click', `line-${c.id}`, () => {
          setSelectedFeature(c);
        });

        map.on('mouseenter', `line-${c.id}`, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', `line-${c.id}`, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      // 2. Add Disruption Hazard Buffer Zone around Umiam
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
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.22,
        },
      });

      map.addLayer({
        id: 'hazard-zone-outline',
        type: 'line',
        source: 'hazard-zone-umiam',
        paint: {
          'line-color': '#ef4444',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      // 3. Add Flood Inundation Buffer Zone for Cachar
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
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.20,
        },
      });

      // 4. Custom DOM Markers for NER Hubs & Hazards
      NER_HUBS.forEach((hub) => {
        const el = document.createElement('div');
        el.className = 'ner-hub-marker';
        el.style.cssText = `
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: white;
          padding: 4px 8px;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 2px solid ${hub.type === 'SURPLUS' ? '#10b981' : hub.type === 'SHORTAGE' ? '#ef4444' : '#f59e0b'};
          cursor: pointer;
          font-family: sans-serif;
        `;

        const dot = document.createElement('span');
        dot.style.cssText = `
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${hub.type === 'SURPLUS' ? '#10b981' : hub.type === 'SHORTAGE' ? '#ef4444' : '#f59e0b'};
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

        el.addEventListener('click', () => {
          setSelectedFeature(hub);
        });

        new maplibregl.Marker({ element: el })
          .setLngLat(hub.coords)
          .addTo(map);
      });

      // 5. Hazard Warning Markers
      HAZARD_POINTS.forEach((hz) => {
        const el = document.createElement('div');
        el.className = 'hazard-point-marker';
        el.style.cssText = `
          width: 28px;
          height: 28px;
          background-color: ${hz.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'};
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 4px ${hz.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'};
          cursor: pointer;
          font-weight: 800;
          font-size: 14px;
        `;
        el.innerHTML = hz.type === 'LANDSLIDE' ? '⛰️' : hz.type === 'FLOOD' ? '🌊' : '🌧️';

        el.addEventListener('click', () => {
          setSelectedFeature(hz);
        });

        new maplibregl.Marker({ element: el })
          .setLngLat(hz.coords)
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', width: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* ── TOP CONTROL BAR: SEARCH & REGION PRESETS ────────────────────────────── */}
      <div style={{
        height: 56,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        {/* Left: Title & Region Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <Compass size={18} />
            </span>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                MAP OVERVIEW — NORTH EASTERN REGION
                <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 9999, backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 700 }}>
                  OPERATIONAL GIS
                </span>
              </div>
            </div>
          </div>

          <div style={{ height: 24, width: 1, backgroundColor: '#E2E8F0' }} />

          {/* Region Quick Select Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
            {[
              { id: 'all-ner', label: 'All NER (8 States)' },
              { id: 'guwahati-shillong', label: 'Guwahati–Shillong' },
              { id: 'barak-valley', label: 'Barak Valley (Silchar)' },
              { id: 'aizawl-link', label: 'Mizoram Link (NH-306)' },
              { id: 'arunachal', label: 'Arunachal Frontier' },
              { id: 'tripura', label: 'Tripura (Agartala)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  fontWeight: activePreset === p.id ? 700 : 500,
                  backgroundColor: activePreset === p.id ? '#059669' : '#F1F5F9',
                  color: activePreset === p.id ? '#ffffff' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Global Search & Layer Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search corridor, district, hazard (e.g. NH-6, Aizawl)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                fontSize: '0.8rem',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
                backgroundColor: '#F8FAFC',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: isDrawerOpen ? '#ECFDF5' : '#F8FAFC',
              color: isDrawerOpen ? '#047857' : '#334155',
              border: `1px solid ${isDrawerOpen ? '#A7F3D0' : '#CBD5E1'}`,
              cursor: 'pointer',
            }}
          >
            <Layers size={14} />
            <span>Layers ({activeLayerCount})</span>
          </button>
        </div>
      </div>

      {/* ── MAIN MAP VIEWPORT & FLOATING PANELS ─────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        
        {/* Map Container */}
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        {/* ── LEFT FLOATING LAYER & FILTER DRAWER ─────────────────────────────── */}
        {isDrawerOpen && (
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 280,
            maxHeight: 'calc(100% - 90px)',
            backgroundColor: '#ffffff',
            borderRadius: 10,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0',
            zIndex: 20,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sliders size={16} color="#059669" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>OPERATIONAL LAYERS</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. HAZARDS GROUP */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: 8 }}>
                HAZARDS & PREDICTIVE RISKS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { key: 'landslides', label: 'Landslide Vulnerability Points', icon: '⛰️' },
                  { key: 'floods', label: 'Riverine & Flash Flood Basins', icon: '🌊' },
                  { key: 'rainfall', label: 'Heavy Rainfall Radar Zones', icon: '🌧️' },
                  { key: 'overallRisk', label: 'Composite Corridor Risk', icon: '⚠️' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(layers as any)[item.key]}
                      onChange={() => toggleLayer(item.key as any)}
                      style={{ accentColor: '#059669' }}
                    />
                    <span>{item.icon}</span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. INFRASTRUCTURE GROUP */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: 8 }}>
                INFRASTRUCTURE & CORRIDORS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { key: 'roads', label: 'National Highway Network (NH)', color: '#3b82f6' },
                  { key: 'bridges', label: 'Culverts & Mountain Bridges', color: '#8b5cf6' },
                  { key: 'roadAccessibility', label: 'Dynamic Accessibility Status', color: '#10b981' },
                  { key: 'blockedCorridors', label: 'Blocked / Degraded Sections', color: '#ef4444' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(layers as any)[item.key]}
                      onChange={() => toggleLayer(item.key as any)}
                      style={{ accentColor: '#059669' }}
                    />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. LOGISTICS & RESOURCES */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: 8 }}>
                LOGISTICS & RELIEF RESOURCES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { key: 'resourceMovements', label: 'Essential Relief Convoys', icon: '🚛' },
                  { key: 'shortageDistricts', label: 'Shortage & Deficit Districts', icon: '🔴' },
                  { key: 'surplusDistricts', label: 'Surplus Supply Bases', icon: '🟢' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(layers as any)[item.key]}
                      onChange={() => toggleLayer(item.key as any)}
                      style={{ accentColor: '#059669' }}
                    />
                    <span>{item.icon}</span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. FIELD INTELLIGENCE */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: 8 }}>
                FIELD INTELLIGENCE & OBSERVERS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { key: 'fieldReports', label: 'Observer Ground Incidents', icon: '📡' },
                  { key: 'verifiedIncidents', label: 'Verified Incident Markers', icon: '✅' },
                ].map((item) => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(layers as any)[item.key]}
                      onChange={() => toggleLayer(item.key as any)}
                      style={{ accentColor: '#059669' }}
                    />
                    <span>{item.icon}</span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Basemap Switcher */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', marginBottom: 6 }}>
                BASEMAP GIS STYLE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { key: 'voyager', label: 'Voyager / Relief' },
                  { key: 'osm', label: 'Standard OSM' },
                ].map((style) => (
                  <button
                    key={style.key}
                    onClick={() => {
                      setMapStyleKey(style.key as any);
                      const map = mapRef.current;
                      if (map) {
                        const source = map.getSource('basemap') as any;
                        if (source && source.setTiles) {
                          const url = style.key === 'voyager'
                            ? 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
                            : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
                          source.setTiles([url]);
                        }
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: mapStyleKey === style.key ? 700 : 500,
                      backgroundColor: mapStyleKey === style.key ? '#ECFDF5' : '#F8FAFC',
                      color: mapStyleKey === style.key ? '#059669' : '#475569',
                      border: `1px solid ${mapStyleKey === style.key ? '#A7F3D0' : '#E2E8F0'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── RIGHT FLOATING SELECTED FEATURE INTELLIGENCE PANEL ─────────────────── */}
        {selectedFeature && (
          <div style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 360,
            maxHeight: 'calc(100% - 90px)',
            backgroundColor: '#ffffff',
            borderRadius: 10,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0',
            zIndex: 20,
            overflowY: 'auto',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
              <div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: selectedFeature.severity === 'CRITICAL' || selectedFeature.status === 'SHORTAGE' ? '#FEE2E2' : selectedFeature.severity === 'HIGH' ? '#FEF3C7' : '#ECFDF5',
                  color: selectedFeature.severity === 'CRITICAL' || selectedFeature.status === 'SHORTAGE' ? '#B91C1C' : selectedFeature.severity === 'HIGH' ? '#B45309' : '#047857',
                }}>
                  {selectedFeature.severity || selectedFeature.type || 'OPERATIONAL NODE'}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '6px 0 2px' }}>
                  {selectedFeature.name || selectedFeature.label}
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {selectedFeature.state || selectedFeature.district || 'North Eastern Region Lifeline Network'}
                </span>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Accessibility Gauge / Status Bar */}
            {selectedFeature.accessibility !== undefined && (
              <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>CORRIDOR ACCESSIBILITY</span>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: selectedFeature.accessibility > 75 ? '#10b981' : selectedFeature.accessibility > 45 ? '#f59e0b' : '#ef4444'
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

            {/* Primary Hazard Drivers */}
            {selectedFeature.primaryDrivers && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: 4 }}>
                  PRIMARY RISK DRIVERS
                </div>
                <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45, margin: 0 }}>
                  {selectedFeature.primaryDrivers}
                </p>
              </div>
            )}

            {/* Hazard Forecast or Ground Observation */}
            {selectedFeature.forecast && (
              <div style={{ backgroundColor: '#FEF3C7', padding: 10, borderRadius: 6, border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={13} />
                  <span>PREDICTIVE FORECAST WINDOW</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#78350F', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {selectedFeature.forecast}
                </p>
              </div>
            )}

            {/* Affected Districts */}
            {selectedFeature.affectedDistricts && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: 4 }}>
                  AFFECTED DISTRICTS & RELIEF HUBS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selectedFeature.affectedDistricts.map((d: string, idx: number) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
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

            {/* Resource Impact */}
            {selectedFeature.resourceImpact && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: 4 }}>
                  ESSENTIAL RESOURCE IMPACT
                </div>
                <p style={{ fontSize: '0.78rem', color: '#B91C1C', margin: 0, fontWeight: 600 }}>
                  {selectedFeature.resourceImpact}
                </p>
              </div>
            )}

            {/* Recommended Action / Route */}
            {selectedFeature.recommendedRoute && (
              <div style={{ backgroundColor: '#ECFDF5', padding: 10, borderRadius: 6, border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#065F46', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={13} />
                  <span>OPERATIONAL RECOMMENDATION</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#047857', margin: '4px 0 0', fontWeight: 600, lineHeight: 1.4 }}>
                  {selectedFeature.recommendedRoute}
                </p>
              </div>
            )}

            {/* ── CONNECTED DECISION FLOW BUTTONS ─────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
              <button
                onClick={() => navigate('/action')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <span>REVIEW AI RECOMMENDATIONS</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() =>
                  openWhatsAppModal({
                    movement_code: selectedFeature.movementCode || 'REL-001',
                    reason: selectedFeature.reason || `${selectedFeature.name || 'Corridor'}: Landslide / Access Risk Warning`,
                    old_route: selectedFeature.name || 'NH-6 Corridor',
                    new_route: 'Route B (Sonapur Ridge Highland Corridor)',
                    destination: selectedFeature.destination || 'Shillong Core Relief Hub',
                  })
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  cursor: 'pointer',
                }}
              >
                <MessageSquare size={14} style={{ color: '#059669' }} />
                <span>SEND DRIVER WHATSAPP ALERT</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  onClick={() => navigate('/resources')}
                  style={{
                    padding: '7px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                  }}
                >
                  Resource Impact
                </button>
                <button
                  onClick={() => navigate('/action')}
                  style={{
                    padding: '7px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    cursor: 'pointer',
                  }}
                >
                  View Alerts & Action
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── BOTTOM BAR: OPERATIONAL LEGEND & DATA FRESHNESS ─────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 10,
        }}>
          {/* Legend Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            
            {/* Risk Levels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B' }}>RISK:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} /> Low
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} /> High
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} /> Critical
                </span>
              </div>
            </div>

            <div style={{ height: 16, width: 1, backgroundColor: '#CBD5E1' }} />

            {/* Accessibility Levels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B' }}>ACCESSIBILITY:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 14, height: 3, backgroundColor: '#10b981', borderRadius: 2 }} /> Accessible
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 14, height: 3, backgroundColor: '#f59e0b', borderRadius: 2 }} /> At Risk
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 14, height: 3, backgroundColor: '#ef4444', borderRadius: 2 }} /> Disrupted
                </span>
              </div>
            </div>

            <div style={{ height: 16, width: 1, backgroundColor: '#CBD5E1' }} />

            {/* Resources */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B' }}>DISTRICT STOCKS:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} /> Surplus
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} /> Shortage
                </span>
              </div>
            </div>

          </div>

          {/* Right: Data Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 9999,
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
              SIMULATION / PROTOTYPE DATA
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
              Calibrated with Official IMD & NESAC Parameters
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
