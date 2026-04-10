
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, CreditCard, CheckCircle2, ChevronLeft, Sparkles, Zap, X, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { supabase } from '../services/supabase';

const GiftCardRedeem: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateWalletBalance, convertPrice } = useGlobal();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{amount: number, code: string} | null>(null);

  const handleRedeem = async () => {
    if (!code || !user) return;
    setLoading(true);
    setError('');

    try {
      // 1. Check if gift card exists and is active in Supabase
      const { data: card, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', code)
        .eq('status', 'active')
        .single();

      if (fetchError || !card) {
        setError('Invalid or already redeemed gift card code.');
        setLoading(false);
        return;
      }

      const amount = card.amount;

      // 2. Mark as redeemed in Supabase
      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({ 
          status: 'redeemed', 
          redeemed_at: new Date().toISOString(),
          redeemed_by: user.id 
        })
        .eq('id', card.id);

      if (updateError) throw updateError;

      // 3. Update wallet balance
      await updateWalletBalance(amount);
      
      setSuccess({ amount, code });
    } catch (err: any) {
      console.error('Redemption failed:', err);
      setError(err.message || 'Failed to redeem gift card.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
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

        <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
          
          <div className="p-12 md:p-20">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8">
                <Gift className="w-10 h-10" />
              </div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Redeem Gift Card</h1>
              <p className="text-slate-500 font-bold max-w-md">Enter your 12-digit gift card code to instantly add balance to your SykBound wallet.</p>
            </div>

            <div className="max-w-md mx-auto space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gift Card Code</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SKB-XXXX-XXXX-XXXX"
                    className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black text-xl tracking-widest text-indigo-600 outline-none border-2 border-transparent focus:border-indigo-600 transition-all text-center font-mono"
                  />
                  {loading && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <button 
                onClick={handleRedeem}
                disabled={loading || code.length < 12}
                className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/10 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
              >
                Redeem Now <ArrowRight className="w-5 h-5" />
              </button>

              <div className="pt-12 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Secure</h5>
                    <p className="text-[9px] font-bold text-slate-400">Encrypted processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Instant</h5>
                    <p className="text-[9px] font-bold text-slate-400">Immediate credit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
            >
              <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Redeemed!</h3>
                <p className="text-slate-500 font-bold mb-8">₹{success.amount.toLocaleString()} has been added to your SykBound wallet.</p>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl mb-10 border border-indigo-100 dark:border-indigo-800">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">New Wallet Balance</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{convertPrice(user?.wallet_balance || 0)}</span>
                </div>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GiftCardRedeem;
