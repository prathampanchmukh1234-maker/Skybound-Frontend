import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, ChevronRight, Play, Info, Ticket, Users, ShieldCheck, X, ChevronLeft } from 'lucide-react';
import { MOVIES, THEATERS, SHOWTIMES } from '../constants';
import { useGlobal } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewSystem from '../components/ReviewSystem';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // Dynamic Dates
  const dates = useMemo(() => {
    const result = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.push({
        day: days[d.getDay()],
        date: d.getDate().toString(),
        full: d.toISOString().split('T')[0]
      });
    }
    return result;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0].full);

  const movie = useMemo(() => MOVIES.find(m => m.id === id), [id]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4">Movie not found</h1>
          <Link to="/movies" className="text-indigo-600 font-bold hover:underline">Back to Movies</Link>
        </div>
      </div>
    );
  }

  const theaterShowtimes = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    SHOWTIMES.filter(s => s.movieId === movie.id).forEach(s => {
      // Filter out past showtimes if the selected date is today
      if (selectedDate === todayStr) {
        const timeParts = s.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          let hour = parseInt(timeParts[1]);
          const minute = parseInt(timeParts[2]);
          const ampm = timeParts[3].toUpperCase();
          if (ampm === 'PM' && hour !== 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;

          if (hour < currentHour || (hour === currentHour && minute < currentMinute + 15)) {
            return; // Skip past showtimes
          }
        }
      }

      if (!grouped[s.theaterId]) grouped[s.theaterId] = [];
      grouped[s.theaterId].push(s);
    });
    return grouped;
  }, [movie.id, selectedDate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-20">
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <button
          onClick={() => navigate('/movies')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Movies
        </button>
      </div>
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={movie.poster} 
            alt={movie.title}
            className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto h-full flex items-end pb-16 px-6 relative z-10 pt-8">
          <div className="flex flex-col md:flex-row gap-12 items-end">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-64 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 shrink-0 relative group cursor-pointer"
              onClick={() => setShowTrailer(true)}
            >
              <img 
                src={movie.poster} 
                alt={movie.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'; }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 text-indigo-600 fill-current ml-1" />
                </div>
              </div>
            </motion.div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3">
                {movie.genre.map(g => (
                  <span key={g} className="px-4 py-1.5 bg-indigo-600/10 backdrop-blur-md border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] break-words max-w-full">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-slate-600 dark:text-slate-400 font-bold">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl">{movie.rating}</span>
                  <span className="text-sm opacity-50">/ 10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{movie.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{movie.releaseDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 mt-12">
        {/* Left Content: Info */}
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Info className="w-6 h-6 text-indigo-600" />
              Synopsis
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
              {movie.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Cast & Crew</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {movie.cast.map(actor => (
                <div key={actor} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{actor}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Actor</p>
                </div>
              ))}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{movie.director}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Director</p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Select Showtime</h2>
              <div className="flex gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                {dates.map(d => (
                  <button
                    key={d.full}
                    onClick={() => setSelectedDate(d.full)}
                    className={`flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all ${
                      selectedDate === d.full 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-500 hover:text-indigo-600'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1">{d.day}</span>
                    <span className="text-xl font-black">{d.date}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {Object.keys(theaterShowtimes).length > 0 ? (
                (Object.entries(theaterShowtimes) as [string, any[]][]).map(([theaterId, shows]) => {
                  const theater = THEATERS.find(t => t.id === theaterId);
                  return (
                    <div key={theaterId} className="group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">{theater?.name}</h3>
                            <p className="text-[10px] text-slate-500 font-bold">{theater?.location} • {theater?.distance}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                          FAST FILLING
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {shows.map(show => (
                          <button
                            key={show.id}
                            onClick={() => setSelectedShowtimeId(show.id)}
                            className={`px-6 py-4 rounded-2xl border transition-all text-center min-w-[120px] ${
                              selectedShowtimeId === show.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-500'
                            }`}
                          >
                            <p className="text-lg font-black">{show.time}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${selectedShowtimeId === show.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {show.format}
                            </p>
                          </button>
                        ))}
                      </div>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 mt-8 group-last:hidden"></div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-bold italic">No showtimes available for this date.</p>
                </div>
              )}
            </div>
          </section>

          <ReviewSystem serviceId={movie.id} serviceType="movie" />
        </div>

        {/* Right Sidebar: Booking Summary Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Ticket className="w-6 h-6 text-indigo-600" />
                Booking Summary
              </h3>
              
              <AnimatePresence mode="wait">
                {selectedShowtimeId ? (
                  <motion.div
                    key="summary-active"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Movie</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{movie.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Format</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {SHOWTIMES.find(s => s.id === selectedShowtimeId)?.format}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Date & Time</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {selectedDate} • {SHOWTIMES.find(s => s.id === selectedShowtimeId)?.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Base Price</span>
                        <span className="text-slate-900 dark:text-white">
                          {convertPrice(SHOWTIMES.find(s => s.id === selectedShowtimeId)?.price.normal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Internet Fees</span>
                        <span className="text-slate-900 dark:text-white">{convertPrice(45)}</span>
                      </div>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-slate-900 dark:text-white">Total Amount</span>
                        <span className="text-2xl font-black text-indigo-600">
                          {convertPrice((SHOWTIMES.find(s => s.id === selectedShowtimeId)?.price.normal || 0) + 45)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/movies/book/${selectedShowtimeId}`)}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
                    >
                      Select Seats
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="summary-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]"
                  >
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm max-w-[180px] mx-auto">
                      Please select a showtime to proceed with booking.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div 
              onClick={() => setShowTrailer(true)}
              className="bg-indigo-600/5 dark:bg-indigo-400/5 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem] p-6 flex items-start gap-4 cursor-pointer hover:bg-indigo-600/10 transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Watch Trailer</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                  See the exclusive SykBound trailer for {movie.title} in 4K HDR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && movie.trailerUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTrailer(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe 
                src={`${movie.trailerUrl}?autoplay=1`}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetails;
