import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Star, ShieldCheck, ChevronRight, Info, Clock, Ticket, Zap, Filter, X, ChevronLeft } from 'lucide-react';
import { ACTIVITIES, LOCATIONS } from '../constants';

import ReviewSystem from '../components/ReviewSystem';
import { AnimatePresence } from 'framer-motion';

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  const filteredActivities = useMemo(() => {
    return ACTIVITIES.filter(a => {
      const matchesCategory = !selectedCategory || a.category === selectedCategory;
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = a.price <= priceRange;
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [selectedCategory, searchQuery, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const isIndianCity = !normalizedQuery || LOCATIONS.some((location) =>
      location.region === 'domestic' && (
        location.name.toLowerCase() === normalizedQuery ||
        location.code?.toLowerCase() === normalizedQuery
      )
    );

    if (!isIndianCity) {
      setSearchError('Please enter an Indian city only.');
      return;
    }

    setSearchError('');
    const queryParams = new URLSearchParams({
      type: 'activity',
      to: searchQuery || 'Pune'
    }).toString();
    navigate(`/search?${queryParams}`);
  };

  const handleBookNow = (activityId: string) => {
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;
    
    navigate('/booking', { 
      state: { 
        item: {
          ...activity,
          price: activity.price,
          location: activity.location,
          venue: activity.title + (activity.location ? ` — ${activity.location}` : ''),
          travel_date: new Date().toISOString().split('T')[0],
          from_city: activity.location || 'Pune'
        }, 
        type: 'activity' 
      } 
    });
  };

  const handleBuyGiftCard = () => {
    navigate('/gift-cards');
  };

  const categories = ['Adventure', 'Culture', 'Food', 'Nature', 'Wellness', 'Workshops'];

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
              Things<br />
              <span className="text-indigo-600">to Do</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Discover and book unique experiences in Pune
              </p>
            </div>
          </div>
          <div className="flex gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide max-w-full">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${!selectedCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Activities Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-16">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 group-focus-within:scale-110 transition-transform" />
              <input 
                type="text" 
                placeholder="Search activities in Pune, Mumbai..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError('');
                }}
                className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border border-transparent focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm text-lg" 
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-12 py-6 rounded-3xl font-black text-[14px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 flex items-center justify-center gap-3">
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>
          {searchError && (
            <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-red-500">{searchError}</p>
          )}
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, idx) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group"
              >
                <div className="h-72 overflow-hidden relative">
                  <img 
                    src={activity.image} 
                    alt={activity.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200`;
                    }}
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <div className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                      <Star className="w-3 h-3 fill-indigo-600" /> {activity.rating}
                    </div>
                    {activity.instantConfirmation && (
                      <div className="px-3 py-1.5 bg-green-500/90 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 shadow-sm">
                        <Zap className="w-3 h-3 fill-white" /> Instant
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-6 right-6 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                    {activity.category}
                  </div>
                </div>
                <div className="p-10 cursor-pointer" onClick={() => setSelectedActivity(activity)}>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight font-display">{activity.title}</h3>
                  <div className="flex items-center gap-6 mb-8 text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{activity.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{activity.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <span className="text-3xl font-black text-indigo-600 tracking-tighter font-display">₹{activity.price}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">/ person</span>
                    </div>
                    <button 
                      onClick={() => handleBookNow(activity.id)}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-sm"
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
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No activities found</h3>
              <p className="text-slate-500 font-bold">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>

        {/* Featured Section */}
        <div className="mt-40 bg-indigo-600 rounded-[3rem] p-16 md:p-24 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-7xl font-black text-white tracking-tighter mb-8 leading-none font-display">Gift an Experience</h2>
            <p className="text-xl font-bold text-white/80 mb-12 leading-relaxed">Surprise your loved ones with a SykBound Gift Card. Redeemable across all activities, movies, and concerts.</p>
            <button 
              onClick={handleBuyGiftCard}
              className="bg-white text-indigo-600 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-2xl shadow-black/20"
            >
              Buy Gift Card
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <Ticket className="w-full h-full text-white rotate-12 translate-x-1/4 -translate-y-1/4" />
          </div>
        </div>
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
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
                  src={selectedActivity.image} 
                  alt={selectedActivity.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedActivity.title}</h2>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-lg font-black">{selectedActivity.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-5 h-5" />
                        <span className="text-sm font-bold">{selectedActivity.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-bold">{selectedActivity.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-600 tracking-tighter">₹{selectedActivity.price}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">per person</div>
                    <button 
                      onClick={() => handleBookNow(selectedActivity.id)}
                      className="mt-6 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                  <div className="md:col-span-2 space-y-8">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Description</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Experience the best of {selectedActivity.location} with this {selectedActivity.category.toLowerCase()} activity. Perfect for {selectedActivity.duration} of exploration and fun.
                      </p>
                    </div>
                    
                    <ReviewSystem serviceId={selectedActivity.id} serviceType="activity" />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Instant Confirmation</h4>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                        Get your tickets instantly after booking. No waiting required.
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

export default Activities;
