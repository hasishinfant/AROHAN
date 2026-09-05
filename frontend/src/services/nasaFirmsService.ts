export const NASA_FIRMS_MAP_KEY = '7f7248d933188493e5e6e1d84e9fba97';

export interface FIRMSFireFeature {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: string | number;
  version: string;
  bright_t31: number;
  frp: number;
  daynight: string;
}

export const nasaFirmsService = {
  key: NASA_FIRMS_MAP_KEY,

  /**
   * Generates the WMS raster tile URL for MapLibre GL JS integration
   */
  getWmsTileUrl(layer: string = 'fires_viirs_24'): string {
    return `https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/${NASA_FIRMS_MAP_KEY}/?service=WMS&version=1.1.1&request=GetMap&format=image/png&transparent=true&layers=${layer}&bbox={bbox-epsg-3857}&width=256&height=256&srs=EPSG:3857`;
  },

  /**
   * Generates WMTS Tile URL for direct XYZ raster sources
   */
  getWmtsTileUrl(): string {
    return `https://firms.modaps.eosdis.nasa.gov/mapserver/wmts/VIIRS_SNPP_Thermal_Anomalies_375m_Day/${NASA_FIRMS_MAP_KEY}/{z}/{x}/{y}.png`;
  },

  /**
   * Fetches active thermal anomaly detection data from NASA FIRMS API
   */
  async fetchActiveFiresIndia(): Promise<FIRMSFireFeature[]> {
    try {
      const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${NASA_FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/IND/1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`FIRMS API returned ${response.status}`);
      const csvText = await response.text();
      
      const lines = csvText.trim().split('\n');
      if (lines.length <= 1) return [];

      const headers = lines[0].split(',');
      const results: FIRMSFireFeature[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 12) {
          results.push({
            latitude: parseFloat(cols[0]),
            longitude: parseFloat(cols[1]),
            brightness: parseFloat(cols[2]),
            scan: parseFloat(cols[3]),
            track: parseFloat(cols[4]),
            acq_date: cols[5],
            acq_time: cols[6],
            satellite: cols[7],
            instrument: cols[8],
            confidence: cols[9],
            version: cols[10],
            bright_t31: parseFloat(cols[11]),
            frp: parseFloat(cols[12] || '0'),
            daynight: cols[13] || 'D',
          });
        }
      }
      return results;
    } catch (e) {
      console.warn('NASA FIRMS Live API fallback used:', e);
      // Fallback NE active thermal anomaly points for demonstration
      return [
        {
          latitude: 25.85,
          longitude: 91.93,
          brightness: 324.5,
          scan: 0.38,
          track: 0.36,
          acq_date: new Date().toISOString().split('T')[0],
          acq_time: '0612',
          satellite: 'N',
          instrument: 'VIIRS',
          confidence: 'nominal',
          version: '2.0NRT',
          bright_t31: 295.2,
          frp: 4.8,
          daynight: 'D',
        },
        {
          latitude: 26.04,
          longitude: 92.15,
          brightness: 338.1,
          scan: 0.40,
          track: 0.37,
          acq_date: new Date().toISOString().split('T')[0],
          acq_time: '0612',
          satellite: 'N',
          instrument: 'VIIRS',
          confidence: 'high',
          version: '2.0NRT',
          bright_t31: 301.4,
          frp: 9.2,
          daynight: 'D',
        },
      ];
    }
  },
};
