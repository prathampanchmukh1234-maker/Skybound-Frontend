import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, MapPin, Calendar, Star, ArrowRight, Search, SlidersHorizontal, Ticket, ChevronLeft, X } from 'lucide-react';
import { CONCERTS } from '../constants';
import { motion } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext';

const Concerts: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<'recommended' | 'priceLow' | 'priceHigh' | 'dateSoonest'>('recommended');

  const categories = ['Music', 'Comedy', 'Theater', 'Sports'];
  const cities = useMemo(() => {
    const derivedCities = CONCERTS.map((concert) => concert.venue.split(',').pop()?.trim()).filter(Boolean) as string[];
    return ['All Cities', ...Array.from(new Set(derivedCities))];
  }, []);

  const filteredConcerts = useMemo(() => {
    const filtered = CONCERTS.filter(c => {
      const concertCity = c.venue.split(',').pop()?.trim() || '';
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? c.category === selectedCategory : true;
      const matchesCity = selectedCity === 'All Cities' ? true : concertCity === selectedCity;
      const matchesPrice = c.price <= maxPrice;
      
      // Date & Time Filtering
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const concertDate = c.date;
      
      if (concertDate < todayStr) return false;
      
      if (concertDate === todayStr && c.time) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        
        const timeParts = c.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          let hour = parseInt(timeParts[1]);
          const minute = parseInt(timeParts[2]);
          const ampm = timeParts[3].toUpperCase();
          if (ampm === 'PM' && hour !== 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;
          
          if (hour < currentHour || (hour === currentHour && minute < currentMinute + 60)) {
            return false;
          }
        }
      }

      return matchesSearch && matchesCategory && matchesCity && matchesPrice;
    });

    if (sortBy === 'priceLow') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'dateSoonest') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [maxPrice, searchQuery, selectedCategory, selectedCity, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              <Music className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Events</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              EXPERIENCE <br/> <span className="text-indigo-600">THE VIBE.</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-lg">
              Discover the most exclusive concerts, stand-up comedy, and live performances in your city.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search artists or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 pl-14 pr-8 py-5 bg-white dark:bg-slate-900 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Filters</span>
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">Concert Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 transition-colors hover:text-indigo-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Price</label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="mb-4 text-lg font-black text-indigo-600">{convertPrice(maxPrice)}</div>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={500}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recommended' | 'priceLow' | 'priceHigh' | 'dateSoonest')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold outline-none transition-all focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="recommended">Recommended</option>
                  <option value="dateSoonest">Date: Soonest</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedCity('All Cities');
                  setMaxPrice(10000);
                  setSortBy('recommended');
                  setSelectedCategory(null);
                  setSearchQuery('');
                }}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-8 mb-12 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCategory === null 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
            }`}
          >
            All Events
          </button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Concerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredConcerts.map((concert, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={concert.id}
              className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/20 transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={concert.image} 
                  alt={concert.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                <div className="absolute top-6 left-6">
                  <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-2">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{concert.rating}</span>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{concert.date}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight leading-tight mb-4">{concert.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{concert.venue}</span>
                    </div>
                    <div className="text-lg font-black text-white">
                      {convertPrice(concert.price)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Artist</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{concert.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="text-sm font-black text-indigo-600">{concert.category}</p>
                  </div>
                </div>

                <Link 
                  to={`/concerts/${concert.id}`}
                  className="flex items-center justify-center gap-3 w-full py-5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredConcerts.length === 0 && (
          <div className="text-center py-40">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No events found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Concerts;
