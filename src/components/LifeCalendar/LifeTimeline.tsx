import React, { useState } from 'react';
import { LifeTrip } from '../../types';
import { Plus, Trash2, Plane, CalendarDays } from 'lucide-react';

interface Props {
  trips: LifeTrip[];
  onAdd: (data: Partial<LifeTrip>) => void;
  onDelete: (id: string) => void;
  onBook: (trip: LifeTrip) => void;
}

const LifeTimeline: React.FC<Props> = ({ trips, onAdd, onDelete, onBook }) => {
  const [destination, setDestination] = useState('');
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [status, setStatus] = useState<'planned' | 'booked'>('planned');

  const handleAdd = () => {
    if (!destination.trim()) return;
    onAdd({ destination, year, status });
    setDestination('');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Set([...trips.map(t => t.year), ...Array.from({ length: 10 }, (_, i) => currentYear + i)])).sort();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Add Trip to Timeline</p>
        <div className="flex gap-3 flex-wrap">
          <input
            value={destination}
            onChange={e => setDestination(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Destination (e.g. Tokyo)"
            className="flex-1 min-w-[160px] bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            min={currentYear}
            max={currentYear + 30}
            className="w-24 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="planned">Planned</option>
            <option value="booked">Booked</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-bold">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Your life timeline is empty. Add your first trip!</p>
        </div>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
          {trips.map((trip, index) => (
            <div key={trip.id} className="relative mb-8">
              <div className="absolute -left-5 w-4 h-4 rounded-full border-2 border-indigo-600 bg-white dark:bg-slate-950 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 ml-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{trip.year}</span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{trip.destination}</h4>
                    <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${trip.status === 'booked' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {trip.status === 'planned' && (
                      <button
                        onClick={() => onBook(trip)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                      >
                        <Plane className="w-3 h-3" /> Book
                      </button>
                    )}
                    <button onClick={() => onDelete(trip.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LifeTimeline;
