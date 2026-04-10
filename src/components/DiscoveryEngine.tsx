
import React from 'react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MICRO_TRIPS = [
  { to: 'Panchgani', time: '2.5h', cost: 4500, image: 'https://hblimg.mmtcdn.com/content/hubble/img/new_dest_imagemar/mmt/activities/m_Panchgani_2_l_800_1200.jpg', tag: 'Hill Station' },
  { to: 'Kolad', time: '3h', cost: 3200, image: 'https://d26dp53kz39178.cloudfront.net/media/uploads/products/33_River_Rafting_in_Kolad-1694158290953.webp', tag: 'Adventure' },
  { to: 'Igatpuri', time: '4.5h', cost: 5500, image: 'https://blog.redbus.in/wp-content/uploads/2024/06/Igatpuri.png', tag: 'Mist City' }
];

export const WeekendTripFinder: React.FC = () => {
  const { convertPrice } = useGlobal();
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-6 mt-40"
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] mb-4 block">Smart Proximity Engine</span>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Micro-Escapes from Pune</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
          <i className="fa-solid fa-clock text-xs text-blue-600"></i>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max 6h Travel Time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {MICRO_TRIPS.map((trip, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate(`/search?to=${trip.to}&type=bus`)} 
            className="glass rounded-[3rem] overflow-hidden group cursor-pointer border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <div className="h-64 relative overflow-hidden">
              <img 
                src={trip.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                referrerPolicy="no-referrer" 
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200'; }}
              />
              <div className="absolute top-6 left-6 px-4 py-2 bg-white/95 rounded-xl text-[9px] font-black text-blue-600 uppercase tracking-widest">{trip.tag}</div>
              <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-slate-950/40 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                <i className="fa-solid fa-bus"></i> {trip.time}
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{trip.to}</h3>
                <span className="text-xl font-black text-blue-600">{convertPrice(trip.cost)}</span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">All-inclusive estimates</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
