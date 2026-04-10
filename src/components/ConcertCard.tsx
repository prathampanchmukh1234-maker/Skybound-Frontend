import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Star, ArrowRight, Ticket } from 'lucide-react';
import { Concert } from '../types';
import { useGlobal } from '../context/GlobalContext';
import { motion } from 'framer-motion';

interface ConcertCardProps {
  concert: Concert;
}

const ConcertCard: React.FC<ConcertCardProps> = ({ concert }) => {
  const { convertPrice } = useGlobal();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] transition-all duration-500"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <img 
          src={concert.image} 
          alt={concert.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        
        <div className="absolute top-6 left-6 flex gap-2">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center gap-2">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{concert.rating}</span>
          </div>
          <div className="px-4 py-2 bg-indigo-600/80 backdrop-blur-md rounded-xl text-[9px] font-black text-white uppercase tracking-widest">
            {concert.category}
          </div>
        </div>
      </div>
  
      <div className="p-8">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{concert.date}</span>
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-6 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {concert.title}
        </h3>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting from</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{convertPrice(concert.price)}</span>
          </div>
          
          <Link 
            to={`/concerts/${concert.id}`}
            className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ConcertCard;
