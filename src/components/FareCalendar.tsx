
import React from 'react';
import { useGlobal } from '../context/GlobalContext';

interface FareCalendarProps {
  onClose: () => void;
  origin: string;
  destination: string;
  onSelectDate: (date: string) => void;
}

const FareCalendar: React.FC<FareCalendarProps> = ({ onClose, origin, destination, onSelectDate }) => {
  const { convertPrice } = useGlobal();
  
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const price = 3000 + Math.floor(Math.random() * 5000);
    return {
      date: d.toISOString().split('T')[0],
      display: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      price,
      isCheapest: false
    };
  });

  const minPrice = Math.min(...days.map(d => d.price));
  days.forEach(d => { if(d.price === minPrice) d.isCheapest = true; });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Price Trends</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
              Lowest rates for {origin} <i className="fa-solid fa-arrow-right mx-2"></i> {destination}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 transition-colors">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="p-8 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {days.map((day, i) => (
            <div 
              key={i} 
              onClick={() => { onSelectDate(day.date); onClose(); }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                day.isCheapest 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{day.weekday}</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{day.display}</div>
              <div className={`text-xs font-black mt-2 ${day.isCheapest ? 'text-green-600' : 'text-blue-500'}`}>
                {convertPrice(day.price)}
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Optimal Value</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 max-w-xs text-right italic">
            *Prices fluctuate based on demand and neural insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FareCalendar;
