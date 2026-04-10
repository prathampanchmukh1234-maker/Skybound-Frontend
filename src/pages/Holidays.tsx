
import React, { useState } from 'react';
import { HOLIDAYS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Search, MapPin, ChevronLeft } from 'lucide-react';

const Holidays: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      type: 'holiday',
      to: searchQuery || 'Goa'
    }).toString();
    navigate(`/search?${queryParams}`);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#fcfdfe] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-blue-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="text-center mb-12 animate-fade-up">
          <span className="text-[12px] font-black text-blue-600 uppercase tracking-[0.5em] mb-4 block">Premium Curations</span>
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">Holiday Packages</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto">Expertly crafted itineraries for the modern explorer. Inclusive of flights, stays, and experiences.</p>
        </div>

        {/* Holiday Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-20">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 group-focus-within:scale-110 transition-transform" />
              <input 
                type="text" 
                placeholder="Where do you want to go? (e.g. Goa, Ladakh, Dubai)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-6 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm text-lg" 
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-12 py-6 rounded-3xl font-black text-[14px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all hover:bg-blue-700 flex items-center justify-center gap-3">
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {HOLIDAYS.map((pkg, i) => (
            <div key={pkg.id} className="glass rounded-[3rem] overflow-hidden group cursor-pointer border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="h-72 relative overflow-hidden">
                <img 
                  src={pkg.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200'; }}
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-lg">
                  {pkg.duration}
                </div>
                <div className="absolute bottom-6 right-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl text-white">
                  <div className="flex items-center gap-1">
                    <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                    <span className="text-[11px] font-black">{pkg.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{pkg.title}</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {pkg.highlights.map((h, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase rounded-lg border border-blue-100 dark:border-blue-800">
                      {h}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Starting from</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{convertPrice(pkg.price)}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/booking', { state: { item: pkg, type: 'holiday' } })}
                    className="azure-btn px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    View Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Holidays;
