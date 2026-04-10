
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import logoUrl from '../logo.svg';
import { 
  Bell, 
  Heart, 
  Moon, 
  Sun, 
  MapPin, 
  ChevronDown, 
  Sparkles, 
  LogOut, 
  User, 
  Gift,
  Search,
  Menu,
  X
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  time: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, currency, setCurrency, location: userLocation, user, loadingAuth, isSyncing, logout } = useGlobal();
  const [scrolled, setScrolled] = useState(false);
  
  // Task 2: Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(() => {
    return localStorage.getItem('sb_wishlist_active') === 'true';
  });

  // Task 3: Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'Booking Confirmed', message: 'Your flight to Paris is confirmed.', read: false, time: '2m ago' },
    { id: 2, title: 'New Offer', message: 'Get 20% off on your next hotel stay.', read: false, time: '1h ago' },
    { id: 3, title: 'Wallet Updated', message: '₹500 added to your SykBound wallet.', read: true, time: '3h ago' },
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('sb_wishlist_active', String(isWishlisted));
  }, [isWishlisted]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleWishlist = () => setIsWishlisted(!isWishlisted);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
        scrolled 
          ? 'py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)]' 
          : 'py-8 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 ring-1 ring-white/20"
            >
              <img src={logoUrl} alt="SkyBound logo" className="w-full h-full object-cover" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                Sky<span className="text-indigo-600">Bound</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mt-1">Premium Ecosystem</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-10">
            {['Flights', 'Hotels', 'Movies', 'Concerts', 'Offers', 'AI Planner'].map((item) => {
              const searchType = new URLSearchParams(location.search).get('type');
              const path = item === 'Flights' ? '/flights' : 
                           item === 'Hotels' ? '/search?type=hotel' : 
                           item === 'Movies' ? '/movies' : 
                           item === 'Concerts' ? '/concerts' : 
                           item === 'Offers' ? '/offers' : '/planner';
              
              const isActive = location.pathname === path ||
                (item === 'Hotels' && location.pathname === '/search' && searchType === 'hotel') ||
                (item === 'Flights' && location.pathname === '/search' && searchType === 'flight');
              
              return (
                <Link 
                  key={item} 
                  to={path} 
                  className="relative group py-2"
                >
                  <span className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600'
                  }`}>
                    {item}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme} 
              className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </motion.button>

            {loadingAuth || isSyncing ? (
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-4 relative group">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 dark:border-indigo-800/50">
                    <User className="w-5 h-5" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all" />
                </div>
                
                {/* User Dropdown */}
                <div className="absolute top-full right-0 mt-4 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">{user.tier || 'Premium'} Member</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                  </div>
                  <div className="p-2">
                    <Link to="/dashboard" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-600 dark:text-slate-400 hover:text-indigo-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                    </Link>
                    <Link to="/profile" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-600 dark:text-slate-400 hover:text-indigo-600">
                      <User className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
                    </Link>
                    <Link to="/settings" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-600 dark:text-slate-400 hover:text-indigo-600">
                      <Sun className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                    </Link>
                    <div className="h-[1px] bg-slate-50 dark:bg-slate-800 my-2 mx-4"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/login"
                  className="azure-btn px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Sign In
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
