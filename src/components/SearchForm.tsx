
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { LOCATIONS } from '../constants';
import FareCalendar from './FareCalendar';
import { motion, AnimatePresence } from 'framer-motion';

const SearchForm: React.FC = () => {
  const navigate = useNavigate();
  const { location: userLoc, convertPrice } = useGlobal();
  const [type, setType] = useState<'flight' | 'hotel' | 'bus' | 'train' | 'holiday' | 'cab' | 'activity'>('flight');
  const [maxBudget, setMaxBudget] = useState(50000);
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);
  
  const [formData, setFormData] = useState({
    from: 'Pune',
    to: '',
    departure: new Date().toISOString().split('T')[0],
    travelers: 1
  });

  const [multiCitySegments, setMultiCitySegments] = useState([
    { from: '', to: '', date: new Date().toISOString().split('T')[0] },
    { from: '', to: '', date: new Date().toISOString().split('T')[1] || new Date(Date.now() + 86400000).toISOString().split('T')[0] }
  ]);

  const [suggestions, setSuggestions] = useState({ from: [], to: [] });
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userLoc && !formData.from) {
      setFormData(prev => ({ ...prev, from: userLoc }));
      if (userLoc.includes('Delhi') && !formData.to) {
        setFormData(prev => ({ ...prev, to: 'Goa' }));
      }
    }
  }, [userLoc, formData.from, formData.to]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchData = { ...formData };
    if (type === 'hotel' || type === 'activity') {
      delete searchData.from;
    }
    const queryParams = new URLSearchParams({ 
      type, 
      ...searchData, 
      budget: maxBudget.toString()
    }).toString();
    navigate(`/search?${queryParams}`);
  };

  const handleInput = (key: 'from' | 'to', val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    setActiveInput(key);
    
    if (val.length > 0) {
      const filtered = LOCATIONS.filter(loc => {
        const matchesSearch = loc.name.toLowerCase().includes(val.toLowerCase()) || 
          loc.code?.toLowerCase().includes(val.toLowerCase()) ||
          loc.country.toLowerCase().includes(val.toLowerCase());
        
        if (['bus', 'train', 'cab'].includes(type)) {
          return matchesSearch && loc.region === 'domestic';
        }
        return matchesSearch;
      }).sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const valLower = val.toLowerCase();
        if (aName.startsWith(valLower) && !bName.startsWith(valLower)) return -1;
        if (!aName.startsWith(valLower) && bName.startsWith(valLower)) return 1;
        return 0;
      }).slice(0, 12);
      setSuggestions(prev => ({ ...prev, [key]: filtered }));
    } else {
      const topLocations = [
        ...LOCATIONS.filter(l => {
          const isTop = ['DEL', 'BOM', 'GOA', 'SXR', 'LEH', 'DXB', 'LHR', 'CDG', 'SIN', 'BKK'].includes(l.id || '');
          if (['bus', 'train', 'cab'].includes(type)) {
            return isTop && l.region === 'domestic';
          }
          return isTop;
        }),
        ...LOCATIONS.filter(l => {
          if (['bus', 'train', 'cab'].includes(type)) {
            return l.region === 'domestic';
          }
          return true;
        }).slice(0, 10)
      ].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).slice(0, 15);
      
      setSuggestions(prev => ({ ...prev, [key]: topLocations }));
    }
  };

  const selectSuggestion = (key: 'from' | 'to', name: string) => {
    setFormData(prev => ({ ...prev, [key]: name }));
    setActiveInput(null);
  };

  return (
    <motion.div 
      ref={wrapperRef} 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-3xl p-5 sm:p-8 md:p-14 relative z-30 max-w-6xl mx-auto border border-slate-100 dark:border-slate-800 shadow-2xl transition-all duration-500"
    >
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8 sm:mb-12 border-b dark:border-slate-800 pb-8 sm:pb-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl">
          {['flight', 'hotel', 'bus', 'train', 'holiday', 'cab', 'activity'].map(t => (
            <motion.button 
              key={t}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setType(t as any)}
              className={`px-4 sm:px-6 py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.18em] transition-all flex items-center gap-2 ${type === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <i className={`fa-solid ${t === 'flight' ? 'fa-plane' : t === 'hotel' ? 'fa-hotel' : t === 'bus' ? 'fa-bus' : t === 'train' ? 'fa-train' : t === 'holiday' ? 'fa-umbrella-beach' : t === 'cab' ? 'fa-car' : 'fa-ticket'}`}></i> {t}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full xl:w-auto">
           <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Max Budget</span>
             <span className="text-sm font-black text-indigo-600 font-display">{convertPrice(maxBudget)}</span>
           </div>
           <input 
              type="range" min="1000" max="200000" step="5000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full sm:w-40 accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
           />
        </div>
      </div>

      {type === 'flight' && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 mb-8 sm:mb-10 px-1 sm:px-4">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <button 
              type="button"
              onClick={() => setIsMultiCity(false)}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!isMultiCity ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
            >
              One Way / Round Trip
            </button>
            <button 
              type="button"
              onClick={() => setIsMultiCity(true)}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isMultiCity ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Multi-City
            </button>
          </div>
          <div className="flex items-center gap-3 lg:ml-auto">
            <input 
              type="checkbox" id="flexi" 
              checked={flexibleDates} 
              onChange={(e) => setFlexibleDates(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
            <label htmlFor="flexi" className="text-[10px] font-black uppercase text-slate-400 cursor-pointer select-none tracking-widest">Flexible Dates (+/- 3 days)</label>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 relative">
        {(type !== 'hotel' && type !== 'activity') && (
          <div className="md:col-span-4 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">Origin</label>
            <input 
              type="text" required placeholder="From City"
              autoComplete="off"
              className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
              value={formData.from}
              onFocus={() => handleInput('from', formData.from)}
              onChange={(e) => handleInput('from', e.target.value)}
            />
            {activeInput === 'from' && suggestions.from.length > 0 && (
              <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] z-[220] overflow-y-auto max-h-[400px] animate-in fade-in slide-in-from-top-4 duration-300 scrollbar-hide">
                <div className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">Recommended Locations</div>
                {suggestions.from.map((loc: any) => (
                <div key={loc.id} onClick={() => selectSuggestion('from', loc.name)} className="px-5 sm:px-8 py-4 sm:py-5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center gap-4 group transition-colors">
                    <div>
                      <span className="font-black text-base text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">{loc.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.country}</span>
                    </div>
                    {loc.code && <span className="text-[11px] font-black bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">{loc.code}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`${(type === 'hotel' || type === 'activity') ? 'md:col-span-8' : 'md:col-span-4'} relative`}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-3 block">
            {type === 'hotel' ? 'Search Hotels in' : type === 'activity' ? 'Search Activities in' : 'Destination'}
          </label>
          <input 
            type="text" required placeholder={type === 'hotel' ? 'e.g. Mumbai, Goa, Dubai' : type === 'activity' ? 'e.g. Pune, Manali, Kerala' : 'To Destination'}
            autoComplete="off"
            className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
            value={formData.to}
            onFocus={() => handleInput('to', formData.to)}
            onChange={(e) => handleInput('to', e.target.value)}
          />
          {activeInput === 'to' && suggestions.to.length > 0 && (
            <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] z-[220] overflow-y-auto max-h-[400px] animate-in fade-in slide-in-from-top-4 duration-300 scrollbar-hide">
              <div className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">Recommended Locations</div>
              {suggestions.to.map((loc: any) => (
                <div key={loc.id} onClick={() => selectSuggestion('to', loc.name)} className="px-5 sm:px-8 py-4 sm:py-5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center gap-4 group transition-colors">
                  <div>
                    <span className="font-black text-base text-slate-900 dark:text-white block group-hover:text-indigo-600 transition-colors">{loc.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.country}</span>
                    </div>
                    {loc.code && <span className="text-[11px] font-black bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">{loc.code}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

        <div className="md:col-span-2 relative">
          <div className="flex justify-between items-center mb-3 px-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type === 'hotel' ? 'Check-In' : 'Date'}</label>
            <button 
              type="button"
              disabled={!formData.to}
              onClick={() => setShowCalendar(true)}
              className={`text-[9px] font-black uppercase tracking-tighter transition-all ${!formData.to ? 'text-slate-300 cursor-not-allowed opacity-50' : 'text-indigo-600 hover:underline'}`}
              title={!formData.to ? `Enter a destination to view price trends` : "View lowest price calendar"}
            >
              <i className="fa-solid fa-calendar-days mr-1"></i> Trends
            </button>
          </div>
          <input 
            type="date" required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
            value={formData.departure}
            onChange={(e) => setFormData({...formData, departure: e.target.value})}
          />
        </div>

        <div className="md:col-span-2 flex flex-col justify-end">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="bg-indigo-600 text-white w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700"
          >
            Search
          </motion.button>
        </div>
      </form>

      {showCalendar && (
        <FareCalendar 
          onClose={() => setShowCalendar(false)}
          origin={formData.from || 'Source'}
          destination={formData.to || 'Destination'}
          onSelectDate={(date) => setFormData(prev => ({ ...prev, departure: date }))}
        />
      )}

      <div className="mt-8 sm:mt-12 flex flex-wrap gap-4 sm:gap-6 items-center border-t dark:border-slate-800 pt-8 sm:pt-10">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Popular Routes:</span>
        <div className="flex flex-wrap gap-3">
          {['Pune → Mumbai', 'Mumbai → Goa', 'Pune → Shirdi', 'Delhi → Leh'].map((route, i) => (
            <button 
              key={i} type="button"
              onClick={() => {
                const [f, t] = route.split(' → ');
                setFormData({...formData, from: f, to: t});
              }}
              className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95 border border-indigo-100 dark:border-indigo-900/40"
            >
              {route}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchForm;
