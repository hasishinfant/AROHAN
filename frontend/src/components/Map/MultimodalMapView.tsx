import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TransportMode, DataSourceStatus } from '../../types/multimodalTypes';
import { MULTIMODAL_NETWORKS } from '../../config/multimodalRoutes';
import { multimodalSimulationService, MultimodalGPSUpdate } from '../../services/multimodalSimulationService';
import { Truck, Train, Ship, Plane, AlertTriangle, Building2, Anchor, Boxes, CheckCircle2, Clock, Info } from 'lucide-react';

interface MultimodalMapViewProps {
  mode: TransportMode;
  onModeChange?: (mode: TransportMode) => void;
}

export function MultimodalMapView({ mode, onModeChange }: MultimodalMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [gpsUpdate, setGpsUpdate] = useState<MultimodalGPSUpdate | null>(
    multimodalSimulationService.getLastUpdate(mode)
  );

  const config = MULTIMODAL_NETWORKS[mode] || MULTIMODAL_NETWORKS.LAND;

  // Subscribe to simulation updates
  useEffect(() => {
    multimodalSimulationService.setMode(mode);
    const unsubscribe = multimodalSimulationService.subscribe((update) => {
      if (update.mode === mode) {
        setGpsUpdate(update);
      }
    });
    return () => unsubscribe();
  }, [mode]);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: config.centerCoords,
      zoom: config.zoom,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Add Route Line Layer
      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: config.routeCoords,
          },
        },
      });

      let lineColor = '#1d4ed8'; // LAND
      if (mode === 'RAIL') lineColor = '#7c3aed';
      else if (mode === 'WATER') lineColor = '#0284c7';
      else if (mode === 'AIR') lineColor = '#eab308';

      map.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': lineColor,
          'line-width': mode === 'AIR' ? 3 : 5,
          'line-dasharray': mode === 'AIR' ? [2, 2] : mode === 'RAIL' ? [3, 1] : [1],
        },
      });

      // Add Terminal Markers
      config.terminals.forEach((term) => {
        const el = document.createElement('div');
        el.className = 'terminal-marker';
        el.style.backgroundColor = '#0f172a';
        el.style.color = '#ffffff';
        el.style.padding = '4px 8px';
        el.style.borderRadius = '4px';
        el.style.border = '1px solid #64748b';
        el.style.fontSize = '0.7rem';
        el.style.fontWeight = '800';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '4px';

        el.innerHTML = `<span>📍 ${term.name}</span>`;

        new maplibregl.Marker({ element: el })
          .setLngLat(term.coords)
          .addTo(map);
      });

      // Add Hazard Marker
      const hazEl = document.createElement('div');
      hazEl.style.backgroundColor = '#fef2f2';
      hazEl.style.color = '#dc2626';
      hazEl.style.border = '2px solid #fecaca';
      hazEl.style.padding = '4px 8px';
      hazEl.style.borderRadius = '4px';
      hazEl.style.fontSize = '0.7rem';
      hazEl.style.fontWeight = '800';
      hazEl.innerHTML = `⚠ HAZARD: ${config.hazardName.split(' ')[0]}`;

      new maplibregl.Marker({ element: hazEl })
        .setLngLat(config.hazardCoords)
        .addTo(map);

      // Create Custom Vehicle Marker Element
      const vehicleEl = document.createElement('div');
      vehicleEl.style.width = '36px';
      vehicleEl.style.height = '36px';
      vehicleEl.style.borderRadius = '50%';
      vehicleEl.style.backgroundColor = lineColor;
      vehicleEl.style.color = '#ffffff';
      vehicleEl.style.display = 'flex';
      vehicleEl.style.alignItems = 'center';
      vehicleEl.style.justifyContent = 'center';
      vehicleEl.style.border = '3px solid #ffffff';
      vehicleEl.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';

      if (mode === 'LAND') vehicleEl.innerHTML = '🚛';
      else if (mode === 'RAIL') vehicleEl.innerHTML = '🚆';
      else if (mode === 'WATER') vehicleEl.innerHTML = '🚢';
      else if (mode === 'AIR') vehicleEl.innerHTML = '✈️';

      const startCoord = config.routeCoords[0];
      const marker = new maplibregl.Marker({ element: vehicleEl })
        .setLngLat(startCoord)
        .addTo(map);

      markerRef.current = marker;
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mode]);

  // Update vehicle marker position on simulation GPS update
  useEffect(() => {
    if (markerRef.current && gpsUpdate) {
      markerRef.current.setLngLat([gpsUpdate.longitude, gpsUpdate.latitude]);
    }
  }, [gpsUpdate]);

  const getStatusBadge = (status: DataSourceStatus) => {
    switch (status) {
      case 'CONNECTED':
        return <span className="data-tag data-tag-real"><CheckCircle2 size={12} /> CONNECTED</span>;
      case 'STATIC_DATA':
        return <span className="data-tag data-tag-derived"><Clock size={12} /> STATIC DATA</span>;
      case 'SIMULATION':
        return <span className="data-tag data-tag-simulated"><Info size={12} /> SIMULATION</span>;
      case 'NOT_CONFIGURED':
        return <span className="badge badge-neutral">NOT CONFIGURED</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Top Transport Mode Selector Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '10px 16px',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottom: '2px solid #1d4ed8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#93c5fd' }}>
            OPERATIONAL TRANSPORT MODE:
          </strong>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['LAND', 'RAIL', 'WATER', 'AIR'] as TransportMode[]).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => onModeChange && onModeChange(m)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 900 : 700,
                    border: '1px solid',
                    borderColor: isActive ? '#38bdf8' : '#334155',
                    backgroundColor: isActive ? '#1d4ed8' : '#1e293b',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {m === 'LAND' && <Truck size={14} />}
                  {m === 'RAIL' && <Train size={14} />}
                  {m === 'WATER' && <Ship size={14} />}
                  {m === 'AIR' && <Plane size={14} />}
                  <span>[{m}]</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Source Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>DATA SOURCE:</span>
          {getStatusBadge(config.dataSourceStatus)}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ flex: 1, width: '100%', minHeight: 440, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} />

      {/* Overlay Information Box */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(6px)',
        padding: '10px 14px',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        zIndex: 10
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
            {config.title}
          </div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
            {config.primaryCorridor}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            Vehicle: <strong>{gpsUpdate?.vehicleName || config.vehicleName}</strong> ({gpsUpdate?.vehicleId || config.vehicleId})
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PROGRESS</div>
            <div style={{ fontWeight: 900, color: '#10b981' }}>{gpsUpdate?.progress_pct || 0}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>SPEED</div>
            <div style={{ fontWeight: 800 }}>{gpsUpdate?.speed_kmh || 0} km/h</div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ETA</div>
            <div style={{ fontWeight: 800, color: '#38bdf8' }}>{gpsUpdate?.eta_formatted || '18:30 IST'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
