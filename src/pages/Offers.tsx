
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tags, Percent, Zap, Clock, ChevronRight, ChevronLeft, Search, Filter, Sparkles, Gift, Heart, Star } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();
  const [activeTab, setActiveTab] = useState('all');

  const offers = [
    { id: 1, title: 'Summer Escape', desc: 'Get up to 40% OFF on luxury beach resorts in Bali and Maldives.', code: 'SUMMER40', category: 'hotels', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200' },
    { id: 2, title: 'SkyBound First', desc: 'Flat ₹500 OFF on your first flight booking with SkyBound.', code: 'FIRSTFLY', category: 'flights', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=1200' },
    { id: 3, title: 'Weekend Special', desc: 'Buy 1 Get 1 FREE on movie tickets every Saturday and Sunday.', code: 'MOVIES2', category: 'movies', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200' },
    { id: 4, title: 'Global Explorer', desc: '15% Cashback on international visa services and travel insurance.', code: 'GLOBAL15', category: 'visa', img: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200' },
    { id: 5, title: 'Concert Mania', desc: 'Early bird access and 10% discount on upcoming live concerts.', code: 'LIVE10', category: 'concerts', img: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?q=80&w=1200' },
    { id: 6, title: 'Road Trip Ready', desc: 'Flat ₹200 OFF on intercity cab bookings above ₹2000.', code: 'CAB200', category: 'cabs', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200' }
  ];

  const filteredOffers = activeTab === 'all' ? offers : offers.filter(o => o.category === activeTab);

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
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

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              Exclusive<br />
              <span className="text-indigo-600">Privileges</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Handpicked deals and rewards for the SykBound community
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <Tags className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Offers</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-16">
          {['all', 'flights', 'hotels', 'movies', 'concerts', 'cabs', 'visa'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-indigo-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredOffers.map((offer, i) => (
            <motion.div 
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all group"
            >
              <div className="h-64 relative overflow-hidden">
                <img src={offer.img} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  {offer.category}
                </div>
                <div className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
              <div className="p-10">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight font-display">{offer.title}</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{offer.desc}</p>
                
                <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                  <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-xl border-2 border-dashed border-indigo-600/30">
                    <span className="text-xs font-black text-indigo-600 font-mono tracking-widest">{offer.code}</span>
                  </div>
                  <button className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                    Claim Offer <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Referral Section */}
        <div className="mt-32 bg-slate-900 rounded-[4rem] p-16 md:p-24 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 text-indigo-400 mb-6">
                <Gift className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Referral Program</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-8">Share the Journey,<br />Earn Rewards.</h2>
              <p className="text-white/60 font-bold leading-relaxed text-lg mb-12">
                Invite your friends to SykBound and get ₹500 in your wallet for every successful referral. Your friends get ₹250 too!
              </p>
              <button onClick={() => navigate('/refer')} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">
                Invite Friends Now
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <Zap className="w-6 h-6" />, title: 'Instant Credit', desc: 'Rewards added instantly.' },
                { icon: <Star className="w-6 h-6" />, title: 'Unlimited', desc: 'No cap on referrals.' },
                { icon: <Heart className="w-6 h-6" />, title: 'Community', desc: 'Grow our network.' },
                { icon: <Clock className="w-6 h-6" />, title: 'Lifetime', desc: 'Rewards never expire.' }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                  <div className="text-indigo-400">{item.icon}</div>
                  <h4 className="text-xl font-black tracking-tight">{item.title}</h4>
                  <p className="text-xs text-white/40 font-bold">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
