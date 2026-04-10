import React, { useState } from 'react';
import { DreamDestination } from '../../types';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  destinations: DreamDestination[];
  onAdd: (data: Partial<DreamDestination>) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const BucketList: React.FC<Props> = ({ destinations, onAdd, onToggle, onDelete }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'nature' | 'city' | 'adventure' | 'culture'>('nature');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name, category, priority, is_completed: false });
    setName('');
  };

  const priorityColor: Record<string, string> = {
    high: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    low: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Add Destination</p>
        <div className="flex gap-3 flex-wrap">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Santorini, Iceland..."
            className="flex-1 min-w-[160px] bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            {['nature', 'city', 'adventure', 'culture'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {destinations.length === 0 && (
          <p className="text-center text-slate-400 font-bold py-8">No destinations yet. Start adding your dream spots!</p>
        )}
        {destinations.map(dest => (
          <div key={dest.id} className={`flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-all ${dest.is_completed ? 'opacity-60' : ''}`}>
            <button onClick={() => onToggle(dest.id, !dest.is_completed)} className="flex-shrink-0 text-indigo-600">
              {dest.is_completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6" />}
            </button>
            <div className="flex-1">
              <p className={`font-black text-slate-900 dark:text-white ${dest.is_completed ? 'line-through text-slate-400' : ''}`}>{dest.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dest.category}</p>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${priorityColor[dest.priority]}`}>{dest.priority}</span>
            <button onClick={() => onDelete(dest.id)} className="text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BucketList;
