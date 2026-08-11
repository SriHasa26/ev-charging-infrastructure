import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, MapPin, ArrowRight, RotateCcw, Trash2, X, Navigation } from 'lucide-react';
import { notify } from '../lib/notifications';

interface RouteHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onReplan: (start: string, destination: string) => void;
}

interface SavedRoute {
  id: string;
  start: string;
  destination: string;
  timestamp: string;
}

export default function RouteHistory({ isOpen, onClose, onReplan }: RouteHistoryProps) {
  const [history, setHistory] = React.useState<SavedRoute[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('route_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, [isOpen]);

  const deleteRoute = (id: string) => {
    const updated = history.filter(r => r.id !== id);
    setHistory(updated);
    localStorage.setItem('route_history', JSON.stringify(updated));
    notify('Route Deleted', 'The route has been removed from your history.', 'info');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('route_history');
    notify('History Cleared', 'All saved routes have been removed.', 'info');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <History className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Route History</h2>
              </div>
              <div className="flex items-center space-x-2">
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs font-bold text-red-600 hover:text-red-700 mr-4"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Navigation className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No saved routes yet</p>
                  <p className="text-gray-400 text-sm mt-1">Your planned journeys will appear here.</p>
                </div>
              ) : (
                history.map((route) => (
                  <motion.div
                    layout
                    key={route.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{route.start}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-red-600" />
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{route.destination}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {new Date(route.timestamp).toLocaleDateString()} at {new Date(route.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onReplan(route.start, route.destination)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          title="Re-plan Route"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRoute(route.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 text-center">
                Routes are saved locally on your device for quick access.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
