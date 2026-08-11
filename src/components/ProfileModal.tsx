import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Settings, Zap, Fuel, Save, Shield, Bell } from 'lucide-react';
import { notify } from '../lib/notifications';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [preferences, setPreferences] = React.useState({
    vehicleType: 'EV',
    minChargingSpeed: '50',
    preferredNetwork: 'All Networks',
    notifications: true,
  });

  React.useEffect(() => {
    const savedPrefs = localStorage.getItem('user_preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    notify('Profile Updated', 'Your preferences have been saved successfully.', 'info');
    onClose();
    // Optional: reload to apply changes globally if needed
    window.dispatchEvent(new Event('storage'));
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
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Preferences</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Default Vehicle Type</label>
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setPreferences({ ...preferences, vehicleType: 'EV' })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${preferences.vehicleType === 'EV' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Zap className="w-4 h-4 mr-2" /> EV
                      </button>
                      <button
                        onClick={() => setPreferences({ ...preferences, vehicleType: 'CNG' })}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center ${preferences.vehicleType === 'CNG' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Fuel className="w-4 h-4 mr-2" /> CNG
                      </button>
                    </div>
                  </div>

                  {preferences.vehicleType === 'EV' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Min. Charging Speed (kW)</label>
                      <select
                        value={preferences.minChargingSpeed}
                        onChange={(e) => setPreferences({ ...preferences, minChargingSpeed: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="50">50 kW (Standard)</option>
                        <option value="150">150 kW (Fast)</option>
                        <option value="350">350 kW (Ultra Fast)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Network</label>
                    <select
                      value={preferences.preferredNetwork}
                      onChange={(e) => setPreferences({ ...preferences, preferredNetwork: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="All Networks">All Networks</option>
                      <option value="EcoCharge">EcoCharge Hub</option>
                      <option value="FastCharge">FastCharge Pro</option>
                      <option value="VoltVortex">VoltVortex</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                        <p className="text-[10px] text-gray-500">Alerts for low battery and nearby stations.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${preferences.notifications ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.notifications ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleSave}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
