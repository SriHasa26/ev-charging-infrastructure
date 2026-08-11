import React from 'react';
import { motion } from 'motion/react';
import { Activity, Zap, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { getSmartChargeAnalysis } from '../services/geminiService';

export default function SmartChargeDoctor() {
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ expected: 150, actual: 130 });
  // Debounce timer ref so we don't call Gemini on every slider tick
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAnalysis = React.useCallback((expected: number, actual: number) => {
    setLoading(true);
    getSmartChargeAnalysis(expected, actual)
      .then(data => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error getting smart charge analysis:', err);
        setLoading(false);
      });
  }, []);

  // Run analysis on mount
  React.useEffect(() => {
    runAnalysis(stats.expected, stats.actual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSliderChange = (field: 'expected' | 'actual', value: number) => {
    const newStats = { ...stats, [field]: value };
    // Clamp actual speed to never exceed expected
    if (field === 'actual' && value > newStats.expected) {
      newStats.actual = newStats.expected;
    }
    setStats(newStats);

    // Debounce the API call — wait 800ms after user stops sliding
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runAnalysis(newStats.expected, newStats.actual);
    }, 800);
  };

  const efficiency = stats.expected > 0 ? Math.round((stats.actual / stats.expected) * 100) : 0;

  const efficiencyColor =
    efficiency >= 90 ? 'text-green-600' :
    efficiency >= 70 ? 'text-orange-500' :
    'text-red-600';

  const efficiencyBarColor =
    efficiency >= 90 ? 'from-green-400 to-emerald-500' :
    efficiency >= 70 ? 'from-orange-400 to-yellow-500' :
    'from-red-500 to-orange-500';

  return (
    <div className="bg-white p-6 rounded-2xl border border-primary/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-accent" />
          <h3 className="text-lg font-bold text-app-text">SmartCharge Doctor</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center ${
            efficiency >= 90
              ? 'bg-green-50 text-green-600'
              : efficiency >= 70
              ? 'bg-orange-50 text-orange-600'
              : 'bg-red-50 text-red-600'
          }`}>
            <ShieldCheck className="w-3 h-3 mr-1" />
            {efficiency >= 90 ? 'Optimal' : efficiency >= 70 ? 'Moderate' : 'Degraded'}
          </span>
        </div>
      </div>

      {/* Interactive sliders */}
      <div className="space-y-5 mb-6">
        {/* Expected Speed */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-app-text/60 font-bold uppercase">
              Expected Speed
            </label>
            <span className="text-sm font-bold text-app-text">
              {stats.expected} <span className="text-xs font-normal">kW</span>
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={350}
            step={5}
            value={stats.expected}
            onChange={e => handleSliderChange('expected', Number(e.target.value))}
            className="w-full h-2 bg-primary/10 rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-app-text/40 mt-1">
            <span>10 kW</span>
            <span>350 kW</span>
          </div>
        </div>

        {/* Actual Speed */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-app-text/60 font-bold uppercase">
              Actual Speed
            </label>
            <span className={`text-sm font-bold ${efficiencyColor}`}>
              {stats.actual} <span className="text-xs font-normal text-app-text/60">kW</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={stats.expected}
            step={1}
            value={stats.actual}
            onChange={e => handleSliderChange('actual', Number(e.target.value))}
            className="w-full h-2 bg-primary/10 rounded-full appearance-none cursor-pointer accent-accent"
          />
          <div className="flex justify-between text-[10px] text-app-text/40 mt-1">
            <span>0 kW</span>
            <span>{stats.expected} kW (max)</span>
          </div>
        </div>
      </div>

      {/* Efficiency bar */}
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-app-text/60">
        <span>Efficiency</span>
        <span className={efficiencyColor}>{efficiency}%</span>
      </div>
      <div className="relative h-2.5 bg-primary/10 rounded-full overflow-hidden mb-6">
        <motion.div
          key={efficiency}
          initial={{ width: 0 }}
          animate={{ width: `${efficiency}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${efficiencyBarColor}`}
        />
      </div>

      {/* AI analysis result */}
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-primary/5 animate-pulse rounded-lg w-3/4" />
          <div className="h-10 bg-primary/5 animate-pulse rounded-xl" />
        </div>
      ) : analysis ? (
        <motion.div
          key={JSON.stringify(analysis)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            efficiency >= 90
              ? 'bg-green-50 border-green-100'
              : efficiency >= 70
              ? 'bg-orange-50 border-orange-100'
              : 'bg-red-50 border-red-100'
          }`}
        >
          <div className="flex items-start space-x-3">
            {efficiency >= 90 ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${efficiency >= 70 ? 'text-orange-500' : 'text-red-600'}`} />
            )}
            <div>
              <p className={`text-sm font-bold ${efficiency >= 90 ? 'text-green-700' : efficiency >= 70 ? 'text-orange-700' : 'text-red-700'}`}>
                Diagnosis: {analysis.diagnosis}
              </p>
              <p className={`text-xs mt-1 leading-relaxed ${efficiency >= 90 ? 'text-green-600' : efficiency >= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                {analysis.recommendation}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Re-analyse button */}
      <button
        onClick={() => runAnalysis(stats.expected, stats.actual)}
        disabled={loading}
        className="mt-4 w-full py-2.5 flex items-center justify-center space-x-2 bg-primary/5 hover:bg-primary/10 rounded-xl text-xs font-bold text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Analysing...' : 'Re-analyse'}</span>
      </button>
    </div>
  );
}
