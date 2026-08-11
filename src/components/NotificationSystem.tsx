import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, AlertCircle, Zap, Battery } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'emergency' | 'success';
  title: string;
  message: string;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback((notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ ...notif, id }, ...prev]);
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  React.useEffect(() => {
    const handleNotify = (event: any) => {
      addNotification(event.detail);
    };

    window.addEventListener('app-notify', handleNotify);
    return () => window.removeEventListener('app-notify', handleNotify);
  }, [addNotification]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-4 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="pointer-events-auto"
          >
            <div className={`p-4 rounded-2xl shadow-xl border flex items-start space-x-4 ${
              notif.type === 'emergency' ? 'bg-red-600 border-red-500 text-white' :
              notif.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-900' :
              notif.type === 'success' ? 'bg-green-50 border-green-100 text-green-900' :
              'bg-white border-gray-100 text-gray-900'
            }`}>
              <div className={`p-2 rounded-xl ${
                notif.type === 'emergency' ? 'bg-white/20' :
                notif.type === 'warning' ? 'bg-orange-100' :
                notif.type === 'success' ? 'bg-green-100' :
                'bg-blue-50'
              }`}>
                {notif.type === 'emergency' ? <Battery className="w-5 h-5" /> :
                 notif.type === 'warning' ? <AlertCircle className="w-5 h-5 text-orange-600" /> :
                 notif.type === 'success' ? <Zap className="w-5 h-5 text-green-600" /> :
                 <Zap className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{notif.title}</p>
                <p className="text-xs mt-1 opacity-90">{notif.message}</p>
              </div>
              <button onClick={() => removeNotification(notif.id)} className="opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
