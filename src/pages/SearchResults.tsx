
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AIRLINES, TRAINS, HOLIDAYS, BUS_OPERATORS, HOTELS_DATA, TRAIN_ROUTES, BUS_ROUTES, CAB_TYPES, ACTIVITIES, FLIGHTS } from '../constants';
import { useGlobal } from '../context/GlobalContext';
import { MatchScore } from '../components/IntelligenceWidgets';

// --- CITY SPECIFIC DATA MAPPING ---
const CITY_HOTELS: Record<string, string[]> = {
  'New Delhi': ['The Leela Palace New Delhi', 'Taj Mahal Hotel Mansingh Road', 'Roseate House Aerocity', 'JW Marriott New Delhi', 'The Oberoi New Delhi', 'Radisson Blu Plaza', 'The Lodhi'],
  'Mumbai': ['The Taj Mahal Palace', 'Trident Nariman Point', 'Sahara Star Mumbai', 'JW Marriott Juhu', 'The St. Regis Mumbai', 'The Oberoi Mumbai', 'Novotel Mumbai Juhu Beach'],
  'Goa': ['W Goa Vagator', 'Taj Exotica Resort & Spa', 'Cidade de Goa', 'Grand Hyatt Goa', 'Novotel Goa Resort', 'The Leela Goa', 'Alila Diwa Goa'],
  'London': ['The Savoy London', 'Shangri-La The Shard', 'The Ritz London', 'Hilton Park Lane', 'The Langham', 'The Dorchester', 'Claridge\'s'],
  'Dubai': ['Burj Al Arab Jumeirah', 'Atlantis The Palm', 'Armani Hotel Dubai', 'Jumeirah Beach Hotel', 'Address Downtown', 'Palazzo Versace Dubai', 'One&Only The Palm'],
  'Paris': ['Hotel Ritz Paris', 'Four Seasons George V', 'The Peninsula Paris', 'Shangri-La Paris', 'Le Meurice', 'Hôtel Plaza Athénée', 'Park Hyatt Paris-Vendôme'],
  'Singapore': ['Marina Bay Sands', 'Raffles Hotel Singapore', 'Fullerton Bay Hotel', 'Capella Singapore', 'W Singapore Sentosa Cove', 'The Ritz-Carlton Millenia', 'Shangri-La Singapore']
};

const DEFAULT_HOTELS = ['Grand Global Residency', 'Elite Plaza Hotel', 'Skyline Luxury Suites', 'The Urban Retreat', 'Azure Bay Resort'];
 
// --- POLICY GENERATOR ---
const getPolicyForProvider = (type: string, provider: string) => {
  const policies: Record<string, any> = {
    flight: {
      cancellation: "Refundable with ₹3,500 fee. Full refund if cancelled within 24 hours of booking.",
      boarding: "Check-in closes 60 mins before departure. Web check-in mandatory.",
      baggage: "15kg Check-in, 7kg Cabin. Extra baggage at ₹550/kg."
    },
    hotel: {
      cancellation: "Free cancellation 48h before check-in. One night charge for late cancellations.",
      checkIn: "Check-in: 2:00 PM, Check-out: 11:00 AM.",
      extraBed: "Available on request for ₹1,500/night."
    },
    bus: {
      cancellation: "80% refund if cancelled 12h before. Zero refund within 4h of departure.",
      boarding: "ID proof mandatory. Rescheduling allowed up to 6h before.",
      amenities: "Water bottle and blanket provided on board."
    },
    train: {
      cancellation: "Full refund excluding clerkage if cancelled 48h prior. 25% deduction within 12h.",
      boarding: "E-ticket valid with original Govt ID. Platform gates close 5 mins before.",
      meal: "Catering as per train class. Pre-booked meals included."
    }
  };
 
  return policies[type] || policies.flight;
};
 
// --- DYNAMIC CONTENT GENERATOR ---
const getAmenityIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('wi-fi') || l.includes('wifi')) return 'fa-wifi';
  if (l.includes('breakfast') || l.includes('food') || l.includes('meal')) return 'fa-utensils';
  if (l.includes('pool') || l.includes('swimming')) return 'fa-person-swimming';
  if (l.includes('gym') || l.includes('fitness')) return 'fa-dumbbell';
  if (l.includes('spa')) return 'fa-spa';
  if (l.includes('parking')) return 'fa-square-p';
  if (l.includes('room service')) return 'fa-bell-concierge';
  if (l.includes('air conditioning') || l.includes('ac')) return 'fa-snowflake';
  if (l.includes('power') || l.includes('charging') || l.includes('plug')) return 'fa-bolt';
  if (l.includes('entertainment') || l.includes('tv')) return 'fa-tv';
  if (l.includes('headphones')) return 'fa-headphones';
  if (l.includes('couch') || l.includes('seat')) return 'fa-couch';
  if (l.includes('water')) return 'fa-bottle-water';
  if (l.includes('security') || l.includes('cctv')) return 'fa-shield-halved';
  if (l.includes('tracking')) return 'fa-location-dot';
  if (l.includes('bed')) return 'fa-bed';
  if (l.includes('light')) return 'fa-lightbulb';
  return 'fa-check';
};

