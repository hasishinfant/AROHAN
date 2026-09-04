import React from 'react';
import { useArohanStore } from '../../stores/arohanStore';

const ROUTE_A_COORDS = [
  [91.7362, 26.1445],[91.7900, 26.0850],[91.8550, 26.0400],
  [91.9300, 25.9700],[91.9650, 25.8900],[91.9550, 25.8200],
  [91.9200, 25.7400],[91.9000, 25.6700],[91.8933, 25.5788],
];

const ROUTE_B_COORDS = [
  [91.7362, 26.1445],[91.7650, 26.0600],[91.8150, 25.9600],
  [91.8400, 25.8600],[91.8600, 25.7700],[91.8750, 25.6700],
  [91.8933, 25.5788],
];

const DISRUPTION_ZONE = [
  [91.9300, 25.8500],[91.9800, 25.8500],[91.9900, 25.9200],
  [91.9400, 25.9300],[91.9300, 25.8500],
];

export function MapView() {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<any>(null);
  const { risk_results, segment_statuses, scenario_step, current_recommendation } = useArohanStore();

  React.useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Dynamically import maplibre-gl
    import('maplibre-gl').then((maplibregl) => {
      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [91.84, 25.86],
        zoom: 9,
      });

      mapRef.current = map;

      map.on('load', () => {
        // Route A source
        map.addSource('route-a', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ROUTE_A_COORDS }, properties: {} },
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
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ROUTE_B_COORDS }, properties: {} },
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
            geometry: { type: 'Polygon', coordinates: [DISRUPTION_ZONE] },
            properties: {},
          },
        });
        map.addLayer({
          id: 'disruption-fill',
          type: 'fill',
          source: 'disruption-zone',
          paint: { 'fill-color': '#dc2626', 'fill-opacity': 0 },
        });
        map.addLayer({
          id: 'disruption-border',
          type: 'line',
          source: 'disruption-zone',
          paint: { 'line-color': '#dc2626', 'line-width': 2, 'line-opacity': 0, 'line-dasharray': [3, 3] },
        });

        // Clean light-theme markers without emojis
        const createMarkerElement = (label: string, bg: string, textColor: string) => {
          const d = document.createElement('div');
          d.innerHTML = `<div style="
            background:${bg};color:${textColor};font-weight:700;font-size:11px;
            padding:4px 8px;border-radius:4px;border:1px solid #cbd5e1;
            box-shadow:0 2px 4px rgba(0,0,0,0.1);white-space:nowrap;font-family:Inter,sans-serif;
            text-transform:uppercase;letter-spacing:0.04em;
          ">${label}</div>`;
          return d;
        };

        new maplibregl.Marker({ element: createMarkerElement('GUWAHATI [ORIGIN]', '#1e3a8a', '#ffffff') })
          .setLngLat([91.7362, 26.1445])
          .addTo(map);

        new maplibregl.Marker({ element: createMarkerElement('SHILLONG [DESTINATION]', '#166534', '#ffffff') })
          .setLngLat([91.8933, 25.5788])
          .addTo(map);

        new maplibregl.Marker({ element: createMarkerElement('RISK ZONE [UMIAM]', '#fef2f2', '#991b1b') })
          .setLngLat([91.965, 25.89])
          .addTo(map);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Reactively update map layers based on state
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const step = scenario_step ?? -1;
    const hasRisk = step >= 2;
    const hasRecommendation = step >= 4;
    const isBlocked = Object.values(segment_statuses ?? {}).includes('BLOCKED');

    // Route A color: amber normal, red if high risk, gray if blocked
    const routeAColor = isBlocked ? '#94a3b8' : hasRisk ? '#dc2626' : '#d97706';
    const routeADash = isBlocked ? [2, 2] : hasRisk ? [6, 3] : [4, 2];
    map.setPaintProperty('route-a-line', 'line-color', routeAColor);
    map.setPaintProperty('route-a-line', 'line-dasharray', routeADash);
    map.setPaintProperty('route-a-line', 'line-opacity', isBlocked ? 0.4 : 0.9);

    // Route B: green if recommended, otherwise neutral gray
    const routeBColor = hasRecommendation ? '#16a34a' : '#64748b';
    const routeBWidth = hasRecommendation ? 5 : 3;
    map.setPaintProperty('route-b-line', 'line-color', routeBColor);
    map.setPaintProperty('route-b-line', 'line-width', routeBWidth);
    map.setPaintProperty('route-b-line', 'line-opacity', hasRecommendation ? 0.95 : 0.5);

    // Disruption zone
    const showZone = hasRisk;
    map.setPaintProperty('disruption-fill', 'fill-opacity', showZone ? 0.2 : 0);
    map.setPaintProperty('disruption-border', 'line-opacity', showZone ? 0.9 : 0);

  }, [scenario_step, segment_statuses, current_recommendation, risk_results]);

  return (
    <div className="map-container">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Light Legend */}
      <div className="map-legend">
        <div className="map-legend-title">Route Network Legend</div>
        <div className="map-legend-item">
          <div className="map-legend-line" style={{ background: '#d97706' }} />
          Route A (NH-6 via Umiam)
        </div>
        <div className="map-legend-item">
          <div className="map-legend-line" style={{ background: '#16a34a' }} />
          Route B (Ridge via Sonapur)
        </div>
        <div className="map-legend-item">
          <div className="map-legend-line" style={{ background: '#dc2626' }} />
          Predicted Flood/Landslide Exposure
        </div>
      </div>

      {/* Top-right info overlays */}
      <div className="map-info-overlay">
        <div className="map-badge-pill">
          Corridor: Guwahati → Shillong
        </div>
        {(scenario_step ?? -1) >= 2 && (
          <div className="map-badge-pill" style={{ color: '#991b1b', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            Risk Active: Rainfall Disruption
          </div>
        )}
        {(scenario_step ?? -1) >= 4 && (
          <div className="map-badge-pill" style={{ color: '#166534', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            Proactive Reroute Recommended
          </div>
        )}
        {Object.values(segment_statuses ?? {}).includes('BLOCKED') && (
          <div className="map-badge-pill" style={{ color: '#991b1b', backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            Field Status: Route A BLOCKED
          </div>
        )}
      </div>
    </div>
  );
}
