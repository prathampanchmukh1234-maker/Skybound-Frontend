
import React, { useEffect } from 'react';
import SearchForm from '../components/SearchForm';
import PromotionalOffers from '../components/PromotionalOffers';
import TravelServices from '../components/TravelServices';
import { CATEGORIZED_DESTINATIONS, MOVIES, CONCERTS, WEEKEND_GETAWAYS_PUNE, LONG_WEEKENDS_2026 } from '../constants';
import { useNavigate, Link } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { WeekendTripFinder } from '../components/DiscoveryEngine';
import MovieCard from '../components/MovieCard';
import ConcertCard from '../components/ConcertCard';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Film, Globe, ShieldCheck, Headset, Tags, Music, ChevronLeft, ChevronRight, Calendar, Plane, Bus, Train, Hotel, Building2, CarTaxiFront, Mountain, FileText, Shield, Gift } from 'lucide-react';

const TrendingDestinations = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 md:mt-40"
    >
      <div className="flex items-center justify-between mb-8 sm:mb-12 gap-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Trending Destinations</h2>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll('left')} className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => scroll('right')} className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x">
        {[
          { name: 'Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200', price: '₹45,000' },
          { name: 'Singapore', img: 'https://images.unsplash.com/photo-1525625239514-46446f1f4405?q=80&w=1200', price: '₹38,000' },
          { name: 'Paris', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200', price: '₹62,000' },
          { name: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200', price: '₹32,000' },
          { name: 'London', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200', price: '₹58,000' },
          { name: 'Tokyo', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200', price: '₹75,000' }
        ].map((dest, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/search?to=${dest.name}`)} 
            className="flex-shrink-0 w-64 group cursor-pointer snap-start"
          >
            <div className="h-96 rounded-[3rem] overflow-hidden relative mb-4 border border-slate-200 dark:border-slate-800 shadow-lg group-hover:shadow-2xl transition-all duration-500">
              <img 
                src={dest.img} 
                alt={dest.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <h4 className="text-2xl font-black text-white tracking-tight">{dest.name}</h4>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Starting {dest.price}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const WeekendGetaways = () => {
  const navigate = useNavigate();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 md:mt-40"
    >
      <div className="flex items-center justify-between mb-8 sm:mb-12 gap-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Weekend Getaways from Pune</h2>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll('left')} className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => scroll('right')} className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x">
        {WEEKEND_GETAWAYS_PUNE.map((g, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/search?to=${g.name}&type=cab`)} 
            className="flex-shrink-0 w-64 group cursor-pointer snap-start"
          >
            <div className="h-64 rounded-[2.5rem] overflow-hidden relative mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500">
              <img 
                src={g.img} 
                alt={g.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest">
                {g.duration} drive
              </div>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{g.name}</h4>
            <p className="text-sm font-bold text-slate-400">Starting {g.price} per person</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { searchHistory, convertPrice, user, loadingAuth, addNotification } = useGlobal();

  const claimOffer = (code: string, desc: string) => {
    const claimed = sessionStorage.getItem('skybound_claimed_coupon');
    if (claimed) {
      try {
        const parsed = JSON.parse(claimed);
        if (parsed.code === code) {
          addNotification("Already Claimed", `You've already saved coupon ${code}. It will apply at checkout.`);
          return;
        }
      } catch (_) {}
    }
    const coupon = { code, desc, timestamp: Date.now() };
    sessionStorage.setItem('skybound_claimed_coupon', JSON.stringify(coupon));
    addNotification("Offer Claimed!", `${desc} — coupon ${code} will auto-apply at checkout.`);
  };

  if (loadingAuth) return null;

  return (
    <div className="pb-32 bg-white dark:bg-slate-950 transition-colors duration-500">
      {/* Hero Section */}
      <div className="relative min-h-[88vh] sm:min-h-[95vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 overflow-hidden">
        <div className="mesh-gradient">
          <div className="blob top-0 left-0"></div>
          <div className="blob bottom-0 right-0" style={{ animationDelay: '-5s', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)' }}></div>
          <div className="blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '-10s', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 70%)' }}></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 max-w-5xl w-full"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-slate-50/50 dark:bg-indigo-900/10 border border-slate-200/50 dark:border-indigo-800/30 text-slate-900 dark:text-white mb-8 sm:mb-10 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Future of Travel & Living</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl md:text-[9rem] font-black mb-6 sm:mb-8 tracking-[-0.06em] leading-[0.92] text-slate-900 dark:text-white break-words max-w-6xl mx-auto px-2 sm:px-4">
            <span className="block text-slate-950 dark:text-white">The World</span>
            <span className="block text-slate-900 drop-shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300 dark:drop-shadow-[0_12px_40px_rgba(79,70,229,0.22)]">
              Awaits You
            </span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 max-w-3xl mx-auto text-base sm:text-lg md:text-xl font-medium mb-10 sm:mb-14 leading-relaxed">
            Experience the most sophisticated ecosystem for travel, entertainment, and lifestyle. Curated for those who demand excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const el = document.getElementById('search-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }} 
              className="azure-btn px-16 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl w-full sm:w-auto"
            >
              Search Destinations
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/concerts')}
              className="glass px-16 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white w-full sm:w-auto"
            >
              Live Experiences
            </motion.button>
          </div>

          <div className="mt-14 sm:mt-24 pt-8 sm:pt-12 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap justify-center items-center gap-5 sm:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Secure Systems</div>
            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white"><Globe className="w-4 h-4 text-purple-600" /> Global Network</div>
            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white"><Sparkles className="w-4 h-4 text-pink-600 fill-current" /> AI Powered</div>
          </div>
        </motion.div>
      </div>

      <div id="search-anchor" className="scroll-mt-32 px-4 sm:px-6 -mt-14 sm:-mt-24 relative z-20 overflow-visible">
        <SearchForm />

        {/* Quick Access Services */}
        <div className="max-w-7xl mx-auto mt-16 sm:mt-24">
          <div className="flex items-center gap-4 mb-8 sm:mb-10 px-0 sm:px-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quick Access</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></div>
            <div className="hidden sm:flex gap-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('quick-access-scroll');
                  if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                }} 
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('quick-access-scroll');
                  if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                }} 
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div id="quick-access-scroll" className="flex gap-4 overflow-x-auto pb-8 px-4 scrollbar-hide snap-x">
            {[
              { name: 'Flights', icon: <Plane className="w-6 h-6" />, path: '/flights', color: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600' },
              { name: 'Buses', icon: <Bus className="w-6 h-6" />, path: '/buses', color: 'bg-orange-50 dark:bg-orange-900/10 text-orange-600' },
              { name: 'Trains', icon: <Train className="w-6 h-6" />, path: '/trains', color: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600' },
              { name: 'Hotels', icon: <Building2 className="w-6 h-6" />, path: '/hotels', color: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' },
              { name: 'Cabs', icon: <CarTaxiFront className="w-6 h-6" />, path: '/cabs', color: 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600' },
              { name: 'Activities', icon: <Mountain className="w-6 h-6" />, path: '/activities', color: 'bg-purple-50 dark:bg-purple-900/10 text-purple-600' },
              { name: 'Visa', icon: <FileText className="w-6 h-6" />, path: '/visa', color: 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600' },
              { name: 'Insurance', icon: <Shield className="w-6 h-6" />, path: '/insurance', color: 'bg-pink-50 dark:bg-pink-900/10 text-pink-600' },
              { name: 'Gift Cards', icon: <Gift className="w-6 h-6" />, path: '/gift-cards', color: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600' },
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex-shrink-0 snap-start"
              >
                <Link to={s.path} className={`flex items-center gap-4 px-8 py-5 ${s.color} rounded-3xl border border-transparent hover:border-current transition-all shadow-sm hover:shadow-xl`}>
                  {s.icon}
                  <span className="text-xs font-black uppercase tracking-widest">{s.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {searchHistory.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12 animate-fade-up">
            <div className="flex items-center gap-4 mb-6">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Continue Searching</span>
               <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
               {searchHistory.map((h, i) => (
                 <div 
                  key={i} 
                  onClick={() => navigate(`/search?type=${h.type}&from=${h.from}&to=${h.to}`)}
                  className="flex-shrink-0 w-64 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-400 transition-all"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                         <i className={`fa-solid ${h.type === 'flight' ? 'fa-plane' : 'fa-hotel'}`}></i>
                       </div>
                       <ArrowRight className="w-3 h-3 text-slate-300" />
                    </div>
                    <div className="font-black text-slate-900 dark:text-white tracking-tight">{h.to}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase mt-1">From {h.from}</div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      <TravelServices />

      {/* Movies Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 md:mt-40"
      >
        <div className="flex items-center justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-2 block">Entertainment</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Now Showing</h2>
          </div>
          <Link to="/movies" className="hidden sm:flex group items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8">
          {MOVIES
            .slice(0, 6)
            .map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
      </motion.div>

      {/* Concerts Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 md:mt-40"
      >
        <div className="flex items-center justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-2 block">Live Events</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Upcoming Concerts</h2>
          </div>
          <Link to="/concerts" className="hidden sm:flex group items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {CONCERTS
            .filter(concert => new Date(concert.date) >= new Date(new Date().setHours(0,0,0,0)))
            .slice(0, 3)
            .map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
        </div>
      </motion.div>

      {/* Live Deals Ticker */}
      <div className="bg-slate-950 py-8 overflow-hidden whitespace-nowrap relative mt-40 border-y border-white/5">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>
        <div className="animate-marquee flex items-center gap-16">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              <button 
                onClick={() => claimOffer('FLASHBUS40', '40% OFF on Pune-Mumbai Buses')}
                className="flex items-center gap-4 text-white/80 font-black uppercase tracking-[0.2em] text-[11px] hover:text-white transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-500 fill-current" />
                <span>Flash Sale: 40% OFF on Pune-Mumbai Buses</span>
              </button>
              <div className="w-2 h-2 bg-white/10 rounded-full"></div>
              <button 
                onClick={() => claimOffer('FIRSTHOTEL500', 'Flat ₹500 OFF on First Hotel Booking')}
                className="flex items-center gap-4 text-white/80 font-black uppercase tracking-[0.2em] text-[11px] hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4 text-purple-500" />
                <span>Flat ₹500 OFF on First Hotel Booking</span>
              </button>
              <div className="w-2 h-2 bg-white/10 rounded-full"></div>
              <button 
                onClick={() => claimOffer('ZEROTRAIN', 'Zero Convenience Fee on Trains today!')}
                className="flex items-center gap-4 text-white/80 font-black uppercase tracking-[0.2em] text-[11px] hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Zero Convenience Fee on Trains today!</span>
              </button>
              <div className="w-2 h-2 bg-white/10 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      <PromotionalOffers />

      <WeekendGetaways />

      <TrendingDestinations />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 md:mt-40"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 sm:mb-16">Recommended for you</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {CATEGORIZED_DESTINATIONS.trending.map((d, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              onClick={() => navigate(`/search?to=${d.name}`)} 
              className="rounded-[3rem] overflow-hidden group cursor-pointer border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-900"
            >
              <div className="h-80 overflow-hidden relative">
                <img 
                  src={d.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800';
                  }}
                />
                <div className="absolute top-8 left-8 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">{d.tag}</div>
              </div>
              <div className="p-10">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{d.name}</h3>
                <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800">
                   <span className="text-sm font-bold text-slate-400">Packages from {d.price}</span>
                   <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">View Deals</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <WeekendTripFinder />

      {/* Upcoming Long Weekends */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 md:mt-40">
        <div className="bg-slate-900 dark:bg-indigo-950 rounded-[2.5rem] md:rounded-[4rem] p-8 sm:p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 sm:mb-12">Upcoming Long Weekends 2026</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {LONG_WEEKENDS_2026.map((w, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-4 py-1 bg-indigo-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">{w.date}</div>
                    <div className={`text-xs font-black uppercase tracking-widest ${w.daysLeft === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {w.daysLeft === 0 ? 'Happening Now' : `${w.daysLeft} days left`}
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">
                      {(w as any).discount}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white tracking-tight mb-2">{w.holiday}</h4>
                  <p className="text-white/60 text-sm font-bold mb-6">{w.extendedTo}</p>
                  <div className="flex flex-wrap gap-2">
                    {(w as any).deals?.map((p: string, j: number) => (
                      <span key={j} className="text-[9px] font-black text-white/40 uppercase tracking-widest px-3 py-1 border border-white/5 rounded-lg group-hover:border-white/20 transition-colors">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 md:mt-40 bg-slate-50 dark:bg-slate-900/50 py-16 sm:py-24 md:py-32 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-12 sm:mb-20">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4 block">The SykBound Advantage</span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Why Choose Us?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
              <ShieldCheck className="w-10 h-10 text-indigo-600" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">Secure Payments</h4>
            <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-xs mx-auto">Your transactions are protected by industry-leading encryption and security protocols.</p>
          </div>
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
              <Headset className="w-10 h-10 text-emerald-600" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">24/7 Support</h4>
            <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-xs mx-auto">Our dedicated support team is available around the clock to assist you with any queries.</p>
          </div>
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
              <Tags className="w-10 h-10 text-amber-600" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">Best Price Guarantee</h4>
            <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-xs mx-auto">We offer the most competitive prices in the market, ensuring you get the best value for your money.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
