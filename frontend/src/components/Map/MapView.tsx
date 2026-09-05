import React from 'react';
import { useArohanStore } from '../../stores/arohanStore';
import { SHIPMENT_MAP_CONFIGS } from '../../config/shipmentRoutes';
import { gpsSimulationService } from '../../services/gpsSimulationService';
import { nasaFirmsService } from '../../services/nasaFirmsService';
import {
  Play,
  Pause,
  RotateCcw,
  Crosshair,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Phone,
  Eye,
  EyeOff,
  Flame
} from 'lucide-react';

const MAP_STYLES = {
  osm: {
    label: 'Street Standard',
    tile: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  topo: {
    label: 'Topographic',
    tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  },
  satellite: {
    label: 'Satellite',
    tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  },
};

export function MapView() {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<any>(null);
  const originMarkerRef = React.useRef<any>(null);
  const destMarkerRef = React.useRef<any>(null);
  const hazardMarkerRef = React.useRef<any>(null);
  const vehicleMarkerRef = React.useRef<any>(null);

  const [followTruck, setFollowTruck] = React.useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = React.useState<number>(20);
  const [mapStyleKey, setMapStyleKey] = React.useState<'osm' | 'topo' | 'satellite'>('osm');
  const [showHazardLayer, setShowHazardLayer] = React.useState<boolean>(true);
  const [showFirmsLayer, setShowFirmsLayer] = React.useState<boolean>(true);

  // Popup states
  const [showVehiclePopup, setShowVehiclePopup] = React.useState<boolean>(false);
  const [vehicleTab, setVehicleTab] = React.useState<'telemetry' | 'cargo' | 'health'>('telemetry');
  const [showHazardPopup, setShowHazardPopup] = React.useState<boolean>(false);

  const {
    selectedShipmentId,
    gpsUpdate,
    setGpsUpdate,
    shipment
  } = useArohanStore();

  const currentConfig = SHIPMENT_MAP_CONFIGS[selectedShipmentId || 1] || SHIPMENT_MAP_CONFIGS[1];

  // Subscribe to GPS Simulation Service updates
  React.useEffect(() => {
    gpsSimulationService.setShipment(selectedShipmentId || 1);
    const unsubscribe = gpsSimulationService.subscribe((update) => {
      setGpsUpdate(update);
    });
    return () => unsubscribe();
  }, [selectedShipmentId]);

  // Sync simulation speed
  const handleSpeedChange = (mult: number) => {
    setSpeedMultiplier(mult);
    gpsSimulationService.setSpeedMultiplier(mult);
  };

  const handleStartPause = () => {
    if (gpsSimulationService.isSimulating()) {
      gpsSimulationService.pause();
    } else {
      gpsSimulationService.start();
    }
  };

  const handleReset = () => {
    gpsSimulationService.reset(selectedShipmentId || 1);
  };

  const handleAcceptReroute = () => {
    gpsSimulationService.acceptReroute();
  };

  const handleKeepRoute = () => {
    gpsSimulationService.keepCurrentRoute();
  };

  // Zoom / Camera handlers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleFitBounds = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: currentConfig.center,
      zoom: currentConfig.zoom,
      essential: true,
    });
  };

  // Change Map Basemap Tile Source
  const handleStyleChange = (key: 'osm' | 'topo' | 'satellite') => {
    setMapStyleKey(key);
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('osm');
    if (source && source.setTiles) {
      source.setTiles([MAP_STYLES[key].tile]);
    }
  };

  // Initialize MapLibre
  React.useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    import('maplibre-gl').then((maplibregl) => {
      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: [MAP_STYLES[mapStyleKey].tile],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: currentConfig.center,
        zoom: currentConfig.zoom,
      });

      mapRef.current = map;

      // User manually panning map disables auto-follow
      map.on('dragstart', () => {
        setFollowTruck(false);
      });

      map.on('load', () => {
        // NASA FIRMS Thermal Anomalies & Active Fire Layer (WMS)
        map.addSource('nasa-firms-source', {
          type: 'raster',
          tiles: [nasaFirmsService.getWmsTileUrl('fires_viirs_24')],
          tileSize: 256,
        });
        map.addLayer({
          id: 'nasa-firms-layer',
          type: 'raster',
          source: 'nasa-firms-source',
          paint: { 'raster-opacity': 0.85 },
        });

        // Route A source
        map.addSource('route-a', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: currentConfig.routeACoords }, properties: {} },
        });
        map.addLayer({
          id: 'route-a-line',
          type: 'line',
          source: 'route-a',
          paint: { 'line-color': '#d97706', 'line-width': 4, 'line-opacity': 0.9, 'line-dasharray': [4, 2] },
        });

        // Route B source
        map.addSource('route-b', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: currentConfig.routeBCoords }, properties: {} },
        });
        map.addLayer({
          id: 'route-b-line',
          type: 'line',
          source: 'route-b',
          paint: { 'line-color': '#64748b', 'line-width': 3, 'line-opacity': 0.6 },
        });

        // Disruption zone
        map.addSource('disruption-zone', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [currentConfig.disruptionZone] },
            properties: {},
          },
        });
        map.addLayer({
          id: 'disruption-fill',
          type: 'fill',
          source: 'disruption-zone',
          paint: { 'fill-color': '#dc2626', 'fill-opacity': 0.18 },
        });
        map.addLayer({
          id: 'disruption-border',
          type: 'line',
          source: 'disruption-zone',
          paint: { 'line-color': '#dc2626', 'line-width': 2, 'line-opacity': 0.8, 'line-dasharray': [3, 3] },
        });

        const createMarkerContainer = () => document.createElement('div');

        // Origin Marker (Clean minimal badge)
        const originEl = createMarkerContainer();
        originEl.innerHTML = `<div style="
          background:#0f172a;color:#ffffff;font-weight:800;font-size:10px;
          padding:4px 8px;border-radius:5px;border:1px solid #475569;
          box-shadow:0 2px 4px rgba(0,0,0,0.25);white-space:nowrap;font-family:Inter,sans-serif;
          text-transform:uppercase;letter-spacing:0.03em;display:flex;align-items:center;gap:4px;
        "><span style="width:6px;height:6px;border-radius:50%;background:#38bdf8;"></span>${currentConfig.originName}</div>`;

        originMarkerRef.current = new maplibregl.Marker({ element: originEl })
          .setLngLat(currentConfig.originCoords)
          .addTo(map);

        // Destination Marker (Clean minimal badge)
        const destEl = createMarkerContainer();
        destEl.innerHTML = `<div style="
          background:#15803d;color:#ffffff;font-weight:800;font-size:10px;
          padding:4px 8px;border-radius:5px;border:1px solid #166534;
          box-shadow:0 2px 4px rgba(0,0,0,0.25);white-space:nowrap;font-family:Inter,sans-serif;
          text-transform:uppercase;letter-spacing:0.03em;display:flex;align-items:center;gap:4px;
        "><span style="width:6px;height:6px;border-radius:50%;background:#4ade80;"></span>${currentConfig.destName}</div>`;

        destMarkerRef.current = new maplibregl.Marker({ element: destEl })
          .setLngLat(currentConfig.destCoords)
          .addTo(map);

        // Hazard Marker (De-cluttered icon badge)
        const hazardEl = createMarkerContainer();
        hazardEl.style.cursor = 'pointer';
        hazardEl.innerHTML = `<div id="hazard-marker-node" style="
          background:#fef2f2;color:#991b1b;font-weight:800;font-size:10px;
          padding:4px 8px;border-radius:5px;border:1.5px solid #dc2626;
          box-shadow:0 2px 6px rgba(220,38,38,0.25);white-space:nowrap;font-family:Inter,sans-serif;
          display:flex;align-items:center;gap:5px;
        ">
          <span style="font-size:11px;">⚠️</span>
          <span>HAZARD: ${currentConfig.hazardName}</span>
        </div>`;

        hazardEl.addEventListener('click', () => {
          setShowHazardPopup((prev) => !prev);
        });

        hazardMarkerRef.current = new maplibregl.Marker({ element: hazardEl })
          .setLngLat(currentConfig.hazardCoords)
          .addTo(map);

        // Live Rotatable Uber/Google-style Truck Marker
        const vehicleEl = createMarkerContainer();
        vehicleEl.style.cursor = 'pointer';
        vehicleEl.innerHTML = `<div id="truck-marker-node" style="
          position:relative;width:36px;height:36px;border-radius:50%;
          background:#0f172a;border:2.5px solid #ffffff;
          box-shadow:0 4px 14px rgba(15,23,42,0.45);
          display:flex;align-items:center;justify-content:center;
          transition:transform 0.2s ease;
        ">
          <div id="truck-compass-arrow" style="
            position:absolute;inset:-3px;border-radius:50%;
            border:2.5px solid transparent;border-top-color:#38bdf8;
            transition:transform 0.3s ease;
          "></div>
          <span style="font-size:16px;line-height:1;">🚚</span>
        </div>`;

        vehicleEl.addEventListener('click', () => {
          setShowVehiclePopup((prev) => !prev);
        });

        vehicleMarkerRef.current = new maplibregl.Marker({ element: vehicleEl })
          .setLngLat(currentConfig.originCoords)
          .addTo(map);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Reactively update map data, line colors, markers, visibility layers, and live vehicle position
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const activeRouteIsB = gpsUpdate?.active_route_label === 'B';

    // Toggle NASA FIRMS Layer
    if (map.getLayer('nasa-firms-layer')) {
      map.setPaintProperty('nasa-firms-layer', 'raster-opacity', showFirmsLayer ? 0.85 : 0);
    }

    // Update GeoJSON Sources
    const sourceA = map.getSource('route-a');
    if (sourceA) {
      sourceA.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: currentConfig.routeACoords },
        properties: {},
      });
    }

    const sourceB = map.getSource('route-b');
    if (sourceB) {
      sourceB.setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: currentConfig.routeBCoords },
        properties: {},
      });
    }

    const sourceDZ = map.getSource('disruption-zone');
    if (sourceDZ) {
      sourceDZ.setData({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [currentConfig.disruptionZone] },
        properties: {},
      });
    }

    // Toggle Disruption fill/border visibility
    if (map.getLayer('disruption-fill')) {
      map.setPaintProperty('disruption-fill', 'fill-opacity', showHazardLayer ? 0.18 : 0);
      map.setPaintProperty('disruption-border', 'line-opacity', showHazardLayer ? 0.8 : 0);
    }

    // Dynamic line styling based on active route
    if (activeRouteIsB) {
      map.setPaintProperty('route-a-line', 'line-color', '#94a3b8');
      map.setPaintProperty('route-a-line', 'line-width', 3);
      map.setPaintProperty('route-a-line', 'line-opacity', 0.5);

      map.setPaintProperty('route-b-line', 'line-color', '#16a34a');
      map.setPaintProperty('route-b-line', 'line-width', 5);
      map.setPaintProperty('route-b-line', 'line-opacity', 0.95);
    } else {
      const routeAColor = gpsUpdate?.hazard_approach_state === 'CRITICAL_DECISION'
        ? '#dc2626'
        : gpsUpdate?.hazard_approach_state === 'WARNING'
        ? '#ea580c'
        : '#d97706';
      map.setPaintProperty('route-a-line', 'line-color', routeAColor);
      map.setPaintProperty('route-a-line', 'line-width', 4);
      map.setPaintProperty('route-a-line', 'line-opacity', 0.9);

      map.setPaintProperty('route-b-line', 'line-color', '#64748b');
      map.setPaintProperty('route-b-line', 'line-width', 3);
      map.setPaintProperty('route-b-line', 'line-opacity', 0.6);
    }

    // Position & Heading from GPS Update
    if (vehicleMarkerRef.current && gpsUpdate && gpsUpdate.shipmentId === currentConfig.id) {
      const targetLngLat: [number, number] = [gpsUpdate.longitude, gpsUpdate.latitude];
      vehicleMarkerRef.current.setLngLat(targetLngLat);

      const compassArrowEl = document.getElementById('truck-compass-arrow');
      if (compassArrowEl) {
        compassArrowEl.style.transform = `rotate(${gpsUpdate.heading_deg}deg)`;
      }

      // Auto-Follow Camera Mode
      if (followTruck) {
        map.easeTo({
          center: targetLngLat,
          duration: 200,
          essential: true,
        });
      }
    } else {
      map.flyTo({
        center: currentConfig.center,
        zoom: currentConfig.zoom,
        essential: true,
      });
    }
  }, [selectedShipmentId, currentConfig, gpsUpdate, followTruck, showHazardLayer, showFirmsLayer]);

  // Auto-resize MapLibre GL map when container dimensions change
  React.useEffect(() => {
    if (!mapContainer.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainer.current);
    return () => resizeObserver.disconnect();
  }, []);

  const isSimulating = gpsSimulationService.isSimulating();
  const simStatus = gpsSimulationService.getStatus();
  const activeSpeed = gpsSimulationService.getSpeedMultiplier();
  const isRerouted = gpsUpdate?.active_route_label === 'B';
  const approachState = gpsUpdate?.hazard_approach_state || 'NORMAL';

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* TOP-LEFT: GPS Simulation Control Panel Toolbar with High Z-Index & Explicit Pointer Events */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        maxWidth: 'calc(100% - 20px)',
        zIndex: 50,
        pointerEvents: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        padding: '5px 10px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        overflowX: 'auto',
        maxHeight: '130px',
      }}>
        {/* Source Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-navy)', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 7px', borderRadius: 4 }}>
          <Navigation size={11} className={isSimulating ? 'animate-spin' : ''} style={{ color: 'var(--primary-blue)' }} />
          <span>GPS SIMULATION</span>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStartPause();
          }}
          className="btn btn-sm btn-blue"
          style={{ padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', pointerEvents: 'auto' }}
        >
          {isSimulating ? <Pause size={12} /> : <Play size={12} />}
          <span>{isSimulating ? 'PAUSE' : simStatus.progress >= 100 ? 'RESTART' : 'START'}</span>
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="btn btn-sm btn-secondary"
          style={{ padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer', pointerEvents: 'auto' }}
          title="Reset Simulation to Departure Hub"
        >
          <RotateCcw size={12} />
          <span>RESET</span>
        </button>

        {/* Speed Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, borderLeft: '1px solid var(--border-medium)', paddingLeft: 8 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>SPEED:</span>
          {[1, 5, 10, 20, 50, 100].map((mult) => {
            const isActive = activeSpeed === mult || speedMultiplier === mult;
            return (
              <button
                key={mult}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeedChange(mult);
                }}
                style={{
                  border: '1px solid',
                  borderColor: isActive ? 'var(--primary-blue)' : 'var(--border-medium)',
                  backgroundColor: isActive ? 'var(--primary-navy)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--text-main)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '3px 7px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  userSelect: 'none',
                }}
              >
                {mult}×
              </button>
            );
          })}
        </div>

        {/* Map Basemap Style Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, borderLeft: '1px solid var(--border-medium)', paddingLeft: 8 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>THEME:</span>
          {(['osm', 'topo', 'satellite'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStyleChange(key);
              }}
              style={{
                border: '1px solid',
                borderColor: mapStyleKey === key ? 'var(--primary-blue)' : 'var(--border-medium)',
                backgroundColor: mapStyleKey === key ? '#eff6ff' : '#ffffff',
                color: mapStyleKey === key ? '#1e40af' : 'var(--text-muted)',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                pointerEvents: 'auto',
                textTransform: 'uppercase',
              }}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Layers & Camera Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderLeft: '1px solid var(--border-medium)', paddingLeft: 8 }}>
          {/* NASA FIRMS Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFirmsLayer(!showFirmsLayer);
            }}
            title="Toggle NASA FIRMS Active Fire / Thermal Anomaly Satellite Layer"
            style={{
              border: '1px solid',
              borderColor: showFirmsLayer ? '#ea580c' : 'var(--border-medium)',
              backgroundColor: showFirmsLayer ? '#fff7ed' : '#ffffff',
              color: showFirmsLayer ? '#c2410c' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '3px 7px',
              borderRadius: 4,
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Flame size={12} style={{ color: showFirmsLayer ? '#ea580c' : 'inherit' }} />
            <span>NASA FIRMS</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowHazardLayer(!showHazardLayer);
            }}
            title="Toggle Hazard Zone Layer"
            style={{
              border: '1px solid',
              borderColor: showHazardLayer ? '#dc2626' : 'var(--border-medium)',
              backgroundColor: showHazardLayer ? '#fef2f2' : '#ffffff',
              color: showHazardLayer ? '#991b1b' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '3px 6px',
              borderRadius: 4,
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}
          >
            {showHazardLayer ? <Eye size={11} /> : <EyeOff size={11} />}
            <span>HAZARDS</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFollowTruck(!followTruck);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              border: '1px solid',
              borderColor: followTruck ? '#16a34a' : 'var(--border-medium)',
              backgroundColor: followTruck ? '#f0fdf4' : '#ffffff',
              color: followTruck ? '#14532d' : 'var(--text-muted)',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          >
            <Crosshair size={12} style={{ color: followTruck ? '#16a34a' : 'inherit' }} />
            <span>{followTruck ? 'FOLLOWING' : 'FOLLOW'}</span>
          </button>
        </div>
      </div>

      {/* FLOATING MAP ZOOM & CAMERA CONTROLS (MIDDLE LEFT) */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 12,
        zIndex: 50,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-medium)',
        borderRadius: 6,
        padding: 4,
        boxShadow: 'var(--shadow-md)',
      }}>
        <button type="button" onClick={handleZoomIn} title="Zoom In" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#334155', pointerEvents: 'auto' }}>
          <ZoomIn size={14} />
        </button>
        <div style={{ height: 1, backgroundColor: '#e2e8f0' }} />
        <button type="button" onClick={handleZoomOut} title="Zoom Out" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#334155', pointerEvents: 'auto' }}>
          <ZoomOut size={14} />
        </button>
        <div style={{ height: 1, backgroundColor: '#e2e8f0' }} />
        <button type="button" onClick={handleFitBounds} title="Fit Entire Route Corridor" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#1e40af', pointerEvents: 'auto' }}>
          <Maximize2 size={14} />
        </button>
      </div>

      {/* TOP-RIGHT: GIS Telemetry Overlay Badges */}
      <div className="map-info-overlay" style={{ position: 'absolute', top: 12, right: 12, zIndex: 40, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <div className="map-badge-rect" style={{ background: '#0f172a', color: '#ffffff', pointerEvents: 'auto' }}>
          <span>CORRIDOR: {currentConfig.corridorLabel}</span>
        </div>

        {/* NASA FIRMS Provenance Badge */}
        {showFirmsLayer && (
          <div className="map-badge-rect" style={{ color: '#c2410c', backgroundColor: '#fff7ed', borderColor: '#ffedd5', pointerEvents: 'auto', fontWeight: 800 }}>
            <Flame size={12} style={{ color: '#ea580c' }} />
            <span>NASA FIRMS VIIRS SATELLITE THERMAL MONITORING</span>
          </div>
        )}

        {/* Live GPS Telemetry Badge */}
        {gpsUpdate && gpsUpdate.shipmentId === currentConfig.id && (
          <div className="map-badge-rect" style={{ color: '#1e40af', backgroundColor: '#eff6ff', borderColor: '#bfdbfe', pointerEvents: 'auto' }}>
            <span>🚚 {gpsUpdate.truckId} · {gpsUpdate.speed_kmh} KM/H · {gpsUpdate.heading_cardinal} ({gpsUpdate.heading_deg}°) · {gpsUpdate.progress_pct}%</span>
          </div>
        )}

        {/* Hazard Approach Distance State Badge */}
        {gpsUpdate && !isRerouted && (
          <div className="map-badge-rect" style={{
            pointerEvents: 'auto',
            color: approachState === 'CRITICAL_DECISION' ? '#991b1b' : approachState === 'WARNING' ? '#c2410c' : approachState === 'UPCOMING' ? '#854d0e' : '#15803d',
            backgroundColor: approachState === 'CRITICAL_DECISION' ? '#fef2f2' : approachState === 'WARNING' ? '#fff7ed' : approachState === 'UPCOMING' ? '#fefce8' : '#f0fdf4',
            borderColor: approachState === 'CRITICAL_DECISION' ? '#fecaca' : approachState === 'WARNING' ? '#ffedd5' : approachState === 'UPCOMING' ? '#fef08a' : '#bbf7d0',
            fontWeight: 800
          }}>
            <span>
              {approachState === 'CRITICAL_DECISION' && `🚨 CRITICAL HAZARD DISTANCE: ${gpsUpdate.distance_to_hazard_km} KM`}
              {approachState === 'WARNING' && `⚠️ HAZARD WARNING: ${gpsUpdate.distance_to_hazard_km} KM`}
              {approachState === 'UPCOMING' && `⚡ HAZARD AHEAD: ${gpsUpdate.distance_to_hazard_km} KM`}
              {approachState === 'NORMAL' && `✅ CORRIDOR DISTANCE CLEAR (${gpsUpdate.distance_to_hazard_km} KM TO HAZARD)`}
            </span>
          </div>
        )}

        {isRerouted && (
          <div className="map-badge-rect" style={{ color: '#14532d', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', fontWeight: 800, pointerEvents: 'auto' }}>
            <CheckCircle2 size={13} />
            <span>SONAPUR RIDGE BYPASS ACTIVE (ROUTE B)</span>
          </div>
        )}

        {gpsUpdate?.simulated_status === 'DELIVERED' && (
          <div className="map-badge-rect" style={{ color: '#14532d', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', pointerEvents: 'auto' }}>
            <CheckCircle2 size={13} />
            <span>JOURNEY COMPLETED — ARRIVED AT DESTINATION</span>
          </div>
        )}
      </div>

      {/* CLICK POPUP: Tabbed Interactive Vehicle Telemetry Card */}
      {showVehiclePopup && gpsUpdate && (
        <div style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 60,
          pointerEvents: 'auto',
          width: 340,
          background: '#ffffff',
          borderRadius: 8,
          border: '1px solid var(--border-medium)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          padding: 14,
          fontFamily: 'Inter, sans-serif'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>🚚</span>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{gpsUpdate.truckId} ({gpsUpdate.shipmentCode})</strong>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Live Satellite Synchronized Telemetry</div>
              </div>
            </div>
            <button type="button" onClick={() => setShowVehiclePopup(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={14} />
            </button>
          </div>

          {/* Interactive Navigation Tabs inside Popup */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10, background: '#f8fafc', padding: 3, borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setVehicleTab('telemetry')}
              style={{
                flex: 1,
                border: 'none',
                background: vehicleTab === 'telemetry' ? '#ffffff' : 'transparent',
                color: vehicleTab === 'telemetry' ? '#1d4ed8' : '#64748b',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '4px 0',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: vehicleTab === 'telemetry' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              GPS Telemetry
            </button>
            <button
              type="button"
              onClick={() => setVehicleTab('cargo')}
              style={{
                flex: 1,
                border: 'none',
                background: vehicleTab === 'cargo' ? '#ffffff' : 'transparent',
                color: vehicleTab === 'cargo' ? '#1d4ed8' : '#64748b',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '4px 0',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: vehicleTab === 'cargo' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Cargo & Driver
            </button>
            <button
              type="button"
              onClick={() => setVehicleTab('health')}
              style={{
                flex: 1,
                border: 'none',
                background: vehicleTab === 'health' ? '#ffffff' : 'transparent',
                color: vehicleTab === 'health' ? '#1d4ed8' : '#64748b',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '4px 0',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: vehicleTab === 'health' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Health Diagnostics
            </button>
          </div>

          {/* TAB 1: GPS TELEMETRY */}
          {vehicleTab === 'telemetry' && (
            <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 5, color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <strong style={{ color: '#1d4ed8' }}>{gpsUpdate.simulated_status} ({gpsUpdate.progress_pct}%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Speed & Heading:</span>
                <strong>{gpsUpdate.speed_kmh} KM/H · {gpsUpdate.heading_cardinal} ({gpsUpdate.heading_deg}°)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Covered / Total:</span>
                <strong>{gpsUpdate.distance_covered_km} km / {gpsUpdate.total_distance_km} km</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Estimated Arrival:</span>
                <strong>{gpsUpdate.eta_formatted}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Current Location:</span>
                <strong style={{ fontSize: '0.68rem', maxWidth: 170, textAlign: 'right' }}>{gpsUpdate.current_location_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: '#64748b' }}>Active Route:</span>
                <span style={{ fontWeight: 800, color: isRerouted ? '#16a34a' : '#d97706' }}>
                  {isRerouted ? 'ROUTE B (SONAPUR BYPASS)' : 'ROUTE A (PRIMARY NH-6)'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CARGO & DRIVER */}
          {vehicleTab === 'cargo' && (
            <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 5, color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Cargo Manifest:</span>
                <strong style={{ textAlign: 'right', maxWidth: 170 }}>{shipment?.cargo_type || 'Disaster Relief Supplies'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payload Weight:</span>
                <strong>{shipment?.weight_kg || 4200} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Assigned Driver:</span>
                <strong>Arjun Sharma (ID: DRV-8821)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Origin Hub:</span>
                <strong>{currentConfig.originName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Destination Hub:</span>
                <strong>{currentConfig.destName}</strong>
              </div>
              <button
                type="button"
                onClick={() => alert(`Connecting encrypted radio beacon to Driver ${gpsUpdate.truckId}...`)}
                style={{
                  marginTop: 6,
                  backgroundColor: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe',
                  borderRadius: 4,
                  padding: '5px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <Phone size={12} />
                <span>CALL DRIVER RADIO BEACON</span>
              </button>
            </div>
          )}

          {/* TAB 3: HEALTH DIAGNOSTICS */}
          {vehicleTab === 'health' && (
            <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 5, color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Fuel / Battery Level:</span>
                <strong style={{ color: '#16a34a' }}>84% (Sufficient for 340 km)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>GPS Satellite Lock:</span>
                <strong style={{ color: '#16a34a' }}>14 Satellites (Sub-meter precision)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Engine Temperature:</span>
                <strong>88°C (Normal Range)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tire Pressure Monitor:</span>
                <strong style={{ color: '#16a34a' }}>All 6 Tyres OK (32 PSI)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Telemetry Signal:</span>
                <strong style={{ color: '#1d4ed8' }}>5G NR Mobile Mesh (Full Bar)</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLICK POPUP: Hazard Detail Card */}
      {showHazardPopup && (
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 60,
          pointerEvents: 'auto',
          width: 320,
          background: '#ffffff',
          borderRadius: 8,
          border: '1px solid #fecaca',
          boxShadow: '0 10px 25px rgba(220,38,38,0.15)',
          padding: 14,
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #fee2e2', paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#991b1b' }}>
              <AlertTriangle size={16} />
              <strong style={{ fontSize: '0.85rem' }}>HAZARD: {currentConfig.hazardName}</strong>
            </div>
            <button type="button" onClick={() => setShowHazardPopup(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 5, color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Risk Type:</span>
              <strong style={{ color: '#dc2626' }}>Heavy Rainfall & Landslide Exposure</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Severity Level:</span>
              <strong style={{ color: '#dc2626' }}>HIGH (78% Disruption Risk)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Distance from Vehicle:</span>
              <strong>{gpsUpdate?.distance_to_hazard_km ?? '--'} km</strong>
            </div>
            <div style={{ marginTop: 4, background: '#fef2f2', padding: 6, borderRadius: 4, color: '#991b1b', fontSize: '0.68rem' }}>
              <strong>Impact:</strong> NH-6 corridor sector blocked due to mudslides. AI Decision Engine recommends dynamic bypass via Sonapur Ridge (Route B).
            </div>

            <button
              type="button"
              onClick={() => {
                handleAcceptReroute();
                setShowHazardPopup(false);
              }}
              style={{
                marginTop: 6,
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4,
                padding: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <Zap size={12} />
              <span>TRIGGER INSTANT REROUTE (ROUTE B)</span>
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM-CENTER: Decision Support Reroute Pipeline Overlay */}
      {gpsUpdate && (gpsUpdate.reroute_recommended || approachState === 'CRITICAL_DECISION' || approachState === 'WARNING') && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 45,
          pointerEvents: 'auto',
          width: '92%',
          maxWidth: 680,
          backgroundColor: '#ffffff',
          border: '2px solid',
          borderColor: isRerouted ? '#16a34a' : '#dc2626',
          borderRadius: 8,
          padding: '12px 16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} style={{ color: isRerouted ? '#16a34a' : '#dc2626' }} />
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  AROHAN DECISION SUPPORT ENGINE — {isRerouted ? 'REROUTE EXECUTED' : 'HAZARD AHEAD'}
                </strong>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                  {isRerouted
                    ? `TRUCK-001 redirected safely via Sonapur Bypass. Disruption risk eliminated.`
                    : `Approaching ${currentConfig.hazardName} (${gpsUpdate.distance_to_hazard_km} km remaining). Action required.`}
                </div>
              </div>
            </div>

            <div style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 4,
              backgroundColor: isRerouted ? '#f0fdf4' : '#fef2f2',
              color: isRerouted ? '#15803d' : '#991b1b',
              border: `1px solid ${isRerouted ? '#bbf7d0' : '#fecaca'}`,
            }}>
              {isRerouted ? 'STATUS: OPTIMAL ROUTE B' : `DIST TO HAZARD: ${gpsUpdate.distance_to_hazard_km} KM`}
            </div>
          </div>

          {/* Route Option Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '8px 0' }}>
            {/* Route A Card */}
            <div style={{
              padding: 8,
              borderRadius: 6,
              border: '1px solid',
              borderColor: !isRerouted ? '#fecaca' : '#e2e8f0',
              backgroundColor: !isRerouted ? '#fff5f5' : '#f8fafc',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                <span>Route A (NH-6 Primary)</span>
                <span style={{ color: '#dc2626' }}>78% Exposure</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3 }}>
                Sector: {currentConfig.hazardName} Landslide Zone
              </div>
            </div>

            {/* Route B Card */}
            <div style={{
              padding: 8,
              borderRadius: 6,
              border: '1px solid',
              borderColor: isRerouted ? '#bbf7d0' : '#cbd5e1',
              backgroundColor: isRerouted ? '#f0fdf4' : '#ffffff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                <span style={{ color: '#15803d' }}>Route B (Sonapur Bypass)</span>
                <span style={{ color: '#16a34a' }}>12% Exposure</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3 }}>
                Clear Sector · Saves ~42 mins arrival delay
              </div>
            </div>
          </div>

          {/* Decision Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {!isRerouted ? (
              <>
                <button
                  type="button"
                  onClick={handleAcceptReroute}
                  className="btn btn-sm btn-blue"
                  style={{
                    flex: 2,
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor: '#16a34a',
                    borderColor: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer'
                  }}
                >
                  <Zap size={14} />
                  <span>ACCEPT REROUTE (SWITCH TO ROUTE B)</span>
                </button>
                <button
                  type="button"
                  onClick={handleKeepRoute}
                  className="btn btn-sm btn-secondary"
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: '0.72rem',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  KEEP ROUTE A
                </button>
              </>
            ) : (
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#15803d',
                fontWeight: 700
              }}>
                <span>✓ Vehicle movement dynamically redirected to Route B. Simulation continuing seamlessly.</span>
                <button
                  type="button"
                  onClick={handleKeepRoute}
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.65rem',
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Revert to Route A
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GIS Legend Container */}
      <div className="map-legend" style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 40, pointerEvents: 'auto' }}>
        <div className="map-legend-title">GIS CORRIDOR NETWORK LEGEND</div>
        <div className="map-legend-item">
          <div className="map-legend-line" style={{ background: isRerouted ? '#94a3b8' : '#d97706' }} />
          <span style={{ fontWeight: !isRerouted ? 700 : 400 }}>{currentConfig.routeAName} {!isRerouted ? '(Active)' : ''}</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-line" style={{ background: isRerouted ? '#16a34a' : '#64748b' }} />
          <span style={{ fontWeight: isRerouted ? 700 : 400 }}>{currentConfig.routeBName} {isRerouted ? '(Active Reroute)' : ''}</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-line" style={{ background: '#ea580c' }} />
          <span>🔥 NASA FIRMS Active Thermal Anomalies (VIIRS 375m)</span>
        </div>
        <div className="map-legend-item">
          <div className="map-legend-line" style={{ background: '#dc2626' }} />
          <span>Disruption / Hazard Exposure Zone</span>
        </div>
      </div>
    </div>
  );
}
