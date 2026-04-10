
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useGlobal } from '../context/GlobalContext';
import { saveTripPlan } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, Wallet, Save, CheckCircle2, Loader2, ChevronRight, Lightbulb, Plane, ShieldCheck, ChevronLeft } from 'lucide-react';

const AITripPlanner: React.FC = () => {
  const { theme, user, convertPrice } = useGlobal();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('Pune');
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('Economy');
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Function to generate a trip itinerary using Gemini API
  const generateTrip = async () => {
    if (!destination) return;
    setLoading(true);
    setSaved(false);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Generate a detailed day-wise travel itinerary for ${days} days from ${origin} to ${destination}. 
      Budget level: ${budget}. 
      Return the response in JSON format: { 
        "title": string, 
        "days": [ { "day": number, "activities": [ { "time": string, "desc": string, "cost": string } ] } ], 
        "tips": [string],
        "policies": { "cancellation": string, "booking": string, "safety": string },
        "transportDetails": string
      }`;
      
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-pro-preview-03-25',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      setItinerary(JSON.parse(res.text));
    } catch (e) {
      console.error("AI Error:", e);
    } finally { setLoading(false); }
  };

  const handleSaveToVault = async () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (!itinerary) return;

    setSaving(true);
    try {
      await saveTripPlan({
        userId: user.id,
        title: itinerary.title,
        destination: destination,
        budget: budget === 'Luxury' ? 50000 : budget === 'Economy' ? 20000 : 10000,
        items: itinerary.days.flatMap((d: any) => d.activities.map((a: any) => ({
          type: 'activity',
          day: d.day,
          ...a
        })))
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Save Error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-24 px-6 max-w-5xl mx-auto dark:bg-gray-950 transition-colors duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="flex items-center justify-center gap-2 text-slate-700 dark:text-white mb-4">
          <Sparkles className="w-5 h-5 fill-current" />
          <span className="text-[12px] font-black uppercase tracking-[0.6em] block">Engineered by Gemini</span>
        </div>
        <h1 className="text-7xl font-black mb-6 tracking-tighter text-slate-900 dark:text-white leading-none">AI Trip Architect</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-xl leading-relaxed max-w-2xl mx-auto">Input your vision. Let our neural networks build your perfect global journey in seconds.</p>
      </motion.div>

      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl rounded-[5rem] -z-10"></div>
        <div className="glass p-12 rounded-[4rem] shadow-2xl mb-16 dark:shadow-none border border-white/20 dark:border-slate-800 backdrop-blur-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 flex items-center gap-2 ml-2">
                <MapPin className="w-3 h-3 text-indigo-500" /> Origin
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] px-8 py-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg" 
                  placeholder="e.g. Pune" 
                  value={origin} 
                  onChange={e => setOrigin(e.target.value)} 
                />
                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 flex items-center gap-2 ml-2">
                <MapPin className="w-3 h-3 text-indigo-500" /> Destination
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] px-8 py-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-lg" 
                  placeholder="e.g. Kyoto, Japan" 
                  value={destination} 
                  onChange={e => setDestination(e.target.value)} 
                />
                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 flex items-center gap-2 ml-2">
                <Calendar className="w-3 h-3 text-indigo-500" /> Duration
              </label>
              <div className="relative group">
                <input 
                  type="number" 
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] px-8 py-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-lg" 
                  value={days} 
                  onChange={e => setDays(Number(e.target.value))} 
                />
                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 flex items-center gap-2 ml-2">
                <Wallet className="w-3 h-3 text-indigo-500" /> Budget
              </label>
              <div className="relative group">
                <select 
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] px-8 py-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-lg appearance-none cursor-pointer" 
                  value={budget} 
                  onChange={e => setBudget(e.target.value)}
                >
                  <option>Backpacker</option>
                  <option>Economy</option>
                  <option>Luxury</option>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-5 h-5 text-slate-400 rotate-90" />
                </div>
                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
          <button 
            onClick={generateTrip} 
            disabled={loading} 
            className="w-full mt-12 py-8 rounded-[3rem] font-black uppercase tracking-[0.5em] text-sm bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center gap-4">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> ARCHITECTING...
                </>
              ) : (
                <>
                  GENERATE MY ITINERARY <ChevronRight className="w-5 h-5" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {itinerary && (
        <div className="space-y-16 animate-fade-up pb-24">
          <div className="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20 border-b dark:border-slate-800 pb-12">
              <div className="max-w-2xl">
                <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-[0.9]">{itinerary.title}</h2>
                <p className="text-xl font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{itinerary.description}</p>
              </div>
              <div className="flex flex-col items-end gap-6 w-full md:w-auto">
                <div className="px-10 py-6 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-600/20 w-full md:w-auto text-center md:text-right">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] block opacity-70 mb-1">Estimated Total</span>
                  <span className="text-4xl font-black tracking-tighter">{convertPrice(itinerary.totalEstimatedCost)}</span>
                </div>
                <button 
                  onClick={handleSaveToVault}
                  disabled={saving}
                  className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 ${
                    saved 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                      : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saved ? 'Saved to Vault' : 'Save to Vault'}
                </button>
              </div>
            </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            <div className="lg:col-span-2 space-y-20">
              {itinerary.days.map((d: any, idx: number) => (
                <motion.div 
                  key={d.day} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-12 border-l-2 border-slate-100 dark:border-slate-800"
                >
                  <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 shadow-lg"></div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-12 tracking-tight">Day {d.day}: {d.theme}</h3>
                  <div className="space-y-10">
                    {d.activities.map((a: any, i: number) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-600/30 transition-all group relative">
                        <div className="flex justify-between items-start mb-6">
                          <span className="px-5 py-2 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">{a.time}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{convertPrice(a.cost)}</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">{a.desc}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{a.description || a.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="font-black text-white mb-8 uppercase tracking-[0.4em] text-xs flex items-center gap-3">
                  <Lightbulb className="w-4 h-4" /> AI Smart Travel Insights
                </h4>
                <div className="space-y-6">
                  {itinerary.tips.map((t: string, i: number) => (
                    <div key={i} className="flex gap-4 items-start text-indigo-50">
                      <CheckCircle2 className="w-4 h-4 text-white mt-1 shrink-0" />
                      <p className="font-bold text-sm tracking-tight leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {itinerary.transportDetails && (
                <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex items-center gap-4 mb-10 shrink-0">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                      <Plane className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">Transport Logistics</h3>
                  </div>
                  <div className="space-y-8 overflow-y-auto pr-4 custom-scrollbar flex-1">
                    {Array.isArray(itinerary.transportDetails) ? (
                      itinerary.transportDetails.map((item: any, i: number) => (
                        <div key={i} className="pb-8 border-b border-white/10 last:border-0 last:pb-0">
                          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">{item.type}</div>
                          <p className="text-lg font-bold leading-relaxed text-slate-300">{item.info}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-lg font-bold leading-relaxed text-slate-300">{itinerary.transportDetails}</p>
                    )}
                  </div>
                </div>
              )}

              {itinerary.policies && (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl min-h-[400px] flex flex-col">
                  <div className="flex items-center gap-4 mb-10 shrink-0">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Details & Policies</h3>
                  </div>
                  <div className="space-y-10 overflow-y-auto pr-4 custom-scrollbar flex-1">
                    {itinerary.policies.cancellation && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cancellation</h4>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{itinerary.policies.cancellation}</p>
                      </div>
                    )}
                    {itinerary.policies.booking && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Booking</h4>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{itinerary.policies.booking}</p>
                      </div>
                    )}
                    {itinerary.policies.safety && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Safety</h4>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{itinerary.policies.safety}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default AITripPlanner;
