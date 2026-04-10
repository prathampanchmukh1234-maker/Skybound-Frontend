import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gift, CreditCard, ShoppingBag, CheckCircle2, ChevronRight, Sparkles, Heart, Zap, X, Copy, Check, ChevronLeft, Loader2 } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { supabase } from '../services/supabase';

const GiftCards: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateWalletBalance } = useGlobal();
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [selectedDesign, setSelectedDesign] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(false);

  const amounts = [500, 1000, 2000, 5000, 10000];
  const designs = [
    { name: 'Classic Indigo', color: 'bg-indigo-600', icon: <Sparkles className="w-12 h-12 text-white/20" /> },
    { name: 'Sunset Rose', color: 'bg-rose-500', icon: <Heart className="w-12 h-12 text-white/20" /> },
    { name: 'Midnight Slate', color: 'bg-slate-900', icon: <Zap className="w-12 h-12 text-white/20" /> },
    { name: 'Forest Emerald', color: 'bg-emerald-600', icon: <ShoppingBag className="w-12 h-12 text-white/20" /> }
  ];

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SKB-';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3 || i === 7) code += '-';
    }
    return code;
  };

  const handleCheckout = async () => {
    if (!email || !recipientName || !user) return;
    
    setLoading(true);
    const newCode = generateCode();
    setGeneratedCode(newCode);

    try {
      const { error } = await supabase.from('gift_cards').insert([{
        user_id: user.id,
        code: newCode,
        amount: selectedAmount,
        design: designs[selectedDesign].name,
        recipient_name: recipientName,
        recipient_email: email,
        status: 'active',
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;
      setShowSuccess(true);
    } catch (err) {
      console.error('Gift card creation failed:', err);
      // Fallback for demo if table doesn't exist yet
      const giftCards = JSON.parse(localStorage.getItem(`skybound_giftcards_${user?.id || 'guest'}`) || '[]');
      giftCards.push({
        code: newCode,
        amount: selectedAmount,
        design: designs[selectedDesign].name,
        recipient: recipientName,
        email: email,
        date: new Date().toISOString(),
        status: 'active'
      });
      localStorage.setItem(`skybound_giftcards_${user?.id || 'guest'}`, JSON.stringify(giftCards));
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen overflow-hidden">
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
        {showSuccess && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Gift Sent!</h3>
              <p className="text-slate-500 font-bold mb-8">Your SykBound Gift Card for ₹{selectedAmount.toLocaleString()} has been sent to {recipientName}.</p>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-10 border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gift Card Code</p>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xl font-black text-indigo-600 font-mono">{generatedCode}</span>
                  <button onClick={copyToClipboard} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowSuccess(false);
                  setEmail('');
                  setRecipientName('');
                }}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20"
              >
                Awesome
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Gift className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">SykBound Gifting</span>
              </div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">The Gift of Choice.</h1>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-lg">SykBound Gift Cards are redeemable across all our services — from luxury stays to blockbuster movies.</p>
              <button 
                onClick={() => navigate('/gift-cards/redeem')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all"
              >
                <Zap className="w-4 h-4" />
                Redeem a Gift Card
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Amount</h4>
                <div className="flex flex-wrap gap-3">
                  {amounts.map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setSelectedAmount(amt)}
                      className={`px-8 py-4 rounded-2xl font-black text-sm transition-all ${selectedAmount === amt ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-indigo-600'}`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose Design</h4>
                <div className="flex gap-4">
                  {designs.map((design, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedDesign(i)}
                      className={`w-16 h-16 rounded-2xl ${design.color} transition-all ${selectedDesign === i ? 'ring-4 ring-indigo-600 ring-offset-4 dark:ring-offset-slate-950 scale-110' : 'opacity-60 hover:opacity-100'}`}
                      title={design.name}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Recipient Name</label>
                  <input 
                    type="text" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl font-bold outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-600 transition-all" 
                    placeholder="Who is it for?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Recipient Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl font-bold outline-none border border-slate-100 dark:border-slate-800 focus:border-indigo-600 transition-all" 
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={!email || !recipientName || loading}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-2xl shadow-black/10 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Buy Gift Card <ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>

          <div className="relative">
            <motion.div 
              key={selectedDesign}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className={`w-full aspect-[1.6/1] ${designs[selectedDesign].color} rounded-[3rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden group perspective-1000`}
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                {designs[selectedDesign].icon}
              </div>
              <div className="h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block mb-1">Gift Card</span>
                    <span className="text-4xl font-black text-white tracking-tighter">SykBound</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest block">Value</span>
                  <span className="text-6xl font-black text-white tracking-tighter">₹{selectedAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Valid Until</span>
                    <span className="text-xs font-black text-white uppercase tracking-widest">MAR 2027</span>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white/60" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-12 -right-12 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Instant Delivery</h5>
                <p className="text-[10px] font-bold text-slate-400">Via Email & SMS</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <ShoppingBag className="w-8 h-8 text-indigo-600" />, title: 'Universal Use', desc: 'Redeemable for flights, hotels, movies, concerts, and more.' },
            { icon: <Sparkles className="w-8 h-8 text-indigo-600 fill-current" />, title: 'No Expiry', desc: 'Our gift cards never expire. Use them whenever you are ready.' },
            { icon: <CreditCard className="w-8 h-8 text-indigo-600" />, title: 'Easy Top-up', desc: 'Add balance to your existing gift card anytime via the SykBound Wallet.' }
          ].map((benefit, i) => (
            <div key={i} className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
                {benefit.icon}
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{benefit.title}</h4>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GiftCards;
