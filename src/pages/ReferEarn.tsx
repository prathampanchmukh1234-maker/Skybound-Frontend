import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Gift, Users, Trophy, Copy, CheckCircle2, ChevronRight, Sparkles, Zap, Heart, Mail, MessageCircle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

const ReferEarn: React.FC = () => {
  const { user, loadingAuth } = useGlobal();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const referralCode = user?.referralCode || (user ? `SKYBOUND${user.id.slice(0, 6).toUpperCase()}` : '');
  const referralLink = `https://sykbound.run.app/signup?ref=${referralCode}`;

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/login', { state: { from: '/refer' } });
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

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = `Join SykBound and get ₹500 rewards on your first booking! Use my link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const shareViaEmail = () => {
    const subject = 'Join SykBound - Your Premium Travel Partner';
    const body = `Hey! I've been using SykBound for my travel bookings and it's amazing. Join using my link and get ₹500 rewards: ${referralLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener,noreferrer');
  };

  const milestones = [
    { referrals: 1, reward: '₹500 Wallet Cash', status: 'Completed' },
    { referrals: 5, reward: 'Free Movie Ticket', status: 'In Progress' },
    { referrals: 10, reward: 'SykBound Elite Membership', status: 'Locked' },
    { referrals: 25, reward: '₹10,000 Travel Voucher', status: 'Locked' }
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Community Rewards</span>
              </div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Share the Love. Get Rewarded.</h1>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-lg">Invite your friends to SykBound and earn SkyPoints & Wallet Cash for every successful referral.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Your Referral Link</h4>
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 overflow-hidden text-ellipsis whitespace-nowrap">
                    {referralLink}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform flex items-center gap-2"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={shareViaWhatsApp}
                  className="bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-transform flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" /> WhatsApp
                </button>
                <button 
                  onClick={shareViaEmail}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-transform flex items-center justify-center gap-3"
                >
                  <Mail className="w-5 h-5" /> Email
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-12">Referral Milestones</h3>
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.status === 'Completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : m.status === 'In Progress' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'}`}>
                        {m.status === 'Completed' ? <CheckCircle2 className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className={`text-lg font-black tracking-tight ${m.status === 'Locked' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{m.reward}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.referrals} Referrals Required</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${m.status === 'Completed' ? 'bg-green-100 text-green-600' : m.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {m.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/30"
            >
              <Gift className="w-12 h-12 text-white" />
            </motion.div>
          </div>
        </div>

        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <Share2 className="w-8 h-8 text-indigo-600" />, title: 'Invite Friends', desc: 'Share your unique referral link with your friends and family.' },
            { icon: <Zap className="w-8 h-8 text-indigo-600" />, title: 'They Join', desc: 'When they sign up and make their first booking on SykBound.' },
            { icon: <Heart className="w-8 h-8 text-indigo-600" />, title: 'You Earn', desc: 'Get instant wallet cash and unlock exclusive milestone rewards.' }
          ].map((step, i) => (
            <div key={i} className="space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
                {step.icon}
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{step.title}</h4>
              <p className="text-sm font-bold text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferEarn;
