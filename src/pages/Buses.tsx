import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Search, MapPin, Calendar, Clock, ShieldCheck, ChevronRight, Info, Filter, X, CheckCircle2, Star, ChevronLeft } from 'lucide-react';
import { BUS_ROUTES } from '../constants';
import SeatSelector from '../components/SeatSelector';

import ReviewSystem from '../components/ReviewSystem';

const Buses: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState({ from: 'Pune', to: 'Mumbai', date: new Date().toISOString().split('T')[0] });
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [filters, setFilters] = useState({ type: 'All', time: 'All' });
  const [showOfferClaimed, setShowOfferClaimed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours;
  };

  const filteredBuses = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    return BUS_ROUTES.filter(bus => {
      const matchesFrom = bus.from.toLowerCase().includes(searchQuery.from.toLowerCase());
      const matchesTo = bus.to.toLowerCase().includes(searchQuery.to.toLowerCase());
      const matchesType = filters.type === 'All' || bus.type.includes(filters.type);
      
      const departureHour = parseTime(bus.departure);
      
      // Filter out past departures if selected date is today
      if (searchQuery.date === todayStr) {
        const [time, period] = bus.departure.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let h = hours;
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        
        if (h < currentHour || (h === currentHour && minutes < currentMinute + 30)) {
          return false;
        }
      }

      const matchesTime = filters.time === 'All' || (
        filters.time === 'Morning' ? (departureHour >= 5 && departureHour < 12) :
        filters.time === 'Afternoon' ? (departureHour >= 12 && departureHour < 17) :
        filters.time === 'Evening' ? (departureHour >= 17) : true
      );
      return matchesFrom && matchesTo && matchesType && matchesTime;
    });
  }, [filters, searchQuery.from, searchQuery.to, searchQuery.date]);

  const handleUpdateSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 800);
  };

  const handleSeatClick = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat));
    } else {
      if (selectedSeats.length < 6) {
        setSelectedSeats(prev => [...prev, seat]);
      }
    }
  };

  const handleBook = () => {
    if (selectedSeats.length === 0) return;
    navigate('/booking', { 
      state: { 
        item: {
          ...selectedBus,
          title: `${selectedBus.operator} - ${selectedBus.type}`,
          poster: selectedBus.image || selectedBus.operatorLogo,
          price: selectedSeats.length * (selectedBus.price || selectedBus.fare),
          seats: selectedSeats,
          from: searchQuery.from,
          to: searchQuery.to,
          date: searchQuery.date,
          venue: `${searchQuery.from} → ${searchQuery.to}`,
          show_time: selectedBus.departure,
          from_city: searchQuery.from,
          to_city: searchQuery.to,
          travel_date: searchQuery.date
        }, 
        type: 'bus' 
      } 
    });
  };

  const claimOffer = (code: string) => {
    sessionStorage.setItem('skybound_claimed_coupon', JSON.stringify({ code, timestamp: Date.now() }));
    setShowOfferClaimed(true);
    setTimeout(() => setShowOfferClaimed(false), 3000);
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="group mb-12 flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-600 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
        </button>

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              Luxury<br />
              <span className="text-indigo-600">Buses</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Premium intercity travel with SykBound Prime
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Bus Type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600"
              >
                <option value="All">All Types</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Seater">Seater</option>
                <option value="AC">AC</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Departure</label>
              <select 
                value={filters.time}
                onChange={(e) => setFilters({...filters, time: e.target.value})}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600"
              >
                <option value="All">Any Time</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 mb-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">From</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
              <input 
                type="text" 
                value={searchQuery.from}
                onChange={(e) => setSearchQuery({...searchQuery, from: e.target.value})}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">To</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
              <input 
                type="text" 
                value={searchQuery.to}
                onChange={(e) => setSearchQuery({...searchQuery, to: e.target.value})}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Date</label>
            <input 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              value={searchQuery.date}
              onChange={(e) => setSearchQuery({...searchQuery, date: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleUpdateSearch}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Update Search'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {filteredBuses.map((bus, idx) => (
            <motion.div 
              key={bus.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 transition-colors"></div>
              <div className="flex flex-wrap items-center justify-between gap-10">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">{bus.operator}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bus.type}</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <ShieldCheck className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">SykBound Safe</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white block font-display tracking-tight">{bus.departure}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                      {new Date(searchQuery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{bus.duration}</span>
                    <div className="w-24 h-[2px] bg-slate-100 dark:bg-slate-800 relative">
                      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
                      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-600"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white block font-display tracking-tight">{bus.arrival}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                      {new Date(searchQuery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <span className="text-3xl font-black text-indigo-600 tracking-tighter font-display">₹{bus.price || bus.fare}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-1">{bus.seatsAvailable || bus.seatsLeft} seats left</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedBus(bus);
                      setSelectedSeats([]);
                    }}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-lg"
                  >
                    Select Seats
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex gap-6">
                  {['Charging Point', 'Water Bottle', 'Blanket', 'Reading Light'].map(amenity => (
                    <div key={amenity} className="flex items-center gap-2 text-slate-400">
                      <Info className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{amenity}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => claimOffer('PRIMEBUS25')}
                  className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Claim Offer: PRIMEBUS25
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seat Selection Modal */}
      <AnimatePresence>
        {selectedBus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBus(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="flex flex-col md:flex-row h-full">
                <div className="flex-1 p-12 border-r border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-12">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Select Seats</h3>
                    <button onClick={() => setSelectedBus(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-12">
                    <div className="flex justify-center gap-8">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md border-2 border-slate-200 dark:border-slate-700"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-600"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booked</span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <SeatSelector 
                        type="bus" 
                        onSelect={handleSeatClick} 
                        selectedSeat={null} 
                        selectedSeats={selectedSeats}
                        item={selectedBus}
                      />
                    </div>

                    <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                      <ReviewSystem serviceId={selectedBus.id} serviceType="bus" />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/30 p-12 flex flex-col">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Booking Details</h4>
                  <div className="space-y-6 flex-1">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{selectedBus.operator}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedBus.type}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Seats</p>
                      <p className="text-lg font-black text-indigo-600 tracking-tight">
                        {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fare</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{selectedSeats.length * (selectedBus.price || selectedBus.fare)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleBook}
                    disabled={selectedSeats.length === 0}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOfferClaimed && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Offer Claimed Successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Buses;
