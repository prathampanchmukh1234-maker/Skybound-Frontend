
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SERVICES = [
  { 
    id: 1, name: 'Web Check-in', icon: 'fa-ticket', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
    action: 'external', path: 'https://www.makemytrip.com/airlines/web-check-in.html' 
  },
  { 
    id: 2, name: 'Flight Status', icon: 'fa-plane-departure', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    action: 'external', path: 'https://www.flightradar24.com/' 
  },
  { 
    id: 3, name: 'My Bookings', icon: 'fa-calendar-check', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20',
    action: 'navigate', path: '/dashboard' 
  },
  { 
    id: 4, name: 'Visa Services', icon: 'fa-passport', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    action: 'navigate', path: '/visa' 
  },
  { 
    id: 5, name: 'Travel Insurance', icon: 'fa-shield-heart', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20',
    action: 'navigate', path: '/insurance' 
  },
  { 
    id: 6, name: 'Gift Cards', icon: 'fa-gift', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20',
    action: 'navigate', path: '/gift-cards' 
  }
];

const TravelServices: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (service: any) => {
    if (service.action === 'navigate') {
      navigate(service.path);
    } else if (service.action === 'external') {
      window.open(service.path, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 mt-40">
      <div className="flex items-center gap-6 mb-16">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] whitespace-nowrap">Travel Utilities</span>
        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {SERVICES.map((service, i) => (
          <motion.button
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(service)}
            className="group flex flex-col items-center gap-6 p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:shadow-2xl transition-all duration-500"
          >
            <div className={`w-20 h-20 ${service.bg} rounded-2xl flex items-center justify-center text-3xl ${service.color} group-hover:scale-110 transition-transform shadow-sm`}>
              <i className={`fa-solid ${service.icon}`}></i>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 text-center leading-tight font-display">
              {service.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TravelServices;
