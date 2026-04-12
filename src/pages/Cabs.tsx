import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, MapPin, Clock, ShieldCheck, ChevronRight, ChevronLeft, Info, User, Briefcase, Star, X } from 'lucide-react';
import { CAB_TYPES, LOCATIONS } from '../constants';

const Cabs: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'outstation' | 'local' | 'airport'>('outstation');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().slice(0, 16)
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveField(null);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getLocations = (val: string) =>
    LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(val.toLowerCase()) ||
      (l.code && l.code.toLowerCase().includes(val.toLowerCase()))
    ).slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      type: 'cab',
      from: formData.from || 'Pune',
      to: formData.to || 'Mumbai',
      departure: formData.date,
      tab: activeTab
    }).toString();
    navigate(`/search?${queryParams}`);
  };

  const handleBook = (cab: any) => {
    navigate('/booking', { 
      state: { 
        item: {
          ...cab,
          title: `${cab.type} - ${cab.example}`,
          poster: cab.image,
          price: cab.baseFare,
          from: formData.from || 'Pune',
          to: formData.to || 'Mumbai',
          date: formData.date,
          venue: (formData.from || 'Pune') + ' → ' + (formData.to || 'Mumbai'),
          from_city: formData.from || 'Pune',
          to_city: formData.to || 'Mumbai',
          travel_date: formData.date,
          show_time: new Date(formData.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }, 
        type: 'cab' 
      } 
    });
  };

  const formattedPickupDate = new Date(formData.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="group mb-12 flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-600 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
        </button>

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              Premium<br />
              <span className="text-indigo-600">Cabs</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Safe, reliable, and premium rides across Pune and beyond
              </p>
            </div>
          </div>
          <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {['outstation', 'local', 'airport'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {tab === 'outstation' ? 'Outstation' : tab === 'local' ? 'Local' : 'Airport'}
              </button>
            ))}
          </div>
        </div>

        {/* Cab Search Tabs */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-16 relative" ref={dropdownRef}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                <input 
                  type="text" 
                  placeholder="Enter Pickup City" 
                  value={formData.from}
                  onChange={(e) => {
                    setFormData({...formData, from: e.target.value});
                    setSuggestions(getLocations(e.target.value));
                    setActiveField('from');
                  }}
                  onFocus={() => { setSuggestions(getLocations(formData.from)); setActiveField('from'); }}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Drop Location</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                <input 
                  type="text" 
                  placeholder="Enter Destination City" 
                  value={formData.to}
                  onChange={(e) => {
                    setFormData({...formData, to: e.target.value});
                    setSuggestions(getLocations(e.target.value));
                    setActiveField('to');
                  }}
                  onFocus={() => { setSuggestions(getLocations(formData.to)); setActiveField('to'); }}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                />
              </div>
            </div>

            {suggestions.length > 0 && activeField && (
              <div className="absolute top-[100px] left-8 right-8 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
                {suggestions.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => {
                      if (activeField === 'from') setFormData({...formData, from: loc.name});
                      else setFormData({...formData, to: loc.name});
                      setSuggestions([]); setActiveField(null);
                    }}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 dark:text-white text-sm">{loc.name}</span>
                        {loc.code && <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">{loc.code}</span>}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{loc.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Pickup Date & Time</label>
              <input 
                type="datetime-local" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                Search Cabs
              </button>
            </div>
          </div>
        </form>

        {/* Cab Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CAB_TYPES.map((cab, idx) => (
            <motion.div 
              key={cab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group"
            >
              <div className="relative h-44 overflow-hidden rounded-[1.75rem] mb-8 border border-slate-100 dark:border-slate-800">
                <img 
                  src={cab.image} 
                  alt={cab.type} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent"></div>
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                  {cab.type}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">{cab.type}</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-yellow-500" />
                    <span className="text-xs font-black">4.8</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{cab.capacity} Seats</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{cab.capacity} Bags</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  <Clock className="w-3 h-3" />
                  <span>Pickup {formattedPickupDate}</span>
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">{cab.example}</p>
                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-black text-indigo-600 tracking-tighter font-display">₹{cab.perKm}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">/ km</span>
                  </div>
                  <button 
                    onClick={() => handleBook(cab)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    Book
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Row */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, title: 'Verified Drivers', desc: 'All our drivers undergo rigorous background checks and training.' },
            { icon: <Clock className="w-8 h-8 text-indigo-600" />, title: 'Punctuality Guaranteed', desc: 'On-time pickup or we give you a discount on your next ride.' },
            { icon: <Car className="w-8 h-8 text-indigo-600" />, title: 'Premium Fleet', desc: 'Well-maintained, clean, and sanitized cars for a comfortable journey.' }
          ].map((feature, i) => (
            <div key={i} className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
                {feature.icon}
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">{feature.title}</h4>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cabs;
