import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Clock, MapPin, ShieldCheck, Zap, CreditCard, Gift, CheckCircle2, Calendar, Info, Sparkles, Loader2 } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewSystem from '../components/ReviewSystem';
import { createBookingRecord } from '../services/db';
import Toast from '../components/Toast';

const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const SERVICES = [
  {
    id: 's1',
    title: 'Elite Spa & Wellness',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1544161515-4508f5ad4c14?auto=format&fit=crop&q=80&w=1200',
    rating: 4.9,
    reviews: 128,
    price: 2500,
    duration: '90 min',
    location: 'Bandra, Mumbai',
    description: 'A premium spa experience with traditional and modern therapies. Our expert therapists use organic oils and advanced techniques to ensure complete relaxation and rejuvenation.',
    features: ['Aromatherapy', 'Deep Tissue Massage', 'Steam & Sauna', 'Organic Refreshments'],
    slots: ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM']
  },
  {
    id: 's2',
    title: 'Iron Paradise Gym',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200',
    rating: 4.8,
    reviews: 256,
    price: 1200,
    duration: 'Day Pass',
    location: 'Juhu, Mumbai',
    description: 'State-of-the-art equipment and professional personal training. Access to all gym zones, including cardio, strength, and functional training areas.',
    features: ['Modern Equipment', 'Personal Trainers', 'Locker Room', 'Protein Bar'],
    slots: ['Morning Pass', 'Afternoon Pass', 'Evening Pass', 'All Day Pass']
  },
  {
    id: 's3',
    title: 'The Hive Coworking',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=1200',
    rating: 4.7,
    reviews: 89,
    price: 800,
    duration: 'Day Pass',
    location: 'BKC, Mumbai',
    description: 'Premium workspace with high-speed internet and gourmet coffee. Designed for productivity and networking in a professional environment.',
    features: ['High-speed WiFi', 'Meeting Rooms', 'Phone Booths', 'Gourmet Coffee'],
    slots: ['Full Day', 'Half Day (Morning)', 'Half Day (Afternoon)']
  },
  {
    id: 's4',
    title: 'Skyline Rooftop Dining',
    category: 'Dining',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200',
    rating: 4.9,
    reviews: 512,
    price: 3500,
    duration: 'Table Booking',
    location: 'Worli, Mumbai',
    description: 'Exquisite fine dining with a panoramic view of the city skyline. Enjoy a curated menu of international cuisines prepared by award-winning chefs.',
    features: ['Panoramic View', 'Live Music', 'Valet Parking', 'Curated Wine List'],
    slots: ['07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM']
  }
];

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertPrice, user, useFreeTrial, refreshUser } = useGlobal();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{message:string,type:'success'|'error'|'info'}|null>(null);
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => setToastMsg({message, type});

  const service = useMemo(() => SERVICES.find(s => s.id === id), [id]);

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Service not found</div>;
  }

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.freeTrialUsed) {
      setShowTrialModal(true);
      return;
    }

    setLoading(true);
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY;

    const bookingData = {
      userId: user.id,
      type: 'service',
      itemId: service.id,
      title: service.title,
      poster: service.image,
      totalPrice: service.price,
      details: {
        type: 'service',
        itemId: service.id,
        slot: selectedSlot,
        serviceTitle: service.title,
        location: service.location,
        duration: service.duration
      },
      venue: service.title,
      show_time: selectedSlot,
      travel_date: new Date().toISOString().split('T')[0],
      paymentId: null
    };

    // Demo Mode: If no key is present, simulate success
    if (!razorpayKey) {
      setTimeout(async () => {
        await createBookingRecord(bookingData);
        await refreshUser();
        setLoading(false);
        setBookingSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      }, 1500);
      return;
    }

    const res = await loadRazorpay();

    if (!res || !(window as any).Razorpay) {
      showToast('Payment SDK failed to load. Please refresh.', 'error');
      setLoading(false);
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(service.price * 100),
      currency: "INR",
      name: "SykBound",
      description: `Service Booking: ${service.title}`,
      image: "/logo.svg",
      handler: async function (response: any) {
        const finalBookingData = {
          ...bookingData,
          paymentId: response.razorpay_payment_id
        };
        await createBookingRecord(finalBookingData);
        await refreshUser();
        setLoading(false);
        setBookingSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      },
      modal: {
        ondismiss: async () => {
          setLoading(false);
          navigate("/payment-failed");
        },
      },
      theme: {
        color: "#4f46e5",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    
    paymentObject.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);
      navigate("/payment-failed");
    });

    paymentObject.open();
  };

  const confirmTrialBooking = async () => {
    setIsBooking(true);
    const success = await useFreeTrial();
    if (success) {
      await createBookingRecord({
        userId: user?.id,
        type: 'service',
        itemId: service.id,
        title: service.title,
        poster: service.image,
        totalPrice: 0,
        details: {
          type: 'service',
          itemId: service.id,
          slot: selectedSlot,
          serviceTitle: service.title,
          location: service.location,
          duration: service.duration
        },
        venue: service.title,
        show_time: selectedSlot,
        travel_date: new Date().toISOString().split('T')[0],
        paymentId: 'free_trial_' + Date.now()
      });
      setTimeout(() => {
        setIsBooking(false);
        setBookingSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      }, 1500);
    } else {
      setIsBooking(false);
      showToast('Free trial booking failed. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-12 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="aspect-video rounded-[4rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl relative">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544161515-4508f5ad4c14?q=80&w=1200'; }}
              />
              <div className="absolute top-10 left-10 px-6 py-3 bg-white/95 backdrop-blur-md rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-xl">
                {service.category}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{service.title}</h1>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-black">{service.rating}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-400">({service.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-bold">{service.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-bold">{service.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <Info className="w-5 h-5 text-indigo-600" />
                  About the Service
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-lg">
                  {service.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-slate-700 dark:text-white fill-current" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Available Slots
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {service.slots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedSlot === slot
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ReviewSystem serviceId={service.id} serviceType="service" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="text-center mb-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Price</span>
                  <h2 className="text-5xl font-black text-indigo-600 tracking-tighter">{convertPrice(service.price)}</h2>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-400">Service</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{service.title}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-sm font-bold text-slate-400">Selected Slot</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedSlot || 'Not Selected'}</span>
                  </div>
                </div>

                <button
                  disabled={!selectedSlot || loading || isBooking}
                  onClick={handlePayment}
                  className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                    !selectedSlot || loading || isBooking
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'
                  }`}
                >
                  {loading || isBooking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay {convertPrice(service.price)} via Razorpay
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 font-bold text-center mt-6 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" />
                  Secure Payment via Razorpay
                </p>
              </div>

              {!user?.freeTrialUsed && (
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-black mb-2">Try it for Free!</h4>
                    <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                      New to SykBound? Enjoy your first service booking on us. No credit card required for your first booking.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      Trial Available
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {bookingSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-600 backdrop-blur-xl"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative text-center text-white"
            >
              <div className="w-32 h-32 bg-white/20 rounded-[3rem] flex items-center justify-center mx-auto mb-10">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-6">Booking Confirmed!</h2>
              <p className="text-indigo-100 text-xl font-medium mb-12 max-w-md mx-auto">
                Your booking for <span className="text-white font-black">{service.title}</span> has been secured. Redirecting to your dashboard...
              </p>
              <div className="w-12 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="w-full h-full bg-white"
                ></motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Razorpay integration handled in handlePayment */}

      {/* Trial Modal */}
      <AnimatePresence>
        {showTrialModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTrialModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Gift className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Unlock Free Trial</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                You're about to use your one-time free trial for this booking. This will cover the <span className="text-indigo-600 font-black">entire cost</span> of the service.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={confirmTrialBooking}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-600/20"
                >
                  Claim Free Service
                </button>
                <button 
                  onClick={() => setShowTrialModal(false)}
                  className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Pay via Razorpay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toastMsg && (
        <Toast 
          message={toastMsg.message} 
          type={toastMsg.type} 
          onClose={() => setToastMsg(null)} 
        />
      )}
    </div>
  );
};

export default ServiceDetails;
