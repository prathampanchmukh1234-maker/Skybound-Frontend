import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calculator, ShieldCheck, ChevronRight, Info, Clock, CheckCircle2, AlertCircle, Percent, X, ArrowRight, Banknote, ChevronLeft } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';

const EMIPlans: React.FC = () => {
  const { user, loadingAuth } = useGlobal();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/login', { state: { from: '/emi' } });
    }
  }, [user, loadingAuth, navigate]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const calculateEMI = (p: number, n: number, r: number = 14) => {
    const monthlyRate = r / 12 / 100;
    const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    return Math.round(emi);
  };

  const emi = calculateEMI(amount, tenure);
  const totalPayable = emi * tenure;
  const interest = totalPayable - amount;

  const handleApply = () => {
    if (!selectedBank || cardNumber.length < 16) return;
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
        setCardNumber('');
        setSelectedBank('');
      }, 3000);
    }, 2000);
  };

  const banks = ['HDFC BANK', 'ICICI Bank', 'SBI Card', 'AXIS BANK', 'KOTAK', 'HSBC'];

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
                <Percent className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">SykBound Finance</span>
              </div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Travel Now. Pay Later.</h1>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-lg">Flexible EMI plans starting from 0% interest on select credit cards and SykBound Pay.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Booking Amount</h4>
                  <span className="text-2xl font-black text-indigo-600 tracking-tighter">₹{amount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="5000" max="500000" step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tenure (Months)</h4>
                <div className="flex gap-3">
                  {[3, 6, 9, 12, 18, 24].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTenure(t)}
                      className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${tenure === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-indigo-600'}`}
                    >
                      {t}M
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-slate-900 dark:bg-indigo-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative z-10">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">EMI Estimate</h3>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Calculated at 14% p.a.</p>
                </div>
              </div>

              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Monthly EMI</span>
                  <span className="text-6xl font-black text-white tracking-tighter">₹{emi.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                  <div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Total Interest</span>
                    <span className="text-xl font-black text-white tracking-tight">₹{interest.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Total Payable</span>
                    <span className="text-xl font-black text-white tracking-tight">₹{totalPayable.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(true)}
                className="w-full bg-white text-indigo-600 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-2xl shadow-black/20"
              >
                Apply for SykBound Pay
              </button>
            </div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 -right-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">No Cost EMI</h5>
                <p className="text-[10px] font-bold text-slate-400">On Select Banks</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Partners Row */}
        <div className="mt-40">
          <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Our Banking Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {banks.map(bank => (
              <span key={bank} className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{bank}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-12">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Apply for EMI</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {showSuccess ? (
                  <div className="text-center py-12 space-y-6">
                    <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Application Approved!</h4>
                    <p className="text-slate-500 font-bold">Your EMI plan has been activated. You can now use SykBound Pay for your bookings.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Your Bank</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {banks.map(bank => (
                          <button 
                            key={bank}
                            onClick={() => setSelectedBank(bank)}
                            className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedBank === bank ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-indigo-600'}`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Credit Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                        <input 
                          type="text" 
                          maxLength={16}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all" 
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-4">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Your card details are encrypted and processed securely. We do not store your CVV.</p>
                    </div>

                    <button 
                      onClick={handleApply}
                      disabled={!selectedBank || cardNumber.length < 16 || isApplying}
                      className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApplying ? 'Processing...' : 'Verify & Apply'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EMIPlans;
