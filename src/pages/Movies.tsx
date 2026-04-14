import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Film, Ticket, Star, Clock, ChevronLeft } from 'lucide-react';
import { MOVIES } from '../constants';
import MovieCard from '../components/MovieCard';
import { motion } from 'framer-motion';

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const handleEliteUpgrade = () => navigate('/privileges');
  const handleViewBenefits = () => navigate('/privileges', { state: { source: 'movies-premiere-access' } });

  const genres = ['All', 'Action', 'Drama', 'Comedy', 'Adventure', 'Fantasy', 'Thriller'];

  const filteredMovies = MOVIES.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 px-6">
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

        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
              Cinematic<br />
              <span className="text-indigo-600">Experiences</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Curated Premieres & Global Blockbusters
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search movies..."
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    selectedGenre === genre 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {filteredMovies.map((movie, idx) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
              <Film className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No movies found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your search or filters.</p>
          </div>
        )}

        <div className="mt-32 bg-indigo-600 rounded-[3rem] p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                SykBound Premiere Access
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-6">
                Experience Cinema Like Never Before
              </h2>
              <p className="text-indigo-100 text-lg font-medium mb-10">
                Get early access to tickets, exclusive screenings, and premium lounge benefits with SykBound Elite.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button onClick={handleEliteUpgrade} className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
                  Upgrade to Elite
                </button>
                <button onClick={handleViewBenefits} className="px-10 py-5 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-400 transition-all border border-indigo-400">
                  View Benefits
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-white/10 backdrop-blur-xl rounded-[4rem] border border-white/20 flex items-center justify-center relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
              <Ticket className="w-32 h-32 text-white opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movies;
