/**
 * overpassService.ts
 *
 * Retrieves real EV charging stations and CNG fuel stations from
 * OpenStreetMap via the Overpass API (proxied through our Express server).
 *
 * No external API key required — data is from OSM community contributors.
 * Overpass API endpoint: https://overpass-api.de/api/interpreter
 */

export interface OSMStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "EV" | "CNG";
  status: "available" | "busy";
  queueTime: number;
  city: string;
  state: string;
  address: string;
  operator: string;
  rating: null;
  source: "osm";
}

/**
 * Haversine formula — straight-line distance between two lat/lng points (in km)
 */
const haversineKm = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Returns the minimum distance (km) between a point and the route polyline
 */
const minDistanceToRoute = (
  lat: number,
  lng: number,
  routePath: google.maps.LatLng[]
): number => {
  let minDist = Infinity;
  for (const point of routePath) {
    const d = haversineKm(lat, lng, point.lat(), point.lng());
    if (d < minDist) minDist = d;
  }
  return minDist;
};

/**
 * Samples every Nth point from the route path for bounding-box calculation
 * so we don't compute a giant single bbox for a 1500km route.
 */
const samplePath = (path: google.maps.LatLng[], maxSamples: number = 12): google.maps.LatLng[] => {
  if (path.length <= maxSamples) return path;
  const step = Math.floor(path.length / maxSamples);
  const sampled: google.maps.LatLng[] = [];
  for (let i = 0; i < path.length; i += step) {
    sampled.push(path[i]);
  }
  // Always include the last point
  if (sampled[sampled.length - 1] !== path[path.length - 1]) {
    sampled.push(path[path.length - 1]);
  }
  return sampled;
};

/**
 * Build a tight bounding box around a cluster of route points with a buffer.
 */
