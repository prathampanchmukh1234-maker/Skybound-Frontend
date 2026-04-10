import React, { useState, useEffect } from 'react';
import { TravelProfile } from '../../types';

interface Props {
  initialData: TravelProfile | null;
  onSave: (data: Partial<TravelProfile>) => void;
}

const LifeProfileForm: React.FC<Props> = ({ initialData, onSave }) => {
  const [age, setAge] = useState(initialData?.age?.toString() || '');
  const [style, setStyle] = useState<'budget' | 'luxury' | 'adventure'>(initialData?.travel_style || 'budget');
  const [budget, setBudget] = useState(initialData?.yearly_budget?.toString() || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAge(initialData.age?.toString() || '');
      setStyle(initialData.travel_style || 'budget');
      setBudget(initialData.yearly_budget?.toString() || '');
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({ age: Number(age), travel_style: style, yearly_budget: Number(budget) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8">
      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">Your Travel Profile</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Age</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="Your age"
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Travel Style</label>
          <div className="grid grid-cols-3 gap-2">
            {(['budget', 'luxury', 'adventure'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${style === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Yearly Travel Budget (₹)</label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="e.g. 150000"
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${saved ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          {saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default LifeProfileForm;
