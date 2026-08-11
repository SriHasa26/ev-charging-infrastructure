import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { notify } from '../lib/notifications';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = React.useState<'suggestion' | 'issue' | 'other'>('suggestion');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, timestamp: new Date().toISOString() }),
      });

      if (response.ok) {
        notify('Feedback Sent', 'Thank you for helping us improve FuelFlow AI!', 'info');
        setMessage('');
        onClose();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      notify('Submission Failed', 'Could not send feedback. Please try again later.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Send Feedback</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">What's on your mind?</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('suggestion')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${type === 'suggestion' ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                  >
                    <Sparkles className={`w-5 h-5 mb-1 ${type === 'suggestion' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`text-[10px] font-bold ${type === 'suggestion' ? 'text-purple-700' : 'text-gray-500'}`}>Suggestion</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('issue')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${type === 'issue' ? 'bg-red-50 border-red-200 ring-1 ring-red-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                  >
                    <AlertCircle className={`w-5 h-5 mb-1 ${type === 'issue' ? 'text-red-600' : 'text-gray-400'}`} />
                    <span className={`text-[10px] font-bold ${type === 'issue' ? 'text-red-700' : 'text-gray-500'}`}>Issue</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('other')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${type === 'other' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                  >
                    <MessageSquare className={`w-5 h-5 mb-1 ${type === 'other' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-[10px] font-bold ${type === 'other' ? 'text-blue-700' : 'text-gray-500'}`}>Other</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={type === 'suggestion' ? "How can we make FuelFlow AI better?" : "Describe the issue you encountered..."}
                  className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
