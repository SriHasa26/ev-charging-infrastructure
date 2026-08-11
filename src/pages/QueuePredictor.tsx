import React from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Zap, Fuel, ChevronLeft, Brain, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getQueuePrediction } from '../services/geminiService';
import { MOCK_STATIONS } from '../constants/stations';
import FeedbackModal from '../components/FeedbackModal';
import ProfileModal from '../components/ProfileModal';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../hooks/useAuth';

export default function QueuePredictor() {
  const [searchParams] = useSearchParams();
  const paramType = (searchParams.get('type') || 'EV') as 'EV' | 'CNG';
  const paramStation = searchParams.get('station') || '';

  const [stationType, setStationType] = React.useState<'EV' | 'CNG'>(paramType);
  const [selectedStation, setSelectedStation] = React.useState(paramStation);
  const [time, setTime] = React.useState('current');
  const [prediction, setPrediction] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [stations, setStations] = React.useState<any[]>(MOCK_STATIONS.filter(s => s.type === 'EV'));
  const [stationsLoading, setStationsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  // Dedicated counter to force a re-fetch without changing stationType
  const [refetchTrigger, setRefetchTrigger] = React.useState(0);
  const { user } = useAuth();

  const triggerRefetch = () => setRefetchTrigger(prev => prev + 1);

  // Load preferences from localStorage on mount (URL params take priority)
  React.useEffect(() => {
    if (!paramStation) {
      // Only apply saved prefs if we didn't arrive with a URL param
      const savedPrefs = localStorage.getItem('user_preferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.vehicleType) setStationType(prefs.vehicleType);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setStationsLoading(true);
    setError(null);

    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchStations = async () => {
      // Set a timeout for the fetch
      timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const response = await fetch(`/api/stations?type=${stationType}`, { signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`Failed to fetch stations: ${response.statusText}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setStations(data);
          setSelectedStation(data[0].name);
        } else {
          throw new Error('No stations returned from API');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('Station fetch timed out, using fallback data.');
        } else {
          console.error('Error fetching stations:', err);
        }
        
        // Fallback to mock data if API fails or times out
        const fallbackStations = MOCK_STATIONS.filter(s => s.type === stationType);
        setStations(fallbackStations);
        if (fallbackStations.length > 0) {
          setSelectedStation(fallbackStations[0].name);
        }
        
        if (err.name !== 'AbortError') {
          setError('Using offline station data. Click Retry to try again.');
        }
      } finally {
        setStationsLoading(false);
      }
    };

    fetchStations();

    return () => {
      controller.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
    // refetchTrigger is intentionally included so Retry/Refresh buttons force a re-fetch
  }, [stationType, refetchTrigger]);

  // Set initial selected station if stations are already populated
  React.useEffect(() => {
    if (stations.length > 0 && !selectedStation) {
      setSelectedStation(stations[0].name);
    }
  }, [stations, selectedStation]);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const result = await getQueuePrediction(selectedStation, stationType, time);
      setPrediction(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <header className="bg-white border-b border-primary/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="p-2 hover:bg-primary/5 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-app-text/60" />
          </Link>
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary p-1 rounded-lg group-hover:bg-primary/90 transition-colors">
              <Fuel className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-app-text group-hover:text-primary transition-colors hidden sm:block">FuelFlow AI</span>
          </Link>
          <div className="h-6 w-px bg-primary/10 mx-2 hidden sm:block" />
          <h1 className="text-xl font-bold text-app-text flex items-center">
            <Clock className="w-6 h-6 mr-2 text-accent" /> Queue Predictor
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors text-xs font-bold text-primary"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold hover:bg-primary/20 transition-colors"
          >
            {user?.name?.[0]}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Prediction Parameters</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Type</label>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setStationType('EV')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stationType === 'EV' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Zap className="w-4 h-4 inline mr-1" /> EV
                    </button>
                    <button
                      onClick={() => setStationType('CNG')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${stationType === 'CNG' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Fuel className="w-4 h-4 inline mr-1" /> CNG
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Select Station</label>
                    <button 
                      onClick={triggerRefetch}
                      disabled={stationsLoading}
                      className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" /> {stationsLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      disabled={stationsLoading || stations.length === 0}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none disabled:opacity-50"
                    >
                      {stationsLoading ? (
                        <option>Loading stations...</option>
                      ) : stations.length === 0 ? (
                        <option>No stations found</option>
                      ) : (
                        stations.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))
                      )}
                    </select>
                    {error && (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-red-500 text-[10px] font-bold">{error}</p>
                        <button 
                          onClick={triggerRefetch}
                          disabled={stationsLoading}
                          className="text-[10px] font-bold text-purple-600 hover:underline disabled:opacity-50"
                        >
                          {stationsLoading ? 'Retrying...' : 'Retry'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time Prediction</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTime('current')}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${time === 'current' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                    >
                      Current Time
                    </button>
                    <button
                      onClick={() => setTime('future')}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${time === 'future' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200'}`}
                    >
                      In 1 Hour
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={loading || !selectedStation}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Predict Queue <TrendingUp className="w-5 h-5 ml-2" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {prediction ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Result Card */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Brain className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                        AI Prediction
                      </span>
                      <div className="flex items-center text-xs text-gray-400">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {Math.round(prediction.confidence * 100)}% confidence
                      </div>
                    </div>

                    <div className="text-center mb-8">
                      <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-bold">Estimated Wait</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-6xl font-black text-gray-900">{prediction.predictedTime}</span>
                        <span className="text-xl font-bold text-gray-400 ml-2">min</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Congestion</p>
                        <p className={`text-sm font-bold ${
                          prediction.congestionLevel === 'Low' ? 'text-green-600' :
                          prediction.congestionLevel === 'Medium' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {prediction.congestionLevel} Level
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Recommendation</p>
                        <p className="text-sm font-bold text-gray-900">{prediction.recommendation}</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                      <p className="text-xs text-purple-900 leading-relaxed italic">
                        "{prediction.insight}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tip Card */}
                <div className="bg-gray-900 p-6 rounded-3xl text-white flex items-start space-x-4">
                  <div className="bg-white/10 p-3 rounded-2xl">
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">AI Tip</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Queue times are typically 30% shorter between 10 PM and 6 AM. Consider scheduling your next charge during off-peak hours.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                  <Clock className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Predict</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Select a station and time above to get real-time AI queue predictions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
      <Chatbot />
    </div>
  );
}
