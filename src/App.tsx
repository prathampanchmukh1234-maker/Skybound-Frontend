
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { GlobalProvider, useGlobal } from './context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import Navbar from './components/Navbar';
import AIChatWidget from './components/AIChatWidget';
import Toast from './components/Toast';
import logoUrl from './logo.svg';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AITripPlanner from './pages/AITripPlanner';
import LifeCalendar from './pages/LifeCalendar';
import Privileges from './pages/Privileges';
import Holidays from './pages/Holidays';
import AdminDashboard from './pages/AdminDashboard';
import Support from './pages/Support';
import GroupPlanner from './pages/GroupPlanner';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import Concerts from './pages/Concerts';
import ConcertDetails from './pages/ConcertDetails';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Buses from './pages/Buses';
import Trains from './pages/Trains';
import Hotels from './pages/Hotels';
import Cabs from './pages/Cabs';
import Activities from './pages/Activities';
import GiftCards from './pages/GiftCards';
import GiftCardRedeem from './pages/GiftCardRedeem';
import Visa from './pages/Visa';
import Insurance from './pages/Insurance';
import Flights from './pages/Flights';
import Wallet from './pages/Wallet';
import ReferEarn from './pages/ReferEarn';
import EMIPlans from './pages/EMIPlans';
import FareAlerts from './pages/FareAlerts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Offers from './pages/Offers';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.addEventListener('pageshow', resetScroll);

    return () => {
      window.removeEventListener('pageshow', resetScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.key, location.pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isInitialized, refreshUser } = useGlobal();
  const [showSkip, setShowSkip] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => setToast({ message, type });

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 4000);
    return () => clearTimeout(timer);
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center animate-bounce shadow-2xl mb-8">
          <img src={logoUrl} alt="SkyBound logo" className="w-full h-full object-cover rounded-3xl" />
        </div>
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 dark:text-indigo-400 animate-pulse">
            SykBound Initializing...
          </div>
          {showSkip && (
            <button 
              onClick={() => {
                window.location.reload(); 
              }}
              className="block mx-auto text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors"
            >
              Taking too long? Click to retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/booking" element={<Booking onShowToast={showToast} />} />
              <Route path="/dashboard" element={<Dashboard onShowToast={showToast} />} />
              <Route path="/planner" element={<AITripPlanner />} />
              <Route path="/life-calendar" element={<LifeCalendar />} />
              <Route path="/privileges" element={<Privileges />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/book/:showtimeId" element={<SeatSelection />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/concerts" element={<Concerts />} />
              <Route path="/concerts/:id" element={<ConcertDetails />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/buses" element={<Buses />} />
              <Route path="/trains" element={<Trains />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/cabs" element={<Cabs />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/gift-cards" element={<GiftCards />} />
              <Route path="/gift-cards/redeem" element={<GiftCardRedeem />} />
              <Route path="/flights" element={<Flights />} />
              <Route path="/visa" element={<Visa />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/refer" element={<ReferEarn />} />
              <Route path="/emi" element={<EMIPlans />} />
              <Route path="/fare-alerts" element={<FareAlerts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/support" element={<Support />} />
              <Route path="/group-planner" element={<GroupPlanner />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failed" element={<PaymentFailed />} />
              <Route path="/login" element={<Login onShowToast={showToast} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="bg-slate-950 text-slate-400 pt-20 pb-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          {/* CTA Band */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-20 mb-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">Ready for your next <br/> masterpiece?</h2>
                <p className="text-indigo-100 text-lg font-medium opacity-80">Join 50,000+ travelers experiencing the SykBound difference.</p>
              </div>
              <Link to="/login" className="bg-white text-indigo-600 px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">
                Get Started Now
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-32">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
                  <img src={logoUrl} alt="SkyBound logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-3xl font-black text-white tracking-tighter">SkyBound</span>
              </div>
              <p className="text-slate-500 text-base leading-relaxed max-w-sm font-medium">
                The premium all-in-one ecosystem for travel, entertainment, and lifestyle. Redefining the art of exploration.
              </p>
              <div className="flex gap-4">
                {['twitter', 'instagram', 'linkedin', 'facebook'].map(social => (
                  <div key={social} className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer border border-white/5">
                    <i className={`fa-brands fa-${social} text-white/50 text-sm`}></i>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">Ecosystem</h4>
              <ul className="space-y-4 text-xs font-bold">
                <li><Link to="/planner" className="hover:text-indigo-500 transition-colors">AI Trip Planner</Link></li>
                <li><Link to="/movies" className="hover:text-indigo-500 transition-colors">Cinema</Link></li>
                <li><Link to="/concerts" className="hover:text-indigo-500 transition-colors">Live Events</Link></li>
                <li><Link to="/hotels" className="hover:text-indigo-500 transition-colors">Stays</Link></li>
                <li><Link to="/holidays" className="hover:text-indigo-500 transition-colors">Holidays</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">Travel</h4>
              <ul className="space-y-4 text-xs font-bold">
                <li><Link to="/buses" className="hover:text-indigo-500 transition-colors">Buses</Link></li>
                <li><Link to="/trains" className="hover:text-indigo-500 transition-colors">Trains</Link></li>
                <li><Link to="/cabs" className="hover:text-indigo-500 transition-colors">Cabs</Link></li>
                <li><Link to="/visa" className="hover:text-indigo-500 transition-colors">Visa Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">Company</h4>
              <ul className="space-y-4 text-xs font-bold">
                <li><Link to="/support" className="hover:text-indigo-500 transition-colors">Support Hub</Link></li>
                <li><Link to="/refer" className="hover:text-indigo-500 transition-colors">Refer & Earn</Link></li>
                <li><Link to="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-8">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
              © {new Date().getFullYear()} SykBound Premium Systems. Built in India.
            </div>
            <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest opacity-40">
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Status: All Systems Operational</span>
              <span className="hover:opacity-100 cursor-pointer transition-opacity">v2.4.0-Premium</span>
            </div>
          </div>
        </div>
      </footer>

      <AIChatWidget />
      
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 left-10 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/40 flex items-center justify-center z-[90] hover:bg-indigo-700 transition-all group"
          >
            <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GlobalProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </GlobalProvider>
  );
};

export default App;