const getServiceContent = (type: string, item: any) => {
  const content: Record<string, any> = {
    flight: {
      title: 'Flight Details',
      amenities: [
        { icon: 'fa-wifi', label: 'High-speed WiFi' },
        { icon: 'fa-plug', label: 'In-seat Power' },
        { icon: 'fa-utensils', label: 'Gourmet Meals' },
        { icon: 'fa-couch', label: 'Ergonomic Seats' },
        { icon: 'fa-headphones', label: 'Noise-cancelling' }
      ],
      highlights: [
        '98% On-time performance',
        'Extra legroom (34" pitch)',
        'Priority boarding included'
      ],
      policy: {
        cancellation: "Refundable with ₹3,500 fee. Full refund if cancelled within 24 hours of booking.",
        boarding: "Check-in closes 60 mins before departure. Web check-in mandatory.",
        baggage: "15kg Check-in, 7kg Cabin. Extra baggage at ₹550/kg."
      }
    },
    hotel: {
      title: 'Hotel Overview',
      amenities: [
        { icon: 'fa-swimming-pool', label: 'Rooftop Pool' },
        { icon: 'fa-dumbbell', label: '24/7 Fitness' },
        { icon: 'fa-coffee', label: 'Buffet Breakfast' },
        { icon: 'fa-spa', label: 'Luxury Spa' },
        { icon: 'fa-concierge-bell', label: '24/7 Concierge' }
      ],
      highlights: [
        'Prime city-center location',
        'Top-rated for cleanliness',
        'Smart room automation'
      ],
      policy: {
        cancellation: "Free cancellation 48h before check-in. One night charge for late cancellations.",
        checkIn: "Check-in: 2:00 PM, Check-out: 11:00 AM.",
        extraBed: "Available on request for ₹1,500/night."
      }
    },
    bus: {
      title: 'Bus Journey Details',
      amenities: [
        { icon: 'fa-snowflake', label: 'Climate Control' },
        { icon: 'fa-bottle-water', label: 'Mineral Water' },
        { icon: 'fa-battery-full', label: 'Charging Ports' },
        { icon: 'fa-video', label: 'CCTV Security' },
        { icon: 'fa-location-dot', label: 'Live Tracking' }
      ],
      highlights: [
        'GPS-tracked boarding points',
        'Punctual departures',
        'Professional crew'
      ],
      policy: {
        cancellation: "80% refund if cancelled 12h before. Zero refund within 4h of departure.",
        boarding: "ID proof mandatory. Rescheduling allowed up to 6h before.",
        amenities: "Water bottle and blanket provided on board."
      }
    },
    train: {
      title: 'Train Experience',
      amenities: [
        { icon: 'fa-bed', label: 'Fresh Bedding' },
        { icon: 'fa-utensils', label: 'Pantry Access' },
        { icon: 'fa-plug', label: 'Individual Ports' },
        { icon: 'fa-lightbulb', label: 'Reading Light' },
        { icon: 'fa-shield-halved', label: 'On-board Security' }
      ],
      highlights: [
        'Express journey route',
        'Spacious berths',
        'Clean washrooms'
      ],
      policy: {
        cancellation: "Full refund excluding clerkage if cancelled 48h prior. 25% deduction within 12h.",
        boarding: "E-ticket valid with original Govt ID. Platform gates close 5 mins before.",
        meal: "Catering as per train class. Pre-booked meals included."
      }
    }
  };

  return content[type] || content.flight;
};

const SERVICE_VISUALS = {
  flight: ['1436491899339-199b1db3f1f5', '1464037866556-6812c9d1c72e', '1540339832810-044a6b24017c', '1575505062-7c4363ad6bea'],
  train: ['1474487543412-1a05136b073a', '1532105956691-9a3a0e109d80', '1464208398033-ab3f496df0e7'],
  bus: ['1544620347-c4fd4a3d5957', '1570125909232-eb263c188f7e', '1464208398033-ab3f496df0e7'],
  hotel: ['1566073771259-6a8506099945', '1582719478250-c89cae4dd85b', '1542314831-068cd1dbfeeb'],
  holiday: ['1514282401047-d79a71a590e8', '1512100356956-c1227c3317bb', '1587474260584-136574528ed5'],
  cab: ['1549317661-1f77a9497651', '1533106497116-4542f14f6d62', '1503376780353-7e6692767b70'],
  activity: ['1533105079780-92b9be482077', '1507525428034-b723cf961d3e', '1501785888041-af3ef285b470']
};

