import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, MapPin, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';

const SERVICES = [
  {
    id: 's1',
    title: 'Elite Spa & Wellness',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1544161515-4508f5ad4c14?q=80&w=1200',
    rating: 4.9,
    reviews: 128,
    price: 2500,
    duration: '90 min',
    location: 'Bandra, Mumbai',
    description: 'A premium spa experience with traditional and modern therapies.'
  },
  {
    id: 's2',
    title: 'Iron Paradise Gym',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200',
    rating: 4.8,
    reviews: 256,
    price: 1200,
    duration: 'Day Pass',
    location: 'Juhu, Mumbai',
    description: 'State-of-the-art equipment and professional personal training.'
  },
  {
    id: 's3',
    title: 'The Hive Coworking',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?q=80&w=1200',
    rating: 4.7,
    reviews: 89,
    price: 800,
    duration: 'Day Pass',
    location: 'BKC, Mumbai',
    description: 'Premium workspace with high-speed internet and gourmet coffee.'
  },
  {
    id: 's4',
    title: 'Skyline Rooftop Dining',
    category: 'Dining',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200',
    rating: 4.9,
    reviews: 512,
    price: 3500,
    duration: 'Table Booking',
    location: 'Worli, Mumbai',
    description: 'Exquisite fine dining with a panoramic view of the city skyline.'
  }
];

const Services: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Wellness', 'Fitness', 'Business', 'Dining'];

  const filteredServices = SERVICES.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              PREMIUM<br />
              <span className="text-indigo-600">EXPERIENCES.</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Curated lifestyle services for the discerning
              </p>
            </div>
          </div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-8 mb-16 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/services/${service.id}`)}
              className={`group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col ${index === 0 ? 'md:col-span-2 md:flex-row' : ''}`}
            >
              <div className={`${index === 0 ? 'md:w-1/2' : 'w-full'} h-80 md:h-auto overflow-hidden relative`}>
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200'; }}
                />
                <div className="absolute top-8 left-8 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  {service.category}
                </div>
              </div>
              
              <div className={`${index === 0 ? 'md:w-1/2' : 'w-full'} p-10 flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black">{service.rating}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">({service.reviews} reviews)</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors font-display">
                    {service.title}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed mb-6 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{service.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{service.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting from</span>
                    <span className="text-3xl font-black text-indigo-600 font-display">{convertPrice(service.price)}</span>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group-hover:translate-x-2 shadow-lg shadow-indigo-600/20">
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-40">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">No services found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
              We couldn't find any services matching your search. Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
