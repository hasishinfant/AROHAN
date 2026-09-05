import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TransportMode } from '../../types';
import { TERMINALS_BY_MODE, HAZARDS_BY_MODE, MODE_METADATA } from '../../services/multimodalDataService';
import { multimodalSimulationService, VehicleTelemetry } from '../../services/multimodalSimulationService';
import { Truck, Train, Ship, Plane, ShieldAlert, Building2, MapPin, Activity } from 'lucide-react';

interface MultimodalMapViewProps {
  activeMode: TransportMode;
  onSelectTerminal?: (terminalName: string) => void;
}

export function MultimodalMapView({ activeMode, onSelectTerminal }: MultimodalMapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const vehicleMarkerRef = useRef<maplibregl.Marker | null>(null);
  const terminalMarkersRef = useRef<maplibregl.Marker[]>([]);
  const hazardMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [telemetry, setTelemetry] = useState<VehicleTelemetry>(
    multimodalSimulationService.getModeTelemetry(activeMode)
  );

  // Center coordinates for NER
  const nerCenter: [number, number] = [91.7362, 26.1445]; // [lng, lat]

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: nerCenter,
      zoom: 7.5,
      pitch: 15,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Subscribe to simulation telemetry
  useEffect(() => {
    const unsubscribe = multimodalSimulationService.subscribe((allTelem) => {
      if (allTelem[activeMode]) {
        setTelemetry(allTelem[activeMode]);
      }
    });
    return () => unsubscribe();
  }, [activeMode]);

  // Handle Mode Change & Layer Isolation
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // 1. Clear existing markers
    terminalMarkersRef.current.forEach((m) => m.remove());
    terminalMarkersRef.current = [];
    hazardMarkersRef.current.forEach((m) => m.remove());
    hazardMarkersRef.current = [];
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.remove();
      vehicleMarkerRef.current = null;
    }

    // 2. Add Terminals for active mode
    const terminals = TERMINALS_BY_MODE[activeMode] || [];
    terminals.forEach((term) => {
      const el = document.createElement('div');
      el.className = 'terminal-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getModeColor(activeMode);
      el.style.border = '2px solid #ffffff';
      el.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = '#ffffff';
      el.style.cursor = 'pointer';
      el.title = `${term.name} (${term.code})`;

      // Render mode-specific icon into element
      el.innerHTML = getTerminalIconSvg(activeMode);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([term.longitude, term.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding:4px; font-family:Inter, sans-serif;">
              <strong style="font-size:0.85rem; color:#0f172a;">${term.name}</strong><br/>
              <span style="font-size:0.72rem; color:#64748b;">Code: ${term.code} | Status: <strong>${term.operationalStatus}</strong></span><br/>
              <span style="font-size:0.72rem; color:#1d4ed8;">Capacity Usage: ${term.capacityPct}%</span>
            </div>
          `)
        )
        .addTo(map);

      terminalMarkersRef.current.push(marker);
    });

    // 3. Add Hazards for active mode
    const hazards = HAZARDS_BY_MODE[activeMode] || [];
    hazards.forEach((haz) => {
      const el = document.createElement('div');
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#dc2626';
      el.style.border = '2px solid #ffffff';
      el.style.boxShadow = '0 2px 5px rgba(220,38,38,0.5)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = '#ffffff';
      el.style.cursor = 'pointer';
      el.title = haz.title;

      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([haz.longitude, haz.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setHTML(`
            <div style="padding:4px; font-family:Inter, sans-serif;">
              <strong style="font-size:0.85rem; color:#dc2626;">HAZARD: ${haz.title}</strong><br/>
              <span style="font-size:0.72rem; color:#0f172a;">${haz.description}</span><br/>
              <span style="font-size:0.7rem; color:#991b1b;">Severity: ${haz.severity} | ${haz.affectedRoute}</span>
            </div>
          `)
        )
        .addTo(map);

      hazardMarkersRef.current.push(marker);
    });

    // 4. Update route line visualization
    const state = multimodalSimulationService.getState(activeMode);
    if (state && state.routeCoords.length >= 2) {
      const geojsonLine: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: state.routeCoords.map((c) => [c[1], c[0]]), // MapLibre expects [lng, lat]
        },
      };

      const sourceId = 'multimodal-route-source';
      const layerId = 'multimodal-route-layer';

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojsonLine);
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojsonLine,
        });

        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': getModeColor(activeMode),
            'line-width': 5,
            'line-opacity': 0.85,
          },
        });
      }

      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'line-color', getModeColor(activeMode));
      }

      // Fly map to center of current mode's route
      const midIdx = Math.floor(state.routeCoords.length / 2);
      const midCoord = state.routeCoords[midIdx];
      if (midCoord) {
        map.flyTo({ center: [midCoord[1], midCoord[0]], zoom: 8, duration: 800 });
      }
    }
  }, [activeMode]);

  // Update Vehicle Marker position on live telemetry update
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !telemetry) return;

    const lngLat: [number, number] = [telemetry.longitude, telemetry.latitude];

    if (!vehicleMarkerRef.current) {
      const vel = document.createElement('div');
      vel.style.width = '38px';
      vel.style.height = '38px';
      vel.style.borderRadius = '50%';
      vel.style.backgroundColor = '#0f172a';
      vel.style.border = `3px solid ${getModeColor(activeMode)}`;
      vel.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
      vel.style.display = 'flex';
      vel.style.alignItems = 'center';
      vel.style.justifyContent = 'center';
      vel.style.color = '#ffffff';
      vel.style.transition = 'all 0.4s ease';

      vel.innerHTML = getVehicleIconSvg(activeMode);

      vehicleMarkerRef.current = new maplibregl.Marker({ element: vel })
        .setLngLat(lngLat)
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="padding:4px; font-family:Inter, sans-serif;">
              <strong style="font-size:0.85rem; color:#0f172a;">${telemetry.vehicleName}</strong><br/>
              <span style="font-size:0.72rem; color:#64748b;">ID: ${telemetry.vehicleId} | Mode: <strong>${telemetry.mode}</strong></span><br/>
              <span style="font-size:0.72rem; color:#16a34a;">Speed: ${telemetry.speedKmh} km/h | ETA: ${telemetry.eta}</span>
            </div>
          `)
        )
        .addTo(map);
    } else {
      vehicleMarkerRef.current.setLngLat(lngLat);
    }
  }, [telemetry, activeMode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Mode Overlay Header */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: getModeColor(activeMode),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          {getModeIconComponent(activeMode)}
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {MODE_METADATA[activeMode].label}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
            Provider: {MODE_METADATA[activeMode].primaryProvider}
          </div>
        </div>
        <span className={`data-tag data-tag-${getDataTagType(telemetry.dataStatus)}`} style={{ fontSize: '0.62rem', marginLeft: 6 }}>
          {telemetry.dataStatus}
        </span>
      </div>

      {/* Vehicle Status Floating Card */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          backgroundColor: 'rgba(15, 23, 42, 0.90)',
          backdropFilter: 'blur(6px)',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
            ACTIVE VEHICLE TELEMETRY
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{telemetry.vehicleName}</div>
          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
            Location: {telemetry.latitude.toFixed(4)}°N, {telemetry.longitude.toFixed(4)}°E
          </div>
        </div>

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>SPEED</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>{telemetry.speedKmh} km/h</div>
        </div>

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PROGRESS</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#60a5fa' }}>{telemetry.progressPct}%</div>
        </div>

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 12 }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ESTIMATED ETA</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>{telemetry.eta}</div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function getModeColor(mode: TransportMode): string {
  switch (mode) {
    case 'LAND':
      return '#1d4ed8'; // Royal Blue
    case 'RAIL':
      return '#7e22ce'; // Purple
    case 'WATER':
      return '#0284c7'; // Cyan / Water Teal
    case 'AIR':
      return '#059669'; // Emerald Green
  }
}

function getDataTagType(dataStatus: string): string {
  switch (dataStatus) {
    case 'CONNECTED':
      return 'real';
    case 'STATIC_DATA':
      return 'derived';
    case 'SIMULATION':
      return 'simulated';
    default:
      return 'neutral';
  }
}

function getModeIconComponent(mode: TransportMode) {
  switch (mode) {
    case 'LAND':
      return <Truck size={14} />;
    case 'RAIL':
      return <Train size={14} />;
    case 'WATER':
      return <Ship size={14} />;
    case 'AIR':
      return <Plane size={14} />;
  }
}

function getTerminalIconSvg(mode: TransportMode): string {
  switch (mode) {
    case 'LAND':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    case 'RAIL':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M4 11h16"/><path d="M12 4v7"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/></svg>`;
    case 'WATER':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/></svg>`;
    case 'AIR':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 5.2c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1Z"/></svg>`;
  }
}

function getVehicleIconSvg(mode: TransportMode): string {
  switch (mode) {
    case 'LAND':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`;
    case 'RAIL':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M4 11h16"/><path d="M12 4v7"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="m8 20-2 2"/><path d="m18 22-2-2"/></svg>`;
    case 'WATER':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M12 10V4.5"/><path d="M12 6.5h3"/></svg>`;
    case 'AIR':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.7 5.2c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1Z"/></svg>`;
  }
}