const getUnsplashUrl = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=85&w=${w}`;

const FLIGHT_IMAGE_BY_AIRLINE: Record<string, string> = {
  'IndiGo': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=85&w=1200',
  'Air India': 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&q=85&w=1200',
  'Vistara': 'https://images.unsplash.com/photo-1521727857535-28d2047314ac?auto=format&fit=crop&q=85&w=1200',
  'SpiceJet': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=85&w=1200'
};

const TRAIN_IMAGE_BY_NAME: Record<string, string> = {
  'Vande Bharat Express': 'https://images.unsplash.com/photo-1474487543412-1a05136b073a?auto=format&fit=crop&q=85&w=1200',
  'Rajdhani Express': 'https://images.unsplash.com/photo-1532105956691-9a3a0e109d80?auto=format&fit=crop&q=85&w=1200',
  'Shatabdi Express': 'https://images.unsplash.com/photo-1515162816999-a0c47dcaf76d?auto=format&fit=crop&q=85&w=1200',
  'Deccan Queen': 'https://images.unsplash.com/photo-1474487543412-1a05136b073a?auto=format&fit=crop&q=85&w=1200'
};

const BUS_IMAGE_BY_OPERATOR: Record<string, string> = {
  'Zingbus': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=85&w=1200',
  'NueGo': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=85&w=1200',
  'IntrCity SmartBus': 'https://images.unsplash.com/photo-1464208398033-ab3f496df0e7?auto=format&fit=crop&q=85&w=1200',
  'MSRTC Shivneri': 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=85&w=1200'
};

const getFlightVisual = (airline: string, fallbackId: string) => FLIGHT_IMAGE_BY_AIRLINE[airline] || getUnsplashUrl(fallbackId);
const getTrainVisual = (name: string, fallbackId: string) => TRAIN_IMAGE_BY_NAME[name] || getUnsplashUrl(fallbackId);
const getBusVisual = (operator: string, fallbackId: string) => BUS_IMAGE_BY_OPERATOR[operator] || getUnsplashUrl(fallbackId);

type TripType = 'one-way' | 'round-trip' | 'multi-city';
interface FlightSegmentQuery {
  from: string;
  to: string;
  date: string;
}

const formatServiceDate = (date: string, type: string) => {
  if (!date) return '';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const label = parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (type === 'hotel') return `Check-in ${label}`;
  if (type === 'cab') return `Pickup ${label}`;
  return `Travel ${label}`;
};

interface DetailsModalProps {
  item: any;
  type: string;
  onClose: () => void;
  onSelect: () => void;
  initialTab?: 'info' | 'policy';
}

const ServiceDetailsModal: React.FC<DetailsModalProps> = ({ item, type, onClose, onSelect, initialTab = 'info' }) => {
  const { convertPrice } = useGlobal();
  const [activeTab, setActiveTab] = useState<'info' | 'policy'>(initialTab);
  const serviceContent = getServiceContent(type, item);
  const policy = serviceContent.policy;

  const metricCards = (() => {
    const base = { label: 'Final Fare', value: convertPrice(item.price), sub: '+ taxes & fees', color: 'border-indigo-500' };
    if (type === 'hotel') return [
      base,
      { label: 'Star Rating', value: '★'.repeat(Math.max(0, Math.min(5, Math.floor(item.stars || item.rating || 4)))), sub: item.location || 'Premium Location', color: 'border-amber-500' },
      { label: 'Check-in / Out', value: '2 PM / 11 AM', sub: 'Standard hotel policy', color: 'border-emerald-500' }
    ];
    if (type === 'activity') return [
      base,
      { label: 'Duration', value: item.duration || '2h', sub: item.location || '', color: 'border-emerald-500' },
      { label: 'Difficulty', value: item.difficulty || 'Easy', sub: 'Certified instructor', color: 'border-amber-500' }
    ];
    if (type === 'cab') return [
      base,
      { label: 'Vehicle', value: item.type || 'Sedan', sub: item.example || '', color: 'border-emerald-500' },
      { label: 'Capacity', value: `${item.capacity || 4} pax`, sub: 'Luggage included', color: 'border-amber-500' }
    ];
    // flight, bus, train — have departure/arrival
    return [
      base,
      { label: 'Duration', value: item.duration || '—', sub: (item.departureTime || '—') + ' → ' + (item.arrivalTime || '—'), color: 'border-emerald-500' },
      { label: type === 'bus' ? 'Bus Type' : type === 'train' ? 'Class' : 'Class', value: item.busType || item.class || (type === 'flight' ? 'Economy' : '—'), sub: 'Verified by SykBound', color: 'border-amber-500' }
    ];
  })();

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row max-h-[92vh]"
      >
        {/* LEFT: image panel */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
          <img 
            src={item.image} 
            className="w-full h-full object-cover" 
            alt={item.title || item.airline} 
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          
          {/* Badges on image */}
          <div className="absolute bottom-8 left-8 flex gap-3">
            <span className="px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase text-white tracking-[0.2em] shadow-lg">
              {serviceContent.title}
            </span>
            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-white tracking-[0.2em] border border-white/10">
              {item.matchScore}% Match
            </span>
          </div>
        </div>

        {/* RIGHT: info panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Title + price header */}
          <div className="p-10 pb-6 border-b dark:border-slate-800">
            <div className="flex justify-between items-start gap-6">
              <div className="min-w-0">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                  {item.title || item.airline}
                </h2>
                {item.location && (
                  <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <i className="fa-solid fa-location-dot text-[10px]"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.location}</span>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Starting from</span>
                <div className="text-3xl font-black text-indigo-600 font-display tracking-tighter">{convertPrice(item.price)}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b dark:border-slate-800 px-10 bg-slate-50/50 dark:bg-slate-800/20">
            <button 
              onClick={() => setActiveTab('info')}
              className={`py-4 px-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'info' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Overview & Amenities
              {activeTab === 'info' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('policy')}
              className={`py-4 px-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'policy' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Terms & Policies
              {activeTab === 'policy' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="p-10 overflow-y-auto flex-1 custom-scrollbar space-y-10">
            {activeTab === 'info' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                {/* metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {metricCards.map((card, i) => (
                    <div key={i} className={`p-5 bg-white dark:bg-slate-800 rounded-2xl border-t-4 ${card.color} shadow-sm`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{card.label}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white truncate">{card.value}</p>
                      <p className="text-[9px] text-slate-400 mt-1 truncate">{card.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-10">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span> Experience Amenities
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(item.amenities || serviceContent.amenities).map((amenity: any, idx: number) => {
                        const label = typeof amenity === 'string' ? amenity : amenity.label;
                        const icon = typeof amenity === 'string' ? getAmenityIcon(amenity) : amenity.icon;
                        return (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm">
                              <i className={`fa-solid ${icon} text-[10px]`}></i>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800"></span> Service Highlights
                    </h4>
                    <div className="space-y-3">
                      {serviceContent.highlights.map((highlight: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-xl border border-transparent">
                          <div className="w-5 h-5 rounded-full bg-yellow-400/10 flex items-center justify-center">
                            <i className="fa-solid fa-star text-yellow-400 text-[8px]"></i>
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {[
                  { icon: 'fa-shield-halved', color: 'text-green-600 bg-green-50 dark:bg-green-900/20', title: 'Cancellation', text: policy.cancellation },
                  { icon: 'fa-clock', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', title: 'Date Change / Check-in', text: policy.dateChange || policy.checkIn || policy.boarding },
                  policy.baggage && { icon: 'fa-suitcase', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', title: 'Baggage Allowance', text: policy.baggage }
                ].filter(Boolean).map((item: any, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <i className={`fa-solid ${item.icon} text-sm`}></i>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-10 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-between items-center gap-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <i className="fa-solid fa-check text-[10px]"></i>
              </div>
              <p className="text-[9px] font-bold text-slate-500 max-w-[200px] leading-relaxed">
                Dynamic pricing — subject to final verification at checkout.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={onClose} className="flex-1 sm:flex-none px-8 py-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all">Dismiss</button>
              <button 
                onClick={onSelect}
                className="flex-1 sm:flex-none px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SearchResults: React.FC = () => {
  const { convertPrice, updateHistory, user } = useGlobal();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  const type = (searchParams.get('type') || 'flight') as any;
  const tripType = (searchParams.get('tripType') || 'one-way') as TripType;
  const toCity = searchParams.get('to') || 'Mumbai';
  const fromCity = searchParams.get('from') || 'Delhi';
  const multiCitySegments = useMemo<FlightSegmentQuery[]>(() => {
    if (tripType !== 'multi-city' || type !== 'flight') return [];

    const segmentsRaw = searchParams.get('segments');
    if (!segmentsRaw) return [];

    try {
      const parsed = JSON.parse(segmentsRaw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((segment) => segment && typeof segment.from === 'string' && typeof segment.to === 'string')
        .map((segment) => ({
          from: segment.from.trim(),
          to: segment.to.trim(),
          date: typeof segment.date === 'string' ? segment.date : ''
        }))
        .filter((segment) => segment.from && segment.to);
    } catch {
      return [];
    }
  }, [searchParams, tripType, type]);
  const itineraryFrom = multiCitySegments[0]?.from || fromCity;
  const itineraryTo = multiCitySegments[multiCitySegments.length - 1]?.to || toCity;
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{item: any, tab: 'info' | 'policy'} | null>(null);
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedTiming, setSelectedTiming] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Recommended');
  
  // Reset filters when type changes
  useEffect(() => {
    setSelectedOperators([]);
    setSelectedStops([]);
    setSelectedTiming([]);
    setSelectedRatings([]);
    setSelectedAmenities([]);
    setSortBy('Recommended');
    setMaxBudget(null);
  }, [type]);

  const departureDateParam = searchParams.get('departure') || '';
  const formattedServiceDate = formatServiceDate(departureDateParam, type);

  useEffect(() => {
    setLoading(true);
    updateHistory({ type, from: itineraryFrom, to: itineraryTo });

    const timer = setTimeout(() => {
      let mockData: any[] = [];
      const pool = (SERVICE_VISUALS as any)[type] || SERVICE_VISUALS.flight;

      const getDeparture = (index: number, mode: string) => {
        const flightTimes = ['06:10', '08:45', '11:30', '14:15', '17:00', '19:45', '22:20'];
        const trainTimes  = ['05:50', '08:20', '11:15', '14:40', '17:10', '20:00', '22:30'];
        const busTimes    = ['06:00', '09:00', '12:30', '16:00', '19:30', '21:45', '23:00'];
        if (mode === 'flight') return flightTimes[index % flightTimes.length];
        if (mode === 'train')  return trainTimes[index % trainTimes.length];
        if (mode === 'bus')    return busTimes[index % busTimes.length];
        return '09:00';
      };

      const getArrival = (index: number, mode: string) => {
        const flightArrivals = ['08:30', '11:00', '13:45', '16:30', '19:15', '22:00', '00:30'];
        const trainArrivals  = ['13:20', '15:50', '18:45', '22:10', '00:40', '03:30', '06:00'];
        const busArrivals    = ['14:00', '17:00', '20:30', '00:00', '03:30', '05:45', '07:00'];
        if (mode === 'flight') return flightArrivals[index % flightArrivals.length];
        if (mode === 'train')  return trainArrivals[index % trainArrivals.length];
        if (mode === 'bus')    return busArrivals[index % busArrivals.length];
        return '12:00';
      };

      if (type === 'flight') {
        if (tripType === 'multi-city' && multiCitySegments.length > 0) {
          mockData = multiCitySegments.flatMap((segment, segmentIndex) => {
            const cityFlights = FLIGHTS.filter((flight) =>
              flight.from.toLowerCase().includes(segment.from.toLowerCase()) &&
              flight.to.toLowerCase().includes(segment.to.toLowerCase())
            );
            const seedFlights = cityFlights.length > 0
              ? cityFlights
              : FLIGHTS.slice(0, 3).map((flight) => ({ ...flight, from: segment.from, to: segment.to }));

            return seedFlights.map((flight, i) => {
              const airlineObj = AIRLINES.find((airline) => airline.name === flight.airline) || AIRLINES[0];
              const absoluteIndex = segmentIndex * 3 + i;
              return {
                id: `${flight.id}-seg-${segmentIndex}-${i}`,
                airline: flight.airline,
                logo: airlineObj.logo,
                image: getFlightVisual(flight.airline, pool[absoluteIndex % pool.length]),
                from: segment.from,
                to: segment.to,
                departureTime: flight.departure,
                arrivalTime: flight.arrival,
                duration: flight.duration,
                price: flight.price + segmentIndex * 450,
                matchScore: Math.max(78, 95 - absoluteIndex),
                type: 'flight',
                stops: absoluteIndex % 3 === 0 ? 'Non-stop' : '1 Stop',
                rating: flight.rating,
                segmentLabel: `Leg ${segmentIndex + 1}`,
                segmentDate: segment.date || departureDateParam,
                policy: getPolicyForProvider('flight', flight.airline),
                amenities: absoluteIndex % 2 === 0
                  ? ['Priority Boarding', 'Extra Legroom', 'USB Port', 'WiFi']
                  : ['Meal Included', 'Beverages', 'Standard Wi-Fi', 'Entertainment']
              };
            });
          });
        } else {
          const cityFlights = FLIGHTS.filter(f =>
            f.from.toLowerCase().includes(fromCity.toLowerCase()) &&
            f.to.toLowerCase().includes(toCity.toLowerCase())
          );
          const sourceData = cityFlights.length > 0 ? cityFlights : FLIGHTS;

          mockData = sourceData.map((flight, i) => {
            const airlineObj = AIRLINES.find(a => a.name === flight.airline) || AIRLINES[0];
            return {
              id: flight.id,
              airline: flight.airline,
              logo: airlineObj.logo,
              image: getFlightVisual(flight.airline, pool[i % pool.length]),
              from: flight.from, to: flight.to,
              departureTime: flight.departure,
              arrivalTime: flight.arrival,
              duration: flight.duration,
              price: flight.price,
              matchScore: 95 - i,
              type: 'flight',
              stops: i % 3 === 0 ? 'Non-stop' : '1 Stop',
              rating: flight.rating,
              policy: getPolicyForProvider('flight', flight.airline),
              amenities: i % 2 === 0 ? ['Priority Boarding', 'Extra Legroom', 'USB Port', 'WiFi'] : ['Meal Included', 'Beverages', 'Standard Wi-Fi', 'Entertainment']
            };
          });
        }
      } else if (type === 'hotel') {
        const cityHotels = HOTELS_DATA.filter(h => h.location.toLowerCase().includes(toCity.toLowerCase()));
        const sourceData = cityHotels.length > 0 ? cityHotels : HOTELS_DATA;
        
        mockData = sourceData.map((hotel, i) => ({
          id: hotel.id,
          title: hotel.name,
          logo: '🏨',
          image: hotel.image,
          price: hotel.pricePerNight,
          matchScore: 98 - i,
          type: 'hotel',
          rating: hotel.rating,
          location: hotel.location,
          amenities: hotel.amenities,
          policy: getPolicyForProvider('hotel', hotel.name)
        }));
      } else if (type === 'train') {
        const cityTrains = TRAIN_ROUTES.filter(t => 
          t.from.toLowerCase().includes(fromCity.toLowerCase()) && 
          t.to.toLowerCase().includes(toCity.toLowerCase())
        );
        const sourceData = cityTrains.length > 0 ? cityTrains : TRAIN_ROUTES;

        mockData = sourceData.map((train, i) => ({
          id: train.id,
          title: `${train.name} (${train.number})`,
          airline: train.name,
          logo: (train as any).logo || '🚂',
          image: train.image || getTrainVisual(train.name, pool[i % pool.length]),
          from: train.from,
          to: train.to,
          departureTime: train.departure,
          arrivalTime: train.arrival,
          duration: train.duration,
          price: (Object.values(train.classes)[0] as any).fare,
          matchScore: 96 - i,
          type: 'train',
          rating: train.rating,
          policy: getPolicyForProvider('train', train.name),
          amenities: ['Bedding', 'Reading Light', 'Charging Port', 'Pantry Access', 'Security']
        }));
      } else if (type === 'bus') {
        const cityBuses = BUS_ROUTES.filter(b => 
          b.from.toLowerCase().includes(fromCity.toLowerCase()) && 
          b.to.toLowerCase().includes(toCity.toLowerCase())
        );
        const sourceData = cityBuses.length > 0 ? cityBuses : BUS_ROUTES;

        mockData = sourceData.map((bus, i) => ({
          id: bus.id,
          title: `${bus.operator} ${bus.type}`,
          airline: bus.operator,
          logo: bus.operatorLogo || '🚌',
          image: bus.image || getBusVisual(bus.operator, pool[i % pool.length]),
          from: bus.from,
          to: bus.to,
          departureTime: bus.departure,
          arrivalTime: bus.arrival,
          duration: bus.duration,
          price: bus.price,
          matchScore: 94 - i,
          type: 'bus',
          rating: bus.rating,
          policy: getPolicyForProvider('bus', bus.operator),
          amenities: bus.amenities
        }));
      } else if (type === 'cab') {
        mockData = CAB_TYPES.map((cab, i) => ({
          id: cab.id,
          airline: cab.type,
          example: cab.example,
          image: cab.image,
          price: cab.baseFare,
          matchScore: 96 - i,
          type: 'cab',
          amenities: cab.includes
        }));
      } else if (type === 'activity') {
        const cityActivities = ACTIVITIES.filter(a => a.location.toLowerCase().includes(toCity.toLowerCase()));
        const sourceData = cityActivities.length > 0 ? cityActivities : ACTIVITIES;

        mockData = sourceData.map((act, i) => ({
          id: act.id,
          title: act.title,
          image: act.image,
          price: act.price,
          matchScore: 95 - i,
          type: 'activity',
          location: act.location,
          rating: act.rating,
          amenities: act.includes
        }));
      } else {
        mockData = HOLIDAYS.filter(h => h.destination.toLowerCase().includes(toCity.toLowerCase())).map(h => ({ ...h, matchScore: 98 }));
        if (mockData.length === 0) mockData = HOLIDAYS.map(h => ({ ...h, matchScore: 90 }));
      }

      const filterPastDepartures = (items: any[], selectedDate: string) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Only apply time-based filtering if the selected date is today
        if (selectedDate !== todayStr) return items;
        
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        
        return items.filter(item => {
          if (!item.departureTime) return true;
          // Parse "HH:MM" or "HH:MM AM/PM" format
          const timeParts = item.departureTime.match(/(\d+):(\d+)/);
          if (!timeParts) return true;
          let hour = parseInt(timeParts[1]);
          const minute = parseInt(timeParts[2]);
          // Handle AM/PM
          if (item.departureTime.includes('PM') && hour !== 12) hour += 12;
          if (item.departureTime.includes('AM') && hour === 12) hour = 0;
          
          const departureTotalMinutes = hour * 60 + minute;
          
          // Only show departures at least 30 minutes from now
          return departureTotalMinutes >= currentTotalMinutes + 30;
        });
      };

      const departureDateParam = searchParams.get('departure') || '';
      const filteredByTime = filterPastDepartures(mockData, departureDateParam);
      setResults(filteredByTime);
      const maxFound = mockData.length > 0 ? Math.max(...mockData.map(r => r.price)) : 20000;
      setMaxBudget(maxFound + 2000);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [toCity, type, fromCity, updateHistory, departureDateParam, itineraryFrom, itineraryTo, tripType, multiCitySegments]);

  const filteredResults = useMemo(() => {
    let list = [...results];
    
    // Budget Filter
    if (maxBudget !== null) {
      list = list.filter(item => item.price <= maxBudget);
    }

    // Operator Filter
    if (selectedOperators.length > 0) {
      list = list.filter(item => selectedOperators.includes(item.airline || item.title));
    }

    // Stops Filter
    if (selectedStops.length > 0) {
      list = list.filter(item => selectedStops.includes(item.stops));
    }

    // Timing Filter
    if (selectedTiming.length > 0) {
      list = list.filter(item => {
        if (type === 'hotel' || type === 'activity') return true;
        const hour = parseInt(item.departureTime?.split(':')[0] || '0');
        if (selectedTiming.includes('Morning') && hour >= 6 && hour < 12) return true;
        if (selectedTiming.includes('Afternoon') && hour >= 12 && hour < 18) return true;
        if (selectedTiming.includes('Evening') && hour >= 18 && hour < 24) return true;
        if (selectedTiming.includes('Night') && (hour >= 0 && hour < 6)) return true;
        return false;
      });
    }

    // Rating Filter
    if (selectedRatings.length > 0) {
      list = list.filter(item => {
        const itemRating = Math.floor(item.rating || 0);
        return selectedRatings.includes(itemRating);
      });
    }

    // Amenities Filter
    if (selectedAmenities.length > 0) {
      list = list.filter(item => selectedAmenities.every(a => item.amenities?.includes(a)));
    }

    // Sorting
    if (sortBy === 'Price: Low to High') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Match Score') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    }

    return list;
  }, [results, maxBudget, selectedOperators, selectedStops, selectedTiming, selectedRatings, selectedAmenities, sortBy]);

  const minMaxPrices = useMemo(() => {
    if (results.length === 0) return { min: 0, max: 200000 };
    const prices = results.map(r => r.price);
    return { min: Math.min(...prices), max: Math.max(...prices) + 5000 };
  }, [results]);

    const handleSelect = (item: any) => {
    let enrichedItem = { ...item };
    if (type === 'flight') {
      enrichedItem.venue = `${item.from} → ${item.to}`;
      enrichedItem.from_city = item.from;
      enrichedItem.to_city = item.to;
      enrichedItem.travel_date = searchParams.get('departure') || '';
      enrichedItem.show_time = item.departureTime;
    }

    if (type === 'hotel') {
      enrichedItem.venue = item.title + (item.location ? ` — ${item.location}` : '');
      enrichedItem.travel_date = searchParams.get('departure') || '';
      enrichedItem.from_city = item.location || '';
    }

    if (type === 'bus') {
      enrichedItem.venue = `${item.from} → ${item.to}`;
      enrichedItem.from_city = item.from;
      enrichedItem.to_city = item.to;
      enrichedItem.travel_date = searchParams.get('departure') || '';
      enrichedItem.show_time = item.departureTime;
    }

    if (type === 'train') {
      enrichedItem.venue = `${item.from} → ${item.to}`;
      enrichedItem.from_city = item.from;
      enrichedItem.to_city = item.to;
      enrichedItem.travel_date = searchParams.get('departure') || '';
      enrichedItem.show_time = item.departureTime;
    }

    if (type === 'cab') {
      enrichedItem.venue = `${searchParams.get('from') || 'Pune'} → ${searchParams.get('to') || 'Mumbai'}`;
      enrichedItem.from_city = searchParams.get('from') || 'Pune';
      enrichedItem.to_city = searchParams.get('to') || 'Mumbai';
      enrichedItem.travel_date = searchParams.get('departure') || '';
    }

    if (type === 'activity') {
      enrichedItem.venue = item.title + (item.location ? ` — ${item.location}` : '');
      enrichedItem.from_city = item.location || '';
      enrichedItem.travel_date = searchParams.get('departure') || new Date().toISOString().split('T')[0];
    }
    
    if (!user) navigate('/login', { state: { from: location.pathname + location.search, pendingItem: enrichedItem, pendingType: type } });
    else navigate('/booking', { state: { item: enrichedItem, type } });
  };

  const clearFilters = () => {
    setSelectedOperators([]);
    setSelectedStops([]);
    setSelectedTiming([]);
    setSelectedRatings([]);
    setSelectedAmenities([]);
    setMaxBudget(minMaxPrices.max);
    setSortBy('Recommended');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#fcfdfe] dark:bg-gray-950 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] capitalize">
              {type === 'flight' && tripType === 'multi-city' ? 'Multi-city flights' : `${type}s to`}<br />
              <span className="text-indigo-600">{type === 'flight' && tripType === 'multi-city' ? `${itineraryFrom} - ${itineraryTo}` : toCity}</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Dynamic Schedule Calibration — {filteredResults.length} results found
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-sort text-indigo-600"></i> Sort by:
            </span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-white cursor-pointer font-black shadow-sm"
            >
              <option value="Recommended">Recommended</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Match Score">Match Score</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <main className="lg:col-span-3 space-y-10">
            {loading ? (
              [1, 2, 3].map(n => <div key={n} className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse"></div>)
            ) : filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative"
                >
                  {/* Accent border for high match scores */}
                  {item.matchScore > 92 && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>
                  )}

                  <div className="flex flex-col md:flex-row items-center gap-10">
                    
                    <div className="w-full md:w-[240px] shrink-0 flex items-center gap-6">
                      <MatchScore score={item.matchScore} />
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 dark:text-white text-xl leading-tight truncate font-display" title={item.airline || item.title}>
                          {item.airline || item.title}
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 block">{item.segmentLabel || type}</span>
                      </div>
                    </div>
                    
                    {type !== 'hotel' ? (
                      <div className="flex-1 flex items-center justify-between w-full px-6 md:px-10 border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800 py-6 md:py-0">
                        <div className="text-center min-w-[80px]">
                          <div className="text-3xl font-black font-display text-slate-900 dark:text-white">{item.departureTime}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.from || fromCity}</div>
                        </div>
                        <div className="flex-1 px-6 text-center">
                          <div className="h-[2px] bg-slate-100 dark:bg-slate-800 w-full relative">
                             <i className={`fa-solid ${type === 'flight' ? 'fa-plane' : type === 'train' ? 'fa-train' : 'fa-bus'} absolute right-0 -top-2 text-indigo-600 transition-all group-hover:translate-x-2`}></i>
                          </div>
                          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">{item.duration} Journey</div>
                        </div>
                        <div className="text-center min-w-[80px]">
                          <div className="text-3xl font-black font-display text-slate-900 dark:text-white">{item.arrivalTime}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.to || toCity}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between w-full px-6 md:px-10 border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800 py-6 md:py-0">
                        <div className="flex items-center gap-1">
                          {[...Array(Math.max(0, Math.min(5, Math.floor(Number(item.rating) || 0))))].map((_, i) => (
                            <i key={i} className="fa-solid fa-star text-yellow-400 text-sm"></i>
                          ))}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.location || toCity}</div>
                      </div>
                    )}
                    
                    <div className="w-full md:w-44 shrink-0 text-right">
                      {(item.segmentDate ? formatServiceDate(item.segmentDate, type) : formattedServiceDate) && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                          <i className="fa-solid fa-calendar-days"></i>
                          <span>{item.segmentDate ? formatServiceDate(item.segmentDate, type) : formattedServiceDate}</span>
                        </div>
                      )}
                      <div className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tighter">{convertPrice(item.price)}</div>
                      <button onClick={() => handleSelect(item)} className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10 active:scale-95">Select</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-sm relative">
                        <img 
                          src={item.image} 
                          className="w-full h-full object-cover" 
                          alt="Visual" 
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase text-indigo-600 mb-2 tracking-widest">Live Inventory</div>
                        <p className="text-sm font-bold text-slate-500 truncate">{item.amenities?.slice(0, 3).join(' • ') || 'Premium Service'}</p>
                        {(item.segmentDate ? formatServiceDate(item.segmentDate, type) : formattedServiceDate) && (
                          <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.segmentDate ? formatServiceDate(item.segmentDate, type) : formattedServiceDate}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-4">
                      <button onClick={() => setModalState({item, tab: 'info'})} className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700">Details</button>
                      <button onClick={() => setModalState({item, tab: 'policy'})} className="px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800/50">View Policy</button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800">
                <i className="fa-solid fa-filter text-7xl text-slate-200 mb-8 block"></i>
                <h3 className="text-2xl font-black text-slate-400 tracking-tighter">No results within the current filter.</h3>
                <button onClick={clearFilters} className="mt-8 text-indigo-600 font-black text-[11px] uppercase tracking-widest hover:underline">Reset All Filters</button>
              </div>
            )}
          </main>
          
          <aside className="lg:col-span-1 space-y-10">
             <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 sticky top-36 shadow-sm">
                <div className="flex items-center justify-between mb-10 pb-6 border-b dark:border-slate-800">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                         <i className="fa-solid fa-sliders text-sm"></i>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Refine</h2>
                   </div>
                   <button onClick={clearFilters} className="text-[9px] font-black uppercase text-indigo-600 hover:underline">Clear</button>
                </div>

                <div className="mb-12">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Budget Range</h3>
                      <span className="text-base font-black text-indigo-600 font-display">{convertPrice(maxBudget || minMaxPrices.max)}</span>
                   </div>
                   <input 
                     type="range" min={minMaxPrices.min} max={minMaxPrices.max} step={500}
                     value={maxBudget || minMaxPrices.max} onChange={(e) => setMaxBudget(Number(e.target.value))}
                     className="w-full accent-indigo-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between mt-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Min: {convertPrice(minMaxPrices.min)}</span>
                      <span>Max: {convertPrice(minMaxPrices.max)}</span>
                   </div>
                </div>

                <div className="mt-12 pt-10 border-t dark:border-slate-800">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">User Rating</h3>
                    <div className="space-y-4">
                        {[5, 4, 3].map(star => (
                          <label key={star} className="flex items-center gap-4 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={selectedRatings.includes(star)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedRatings([...selectedRatings, star]);
                                else setSelectedRatings(selectedRatings.filter(r => r !== star));
                              }}
                              className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                            />
                            <div className="flex gap-1">
                              {[...Array(Math.max(0, Math.floor(star)))].map((_, i) => (
                                <i key={i} className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                              ))}
                              <span className="text-[10px] font-black text-slate-400 ml-1">& Up</span>
                            </div>
                          </label>
                        ))}
                    </div>
                </div>

                {type === 'hotel' && (
                  <div className="mt-12 pt-10 border-t dark:border-slate-800">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Amenities</h3>
                      <div className="space-y-4">
                         {['Buffet Breakfast', 'Rooftop Pool', 'Luxury Spa', 'Free WiFi', 'Fitness Center', 'Parking', 'Room Service'].map(amenity => (
                           <label key={amenity} className="flex items-center gap-4 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                checked={selectedAmenities.includes(amenity)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedAmenities([...selectedAmenities, amenity]);
                                  else setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                                }}
                                className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{amenity}</span>
                           </label>
                         ))}
                      </div>
                  </div>
                 )}

                 {type === 'flight' && (
                  <>
                    <div className="mt-12 pt-10 border-t dark:border-slate-800">
                       <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Airlines</h3>
                       <div className="space-y-4">
                          {AIRLINES.map(airline => (
                            <label key={airline.name} className="flex items-center gap-4 cursor-pointer group">
                               <input 
                                 type="checkbox" 
                                 checked={selectedOperators.includes(airline.name)}
                                 onChange={(e) => {
                                   if (e.target.checked) setSelectedOperators([...selectedOperators, airline.name]);
                                   else setSelectedOperators(selectedOperators.filter(a => a !== airline.name));
                                 }}
                                 className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                               />
                               <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{airline.name}</span>
                            </label>
                          ))}
                       </div>
                    </div>

                    <div className="mt-12 pt-10 border-t dark:border-slate-800">
                       <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Stops</h3>
                       <div className="space-y-4">
                          {['Non-stop', '1 Stop', '2+ Stops'].map(stop => (
                            <label key={stop} className="flex items-center gap-4 cursor-pointer group">
                               <input 
                                 type="checkbox" 
                                 checked={selectedStops.includes(stop)}
                                 onChange={(e) => {
                                   if (e.target.checked) setSelectedStops([...selectedStops, stop]);
                                   else setSelectedStops(selectedStops.filter(s => s !== stop));
                                 }}
                                 className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                               />
                               <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{stop}</span>
                            </label>
                          ))}
                       </div>
                    </div>
                  </>
                 )}

                 {type === 'bus' && (
                    <>
                      <div className="mt-12 pt-10 border-t dark:border-slate-800">
                         <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Bus Operators</h3>
                         <div className="space-y-4">
                            {BUS_OPERATORS.map(op => (
                              <label key={op.name} className="flex items-center gap-4 cursor-pointer group">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedOperators.includes(op.name)}
                                   onChange={(e) => {
                                     if (e.target.checked) setSelectedOperators([...selectedOperators, op.name]);
                                     else setSelectedOperators(selectedOperators.filter(a => a !== op.name));
                                   }}
                                   className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                                 />
                                 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{op.name}</span>
                              </label>
                            ))}
                         </div>
                      </div>
                      <div className="mt-12 pt-10 border-t dark:border-slate-800">
                         <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Bus Type</h3>
                         <div className="space-y-4">
                            {['AC Sleeper', 'Electric AC', 'Volvo Multi-Axle', 'AC Luxury', 'Non-AC Sleeper'].map(bType => (
                              <label key={bType} className="flex items-center gap-4 cursor-pointer group">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedStops.includes(bType)}
                                   onChange={(e) => {
                                     if (e.target.checked) setSelectedStops([...selectedStops, bType]);
                                     else setSelectedStops(selectedStops.filter(s => s !== bType));
                                   }}
                                   className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                                 />
                                 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{bType}</span>
                              </label>
                            ))}
                         </div>
                      </div>
                    </>
                 )}

                 {type === 'train' && (
                    <>
                      <div className="mt-12 pt-10 border-t dark:border-slate-800">
                         <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Trains</h3>
                         <div className="space-y-4">
                            {TRAINS.map(train => (
                              <label key={train.name} className="flex items-center gap-4 cursor-pointer group">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedOperators.includes(train.name)}
                                   onChange={(e) => {
                                     if (e.target.checked) setSelectedOperators([...selectedOperators, train.name]);
                                     else setSelectedOperators(selectedOperators.filter(a => a !== train.name));
                                   }}
                                   className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                                 />
                                 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{train.name}</span>
                              </label>
                            ))}
                         </div>
                      </div>
                      <div className="mt-12 pt-10 border-t dark:border-slate-800">
                         <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Class</h3>
                         <div className="space-y-4">
                            {['1A', '2A', '3A', 'SL', 'CC', 'EC'].map(tClass => (
                              <label key={tClass} className="flex items-center gap-4 cursor-pointer group">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedStops.includes(tClass)}
                                   onChange={(e) => {
                                     if (e.target.checked) setSelectedStops([...selectedStops, tClass]);
                                     else setSelectedStops(selectedStops.filter(s => s !== tClass));
                                   }}
                                   className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 accent-indigo-600 cursor-pointer"
                                 />
                                 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{tClass}</span>
                              </label>
                            ))}
                         </div>
                      </div>
                    </>
                 )}

                 {(type === 'flight' || type === 'bus' || type === 'train') && (
                    <div className="mt-12 pt-10 border-t dark:border-slate-800">
                       <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Departure Time</h3>
                       <div className="grid grid-cols-2 gap-4">
                          {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                            <button
                              key={time}
                              onClick={() => {
                                if (selectedTiming.includes(time)) setSelectedTiming(selectedTiming.filter(t => t !== time));
                                else setSelectedTiming([...selectedTiming, time]);
                              }}
                              className={`py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedTiming.includes(time) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-indigo-600/30'}`}
                            >
                              {time}
                            </button>
                          ))}
                       </div>
                    </div>
                 )}

                <div className="mt-12 pt-10 border-t dark:border-slate-800">
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8">Travel IQ</h3>
                   <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed italic">
                        "Smart Tip: Mid-day departures for {toCity} are currently showing high match scores."
                      </p>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>

      {modalState && (
        <ServiceDetailsModal 
          item={modalState.item} 
          type={type} 
          initialTab={modalState.tab} 
          onClose={() => setModalState(null)} 
          onSelect={() => handleSelect(modalState.item)}
        />
      )}
    </div>
  );
};

export default SearchResults;
