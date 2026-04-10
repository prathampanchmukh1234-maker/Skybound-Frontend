
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { Wand2, Sofa, Gem, ShieldCheck, Headset, Hotel, ChevronLeft } from 'lucide-react';

const Privileges: React.FC = () => {
  const navigate = useNavigate();
  const { user, upgradeTier } = useGlobal();

  const handleJoinElite = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/privileges' } });
      return;
    }
    await upgradeTier('Elite');
    navigate('/dashboard');
  };

  const benefits = [
    {
      title: 'Neural Concierge',
      desc: '24/7 travel planning powered by advanced Gemini AI. From hidden gems to optimized routes.',
      icon: <Wand2 className="w-8 h-8" />,
      color: 'blue'
    },
    {
      title: 'Global Lounge Access',
      desc: 'Complimentary access to over 1,200+ airport lounges worldwide. Travel in absolute comfort.',
      icon: <Sofa className="w-8 h-8" />,
      color: 'indigo'
    },
    {
      title: '3x Rewards',
      desc: 'Triple SkyPoints on every booking. Accelerate your way to free flights and stays.',
      icon: <Gem className="w-8 h-8" />,
      color: 'purple'
    },
    {
      title: 'Zero Cancellation Fees',
      desc: 'Ultimate flexibility. Cancel any domestic flight or hotel booking at no extra cost.',
      icon: <ShieldCheck className="w-8 h-8" />,
      color: 'cyan'
    },
    {
      title: 'Priority Support',
      desc: 'Dedicated elite support team with sub-5 minute response times, anytime, anywhere.',
      icon: <Headset className="w-8 h-8" />,
      color: 'blue'
    },
    {
      title: 'Luxury Upgrades',
      desc: 'Complimentary room upgrades and early check-in at our global partner hotels.',
      icon: <Hotel className="w-8 h-8" />,
      color: 'indigo'
    }
  ];

  return (
    <div className="min-h-screen pt-36 pb-24 bg-[#fcfdfe] dark:bg-slate-950 transition-colors duration-500">
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

        <div className="text-center mb-24 animate-fade-up">
          <span className="text-[12px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.6em] mb-4 block">Exclusive Ecosystem</span>
          <h1 className="text-7xl font-black mb-8 tracking-tighter text-slate-900 dark:text-white leading-none">THE SKYBOUND <br/> PRIVILEGE.</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
            Standard travel is a commodity. Elite travel is an experience. Join the top 1% of global explorers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {benefits.map((b, i) => (
            <div key={i} className="glass p-12 rounded-[3.5rem] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 dark:border-slate-800 group">
              <div className={`w-16 h-16 bg-${b.color}-50 dark:bg-${b.color}-900/20 rounded-2xl flex items-center justify-center text-${b.color}-600 dark:text-${b.color}-400 mb-8 group-hover:scale-110 transition-transform`}>
                {b.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{b.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto bg-slate-900 dark:bg-white p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="relative z-10">
              <h2 className="text-5xl font-black text-white dark:text-slate-950 mb-8 tracking-tighter">Ready to Ascend?</h2>
              <p className="text-slate-400 dark:text-slate-500 text-lg font-medium mb-12 max-w-lg mx-auto leading-relaxed">
                Upgrade your status today for ₹15,000/year and unlock immediate access to all Elite benefits.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                 <button 
                  onClick={handleJoinElite}
                  className="bg-blue-600 dark:bg-slate-950 text-white dark:text-white px-16 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                 >
                   {user?.tier === 'Elite' ? 'You are Elite' : 'Join Elite Now'}
                 </button>
                 <button 
                  onClick={() => navigate('/')}
                  className="bg-transparent border-2 border-slate-700 dark:border-slate-200 text-white dark:text-slate-900 px-16 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
                 >
                   Maybe Later
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Privileges;
