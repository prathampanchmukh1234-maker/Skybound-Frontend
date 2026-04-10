import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, MapPin, Calendar, Star, ChevronRight, Info, Clock, Heart, Zap, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import { INSURANCE_PLANS } from '../constants';

const Insurance: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCalculate = () => {
    if (!destination || !duration) return;
    setIsCalculating(true);
    setTimeout(() => {
      const base = 499;
      const days = parseInt(duration) || 1;
      setCalculatedPremium(base + (days * 50));
      setIsCalculating(false);
    }, 1500);
  };

  const handleBuy = (planName: string, price: number) => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">SykBound Care</span>
              </div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Travel with Peace of Mind.</h1>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-lg">Comprehensive coverage for medical emergencies, trip cancellations, and lost baggage.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  <input 
                    type="text" 
                    placeholder="Worldwide" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Duration (Days)</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  <input 
                    type="number" 
                    placeholder="15" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                  />
                </div>
              </div>
              <button 
                onClick={handleCalculate}
                disabled={isCalculating || !destination || !duration}
                className="md:col-span-2 bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Premium'}
              </button>

              {calculatedPremium && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Estimated Premium</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">₹{calculatedPremium}</span>
                  </div>
                  <button onClick={() => handleBuy('Custom Plan', calculatedPremium)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Get Covered</button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">SykBound Elite Care</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Our Most Popular Plan</p>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {[
                  'Medical Coverage up to $500,000',
                  'Trip Cancellation up to $5,000',
                  'Lost Baggage up to $2,500',
                  '24/7 Global Assistance',
                  'COVID-19 Coverage Included'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹1,499</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Premium</span>
                </div>
                <button onClick={() => handleBuy('Elite Care', 1499)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                  Buy Now
                </button>
              </div>
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -z-0"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -z-0"></div>
          </div>
        </div>

        {/* Insurance Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {INSURANCE_PLANS.map((plan) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group"
            >
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{plan.name}</h3>
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              
              <div className="space-y-4 mb-10">
                {plan.covers.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black text-indigo-600 tracking-tighter">₹{plan.price}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Premium</span>
                </div>
                <button onClick={() => handleBuy(plan.name, plan.price)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95">
                  Select
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] text-center max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Policy Issued!</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Your travel insurance policy has been generated and sent to your email.</p>
              <button onClick={() => setShowSuccess(false)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest">Great, Thanks!</button>
            </div>
          </motion.div>
        )}

        {/* Claim Process Section */}
        <div className="mt-40">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-16 text-center">Hassle-free Claims</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Inform Us', desc: 'Call our 24/7 helpline or use the SykBound app.' },
              { step: '02', title: 'Submit Info', desc: 'Upload necessary documents digitally.' },
              { step: '03', title: 'Verification', desc: 'Our experts review your claim instantly.' },
              { step: '04', title: 'Settlement', desc: 'Direct transfer to your bank or SykBound Wallet.' }
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                <div className="text-6xl font-black text-slate-50 dark:text-slate-800 absolute -top-4 -right-4 group-hover:text-indigo-600/10 transition-colors">{s.step}</div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-4 relative z-10">{s.title}</h4>
                <p className="text-sm font-bold text-slate-500 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
