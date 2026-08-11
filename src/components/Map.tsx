import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { LocateFixed, Layers, Info, Zap, Fuel } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

interface MapProps {
  stations: any[];
  directions?: google.maps.DirectionsResult | null;
  routeType?: 'normal' | 'reroute' | 'emergency';
  onLocationUpdate?: (location: google.maps.LatLngLiteral) => void;
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function Map({ stations, directions, routeType = 'normal', onLocationUpdate, onMapLoad }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ['geometry', 'places'] as any
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = React.useState(defaultCenter);
  const [selectedStation, setSelectedStation] = React.useState<any>(null);

  // Get current location on load
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
          setMapCenter(pos);
          onLocationUpdate?.(pos);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    }
  }, [onLocationUpdate]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
          onLocationUpdate?.(pos);
          map?.panTo(pos);
          map?.setZoom(15);
        },
        () => {
          alert("Error: The Geolocation service failed.");
        }
      );
    }
  };

  const handleShowAllStations = () => {
    if (map && stations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      stations.forEach(station => {
        bounds.extend({ lat: station.lat, lng: station.lng });
      });
      if (currentPosition) {
        bounds.extend(currentPosition);
      }
      map.fitBounds(bounds);
    }
  };

  const calculateDistanceFromRoute = (station: any) => {
    if (!directions || !window.google || !window.google.maps.geometry) return null;
    const route = directions.routes[0];
    if (!route) return null;

    const path = route.overview_path;
    const stationLatLng = new google.maps.LatLng(station.lat, station.lng);
    
    // Find the minimum distance to any point on the polyline
    let minDistance = Infinity;
    for (let i = 0; i < path.length; i++) {
      const dist = google.maps.geometry.spherical.computeDistanceBetween(stationLatLng, path[i]);
      if (dist < minDistance) minDistance = dist;
    }
    
    return (minDistance / 1000).toFixed(1); // Return in km
  };

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    onMapLoad?.(map);
  }, [onMapLoad]);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {directions && (
          <DirectionsRenderer 
            directions={directions} 
            options={{
              polylineOptions: {
                strokeColor: routeType === 'emergency' ? '#ef4444' : routeType === 'reroute' ? '#8b5cf6' : '#3b82f6',
                strokeWeight: 6,
                strokeOpacity: 0.8
              }
            }}
          />
        )}
        
        {/* User Current Location Marker */}
        {currentPosition && (
          <Marker
            position={currentPosition}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
            title="Your Location"
          />
        )}

        {stations.map(station => {
          console.log(`Rendering marker for ${station.name} at ${station.lat}, ${station.lng}`);
          return (
            <Marker
              key={station.id}
              position={{ lat: station.lat, lng: station.lng }}
              title={station.name}
              onClick={() => setSelectedStation(station)}
              icon={station.type === 'EV' 
                ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' 
                : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'}
            />
          );
        })}

        {selectedStation && (
          <InfoWindow
            position={{ lat: selectedStation.lat, lng: selectedStation.lng }}
            onCloseClick={() => setSelectedStation(null)}
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center space-x-2 mb-2">
                {selectedStation.type === 'EV' ? <Zap className="w-4 h-4 text-green-600" /> : <Fuel className="w-4 h-4 text-blue-600" />}
                <h3 className="font-bold text-gray-900">{selectedStation.name}</h3>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{selectedStation.city}, {selectedStation.state}</span>
                </p>
                <p className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{selectedStation.type} Station</span>
                </p>
                {directions && (
                  <p className="flex justify-between">
                    <span>Distance from route:</span>
                    <span className="font-medium text-primary">{calculateDistanceFromRoute(selectedStation)} km</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span>Wait Time:</span>
                  <span className="font-medium text-accent">{selectedStation.queueTime || 15} min</span>
                </p>
                <p className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${selectedStation.status === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
                    {selectedStation.status}
                  </span>
                </p>
              </div>
              <button className="w-full mt-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors">
                Add to Route
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-primary/10 z-10">
        <h4 className="text-[10px] font-bold text-app-text uppercase tracking-wider mb-2">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
            <span className="text-xs text-app-text/70">EV Charging</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <span className="text-xs text-app-text/70">CNG Station</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#4285F4] shadow-sm" />
            <span className="text-xs text-app-text/70">Your Location</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-24 right-4 flex flex-col space-y-2 z-10">
        <button
          onClick={handleShowAllStations}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all text-green-600"
          title="Show All Stations"
        >
          <Layers className="w-6 h-6" />
        </button>
        <button
          onClick={handleLocateMe}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all text-blue-600"
          title="Locate Me"
        >
          <LocateFixed className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

const mapStyles = [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry",
    "stylers": [{ "visibility": "on" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#a0a4a5" }]
  },
  {
    "featureType": "administrative.province",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#828282" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#e3eed3" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#e3e3e3" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#d3eafc" }]
  }
];
