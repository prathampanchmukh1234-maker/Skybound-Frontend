import React from 'react';
import { Star, Clock } from 'lucide-react';
import { Movie } from '../types';
import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const today = new Date();
  const isReleased = new Date(movie.releaseDate) <= today;

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative"
    >
      <Link 
        to={`/movies/${movie.id}`}
        className="block bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-800/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)]"
        id={`movie-card-${movie.id}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'; }}
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
          
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-black text-white">{movie.rating}</span>
          </div>

          {!isReleased && (
            <div className="absolute top-4 left-4 bg-indigo-600 px-3 py-1.5 rounded-xl shadow-lg">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Advance Booking</span>
            </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genre.slice(0, 2).map((g, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white">
                  {g}
                </span>
              ))}
            </div>
            <button className="w-full py-3 bg-white text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-xl">
              Book Tickets
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{movie.title}</h3>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-indigo-600" />
              {movie.duration}
            </span>
            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></span>
            <span className="line-clamp-1">{movie.genre[0]}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
