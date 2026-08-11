/**
 * Utility to decode Google Maps Polyline
 */
export const decodePolyline = (encoded: string): google.maps.LatLng[] => {
  if (!window.google || !window.google.maps.geometry) return [];
  return google.maps.geometry.encoding.decodePath(encoded);
};

/**
 * Samples points along the route every ~10-15km to avoid hitting API limits
 * while ensuring full coverage.
 */
export const sampleRoutePoints = (path: google.maps.LatLng[], sampleIntervalKm: number = 15): google.maps.LatLng[] => {
  if (path.length < 2) return path;

  const sampledPoints: google.maps.LatLng[] = [path[0]];
  let lastSampledPoint = path[0];
  let accumulatedDistance = 0;

  for (let i = 1; i < path.length; i++) {
    const dist = google.maps.geometry.spherical.computeDistanceBetween(path[i - 1], path[i]);
    accumulatedDistance += dist;

    if (accumulatedDistance >= sampleIntervalKm * 1000) {
      sampledPoints.push(path[i]);
      lastSampledPoint = path[i];
      accumulatedDistance = 0;
    }
  }

  // Ensure destination is included
  if (sampledPoints[sampledPoints.length - 1] !== path[path.length - 1]) {
    sampledPoints.push(path[path.length - 1]);
  }

  return sampledPoints;
};

/**
 * Searches for stations near a specific point using Google Places API
 */
const searchNearPoint = (
  service: google.maps.places.PlacesService,
  location: google.maps.LatLng,
  keyword: string,
  radius: number = 5000
): Promise<google.maps.places.PlaceResult[]> => {
  return new Promise((resolve) => {
    service.nearbySearch(
      {
        location,
        radius,
        keyword,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          resolve([]);
        }
      }
    );
  });
};

/**
 * Utility to reverse geocode coordinates using Google Maps Geocoder
 */
export const reverseGeocode = (lat: number, lng: number): Promise<{ city: string, state: string, address: string }> => {
  return new Promise((resolve) => {
    if (!window.google || !window.google.maps.Geocoder) {
      resolve({ city: 'Unknown', state: 'Unknown', address: 'Location not available' });
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const addressComponents = results[0].address_components;
        let city = '';
        let state = '';

        addressComponents.forEach(component => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (!city && component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
        });

        resolve({
          city: city || 'Unknown',
          state: state || 'Unknown',
          address: results[0].formatted_address
        });
      } else {
        resolve({ city: 'Unknown', state: 'Unknown', address: 'Location not available' });
      }
    });
  });
};

/**
 * Main function to find all stations along a route
 */
export const fetchStationsAlongRoute = async (
  map: google.maps.Map,
  polyline: string,
  types: ('EV' | 'CNG')[]
): Promise<any[]> => {
  const path = decodePolyline(polyline);
  const sampledPoints = sampleRoutePoints(path, 20); // Sample every 20km for long routes
  const service = new google.maps.places.PlacesService(map);
  
  console.log(`Route decoded: ${path.length} points. Sampled: ${sampledPoints.length} points.`);

  const allResults: google.maps.places.PlaceResult[] = [];
  const keywords = {
    'EV': 'EV charging station',
    'CNG': 'CNG station'
  };

  // Limit to max 20 samples to stay within reasonable performance/quota
  const limitedSamples = sampledPoints.slice(0, 20);

  for (const point of limitedSamples) {
    for (const type of types) {
      const results = await searchNearPoint(service, point, keywords[type]);
      // Add type info to results
      results.forEach(r => (r as any)._type = type);
      allResults.push(...results);
    }
    // Small delay to avoid OVER_QUERY_LIMIT
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Deduplicate by place_id
  const uniqueResults = Array.from(new Map(allResults.map(item => [item.place_id, item])).values());
  console.log(`Total unique places found: ${uniqueResults.length}`);

  // Final Filter: Keep only those within 5km of the actual polyline
  const polylineObj = new google.maps.Polyline({ path });
  const filteredPlaces = uniqueResults.filter(place => {
    const lat = place.geometry?.location?.lat() || 0;
    const lng = place.geometry?.location?.lng() || 0;
    const latLng = new google.maps.LatLng(lat, lng);
    return google.maps.geometry.poly.isLocationOnEdge(latLng, polylineObj, 0.05); // ~5km tolerance
  });

  console.log(`Stations after route filtering: ${filteredPlaces.length}. Fetching location details...`);

  // Enrich with reverse geocoding
  const finalStations = await Promise.all(filteredPlaces.map(async (place) => {
    const lat = place.geometry?.location?.lat() || 0;
    const lng = place.geometry?.location?.lng() || 0;
    
    // Get city/state info
    const locationInfo = await reverseGeocode(lat, lng);

    return {
      id: place.place_id,
      name: place.name,
      lat,
      lng,
      type: (place as any)._type,
      status: place.business_status === 'OPERATIONAL' ? 'available' : 'busy',
      // Time-of-day based queue estimate — matches backend logic
      queueTime: (() => {
        const hour = new Date().getHours();
        const baseTime = (place as any)._type === 'CNG' ? 5 : 10;
        if (hour >= 7 && hour <= 10) return Math.round(baseTime * 1.8);
        if (hour >= 17 && hour <= 20) return Math.round(baseTime * 2.0);
        if (hour >= 22 || hour <= 5) return Math.round(baseTime * 0.4);
        return baseTime;
      })(),
      congestionLevel: (() => {
        const hour = new Date().getHours();
        if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) return 'High';
        if (hour >= 22 || hour <= 5) return 'Low';
        return 'Medium';
      })(),
      rating: place.rating,
      ...locationInfo
    };
  }));

  return finalStations;
};
