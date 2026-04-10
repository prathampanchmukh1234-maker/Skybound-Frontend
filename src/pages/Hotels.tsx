import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hotel, Search, MapPin, Calendar, Star, ShieldCheck, ChevronRight, Info, Map as MapIcon, List, Filter, X, Check, ChevronLeft } from 'lucide-react';
import { HOTELS_DATA } from '../constants';

import ReviewSystem from '../components/ReviewSystem';

const Hotels: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  const filteredHotels = useMemo(() => {
    return HOTELS_DATA.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           hotel.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = selectedRating ? hotel.rating >= selectedRating : true;
      const matchesPrice = hotel.pricePerNight >= priceRange[0] && hotel.pricePerNight <= priceRange[1];
      return matchesSearch && matchesRating && matchesPrice;
    });
  }, [searchQuery, selectedRating, priceRange]);

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const queryParams = new URLSearchParams({
      type: 'hotel',
      to: searchQuery || 'Mumbai',
      departure: checkIn,
      return: checkOut
    }).toString();
    
    setTimeout(() => {
      navigate(`/search?${queryParams}`);
      setIsSearching(false);
    }, 1500);
  };

  const handleBookNow = (hotelId: string) => {
    const hotel = HOTELS_DATA.find(h => h.id === hotelId);
    if (!hotel) return;
    
    navigate('/booking', { 
      state: { 
        item: {
          ...hotel,
          price: hotel.pricePerNight,
          checkIn,
          checkOut,
          location: hotel.location,
          venue: hotel.location,
          travel_date: checkIn || new Date().toISOString().split('T')[0],
          from_city: hotel.location
        }, 
        type: 'hotel' 
      } 
    });
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              Premium<br />
              <span className="text-indigo-600">Stays</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Handpicked luxury hotels and resorts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-2xl border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <button 
                onClick={() => setView('list')}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button 
                onClick={() => setView('map')}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'map' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <MapIcon className="w-4 h-4" /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Hotel Search Bar */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Location</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
              <input 
                type="text" 
                placeholder="Pune, Maharashtra" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Check-In</label>
            <input 
              type="date" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Check-Out</label>
            <input 
              type="date" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={isSearching}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                'Search Hotels'
              )}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minimum Rating</h4>
                  <div className="flex gap-2">
                    {[3, 4, 4.5].map(rating => (
                      <button 
                        key={rating}
                        onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRating === rating ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                      >
                        {rating}+ Stars
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Range (per night)</h4>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="0" max="50000" step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="text-sm font-black text-slate-900 dark:text-white">Up to ₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-end justify-end">
                  <button 
                    onClick={() => {
                      setSelectedRating(null);
                      setPriceRange([0, 50000]);
                      setSearchQuery('');
                    }}
                    className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel, idx) => (
                <motion.div 
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group ${idx === 0 && filteredHotels.length > 1 ? 'md:col-span-2 lg:col-span-2' : ''}`}
                >
                  <div className={`relative overflow-hidden ${idx === 0 && filteredHotels.length > 1 ? 'h-96' : 'h-72'}`}>
                    <img 
                      src={hotel.image} 
                      alt={hotel.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200`;
                      }}
                    />
                    <div className="absolute top-8 left-8 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                      <Star className="w-3 h-3 fill-indigo-600" /> {hotel.rating}
                    </div>
                    <div className="absolute bottom-8 right-8 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                      {new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="p-10 cursor-pointer" onClick={() => setSelectedHotel(hotel)}>
                    <h3 className={`${idx === 0 && filteredHotels.length > 1 ? 'text-4xl' : 'text-3xl'} font-black text-slate-900 dark:text-white mb-4 tracking-tight font-display`}>{hotel.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {hotel.amenities.slice(0, 4).map(am => (
                        <span key={am} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-lg">{am}</span>
                      ))}
                      {hotel.amenities.length > 4 && <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase rounded-lg">+{hotel.amenities.length - 4}</span>}
                    </div>
                    <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                      <div>
                        <span className="text-3xl font-black text-indigo-600 tracking-tighter font-display">₹{hotel.pricePerNight}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">/ night</span>
                      </div>
                      <button 
                        onClick={() => handleBookNow(hotel.id)}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No hotels found</h3>
                <p className="text-slate-500 font-bold">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[600px] bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center border-4 border-dashed border-slate-300 dark:border-slate-700">
            <div className="text-center space-y-4">
              <MapIcon className="w-16 h-16 text-slate-400 mx-auto" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Interactive Map View</h3>
              <p className="text-slate-500 font-bold">Explore hotels by neighborhood and proximity</p>
              <button onClick={() => setView('list')} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Switch back to list</button>
            </div>
          </div>
        )}
      </div>

      {/* Hotel Detail Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHotel(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-96">
                <img 
                  src={selectedHotel.image} 
                  alt={selectedHotel.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedHotel(null)}
                  className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedHotel.name}</h2>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-lg font-black">{selectedHotel.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-bold">{selectedHotel.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-600 tracking-tighter">₹{selectedHotel.pricePerNight}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">per night</div>
                    <button 
                      onClick={() => handleBookNow(selectedHotel.id)}
                      className="mt-6 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      Book This Hotel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                  <div className="md:col-span-2 space-y-8">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Amenities</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedHotel.amenities.map((am: string) => (
                          <div key={am} className="flex items-center gap-2 text-slate-500">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold">{am}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <ReviewSystem serviceId={selectedHotel.id} serviceType="hotel" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">SykBound Assured</h4>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                        This property has been verified for quality, safety, and hygiene standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hotels;
