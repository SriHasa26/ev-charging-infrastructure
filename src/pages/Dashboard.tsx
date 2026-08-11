import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import AIInsights from '../components/AIInsights';
import SmartChargeDoctor from '../components/SmartChargeDoctor';
import NotificationSystem from '../components/NotificationSystem';
import FeedbackModal from '../components/FeedbackModal';
import ProfileModal from '../components/ProfileModal';
import RouteHistory from '../components/RouteHistory';
import Chatbot from '../components/Chatbot';
import { Search, MapPin, Zap, Fuel, Battery, Navigation, ShieldAlert, Clock, MessageSquare, User as UserIcon, History, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { notify } from '../lib/notifications';
import { MOCK_STATIONS } from '../constants/stations';
import { fetchOverpassStations } from '../services/overpassService';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = React.useState<'hub' | 'map' | 'insights' | 'doctor'>('hub');
  const [start, setStart] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [vehicleType, setVehicleType] = React.useState<'EV' | 'CNG'>('EV');
  const [battery, setBattery] = React.useState(75);
  const [stations, setStations] = React.useState(MOCK_STATIONS);
  const [selectedStation, setSelectedStation] = React.useState(null);
  const [showOnlyReachable, setShowOnlyReachable] = React.useState(false);
  const [showEV, setShowEV] = React.useState(true);
  const [showCNG, setShowCNG] = React.useState(true);
  const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);
  const [userLocation, setUserLocation] = React.useState<google.maps.LatLngLiteral | null>(null);
  const [mapInstance, setMapInstance] = React.useState<google.maps.Map | null>(null);
  const [routeType, setRouteType] = React.useState<'normal' | 'reroute' | 'emergency'>('normal');
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isFallbackMode, setIsFallbackMode] = React.useState(false);

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    const savedPrefs = localStorage.getItem('user_preferences');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      if (prefs.vehicleType) setVehicleType(prefs.vehicleType);
    }
  }, []);

  const getDistance = (p1: any, p2: any) => {
    const R = 6371; // km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Returns true if the station is within `thresholdKm` of ANY point on the route overview path
  const isStationNearRoute = (station: any, routePath: google.maps.LatLng[], thresholdKm: number = 80): boolean => {
    for (const point of routePath) {
      const dist = getDistance(
        { lat: station.lat, lng: station.lng },
        { lat: point.lat(), lng: point.lng() }
      );
      if (dist <= thresholdKm) return true;
    }
    return false;
  };

  const handleReroute = () => {
    if (!window.google || !start || !destination) {
      notify('Route Required', 'Please set start and destination in the sidebar first.', 'warning');
      return;
    }

    // Save to history
    const newRoute = {
      id: Math.random().toString(36).substr(2, 9),
      start,
      destination,
      timestamp: new Date().toISOString()
    };
    const existing = JSON.parse(localStorage.getItem('route_history') || '[]');
    localStorage.setItem('route_history', JSON.stringify([newRoute, ...existing].slice(0, 10)));

    const service = new google.maps.DirectionsService();
    service.route({
      origin: start,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    }, (result, status) => {
      if (status === 'OK' && result) {
        console.log("Route loaded successfully");
        // Pick an alternative route if available to simulate "avoiding traffic/queues"
        const bestRoute = result.routes.length > 1 ? result.routes[1] : result.routes[0];
        setDirections({ ...result, routes: [bestRoute] });
        setRouteType('reroute');
        notify('Better route found', 'Optimized to avoid high traffic and station queues.', 'info');
      } else {
        notify('Reroute Failed', 'Could not find an alternative route.', 'warning');
      }
    });
  };

  const handleEmergencyRoute = () => {
    if (battery >= 20) {
      notify('Battery Sufficient', 'Your current level is above 20%. Emergency routing not required.', 'info');
      return;
    }

    if (!window.google || !userLocation) {
      notify('Location Required', 'Waiting for your current location...', 'warning');
      return;
    }

    const nearest = stations
      .filter(s => s.type === vehicleType)
      .sort((a, b) => getDistance(userLocation, a) - getDistance(userLocation, b))[0];

    if (nearest) {
      const service = new google.maps.DirectionsService();
      service.route({
        origin: userLocation,
        destination: { lat: nearest.lat, lng: nearest.lng },
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
          setRouteType('emergency');
          notify('Emergency Route Activated', `Shortest path to ${nearest.name} generated.`, 'emergency');
        } else {
          notify('Emergency Failed', 'Could not generate emergency route.', 'emergency');
        }
      });
    } else {
      notify('No Stations Found', `Could not find any nearby ${vehicleType} stations.`, 'emergency');
    }
  };

  const filteredStations = React.useMemo(() => {
    console.log("Filtering stations... Total available:", stations.length);
    let result = [...stations];
    
    // 1. Filter by toggles (EV/CNG)
    result = result.filter(s => {
      if (s.type === 'EV' && !showEV) return false;
      if (s.type === 'CNG' && !showCNG) return false;
      return true;
    });

    // 2. Filter by vehicle type if not in map view
    if (view !== 'map') {
      result = result.filter(s => s.type === vehicleType);
    }

    // 3. Filter by route using reliable Haversine distance check
    if (directions && window.google) {
      console.log("Route loaded, applying Haversine distance filter...");
      const route = directions.routes[0];
      if (route && route.overview_path && route.overview_path.length > 0) {
        const routePath = route.overview_path;
        // Use 80km corridor — catches stations along long routes like Delhi→Mumbai
        const routeFiltered = result.filter(station => isStationNearRoute(station, routePath, 80));
        console.log("Stations within 80km of route:", routeFiltered.length);

        if (routeFiltered.length > 0) {
          result = routeFiltered;
        } else {
          console.log("No stations near route — showing all as fallback.");
        }
      }
    }

    // 4. Filter by battery level (simulated range check)
    if (showOnlyReachable && battery < 30) {
      result = result.filter((_, index) => index % 2 === 0);
    }
    
    console.log("Final filtered stations count:", result.length);
    return result;
  }, [stations, showOnlyReachable, battery, directions, view, vehicleType, showEV, showCNG]);

  // Handle fallback mode state — use same Haversine check for consistency
  React.useEffect(() => {
    console.log("Stations loaded:", stations.length);
    if (directions && window.google) {
      const route = directions.routes[0];
      if (route && route.overview_path && route.overview_path.length > 0) {
        const routePath = route.overview_path;
        const anyNearRoute = stations.some(station => isStationNearRoute(station, routePath, 80));
        setIsFallbackMode(!anyNearRoute);
      }
    } else {
      setIsFallbackMode(false);
    }
  }, [directions, stations]);

  React.useEffect(() => {
    const controller = new AbortController();
    const fetchStations = async () => {
      try {
        // Fetch all stations instead of just one type
        const res = await fetch(`/api/stations`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch stations');
        const data = await res.json();
        
        // Retrieve also from OSM (local cache for performance across the whole map)
        let osmData: any[] = [];
        try {
          const { loadLocalStations } = await import('../services/overpassService');
          osmData = await loadLocalStations();
        } catch (osmErr) {
          console.error("Failed to load local OSM stations:", osmErr);
        }

        if (data && data.length > 0) {
          setStations([...data, ...osmData]);
        } else if (osmData.length > 0) {
          setStations(osmData);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching stations:', err);
        // Fallback to mock data (all)
        setStations(MOCK_STATIONS);
      }
    };

    fetchStations();
    return () => controller.abort();
  }, []);

  // Trigger Overpass route search when directions change
  React.useEffect(() => {
    if (directions && window.google) {
      const routePath = directions.routes[0]?.overview_path;
      if (!routePath || routePath.length < 2) return;

      const searchStations = async () => {
        // Step 1: Immediately show MOCK_STATIONS that are near the route
        const types: ('EV' | 'CNG')[] = [];
        if (showEV) types.push('EV');
        if (showCNG) types.push('CNG');

        const nearbyMock = MOCK_STATIONS.filter(s => {
          if (s.type === 'EV' && !showEV) return false;
          if (s.type === 'CNG' && !showCNG) return false;
          return isStationNearRoute(s, routePath, 80);
        });

        if (nearbyMock.length > 0) {
          setStations(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const toAdd = nearbyMock.filter(s => !existingIds.has(s.id));
            return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
          });
          notify('Route Loaded', `Showing ${nearbyMock.length} nearby stations. Fetching live OSM data...`, 'info');
        } else {
          notify('Fetching Stations', 'Querying OpenStreetMap for live station data...', 'info');
        }

        // Step 2: Query Overpass OSM for real stations along the route (Instant return, background updates)
        try {
          const immediateStations = await fetchOverpassStations(routePath, types, 50, (liveData) => {
            // Callback fired whenever a chunk of live stations is retrieved
            setStations(prev => {
              const merged = [...prev];
              const existingIds = new Set(merged.map(s => s.id));
              const newLive = liveData.filter(s => !existingIds.has(s.id));
              if (newLive.length > 0) {
                console.log(`[Dashboard] Adding ${newLive.length} live stations in background...`);
                return [...merged, ...newLive];
              }
              return merged;
            });
          });

          if (immediateStations.length > 0) {
            setStations(prev => {
              const merged = [...immediateStations];
              const osmIds = new Set(immediateStations.map(s => s.id));
              // Keep mock stations not overlapping with OSM results
              prev.forEach(s => { if (!osmIds.has(s.id)) merged.push(s); });
              return merged;
            });
            notify('Live Data Loaded', `Found real stations along your route.`, 'success');
          } else if (nearbyMock.length === 0) {
            notify('No Stations Found', 'No EV/CNG stations found along this route in OSM data.', 'warning');
          }
        } catch (error) {
          console.error('[Overpass] Route search error:', error);
          if (nearbyMock.length === 0) {
            notify('Search Error', 'Could not fetch live data. Showing all available stations.', 'warning');
          }
        }
      };

      searchStations();
    }
  }, [directions, showEV, showCNG]);

  // Build a Google Maps deep-link for the current route + station waypoints
  const getGoogleMapsUrl = () => {
    if (!start || !destination) return null;
    const origin = encodeURIComponent(start);
    const dest   = encodeURIComponent(destination);
    const waypoints = filteredStations
      .slice(0, 8) // Google Maps supports up to 8 waypoints
      .map(s => `${s.lat},${s.lng}`)
      .join('|');
    const base = 'https://www.google.com/maps/dir/?api=1';
    return `${base}&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=driving`;
  };

  const googleMapsUrl = getGoogleMapsUrl();

  const renderHub = () => (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-app-text mb-2"
          >
            Welcome back, {user?.name?.split(' ')[0]}
          </motion.h2>
          <p className="text-app-text/60 italic serif">Select a tool to optimize your journey.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('map')}
            className="group bg-white p-8 rounded-3xl border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left flex flex-col h-64"
          >
            <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
              <Navigation className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-app-text mb-2">Route Optimizer</h3>
            <p className="text-app-text/60 text-sm leading-relaxed">Interactive map with real-time EV/CNG station routing and traffic data.</p>
            <div className="mt-auto flex items-center text-primary font-bold text-sm">
              Open Map <Search className="w-4 h-4 ml-2" />
            </div>
          </motion.button>

          {/* AI Insights Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/queue-predictor')}
            className="group bg-white p-8 rounded-3xl border border-accent/5 shadow-sm hover:shadow-xl hover:border-accent/20 transition-all text-left flex flex-col h-64"
          >
            <div className="bg-accent/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
              <Clock className="w-7 h-7 text-accent group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-app-text mb-2">Queue Predictor</h3>
            <p className="text-app-text/60 text-sm leading-relaxed">AI-powered wait time predictions for all nearby charging and fuel stations.</p>
            <div className="mt-auto flex items-center text-accent font-bold text-sm">
              View Predictions <Search className="w-4 h-4 ml-2" />
            </div>
          </motion.button>


          {/* SmartCharge Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('doctor')}
            className="group bg-white p-8 rounded-3xl border border-secondary/5 shadow-sm hover:shadow-xl hover:border-secondary/20 transition-all text-left flex flex-col h-64"
          >
            <div className="bg-secondary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors">
              <Zap className="w-7 h-7 text-secondary group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-app-text mb-2">SmartCharge Doctor</h3>
            <p className="text-app-text/60 text-sm leading-relaxed">Analyze your charging performance and get AI-driven health recommendations.</p>
            <div className="mt-auto flex items-center text-secondary font-bold text-sm">
              Run Diagnosis <Search className="w-4 h-4 ml-2" />
            </div>
          </motion.button>

          {/* Vehicle Config Card */}
          <div className="bg-app-text p-8 rounded-3xl shadow-xl text-white flex flex-col h-64 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Active Vehicle</h3>
                <p className="text-white/60 text-sm">Configure your fuel and battery settings.</p>
              </div>
              <div className="flex p-1 bg-white/10 rounded-xl">
                <button
                  onClick={() => setVehicleType('EV')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${vehicleType === 'EV' ? 'bg-white text-app-text' : 'text-white/60 hover:text-white'}`}
                >
                  EV
                </button>
                <button
                  onClick={() => setVehicleType('CNG')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${vehicleType === 'CNG' ? 'bg-white text-app-text' : 'text-white/60 hover:text-white'}`}
                >
                  CNG
                </button>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white/60">Current {vehicleType === 'EV' ? 'Battery' : 'Fuel'} Level</span>
                <span className="text-lg font-bold text-secondary">{battery}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={battery}
                onChange={(e) => setBattery(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
            </div>
          </div>

          {/* Feedback Card */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFeedbackOpen(true)}
            className="group bg-primary/5 p-8 rounded-3xl border border-primary/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left flex flex-col h-64"
          >
            <div className="bg-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-app-text mb-2">Feedback</h3>
            <p className="text-app-text/60 text-sm leading-relaxed">Help us improve! Submit your suggestions or report any issues you find.</p>
            <div className="mt-auto flex items-center text-primary font-bold text-sm">
              Send Feedback <Navigation className="w-4 h-4 ml-2" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-app-bg flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b border-primary/10 px-6 py-3 flex items-center justify-between z-20">
        <div className="flex items-center space-x-4">
          <Link 
            to="/"
            className="flex items-center space-x-3 group"
          >
            <div className="bg-primary p-1.5 rounded-lg group-hover:bg-primary/90 transition-colors">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-app-text group-hover:text-primary transition-colors">FuelFlow AI</h1>
          </Link>
          {view !== 'hub' && (
            <button 
              onClick={() => setView('hub')}
              className="ml-4 text-sm font-bold text-primary hover:text-primary/80 flex items-center"
            >
              <Navigation className="w-4 h-4 mr-1 rotate-180" /> Back to Hub
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors text-xs font-bold text-primary"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors text-xs font-bold text-primary"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-app-text">{user?.name}</p>
            <p className="text-xs text-app-text/60">{user?.email}</p>
          </div>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold hover:bg-primary/20 transition-colors"
          >
            {user?.name?.[0]}
          </button>
        </div>
      </header>

      {view === 'hub' ? renderHub() : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Inputs (Only for Map view) */}
          {view === 'map' && (
            <aside className="w-80 bg-white border-r border-primary/10 p-6 overflow-y-auto hidden lg:block">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-app-text mb-4 flex items-center">
                    <Navigation className="w-4 h-4 mr-2 text-primary" /> Route Planner
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-app-text/40" />
                      </div>
                      <input
                        type="text"
                        placeholder="Start location"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-primary/10 rounded-xl text-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-app-text/40" />
                      </div>
                      <input
                        type="text"
                        placeholder="Destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-primary/10 rounded-xl text-sm focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-app-text mb-4 flex items-center">
                    <ShieldAlert className="w-4 h-4 mr-2 text-primary" /> Infrastructure Toggles
                  </h3>
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-app-text">EV Stations</span>
                      </div>
                      <button 
                        onClick={() => setShowEV(!showEV)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${showEV ? 'bg-green-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showEV ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Fuel className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-app-text">CNG Stations</span>
                      </div>
                      <button 
                        onClick={() => setShowCNG(!showCNG)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${showCNG ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showCNG ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="pt-2 border-t border-primary/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">Reachable Only</span>
                        <button 
                          onClick={() => setShowOnlyReachable(!showOnlyReachable)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${showOnlyReachable ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showOnlyReachable ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-app-text">
                      {isFallbackMode ? "Nearby Stations (Fallback)" : "Stations Along Route"}
                    </h3>
                    <button 
                      onClick={() => {
                        fetch(`/api/stations`)
                          .then(res => res.json())
                          .then(data => setStations(data));
                      }}
                      className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center"
                    >
                      <Search className="w-3 h-3 mr-1" /> Discover
                    </button>
                  </div>
                  {isFallbackMode && (
                    <div className="mb-4 p-3 bg-accent/10 rounded-xl border border-accent/20">
                      <p className="text-[10px] font-bold text-accent flex items-center">
                        <ShieldAlert className="w-3 h-3 mr-1" /> No stations found — showing all available stations
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {filteredStations.map((station: any) => (
                      <button
                        key={station.id}
                        onClick={() => setSelectedStation(station)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedStation?.id === station.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-primary/5 hover:border-primary/20 bg-white'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-sm font-bold text-app-text">{station.name}</p>
                            <p className="text-[10px] text-app-text/50">{station.city}, {station.state}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${station.status === 'available' ? 'bg-secondary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                            {station.status}
                          </span>
                        </div>
                        <p className="text-xs text-app-text/60 flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> {station.queueTime} min wait
                        </p>
                      </button>
                    ))}
                    {filteredStations.length === 0 && (
                      <div className="p-8 text-center bg-primary/5 rounded-2xl border border-dashed border-primary/10">
                        <p className="text-xs text-app-text/60">No stations match your filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Center - Content */}
          <main className="flex-1 relative overflow-y-auto">
            {view === 'map' && (
              <Map 
                stations={filteredStations} 
                directions={directions} 
                routeType={routeType}
                onLocationUpdate={setUserLocation}
                onMapLoad={setMapInstance}
              />
            )}
            {view === 'insights' && (
              <div className="p-6 lg:p-12 max-w-4xl mx-auto">
                <AIInsights 
                  selectedStation={selectedStation} 
                  stations={filteredStations}
                  onSelectStation={setSelectedStation}
                />
              </div>
            )}
            {view === 'doctor' && (
              <div className="p-6 lg:p-12 max-w-4xl mx-auto">
                <SmartChargeDoctor />
              </div>
            )}
            
            {view === 'map' && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 flex-wrap justify-center gap-y-2">
                <button 
                  onClick={handleReroute}
                  className="px-5 py-3 bg-white text-app-text rounded-full font-bold shadow-xl border border-primary/10 hover:bg-primary/5 transition-all flex items-center text-sm"
                >
                  <Navigation className="w-4 h-4 mr-2 text-primary" /> Reroute
                </button>
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-blue-600 text-white rounded-full font-bold shadow-xl hover:bg-blue-700 transition-all flex items-center text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Open in Maps
                  </a>
                )}
                <button 
                  onClick={handleEmergencyRoute}
                  className="px-5 py-3 bg-accent text-white rounded-full font-bold shadow-xl hover:bg-accent/90 transition-all flex items-center text-sm"
                >
                  <Battery className="w-4 h-4 mr-2" /> Emergency
                </button>
              </div>
            )}
          </main>

          {/* Right Panel - Insights (Only for Map view) */}
          {view === 'map' && (
            <aside className="w-96 bg-app-bg border-l border-primary/10 p-6 overflow-y-auto hidden xl:block">
              <div className="space-y-6">
                <AIInsights 
                  selectedStation={selectedStation} 
                  stations={filteredStations}
                  onSelectStation={setSelectedStation}
                />
                <SmartChargeDoctor />
              </div>
            </aside>
          )}
        </div>
      )}

      <NotificationSystem />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
      <RouteHistory 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onReplan={(s, d) => {
          setStart(s);
          setDestination(d);
          setView('map');
          setIsHistoryOpen(false);
          notify('Route Loaded', 'Click Reroute to optimize your journey.', 'info');
        }} 
      />
      <Chatbot context={{
        userName: user?.name,
        vehicleType,
        origin: start || undefined,
        destination: destination || undefined,
        stationsFound: filteredStations.length,
        selectedStation: (selectedStation as any)?.name,
      }} />
    </div>
  );
}