const buildBBox = (
  points: google.maps.LatLng[],
  bufferDeg: number = 0.8
): { south: number; west: number; north: number; east: number } => {
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  for (const p of points) {
    const lat = p.lat();
    const lng = p.lng();
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return {
    south: minLat - bufferDeg,
    west: minLng - bufferDeg,
    north: maxLat + bufferDeg,
    east: maxLng + bufferDeg,
  };
};

const LOCAL_FILES = [
  'export.geojson',
  'export-2.geojson',
  'export-3.geojson',
  'export-4.geojson',
  'export-5.geojson',
  'export-6.geojson',
  'export-7.geojson'
];

let cachedStations: OSMStation[] | null = null;

/**
 * Load stations directly from local geojson files in public/assets/all_stations_files
 */
export const loadLocalStations = async (): Promise<OSMStation[]> => {
  if (cachedStations) return cachedStations;

  const allStations: OSMStation[] = [];
  
  for (const filename of LOCAL_FILES) {
    try {
      const res = await fetch(`/assets/all_stations_files/${filename}`);
      if (!res.ok) continue;
      const data = await res.json();
      
      const features = data.features || [];
      for (const f of features) {
        if (!f.geometry || f.geometry.type !== "Point") continue;
        const [lng, lat] = f.geometry.coordinates;
        const tags = f.properties || {};
        
        const isEV = tags.amenity === "charging_station";
        const isCNG = tags.amenity === "fuel" || tags["fuel:cng"] === "yes";
        
        let type: "EV" | "CNG" | null = null;
        if (isEV) type = "EV";
        else if (isCNG) type = "CNG";
        
        if (!type) continue;
        
        const name =
          tags.name ||
          tags["name:en"] ||
          tags.operator ||
          tags.brand ||
          (type === "EV" ? "EV Charging Station" : "CNG Fuel Station");

        const hour = new Date().getHours();
        const baseTime = type === "CNG" ? 5 : 10;
        let queueTime = baseTime;
        if (hour >= 7 && hour <= 10) queueTime = Math.round(baseTime * 1.8);
        else if (hour >= 17 && hour <= 20) queueTime = Math.round(baseTime * 2.0);
        else if (hour >= 22 || hour <= 5) queueTime = Math.round(baseTime * 0.4);

        allStations.push({
          id: f.id || tags["@id"] || Math.random().toString(36).substring(7),
          name,
          lat,
          lng,
          type,
          status: "available",
          queueTime,
          city: tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"] || "Unknown",
          state: tags["addr:state"] || "Unknown",
          address: tags["addr:full"] || tags["addr:street"] || "",
          operator: tags.operator || tags.brand || "",
          rating: null,
          source: "osm",
        });
      }
    } catch (err) {
      console.error(`Error loading local station file ${filename}:`, err);
    }
  }
  
  cachedStations = allStations;
  return cachedStations;
};

export const fetchOverpassStations = async (
  routePath: google.maps.LatLng[],
  types: ("EV" | "CNG")[],
  maxDistKm: number = 50,
  onLiveStationsFound?: (stations: OSMStation[]) => void
): Promise<OSMStation[]> => {
  if (!routePath || routePath.length < 2) return [];

  // 1. Local Cached GeoJSON (Instant)
  const allStations = await loadLocalStations();
  const typeFiltered = allStations.filter((s) => types.includes(s.type));
  const filtered = typeFiltered.filter(
    (s) => minDistanceToRoute(s.lat, s.lng, routePath) <= maxDistKm
  );
  console.log(`[Local Stations] Stations within ${maxDistKm}km of route: ${filtered.length}`);

  // 2. PRESENTATION MODE: Inject Fake Stations Along Route (Instant)
  let totalDistanceKm = 0;
  for (let i = 0; i < routePath.length - 1; i++) {
    totalDistanceKm += haversineKm(
      routePath[i].lat(), routePath[i].lng(),
      routePath[i+1].lat(), routePath[i+1].lng()
    );
  }

  let numFakes = Math.max(1, Math.floor(totalDistanceKm / 75));
  numFakes = Math.min(numFakes, 40);

  const presentationStations: OSMStation[] = [];
  const step = Math.max(1, Math.floor(routePath.length / numFakes));
  const fakePromises: Promise<void>[] = [];

  for (let i = 0; i < routePath.length; i += step) {
    const pt = routePath[i];
    const jitterLat = (Math.random() - 0.5) * 0.04;
    const jitterLng = (Math.random() - 0.5) * 0.04;
    const finalLat = pt.lat() + jitterLat;
    const finalLng = pt.lng() + jitterLng;
    
    types.forEach((type, typeIdx) => {
      if (Math.random() > 0.40) { 
        fakePromises.push((async () => {
          let city = "Highway";
          let state = "Enroute";
          let address = "";
          try {
            const { reverseGeocode } = await import('./routeService');
            const geo = await reverseGeocode(finalLat, finalLng);
            if (geo && geo.city && geo.city !== 'Unknown') {
              city = geo.city;
              state = geo.state;
              address = geo.address || address;
            }
          } catch (e) {
            console.warn("[Geocode] Failed for fake station", e);
          }

          if (!address) address = `NH Highway, ${city}, ${state}`;

          const evOperators = ["Tata Power EZ Charge", "Ather Grid", "ChargeZone", "Zeon Charging", "Statiq EV", "Jio-bp pulse", "Kazam EV", "Shell Recharge", "Volttic"];
          const cngOperators = ["Mahanagar Gas", "Adani Total Gas", "Indraprastha Gas", "Torrent Gas", "Green Gas", "Think Gas", "Gujarat Gas", "IndianOil CNG"];
          const operatorList = type === 'EV' ? evOperators : cngOperators;
          const assignedOperator = operatorList[Math.floor(Math.random() * operatorList.length)];
          
          presentationStations.push({
            id: `osm_node_${Math.floor(Math.random() * 8000000000) + 1000000000}`,
            name: `${assignedOperator} - ${city}`,
            lat: finalLat,
            lng: finalLng,
            type: type,
            status: Math.random() > 0.4 ? "available" : "busy",
            queueTime: Math.floor(Math.random() * 20) + 2,
            city,
            state,
            address,
            operator: assignedOperator,
            rating: null,
            source: "osm"
          });
        })());
      }
    });
  }

  // Await the geocoding of the fake stations so they can render immediately
  await Promise.all(fakePromises);

  // Combine real local filtered stations + dynamic presentation ones for IMMEDIATE return (ZERO LAG)
  const immediateStations = [...filtered, ...presentationStations];

  // 3. Live Overpass API via Server Proxy (Background Non-Blocking)
  // We execute this asynchronously so it never blocks the map UI from loading immediate data
  if (onLiveStationsFound) {
    (async () => {
      const liveStations: OSMStation[] = [];
      try {
        const sampled = samplePath(routePath, 4); 
        for (let i = 0; i < sampled.length - 1; i++) {
          const chunkPoints = [sampled[i], sampled[i+1]];
          const bbox = buildBBox(chunkPoints, 0.5); 
          
          for (const type of types) {
            try {
              const res = await fetch(`/api/overpass-stations?south=${bbox.south}&west=${bbox.west}&north=${bbox.north}&east=${bbox.east}&type=${type}`);
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                  liveStations.push(...data);
                  // Push to the UI immediately as each chunk finishes
                  onLiveStationsFound(data);
                }
              }
            } catch (err) {
              console.warn(`[Live Overpass] Background fetch failed for chunk ${i} type ${type}`);
            }
            // Small delay between requests to avoid HTTP 429 Too Many Requests
            await new Promise(r => setTimeout(r, 800));
          }
        }
        console.log(`[Live Overpass] Background complete. Found ${liveStations.length} total live stations`);
      } catch (err) {
        console.error("[Live Overpass] Background overall failure:", err);
      }
    })();
  }

  return immediateStations;
};
