import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, MapPin, Calendar, Star, ChevronRight, Info, Clock, Heart, Zap, CheckCircle2, AlertCircle, TrendingDown, TrendingUp, Minus, X, Trash2, ChevronLeft, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { supabase } from '../services/supabase';

const FareAlerts: React.FC = () => {
  const { user, loadingAuth } = useGlobal();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/login', { state: { from: '/fare-alerts' } });
    }
  }, [user, loadingAuth, navigate]);

  const fetchAlerts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setAlerts(data);
    if (error) console.error('Error fetching alerts:', error);
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !targetPrice || !user) return;

    setLoading(true);
    const newAlert = {
      user_id: user.id,
      from_city: from,
      to_city: to,
      current_price: Math.floor(Number(targetPrice) * 1.2), // Mock current price
      target_price: Number(targetPrice),
      status: 'Active',
      trend: Math.random() > 0.5 ? 'down' : 'up',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('price_alerts').insert([newAlert]);

    if (error) {
      console.error('Error setting alert:', error);
    } else {
      await fetchAlerts();
      setFrom('');
      setTo('');
      setTargetPrice('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setLoading(false);
  };

  const removeAlert = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('price_alerts').delete().eq('id', id);
    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    } else {
      console.error('Error removing alert:', error);
    }
  };

  const priceData = [
    { date: 'Mar 10', price: 15000 },
    { date: 'Mar 12', price: 14200 },
    { date: 'Mar 14', price: 14800 },
    { date: 'Mar 16', price: 13500 },
    { date: 'Mar 18', price: 12800 },
    { date: 'Mar 20', price: 12500 },
    { date: 'Mar 22', price: 12500 }
  ];

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-24">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Price Monitoring</span>
              </div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Smart Fare Alerts.</h1>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-lg">Never miss a price drop. Set custom alerts and get notified via WhatsApp and Email instantly.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    exit={{ y: -100 }}
                    className="absolute inset-x-0 top-0 bg-green-500 text-white py-4 text-center font-black text-[10px] uppercase tracking-widest z-20"
                  >
                    Alert Set Successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSetAlert} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                      <input 
                        type="text" 
                        placeholder="Pune" 
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                      <input 
                        type="text" 
                        placeholder="Dubai" 
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="10000" 
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!from || !to || !targetPrice || loading}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} Set Price Alert
                </button>
              </form>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Price Trends: Pune to Dubai</h3>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Down 12%</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lowest</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">₹12,200</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Average</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">₹14,500</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Highest</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">₹18,900</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="space-y-8">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Your Price Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <motion.div 
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{alert.from_city} → {alert.to_city}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">One Way • Economy</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.status === 'Triggered' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      <Bell className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Price</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">₹{alert.current_price?.toLocaleString()}</span>
                        {alert.trend === 'down' ? <TrendingDown className="w-4 h-4 text-green-600" /> : <TrendingUp className="w-4 h-4 text-red-600" />}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Price</span>
                      <span className="text-2xl font-black text-indigo-600 tracking-tighter">₹{alert.target_price?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${alert.status === 'Triggered' ? 'text-green-600' : 'text-indigo-600'}`}>{alert.status}</span>
                    <button 
                      onClick={() => removeAlert(alert.id)}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" /> Remove Alert
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No active alerts</h3>
                <p className="text-slate-500 font-bold">Set your first price alert to start monitoring fares</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareAlerts;
