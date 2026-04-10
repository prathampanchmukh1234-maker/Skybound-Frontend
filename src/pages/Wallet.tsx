import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, History, CreditCard, Sparkles, ChevronRight, ShieldCheck, Zap, X, AlertCircle, ChevronLeft } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const Wallet: React.FC = () => {
  const { user, loadingAuth, updateWalletBalance, convertPrice } = useGlobal();
  const walletBalance = user?.walletBalance || 0;
  const navigate = useNavigate();
  const [skyPoints, setSkyPoints] = useState(4500);
  const [activeModal, setActiveModal] = useState<'add' | 'withdraw' | 'convert' | null>(null);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/login', { state: { from: '/wallet' } });
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedTxs = data.map(tx => ({
            id: tx.id,
            type: tx.type,
            title: tx.reason,
            amount: tx.amount,
            date: new Date(tx.created_at).toISOString().split('T')[0],
            status: 'Completed'
          }));
          setTransactions(mappedTxs);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleAction = async () => {
    const numAmount = Number(amount);
    if (activeModal === 'add') {
      await updateWalletBalance(numAmount);
      await addTransaction('credit', 'Added to Wallet', numAmount);
    }
    if (activeModal === 'withdraw') {
      if (numAmount > walletBalance) return;
      await updateWalletBalance(-numAmount);
      await addTransaction('debit', 'Withdrawal to Bank', numAmount);
    }
    if (activeModal === 'convert') {
      const convertedAmount = skyPoints * 0.1;
      await updateWalletBalance(convertedAmount);
      await addTransaction('credit', 'SkyPoints Conversion', convertedAmount);
      setSkyPoints(0);
    }
    setActiveModal(null);
    setAmount('');
  };

  const addTransaction = async (type: 'credit' | 'debit', title: string, amount: number) => {
    if (!user) return;
    
    try {
      // Insert into Supabase
      const { data, error } = await supabase.from('wallet_transactions').insert([{
        user_id: user.id,
        type,
        amount,
        reason: title
      }]).select();

      if (error) throw error;

      const newTx = {
        id: data?.[0]?.id || Date.now(),
        type,
        title,
        amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed'
      };
      setTransactions(prev => [newTx, ...prev]);
    } catch (err) {
      console.error("Failed to log transaction:", err);
    }
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

        <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter capitalize">
                  {activeModal === 'add' ? 'Add Money' : activeModal === 'withdraw' ? 'Withdraw Funds' : 'Convert SkyPoints'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              {activeModal !== 'convert' ? (
                <div className="space-y-6 mb-10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-4">Enter Amount</label>
                  <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-14 pr-8 py-6 font-black text-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {activeModal === 'withdraw' && Number(amount) > walletBalance && (
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest ml-4">
                      <AlertCircle className="w-3 h-3" /> Insufficient Balance
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                  You are about to convert <span className="text-indigo-600">{skyPoints.toLocaleString()} SkyPoints</span> into <span className="text-indigo-600">₹{(skyPoints * 0.1).toLocaleString()} Wallet Cash</span>.
                </p>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAction}
                  disabled={activeModal !== 'convert' && (!amount || (activeModal === 'withdraw' && Number(amount) > walletBalance))}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <div className="mb-12">
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">SykBound Wallet</h1>
          <p className="text-slate-500 font-bold">Manage your funds, SkyPoints, and transaction history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-600 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <WalletIcon className="w-full h-full text-white rotate-12 translate-x-1/4 -translate-y-1/4" />
              </div>
              <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <WalletIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">SykBound Balance</span>
                    <span className="text-4xl font-black text-white tracking-tighter">₹{walletBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveModal('add')}
                    className="flex-1 bg-white text-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Money
                  </button>
                  <button 
                    onClick={() => setActiveModal('withdraw')}
                    className="flex-1 bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </motion.div>

            {/* SkyPoints Card */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-colors"></div>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-700 dark:text-white fill-current" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{skyPoints.toLocaleString()}</h4>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">SkyPoints Balance</p>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-500 mb-8 leading-relaxed">Convert your SkyPoints to wallet balance or use them for instant discounts on bookings.</p>
              <button 
                onClick={() => setActiveModal('convert')}
                disabled={skyPoints === 0}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Convert to Cash
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Recent Transactions</h3>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{tx.title}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.date}</span>
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{tx.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black tracking-tighter ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Wallet Transaction</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                  <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Row */}
        <div className="mt-40 bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-16">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            <div>
              <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Bank-Grade Security</h5>
              <p className="text-[10px] font-bold text-slate-400">256-bit SSL Encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-indigo-600" />
            <div>
              <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Instant Settlements</h5>
              <p className="text-[10px] font-bold text-slate-400">Real-time processing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CreditCard className="w-8 h-8 text-indigo-600" />
            <div>
              <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">PCI-DSS Compliant</h5>
              <p className="text-[10px] font-bold text-slate-400">Secure card storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
