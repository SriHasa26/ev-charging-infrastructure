import React from 'react';
import { motion } from 'motion/react';
import { Brain, Clock, TrendingUp, AlertCircle, Zap, Fuel, Star, Coffee, Wifi, User, Info, DollarSign, Utensils, ShoppingBag, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getQueuePrediction } from '../services/geminiService';

interface AIInsightsProps {
  selectedStation: any;
  stations: any[];
  onSelectStation: (station: any) => void;
}

const AmenityIcon = ({ name }: { name: string }) => {
  switch (name.toLowerCase()) {
    case 'wifi': return <Wifi className="w-3.5 h-3.5" />;
    case 'coffee': return <Coffee className="w-3.5 h-3.5" />;
    case 'food court': return <Utensils className="w-3.5 h-3.5" />;
    case 'convenience store': return <ShoppingBag className="w-3.5 h-3.5" />;
    default: return <Info className="w-3.5 h-3.5" />;
  }
};

export default function AIInsights({ selectedStation, stations, onSelectStation }: AIInsightsProps) {
  const navigate = useNavigate();
  const [prediction, setPrediction] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [reserved, setReserved] = React.useState(false);

  const handleReserveSlot = () => {
    setReserved(true);
    // Navigate to Queue Predictor with station pre-selected via URL param
    setTimeout(() => {
      const params = new URLSearchParams({ station: selectedStation?.name || '', type: selectedStation?.type || 'EV' });
      navigate(`/queue-predictor?${params.toString()}`);
    }, 800);
  };

  React.useEffect(() => {
    if (selectedStation) {
      setLoading(true);
      getQueuePrediction(selectedStation.name, selectedStation.type)
        .then(data => {
          setPrediction(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error getting queue prediction:', err);
          setLoading(false);
        });
    }
  }, [selectedStation]);

  if (!selectedStation) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-primary/10 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-accent/10 p-2 rounded-xl">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-app-text">Queue Predictor</h3>
        </div>
        
        <div className="text-center py-8 mb-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Select a nearby station to predict wait times</p>
          <p className="text-gray-400 text-sm mt-1">AI analyzes real-time traffic and historical data</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nearby Stations</h4>
          {stations.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm italic">
              No stations found nearby. Try changing your vehicle type.
            </div>
          ) : (
            stations.map((station) => (
              <button
                key={station.id}
                onClick={() => onSelectStation(station)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${station.type === 'EV' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {station.type === 'EV' ? <Zap className="w-5 h-5" /> : <Fuel className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{station.name}</p>
                    <p className="text-xs text-gray-500">Current wait: {station.queueTime}m</p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-primary/10 shadow-sm overflow-y-auto max-h-[80vh]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-accent/10 p-2 rounded-xl">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-app-text">Station Details</h3>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-app-text/60">{selectedStation.name}</p>
              <div className="flex items-center text-secondary text-[10px] font-bold">
                <Star className="w-3 h-3 mr-0.5 fill-current" /> {selectedStation.rating || '4.5'}
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onSelectStation(null)}
          className="text-xs font-bold text-accent hover:text-accent/80"
        >
          Change Station
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-gray-50 rounded-xl" />
          <div className="h-32 bg-gray-50 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status & Pricing Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <p className="text-[10px] text-primary font-bold uppercase mb-1">Live Status</p>
              <p className="text-sm font-bold text-app-text">{selectedStation.detailedStatus || selectedStation.status}</p>
              <p className="text-[10px] text-primary/60 mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {prediction?.predictedTime || selectedStation.queueTime}m wait
              </p>
            </div>
            <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
              <p className="text-[10px] text-primary font-bold uppercase mb-1">Pricing</p>
              <p className="text-sm font-bold text-app-text">{selectedStation.pricing || '$0.35/kWh'}</p>
              <p className="text-[10px] text-primary/60 mt-1 flex items-center">
                <DollarSign className="w-3 h-3 mr-1" /> Best rate nearby
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {(selectedStation.amenities || ["WiFi", "Coffee", "Restrooms"]).map((amenity: string) => (
                <div key={amenity} className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-[10px] font-bold text-gray-600">
                  <AmenityIcon name={amenity} />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-app-text/40 uppercase tracking-wider mb-1">AI Insights</h4>
            <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
              <div className="flex items-start space-x-3">
                <div className="bg-accent/10 p-2 rounded-lg mt-1">
                  <Brain className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-accent">Smart Recommendation</p>
                  <p className="text-xs text-accent/80 mt-1 leading-relaxed">
                    {prediction?.insight || "Analyzing current traffic patterns and historical data for this station..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Reviews */}
          <div>
            <h4 className="text-xs font-bold text-app-text/40 uppercase tracking-wider mb-3">Recent Reviews</h4>
            <div className="space-y-3">
              {(selectedStation.reviews || [
                { user: "Alex", rating: 5, comment: "Fastest chargers in the area!" },
                { user: "Sarah", rating: 4, comment: "Clean facilities, easy access." }
              ]).map((review: any, i: number) => (
                <div key={i} className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-app-text">{review.user}</span>
                    </div>
                    <div className="flex items-center text-secondary">
                      {[...Array(review.rating)].map((_, j) => (
                        <Star key={j} className="w-2.5 h-2.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-app-text/60 leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReserveSlot}
            disabled={reserved}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2 ${
              reserved
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {reserved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Redirecting to Predictor...</span>
              </>
            ) : (
              <span>Reserve Slot via Queue Predictor</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
