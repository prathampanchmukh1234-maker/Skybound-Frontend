import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle2, Gift, Sparkles, Zap, ChevronRight, Tag, Clock } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

const OFFERS = [
  {
    id: 'bus-prime',
    title: 'SykBound Prime Bus Exclusive',
    description: 'Get flat 25% OFF on all luxury bus bookings. Valid for Prime members.',
    code: 'PRIMEBUS25',
    color: 'from-indigo-600 to-blue-600',
    icon: <Zap className="w-6 h-6" />,
    expiry: 'Valid till 31st March 2026',
    reward: 100
  },
  {
    id: 'hotel-first',
    title: 'First Hotel Booking',
    description: 'Enjoy up to ₹2,000 OFF on your first hotel stay with SykBound.',
    code: 'WELCOMEHOTEL',
    color: 'from-emerald-600 to-teal-600',
    icon: <Gift className="w-6 h-6" />,
    expiry: 'Valid for new users only',
    reward: 200
  },
  {
    id: 'flight-intl',
    title: 'International Escape',
    description: 'Flat 10% OFF on international flight bookings. No upper limit.',
    code: 'GLOBETROTTER',
    color: 'from-rose-600 to-pink-600',
    icon: <Sparkles className="w-6 h-6 fill-current" />,
    expiry: 'Valid on select airlines',
    reward: 150
  }
];

const PromotionalOffers: React.FC = () => {
  const { user, updateWalletBalance } = useGlobal();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [claimedOffer, setClaimedOffer] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClaim = async (offer: any) => {
    if (!user) return;
    
    const claimedKey = `skybound_claimed_${user.id}_${offer.id}`;
    if (localStorage.getItem(claimedKey)) {
      setClaimedOffer(offer.id);
      setTimeout(() => setClaimedOffer(null), 2000);
      return;
    }

    try {
      await updateWalletBalance(offer.reward);
      localStorage.setItem(claimedKey, 'true');
      sessionStorage.setItem('skybound_claimed_coupon', JSON.stringify({
        code: offer.code,
        id: offer.id,
        timestamp: Date.now()
      }));
      setClaimedOffer(offer.id);
      setTimeout(() => setClaimedOffer(null), 3000);
    } catch (error) {
      console.error("Failed to claim offer:", error);
    }
  };

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Tag className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exclusive Rewards</span>
            </div>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">SykBound Prime Offers</h2>
          </div>
          <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
            View All Offers <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {OFFERS.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col"
            >
              <div className={`h-4 bg-gradient-to-r ${offer.color}`}></div>
              <div className="p-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${offer.color} flex items-center justify-center text-white shadow-lg`}>
                    {offer.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Coupon Code</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{offer.code}</span>
                      <button 
                        onClick={() => handleCopy(offer.code)}
                        className="text-indigo-600 hover:scale-110 transition-transform"
                      >
                        {copiedCode === offer.code ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{offer.title}</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8 flex-1">{offer.description}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {offer.expiry}
                  </div>
                  <button 
                    onClick={() => handleClaim(offer)}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      claimedOffer === offer.id 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {claimedOffer === offer.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Offer Claimed
                      </>
                    ) : (
                      <>
                        Claim Offer <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {copiedCode && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Code Copied to Clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PromotionalOffers;
