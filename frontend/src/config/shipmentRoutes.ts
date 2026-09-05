export interface ShipmentRouteConfig {
  id: number;
  shipmentCode: string;
  truckId: string;
  containerId: string;
  corridorLabel: string;
  originName: string;
  originCoords: [number, number];
  destName: string;
  destCoords: [number, number];
  hazardName: string;
  hazardCoords: [number, number];
  truckName: string;
  routeAName: string;
  routeACoords: [number, number][];
  routeBName: string;
  routeBCoords: [number, number][];
  disruptionZone: [number, number][];
  center: [number, number];
  zoom: number;
}

export const SHIPMENT_MAP_CONFIGS: Record<number, ShipmentRouteConfig> = {
  1: {
    id: 1,
    shipmentCode: 'SHP-001',
    truckId: 'TRK-001',
    containerId: 'CNT-001',
    corridorLabel: 'Guwahati → Shillong',
    originName: 'GUWAHATI [ORIGIN HUB]',
    originCoords: [91.7362, 26.1445],
    destName: 'SHILLONG [DESTINATION HUB]',
    destCoords: [91.8933, 25.5788],
    hazardName: 'HAZARD ZONE [UMIAM]',
    hazardCoords: [91.965, 25.89],
    truckName: 'TRUCK-01 · EN ROUTE',
    routeAName: 'Route A (NH-6 via Umiam)',
    routeACoords: [
      [91.7362, 26.1445], [91.7900, 26.0850], [91.8550, 26.0400],
      [91.9300, 25.9700], [91.9650, 25.8900], [91.9550, 25.8200],
      [91.9200, 25.7400], [91.9000, 25.6700], [91.8933, 25.5788],
    ],
    routeBName: 'Route B (Ridge via Sonapur)',
    routeBCoords: [
      [91.7362, 26.1445], [91.7650, 26.0600], [91.8150, 25.9600],
      [91.8400, 25.8600], [91.8600, 25.7700], [91.8750, 25.6700],
      [91.8933, 25.5788],
    ],
    disruptionZone: [
      [91.9300, 25.8500], [91.9800, 25.8500], [91.9900, 25.9200],
      [91.9400, 25.9300], [91.9300, 25.8500],
    ],
    center: [91.84, 25.86],
    zoom: 9,
  },
  2: {
    id: 2,
    shipmentCode: 'SHP-002',
    truckId: 'TRK-002',
    containerId: 'CNT-002',
    corridorLabel: 'Guwahati → Silchar',
    originName: 'GUWAHATI [INLAND PORT]',
    originCoords: [91.7362, 26.1445],
    destName: 'SILCHAR [FREIGHT TERM]',
    destCoords: [92.7789, 24.8333],
    hazardName: 'HAZARD ZONE [BARAIL RANGE]',
    hazardCoords: [92.4000, 25.2500],
    truckName: 'TRUCK-02 · IN TRANSIT',
    routeAName: 'Route A (NH-6 via Jowai-Badarpur)',
    routeACoords: [
      [91.7362, 26.1445], [91.8933, 25.5788], [92.2000, 25.4500],
      [92.4000, 25.2200], [92.6000, 25.0000], [92.7789, 24.8333],
    ],
    routeBName: 'Route B (NH-27 via Haflong Bypass)',
    routeBCoords: [
      [91.7362, 26.1445], [92.1500, 26.1000], [92.6500, 25.8000],
      [93.0000, 25.3000], [92.8500, 24.9500], [92.7789, 24.8333],
    ],
    disruptionZone: [
      [92.3000, 25.1500], [92.5000, 25.1500], [92.5000, 25.3500],
      [92.3000, 25.3500], [92.3000, 25.1500],
    ],
    center: [92.25, 25.48],
    zoom: 8,
  },
  3: {
    id: 3,
    shipmentCode: 'SHP-003',
    truckId: 'TRK-003',
    containerId: 'CNT-003',
    corridorLabel: 'Shillong → Agartala',
    originName: 'SHILLONG [CENTRAL DEPOT]',
    originCoords: [91.8933, 25.5788],
    destName: 'AGARTALA [CIVIL HOSP]',
    destCoords: [91.2868, 23.8315],
    hazardName: 'HAZARD ZONE [DHARMANAGAR]',
    hazardCoords: [92.1600, 24.3600],
    truckName: 'TRUCK-03 · DISPATCHED',
    routeAName: 'Route A (NH-8 Dharmanagar Arterial)',
    routeACoords: [
      [91.8933, 25.5788], [92.2000, 25.1000], [92.1600, 24.3600],
      [91.8000, 24.1000], [91.2868, 23.8315],
    ],
    routeBName: 'Route B (Ambassa Hill Bypass)',
    routeBCoords: [
      [91.8933, 25.5788], [91.7000, 25.0000], [91.5000, 24.5000],
      [91.3500, 24.0500], [91.2868, 23.8315],
    ],
    disruptionZone: [
      [92.0500, 24.2500], [92.2500, 24.2500], [92.2500, 24.4500],
      [92.0500, 24.4500], [92.0500, 24.2500],
    ],
    center: [91.60, 24.70],
    zoom: 8,
  },
  4: {
    id: 4,
    shipmentCode: 'SHP-004',
    truckId: 'TRK-004',
    containerId: 'CNT-004',
    corridorLabel: 'Guwahati → Tezpur',
    originName: 'GUWAHATI [MED DEPOT]',
    originCoords: [91.7362, 26.1445],
    destName: 'TEZPUR [REGIONAL HOSP]',
    destCoords: [92.8000, 26.6338],
    hazardName: 'HAZARD ZONE [MANGALDOI]',
    hazardCoords: [92.1000, 26.4500],
    truckName: 'TRUCK-04 · IN TRANSIT',
    routeAName: 'Route A (NH-15 North Bank Express)',
    routeACoords: [
      [91.7362, 26.1445], [91.9500, 26.4000], [92.3000, 26.5200],
      [92.8000, 26.6338],
    ],
    routeBName: 'Route B (NH-715 Kaliabor Bridge)',
    routeBCoords: [
      [91.7362, 26.1445], [92.1000, 26.2000], [92.6800, 26.3500],
      [92.8600, 26.5500], [92.8000, 26.6338],
    ],
    disruptionZone: [
      [92.0000, 26.3800], [92.2000, 26.3800], [92.2000, 26.5500],
      [92.0000, 26.5500], [92.0000, 26.3800],
    ],
    center: [92.26, 26.38],
    zoom: 9,
  },
  5: {
    id: 5,
    shipmentCode: 'SHP-005',
    truckId: 'TRK-005',
    containerId: 'CNT-005',
    corridorLabel: 'Guwahati → Itanagar',
    originName: 'GUWAHATI [IND PARK]',
    originCoords: [91.7362, 26.1445],
    destName: 'ITANAGAR [CAPITAL DEPOT]',
    destCoords: [93.6053, 27.0844],
    hazardName: 'HAZARD ZONE [BANDERDEWA]',
    hazardCoords: [93.4800, 26.9800],
    truckName: 'TRUCK-05 · PLANNED',
    routeAName: 'Route A (NH-415 Banderdewa Pass)',
    routeACoords: [
      [91.7362, 26.1445], [92.8000, 26.6338], [93.3500, 26.8800],
      [93.6053, 27.0844],
    ],
    routeBName: 'Route B (Holongi Corridor Bypass)',
    routeBCoords: [
      [91.7362, 26.1445], [92.5000, 26.4000], [93.1000, 26.7500],
      [93.4500, 26.9500], [93.6053, 27.0844],
    ],
    disruptionZone: [
      [93.4000, 26.9000], [93.5500, 26.9000], [93.5500, 27.0500],
      [93.4000, 27.0500], [93.4000, 26.9000],
    ],
    center: [92.67, 26.61],
    zoom: 8,
  },
  6: {
    id: 6,
    shipmentCode: 'SHP-006',
    truckId: 'TRK-006',
    containerId: 'CNT-006',
    corridorLabel: 'Silchar → Aizawl',
    originName: 'SILCHAR [DIST HUB]',
    originCoords: [92.7789, 24.8333],
    destName: 'AIZAWL [ZUANGTUI HUB]',
    destCoords: [92.7176, 23.7271],
    hazardName: 'HAZARD ZONE [VAIRENGTE]',
    hazardCoords: [92.7200, 24.3000],
    truckName: 'TRUCK-06 · DISRUPTED',
    routeAName: 'Route A (NH-306 Vairengte Pass)',
    routeACoords: [
      [92.7789, 24.8333], [92.7500, 24.4800], [92.6800, 24.1200],
      [92.7176, 23.7271],
    ],
    routeBName: 'Route B (Mamit Riverine Bypass)',
    routeBCoords: [
      [92.7789, 24.8333], [92.5000, 24.4000], [92.4500, 23.9500],
      [92.7176, 23.7271],
    ],
    disruptionZone: [
      [92.6500, 24.2000], [92.8000, 24.2000], [92.8000, 24.4000],
      [92.6500, 24.4000], [92.6500, 24.2000],
    ],
    center: [92.75, 24.28],
    zoom: 9,
  },
};
