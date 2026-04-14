import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, Search, MapPin, Calendar, Clock, ShieldCheck, ChevronRight, ChevronLeft, Info, X, CheckCircle2, AlertCircle, Activity, Map as MapIcon, Navigation } from 'lucide-react';
import { LOCATIONS, TRAIN_ROUTES } from '../constants';
import Toast from '../components/Toast';

const Trains: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'book' | 'pnr' | 'status'>('book');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [pnr, setPnr] = useState('');
  const [trainNo, setTrainNo] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusType, setStatusType] = useState<'pnr' | 'live'>('pnr');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearchedRoutes, setHasSearchedRoutes] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveInput(null);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getStationSuggestions = (value: string) => {
    const normalizedValue = value.trim().toLowerCase();
    return LOCATIONS.filter((location) => {
      const matchesSearch =
        !normalizedValue ||
        location.name.toLowerCase().includes(normalizedValue) ||
        location.country.toLowerCase().includes(normalizedValue) ||
        location.code?.toLowerCase().includes(normalizedValue);

      return matchesSearch && location.region === 'domestic';
    }).slice(0, 8);
  };

  const openSuggestions = (field: 'from' | 'to', value: string) => {
    setActiveInput(field);
    setSuggestions(getStationSuggestions(value));
  };

  const selectSuggestion = (field: 'from' | 'to', value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setActiveInput(null);
    setSuggestions([]);
  };

  const filteredRoutes = useMemo(() => {
    const from = formData.from.trim().toLowerCase();
    const to = formData.to.trim().toLowerCase();

    return TRAIN_ROUTES.filter((train) => {
      const matchesFrom = !from || train.from.toLowerCase().includes(from);
      const matchesTo = !to || train.to.toLowerCase().includes(to);
      return matchesFrom && matchesTo;
    });
  }, [formData.from, formData.to]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to.trim()) {
      setToast({ message: 'Enter a destination station to view trains.', type: 'error' });
      return;
    }
    setIsSearching(true);

    setTimeout(() => {
      setHasSearchedRoutes(true);
      setIsSearching(false);
      if (filteredRoutes.length === 0) {
        setToast({ message: 'No matching IRCTC routes found for this destination.', type: 'info' });
      }
    }, 600);
  };

  const handleCheckStatus = (type: 'pnr' | 'live') => {
    if (type === 'pnr' && pnr.length < 10) return;
    if (type === 'live' && !trainNo) return;
    
    setStatusType(type);
    setIsLoading(true);
    setShowStatusModal(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleBookNow = (trainId: string, classType: string) => {
    const train = TRAIN_ROUTES.find(t => t.id === trainId);
    if (!train) return;
    
    navigate('/booking', { 
      state: { 
        item: {
          ...train,
          title: `${train.name} (${train.number})`,
          poster: train.image,
          price: train.classes[classType as keyof typeof train.classes].fare,
          class: classType,
          from: train.from,
          to: train.to,
          venue: `${train.from} → ${train.to}`,
          from_city: train.from,
          to_city: train.to,
          travel_date: formData.date,
          show_time: train.departure
        }, 
        type: 'train' 
      } 
    });
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
              IRCTC<br />
              <span className="text-indigo-600">Bookings</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Official IRCTC Partner — Instant Booking & PNR Calibration
              </p>
            </div>
          </div>
          <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            {['book', 'pnr', 'status'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {tab === 'book' ? 'Book' : tab === 'pnr' ? 'PNR' : 'Status'}
              </button>
            ))}
          </div>
        </div>

        {/* Train Search Tabs */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-20 relative overflow-visible z-20">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8" ref={dropdownRef}>
            {activeTab === 'book' ? (
              <form onSubmit={handleSearch} className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">From Station</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder="Pune Jn (PUNE)" 
                      value={formData.from}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setFormData({...formData, from: nextValue});
                        openSuggestions('from', nextValue);
                      }}
                      onFocus={() => openSuggestions('from', formData.from)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
                    />
                  </div>
                  {activeInput === 'from' && suggestions.length > 0 && (
                    <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[220] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[320px] overflow-y-auto">
                      {suggestions.map((location) => (
                        <button
                          key={`${location.id}-from`}
                          type="button"
                          onClick={() => selectSuggestion('from', location.name)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 dark:text-white">{location.name}</span>
                              {location.code && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">{location.code}</span>}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{location.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">To Station</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 group-focus-within:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder="Mumbai CSMT (CSMT)" 
                      value={formData.to}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setFormData({...formData, to: nextValue});
                        openSuggestions('to', nextValue);
                      }}
                      onFocus={() => openSuggestions('to', formData.to)}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
                    />
                  </div>
                  {activeInput === 'to' && suggestions.length > 0 && (
                    <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[220] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-[320px] overflow-y-auto">
                      {suggestions.map((location) => (
                        <button
                          key={`${location.id}-to`}
                          type="button"
                          onClick={() => selectSuggestion('to', location.name)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 dark:text-white">{location.name}</span>
                              {location.code && <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">{location.code}</span>}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{location.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Date</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit" 
                    disabled={isSearching}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      'Search Trains'
                    )}
                  </button>
                </div>
              </form>
            ) : activeTab === 'pnr' ? (
              <div className="md:col-span-4 flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Info className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 group-focus-within:scale-110 transition-transform" />
                  <input 
                    type="text" 
                    maxLength={10}
                    placeholder="Enter 10-digit PNR Number" 
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
                  />
                </div>
                <button 
                  onClick={() => handleCheckStatus('pnr')}
                  disabled={pnr.length < 10}
                  className="bg-indigo-600 text-white px-16 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  Check Status
                </button>
              </div>
            ) : (
              <div className="md:col-span-4 flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Train className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 group-focus-within:scale-110 transition-transform" />
                  <input 
                    type="text" 
                    placeholder="Enter Train Number or Name" 
                    value={trainNo}
                    onChange={(e) => setTrainNo(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm" 
                  />
                </div>
                <button 
                  onClick={() => handleCheckStatus('live')}
                  disabled={!trainNo}
                  className="bg-indigo-600 text-white px-16 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  Track Live
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Train Results */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Available Express Routes</h2>
            <div className="flex-1 h-[1px] bg-slate-200 dark:border-slate-800"></div>
          </div>
          {!formData.to.trim() ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-lg font-black text-slate-900 dark:text-white">Enter a destination to unlock IRCTC train options.</p>
              <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">We will show matching trains only after a valid route is entered.</p>
            </div>
          ) : !hasSearchedRoutes ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-lg font-black text-slate-900 dark:text-white">Search your route to see live train options.</p>
              <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">Enter your stations and date, then tap `Search Trains`.</p>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-lg font-black text-slate-900 dark:text-white">No matching trains found.</p>
              <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">Try a different source or destination station.</p>
            </div>
          ) : filteredRoutes.map((train, idx) => (
            <motion.div 
              key={train.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 transition-colors"></div>
              <div className="flex flex-wrap items-center justify-between gap-10 mb-12">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-indigo-600 font-display bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">{train.number}</span>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">{train.name}</h3>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Runs on: M T W T F S S</span>
                    <div className="flex items-center gap-2 text-green-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[11px] font-black uppercase tracking-widest">Confirmed Guarantee</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-16">
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white block font-display tracking-tight">{train.departure}</span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                      {new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3 px-6">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{train.duration}</span>
                    <div className="w-32 h-[2px] bg-slate-100 dark:bg-slate-800 relative">
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-900 dark:text-white block font-display tracking-tight">{train.arrival}</span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                      {new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {Object.entries(train.classes).map(([type, details]) => (
                  <button 
                    key={type}
                    onClick={() => handleBookNow(train.id, type)}
                    className={`p-6 rounded-2xl border transition-all text-left group/cls relative overflow-hidden ${details.status.includes('WL') ? 'bg-red-50/30 dark:bg-red-900/5 border-red-100 dark:border-red-900/20' : 'bg-green-50/30 dark:bg-green-900/5 border-green-100 dark:border-green-900/20'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{type}</span>
                      <span className="text-base font-black text-indigo-600 font-display">₹{details.fare}</span>
                    </div>
                    <div className={`text-sm font-black ${details.status.includes('WL') ? 'text-red-600' : 'text-green-600'}`}>
                      {details.status}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-2">Updated 2m ago</div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 translate-y-full group-hover/cls:translate-y-0 transition-transform"></div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatusModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-12">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {statusType === 'pnr' ? 'PNR Status' : 'Live Tracking'}
                  </h3>
                  <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {isLoading ? (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Fetching real-time data...</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {statusType === 'pnr' ? (
                      <div className="space-y-8">
                        <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">PNR Number</p>
                              <p className="text-2xl font-black text-slate-900 dark:text-white">{pnr}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Status</p>
                              <p className="text-xl font-black text-green-600">CONFIRMED</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coach</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">A1</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Berth</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">42 (Lower)</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                          <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Your ticket is valid. Have a safe journey!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                              <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-slate-900 dark:text-white">12124 Deccan Queen</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pune to Mumbai</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Running Status</p>
                            <p className="text-lg font-black text-green-600">ON TIME</p>
                          </div>
                        </div>

                        <div className="relative py-12">
                          <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-indigo-600 rounded-full"></div>
                          </div>
                          <div className="space-y-12 ml-16">
                            <div className="relative">
                              <div className="absolute -left-[46px] top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900"></div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Departed</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">Pune Junction</p>
                              <p className="text-[10px] font-bold text-slate-500">07:15 AM</p>
                            </div>
                            <div className="relative">
                              <div className="absolute -left-[46px] top-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <Navigation className="w-3 h-3 text-white fill-white" />
                              </div>
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Current Location</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">Lonavala</p>
                              <p className="text-[10px] font-bold text-slate-500">Passing through...</p>
                            </div>
                            <div className="relative opacity-50">
                              <div className="absolute -left-[46px] top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-300 rounded-full border-4 border-white dark:border-slate-900"></div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Stop</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">Kalyan Junction</p>
                              <p className="text-[10px] font-bold text-slate-500">ETA: 09:45 AM</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => setShowStatusModal(false)}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Trains;
