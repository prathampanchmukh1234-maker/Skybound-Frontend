
import React, { useState } from 'react';

interface SeatSelectorProps {
  type: 'bus' | 'train' | 'flight' | 'movie';
  onSelect: (seat: string) => void;
  selectedSeat: string | null;
  selectedSeats?: string[]; // For multi-select like movies
  maxSelectableSeats?: number;
  bookedSeats?: string[]; // For real-time availability
  showtime?: any; // For movies
  item?: any; // For bus/train/etc.
  convertPrice?: (price: number) => string;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ type, onSelect, selectedSeat, selectedSeats = [], maxSelectableSeats = 1, bookedSeats = [], showtime, item, convertPrice }) => {
  const [activeCoach, setActiveCoach] = useState('H1');

  const data = item || showtime;

  const getMovieSeatCategory = (row: string) => {
    // Back rows (A, B) = Recliner (most expensive, furthest from screen)
    // Middle rows (C-F) = Prime
    // Front rows (G-J) = Classic (cheapest, closest to screen)
    if (['J', 'I'].includes(row)) return { name: 'Royal Recliner', price: 850, color: 'text-amber-500', bg: 'bg-amber-500' };
    if (['H', 'G', 'F', 'E'].includes(row)) return { name: 'Club Prime', price: 450, color: 'text-indigo-500', bg: 'bg-indigo-500' };
    return { name: 'Classic', price: 220, color: 'text-slate-500', bg: 'bg-slate-500' };
  };

  const renderMovieLayout = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = Array.from({ length: 14 }, (_, i) => i + 1);

    const categories = [
      { name: 'Classic',       price: 220,  rows: ['A', 'B', 'C', 'D'] },  // front rows closest to screen
      { name: 'Club Prime',    price: 450,  rows: ['E', 'F', 'G', 'H'] },  // middle
      { name: 'Royal Recliner', price: 850, rows: ['I', 'J'] },             // back rows, most expensive
    ];

    return (
      <div className="flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-10">
          <div className="w-3/4 h-8 bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700 dark:to-transparent rounded-t-full flex items-center justify-center">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.5em]">SCREEN</span>
          </div>
          <div className="w-3/4 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)]"></div>
        </div>

        <div className="flex flex-col gap-12 items-center overflow-x-auto pb-8 no-scrollbar w-full">
          {categories.map(cat => (
            <div key={cat.name} className="w-full space-y-6">
              <div className="flex items-center gap-4 px-6">
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.name}</span>
                  <span className="text-[12px] font-black text-indigo-600">{convertPrice ? convertPrice(cat.price) : `₹${cat.price}`}</span>
                </div>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
              </div>
              
              <div className="flex flex-col gap-4 items-center">
                {cat.rows.map(row => (
                  <div key={row} className="flex gap-4 items-center">
                    <span className="w-6 text-[10px] font-black text-slate-400">{row}</span>
                    <div className="flex gap-3">
                      {cols.map(col => {
                        const seatId = `${row}${col}`;
                        const isSelected = selectedSeats.includes(seatId) || selectedSeat === seatId;
                        const isBooked = bookedSeats.includes(seatId);
                        const category = getMovieSeatCategory(row);

                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => onSelect(seatId)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all relative group ${
                              isBooked 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                : isSelected
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-110 z-10'
                                  : `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${category.color} hover:border-indigo-500 hover:text-indigo-600`
                            }`}
                          >
                            <span className="text-[10px] font-black">{seatId}</span>
                            {!isBooked && !isSelected && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {convertPrice ? convertPrice(category.price) : `₹${category.price}`}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-[10px] font-black text-slate-400">{row}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Bus Layout: Dynamic based on totalSeats
  const renderBusLayout = () => {
    const totalSeats = item?.totalSeats || 40;
    const occupiedSeats = item?.occupiedSeats || [];
    const rows = Math.ceil(totalSeats / 4);
    const cols = ['A', 'B', 'C', 'D'];
    
    return (
      <div className="flex flex-col items-center">
        <div className="w-full max-w-sm bg-slate-100 dark:bg-slate-800 p-8 rounded-[2rem] border-4 border-slate-200 dark:border-slate-700 relative">
          <div className="absolute top-4 right-4 text-slate-400 flex flex-col items-center">
             <i className="fa-solid fa-dharmachakra animate-spin-slow text-xl"></i>
             <div className="text-[8px] font-black uppercase mt-1">Driver</div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-12">
            {Array.from({ length: rows }).map((_, r) => (
              <React.Fragment key={r}>
                {cols.map((c, ci) => {
                  const seatId = `${r + 1}${c}`;
                  const isGap = ci === 2; // Create a walk-way in the middle
                  const isOccupied = occupiedSeats.includes(seatId);
                  const isSelected = selectedSeat === seatId || selectedSeats.includes(seatId);
                  
                  // If we exceed totalSeats, don't render
                  if ((r * 4) + ci >= totalSeats) return isGap ? <div key={`gap-${r}-${ci}`} className="w-4"></div> : <div key={`empty-${r}-${ci}`}></div>;

                  return (
                    <React.Fragment key={seatId}>
                      {isGap && <div className="w-4"></div>}
                      <button
                        disabled={isOccupied}
                        onClick={() => onSelect(seatId)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                          isOccupied
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            : isSelected
                              ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/40' 
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600'
                        }`}
                      >
                        {seatId}
                      </button>
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Train Layout: 1 Coach has multiple 8-berth compartments
  const renderTrainLayout = () => {
    const coaches = ['H1', 'A1', 'A2', 'B1', 'B2', 'S1'];
    const berths = ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'];
    
    return (
      <div className="space-y-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {coaches.map(c => (
            <button 
              key={c}
              onClick={() => setActiveCoach(c)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCoach === c ? 'azure-btn' : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              Coach {c}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, compIdx) => (
            <div key={compIdx} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
               <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Compartment {compIdx + 1}</div>
               <div className="grid grid-cols-4 gap-4">
                  {/* Left Side: 6 berths (3x2) */}
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                     {berths.slice(0, 6).map((b, i) => {
                       const seatId = `${activeCoach}-${(compIdx * 8) + i + 1} ${b}`;
                       return (
                         <button
                           key={seatId}
                           onClick={() => onSelect(seatId)}
                           className={`h-12 rounded-xl flex items-center justify-between px-4 text-[9px] font-black transition-all ${
                             selectedSeat === seatId 
                             ? 'azure-btn scale-105 shadow-md' 
                             : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                           }`}
                         >
                           <span>{i + 1}</span>
                           <span className="opacity-60">{b}</span>
                         </button>
                       );
                     })}
                  </div>
                  {/* Right Side: Side Berths */}
                  <div className="col-span-1 flex flex-col gap-4">
                    {berths.slice(6, 8).map((b, i) => {
                       const seatId = `${activeCoach}-${(compIdx * 8) + i + 7} ${b}`;
                       return (
                         <button
                           key={seatId}
                           onClick={() => onSelect(seatId)}
                           className={`h-20 rounded-xl flex flex-col items-center justify-center gap-1 text-[9px] font-black transition-all ${
                             selectedSeat === seatId 
                             ? 'azure-btn scale-105 shadow-md' 
                             : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                           }`}
                         >
                           <span className="opacity-60">{b}</span>
                           <span>{i + 7}</span>
                         </button>
                       );
                     })}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFlightLayout = () => {
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const bookedFlightSeats = item?.occupiedSeats || [];
    const cabinSections = [
      { label: 'Business', rows: Array.from({ length: 4 }, (_, index) => index + 1), price: 4200, accent: 'text-amber-500' },
      { label: 'Premium', rows: Array.from({ length: 6 }, (_, index) => index + 5), price: 2200, accent: 'text-indigo-500' },
      { label: 'Economy', rows: Array.from({ length: 18 }, (_, index) => index + 11), price: 0, accent: 'text-slate-500' }
    ];

    return (
      <div className="flex flex-col items-center gap-8">
        <div className="w-full max-w-3xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 p-5 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aircraft Layout</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">3-3 Narrow Body Cabin</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Capacity</p>
              <p className="text-sm font-black text-indigo-600">{cabinSections.reduce((total, section) => total + section.rows.length * 6, 0)} Seats</p>
            </div>
          </div>

          <div className="mb-6 rounded-[2rem] bg-slate-900 text-white py-4 text-center shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] opacity-70">Cockpit</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em]">Front of Aircraft</p>
          </div>

          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-1">
            {cabinSections.map((section) => (
              <div key={section.label} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${section.accent}`}>{section.label}</p>
                    <p className="text-[10px] font-bold text-slate-400">
                      {section.price > 0 ? (convertPrice ? convertPrice(section.price) : `₹${section.price}`) : 'Included Fare'}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-[32px_repeat(3,minmax(0,1fr))_24px_repeat(3,minmax(0,1fr))_32px] gap-2 px-1">
                    <div></div>
                    {seatLetters.slice(0, 3).map((letter) => (
                      <div key={`${section.label}-left-${letter}`} className="text-center text-[10px] font-black text-slate-400">{letter}</div>
                    ))}
                    <div className="text-center text-[9px] font-black text-slate-300">|</div>
                    {seatLetters.slice(3).map((letter) => (
                      <div key={`${section.label}-right-${letter}`} className="text-center text-[10px] font-black text-slate-400">{letter}</div>
                    ))}
                    <div></div>
                  </div>

                  {section.rows.map((rowNumber) => (
                    <div key={`${section.label}-${rowNumber}`} className="grid grid-cols-[32px_repeat(3,minmax(0,1fr))_24px_repeat(3,minmax(0,1fr))_32px] gap-2 items-center">
                      <div className="text-center text-[10px] font-black text-slate-400">{rowNumber}</div>
                      {seatLetters.map((letter, index) => {
                        const seatId = `${rowNumber}${letter}`;
                        const isBooked = bookedFlightSeats.includes(seatId) || bookedSeats.includes(seatId);
                        const isSelected = selectedSeat === seatId || selectedSeats.includes(seatId);
                        const isWindow = letter === 'A' || letter === 'F';
                        const isAisle = letter === 'C' || letter === 'D';
                        const seatTone = section.label === 'Business'
                          ? 'border-amber-200 text-amber-600'
                          : section.label === 'Premium'
                            ? 'border-indigo-200 text-indigo-600'
                            : 'border-slate-200 text-slate-600';

                        return (
                          <React.Fragment key={seatId}>
                            {index === 3 && <div className="text-center text-[9px] font-black text-slate-300">|</div>}
                            <button
                              disabled={isBooked}
                              onClick={() => onSelect(seatId)}
                              className={`h-11 rounded-xl border text-[10px] font-black transition-all ${
                                isBooked
                                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white scale-105 shadow-lg shadow-indigo-600/30'
                                    : `bg-white dark:bg-slate-900 ${seatTone} hover:border-indigo-500 hover:text-indigo-600`
                              }`}
                              title={`${seatId}${isWindow ? ' Window' : isAisle ? ' Aisle' : ' Middle'}`}
                            >
                              <span className="block leading-none">{seatId}</span>
                              <span className="block mt-1 text-[8px] opacity-60">
                                {isWindow ? 'W' : isAisle ? 'A' : 'M'}
                              </span>
                            </button>
                          </React.Fragment>
                        );
                      })}
                      <div className="text-center text-[10px] font-black text-slate-400">{rowNumber}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white border border-slate-300 inline-block"></span>
            Available
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
            Selected
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200 inline-block"></span>
            Occupied
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            Business
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter capitalize">
          Select Your {type === 'train' ? 'Berth' : 'Seat'}
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
          SkyBound Premium {type} Experience
        </p>
        <p className="text-[10px] font-bold text-indigo-600 mt-3">
          Select up to {maxSelectableSeats} {type === 'train' ? 'berth' : 'seat'}{maxSelectableSeats > 1 ? 's' : ''}
        </p>
      </div>

      {type === 'bus' && renderBusLayout()}
      {type === 'train' && renderTrainLayout()}
      {type === 'movie' && renderMovieLayout()}
      {type === 'flight' && renderFlightLayout()}
    </div>
  );
};

export default SeatSelector;
