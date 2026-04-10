
import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { savePriceAlert } from '../services/db';

export const PriceWaitSimulator: React.FC<{ currentPrice: number }> = ({ currentPrice }) => {
  const { convertPrice } = useGlobal();
  const [prediction, setPrediction] = useState<{ risk: string, savings: number, trend: 'up' | 'down' } | null>(null);

  useEffect(() => {
    // Simulated prediction logic
    const risks = ['Low', 'Medium', 'High'];
    setPrediction({
      risk: risks[Math.floor(Math.random() * risks.length)],
      savings: Math.floor(Math.random() * 1500) + 500,
      trend: Math.random() > 0.4 ? 'down' : 'up'
    });
  }, []);

  if (!prediction) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mt-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Wait Strategy</span>
        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
          prediction.risk === 'Low' ? 'bg-green-100 text-green-700' : 
          prediction.risk === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
        }`}>
          Risk: {prediction.risk}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${prediction.trend === 'down' ? 'bg-green-600' : 'bg-orange-600'} text-white`}>
          <i className={`fa-solid fa-hourglass-${prediction.trend === 'down' ? 'start' : 'end'}`}></i>
        </div>
        <div>
          <h4 className="font-black text-slate-900 dark:text-white text-sm">
            {prediction.trend === 'down' ? `Wait for -${convertPrice(prediction.savings)}` : 'Book Now (Prices Rising)'}
          </h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">AI Confidence: 88%</p>
        </div>
      </div>
    </div>
  );
};

export const TargetPriceAlert: React.FC<{ from: string, to: string, currentPrice: number, onAlertSet: (target: number) => void }> = ({ from, to, currentPrice, onAlertSet }) => {
  const { convertPrice, user } = useGlobal();
  const [target, setTarget] = useState(Math.floor(currentPrice * 0.85));
  const [loading, setLoading] = useState(false);

  // Sync target when currentPrice changes (e.g., first result loads)
  useEffect(() => {
    if (currentPrice) {
      setTarget(Math.floor(currentPrice * 0.85));
    }
  }, [currentPrice]);

  const handleSetAlert = async () => {
    setLoading(true);
    try {
      await savePriceAlert({ userId: user?.id || 'demo', from, to, targetPrice: target, currentPrice });
      onAlertSet(target);
    } catch (e) {
      console.error("Radar sync failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20">
      <h3 className="text-lg font-black tracking-tight mb-2">Target Price Alert</h3>
      <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-6">Notify me & filter when price drops below</p>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black">{convertPrice(target)}</span>
          <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[9px] font-black uppercase">-{Math.round((1 - target/currentPrice)*100)}%</span>
        </div>
        <input 
          type="range" min={Math.max(500, currentPrice * 0.4)} max={currentPrice} step={500}
          value={target} onChange={(e) => setTarget(Number(e.target.value))}
          className="w-full accent-white h-1.5 bg-blue-400 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[8px] font-black uppercase opacity-60">
           <span>{convertPrice(Math.max(500, currentPrice * 0.4))}</span>
           <span>{convertPrice(currentPrice)}</span>
        </div>
      </div>

      <button onClick={handleSetAlert} disabled={loading} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95">
        {loading ? 'CALIBRATING...' : 'ENABLE RADAR'}
      </button>
    </div>
  );
};

export const MatchScore: React.FC<{ score: number }> = ({ score }) => {
  return (
    <div className="flex flex-col items-center group cursor-help shrink-0" title={`Neural Match Score: ${score}% alignment with your preferences`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-md group-hover:bg-blue-500/20 transition-all"></div>
        <svg className="w-full h-full -rotate-90 relative">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100 dark:text-slate-800" />
          <circle 
            cx="24" cy="24" r="20" 
            stroke="currentColor" strokeWidth="3" 
            fill="transparent" 
            strokeDasharray={125.6} 
            strokeDashoffset={125.6 - (125.6 * score) / 100} 
            className="text-blue-600 transition-all duration-1000" 
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[9px] font-black text-slate-900 dark:text-white">{score}%</span>
      </div>
      <div className="bg-blue-600 text-white text-[6px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1.5 shadow-sm border border-white/20 whitespace-nowrap">
        AI MATCH
      </div>
    </div>
  );
};
