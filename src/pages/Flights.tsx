
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, MapPin, Calendar, Users, ShieldCheck, ChevronRight, ChevronLeft, Info, Star, Clock, Zap, Filter, Search } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { LOCATIONS } from '../constants';

const Flights: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();
  const [formData, setFormData] = useState({
    from: 'Pune',
    to: '',
    date: new Date().toISOString().split('T')[0],
    travelers: 1,
    class: 'Economy'
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
      type: 'flight',
      from: formData.from,
      to: formData.to || 'Mumbai',
      departure: formData.date,
      travelers: formData.travelers.toString(),
      class: formData.class
    }).toString();
    navigate(`/search?${queryParams}`);
  };

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
              SkyBound<br />
              <span className="text-indigo-600">Aviation</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Premium flight bookings with global connectivity
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">IATA Certified</span>
            </div>
          </div>
        </div>

        {/* Flight Search Form */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-20 relative overflow-visible z-20">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-8 relative" ref={dropdownRef}>
            <div className="md:col-span-3 space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">From</label>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 group-focus-within:scale-110 transition-transform" />
                <input 
                  type="text" 
                  placeholder="Pune (PNQ)" 
                  value={formData.from}
                  onChange={(e) => {
                    setFormData({...formData, from: e.target.value});
                    setSuggestions(getLocations(e.target.value));
                    setActiveField('from');
                  }}
                  onFocus={() => { setSuggestions(getLocations(formData.from)); setActiveField('from'); }}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
                />
              </div>
              {suggestions.length > 0 && activeField === 'from' && (
                <div className="absolute top-[105%] left-0 right-0 z-[220] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, from: loc.name});
                        setSuggestions([]); setActiveField(null);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 dark:text-white">{loc.name}</span>
                          {loc.code && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">{loc.code}</span>}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-3 space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">To</label>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 group-focus-within:scale-110 transition-transform" />
                <input 
                  type="text" 
                  placeholder="Mumbai (BOM)" 
                  value={formData.to}
                  onChange={(e) => {
                    setFormData({...formData, to: e.target.value});
                    setSuggestions(getLocations(e.target.value));
                    setActiveField('to');
                  }}
                  onFocus={() => { setSuggestions(getLocations(formData.to)); setActiveField('to'); }}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
                />
              </div>
              {suggestions.length > 0 && activeField === 'to' && (
                <div className="absolute top-[105%] left-0 right-0 z-[220] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, to: loc.name});
                        setSuggestions([]); setActiveField(null);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 dark:text-white">{loc.name}</span>
                          {loc.code && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">{loc.code}</span>}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.country}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Departure</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Travelers & Class</label>
              <div className="relative group">
                <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                <select 
                  value={formData.class}
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm appearance-none"
                >
                  <option>Economy</option>
                  <option>Premium Economy</option>
                  <option>Business</option>
                  <option>First Class</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 flex items-center justify-center gap-3">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Featured Airlines */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Partner Airlines</h2>
            <div className="flex-1 h-[1px] bg-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {['Air India', 'IndiGo', 'Vistara', 'Emirates', 'Qatar Airways', 'Singapore Airlines'].map((airline, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{airline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, title: 'Safe Travels', desc: 'Comprehensive health and safety protocols across all partner airlines.' },
            { icon: <Clock className="w-8 h-8 text-indigo-600" />, title: 'Real-time Updates', desc: 'Instant notifications for gate changes, delays, and boarding status.' },
            { icon: <Zap className="w-8 h-8 text-indigo-600" />, title: 'Instant Booking', desc: 'One-click checkout and immediate e-ticket generation for all routes.' }
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

export default Flights;
