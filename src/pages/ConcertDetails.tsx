import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star, ArrowRight, Ticket, Users, ShieldCheck, Share2, Heart, Info, ChevronLeft, CreditCard, Gift, CheckCircle2, Music, Loader2 } from 'lucide-react';
import { CONCERTS } from '../constants';
import { useGlobal } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewSystem from '../components/ReviewSystem';
import { supabase } from '../services/supabase';
import { createBookingRecord } from '../services/db';

const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

import Toast from '../components/Toast';

const ConcertDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertPrice, user, useFreeTrial, refreshUser } = useGlobal();
  const [selectedCategory, setSelectedCategory] = useState<'General' | 'VIP' | 'Backstage'>('General');
  const [ticketCount, setTicketCount] = useState(1);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasClaimedFree, setHasClaimedFree] = useState(false);
  const [toastMsg, setToastMsg] = useState<{message:string, type:'success'|'error'|'info'}|null>(null);
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => setToastMsg({message, type});

  const concert = useMemo(() => CONCERTS.find(c => c.id === id), [id]);

  const isFreeDemo = useMemo(() => user?.email?.includes('demo') || user?.email?.includes('test'), [user]);

  React.useEffect(() => {
    const checkFreeClaim = async () => {
      if (!user || !isFreeDemo || !id) return;
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .eq('payment_id', 'demo');
      
      if (data && data.length > 0) {
        setHasClaimedFree(true);
      }
    };
    checkFreeClaim();
  }, [user, isFreeDemo, id]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTrialModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4">Event not found</h1>
          <Link to="/concerts" className="text-indigo-600 font-bold hover:underline">Back to Events</Link>
        </div>
      </div>
    );
  }

  const categoryPrices = {
    General: concert.price,
    VIP: concert.price * 2.5,
    Backstage: concert.price * 5
  };

  const totalPrice = categoryPrices[selectedCategory] * ticketCount;

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.freeTrialUsed && ticketCount === 1 && selectedCategory === 'General') {
      setShowTrialModal(true);
      return;
    }

    setLoading(true);
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    const bookingData = {
      userId: user.id,
      type: 'concert',
      itemId: concert.id,
      title: concert.title,
      poster: concert.image,
      seat: [selectedCategory],
      totalPrice: totalPrice,
      paymentId: null,
      venue: concert.venue,
      travel_date: concert.date,
      show_time: concert.time
    };

    // Demo Mode or isFreeDemo: If no key is present or user is demo, skip payment
    if (!razorpayKey || isFreeDemo) {
      setTimeout(async () => {
        await createBookingRecord({
          ...bookingData,
          paymentId: isFreeDemo ? 'demo' : 'razorpay_simulated'
        });
        await refreshUser();
        setLoading(false);
        setBookingSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      }, 1500);
      return;
    }

    const res = await loadRazorpay();

    if (!res || !(window as any).Razorpay) {
      console.error("Razorpay SDK not loaded");
      setLoading(false);
      return;
    }

    // Fetch order_id from backend
    let orderId = '';
    try {
      const BASE_API_URL = import.meta.env.VITE_API_URL || '';
      const { data: { session } } = await supabase.auth.getSession();
      const orderRes = await fetch(`${BASE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ amount: totalPrice }),
      });
      if (!orderRes.ok) throw new Error('Order creation failed');
      const orderData = await orderRes.json();
      orderId = orderData.orderId;
    } catch (err) {
      console.error('Failed to create Razorpay order:', err);
      setLoading(false);
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      order_id: orderId,
      name: "SykBound",
      description: `Concert Booking: ${concert.title}`,
      image: "/logo.svg",
      handler: async function (response: any) {
        // Verify on backend
        try {
          const BASE_API_URL = import.meta.env.VITE_API_URL || '';
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(`${BASE_API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
        } catch (err) {
          console.error('Payment verification failed:', err);
        }

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
      // FIXED: HANDLE USER EXIT (MODAL CLOSE)
      modal: {
        ondismiss: function () {
          setLoading(false);
          navigate('/payment-failed'); // MUST redirect here
        },
      },
      theme: {
        color: "#4f46e5",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    
    // FIXED: HANDLE PAYMENT FAILURE
    paymentObject.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);
      setLoading(false);
      navigate("/payment-failed");
    });

    paymentObject.open();
  };

  // FIXED: FREE TRIAL NOT BOOKING
  const handleFreeTrial = async () => {
    if (!user) {
      showToast('Login required', 'error');
      return;
    }

    // FIXED: Prevent duplicate claims
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', id);

    if (existing?.length) {
      showToast('Free ticket already claimed', 'info');
      setShowTrialModal(false);
      return;
    }

    const success = await useFreeTrial();
    if (success) {
      const bookingData = {
        user_id: user.id,
        type: 'concert',
        item_id: concert.id,
        title: concert.title,
        poster: concert.image,
        seat: [selectedCategory],
        total_price: 0,
        payment_id: 'free_trial',
        status: 'confirmed',
        created_at: new Date().toISOString()
      };

      // FIXED: SAVE TO SUPABASE
      const { error } = await supabase.from('bookings').insert([bookingData]);

      if (error) {
        console.error(error);
        showToast('Booking failed', 'error');
        return;
      }

      setShowTrialModal(false);
      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden">
        <img 
          src={concert.image} 
          alt={concert.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        
        <div className="absolute top-24 left-0 right-0 px-6 pt-6">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/concerts')}
              className="flex items-center gap-2 text-white/70 hover:text-white font-black text-[10px] uppercase tracking-widest mb-12 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Events
            </button>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
              <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 border border-indigo-400 text-white">
                  <Music className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{concert.category}</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                  {concert.title}
                </h1>
                <div className="flex flex-wrap items-center gap-8 text-white/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Date</p>
                      <p className="text-sm font-black">{concert.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Time</p>
                      <p className="text-sm font-black">{concert.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Venue</p>
                      <p className="text-sm font-black">{concert.venue}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">About the Event</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">
                {concert.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Artist Info</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{concert.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Verified Event</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">SykBound Assured</p>
                  </div>
                </div>
              </div>
            </section>

            <ReviewSystem serviceId={concert.id} serviceType="concert" />
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Select Tickets</h3>
                
                <div className="space-y-4 mb-10">
                  {(['General', 'VIP', 'Backstage'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full p-6 rounded-2xl border transition-all text-left group ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-black uppercase tracking-widest">{cat}</span>
                        <span className={`text-lg font-black ${selectedCategory === cat ? 'text-white' : 'text-indigo-600'}`}>
                          {convertPrice(categoryPrices[cat])}
                        </span>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedCategory === cat ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {cat === 'General' ? 'Standard Entry' : cat === 'VIP' ? 'Front Row + Lounge' : 'Meet & Greet + All Access'}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Quantity</span>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:border-indigo-400 transition-all font-black"
                    >
                      -
                    </button>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{ticketCount}</span>
                    <button 
                      onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:border-indigo-400 transition-all font-black"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-10 px-2">
                  <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Amount</span>
                  <span className="text-3xl font-black text-indigo-600 tracking-tighter">{convertPrice(totalPrice)}</span>
                </div>

                {isFreeDemo ? (
                  <button
                    disabled={loading || hasClaimedFree}
                    onClick={handlePayment}
                    className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : hasClaimedFree ? (
                      'Already Claimed Free'
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Claim Free Ticket
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled={loading}
                    onClick={handlePayment}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay {convertPrice(totalPrice)} via Razorpay
                      </>
                    )}
                  </button>
                )}

                <p className="text-[10px] text-slate-400 font-bold text-center mt-6 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" />
                  Secure Checkout via Razorpay
                </p>
              </div>

              {!user?.freeTrialUsed && (
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-black mb-2">First Event Free?</h4>
                    <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                      Claim your one-time free trial for a General category ticket. Experience SykBound for free!
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
                Your tickets for <span className="text-white font-black">{concert.title}</span> have been secured. Redirecting to your dashboard...
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
              {/* FIXED: Close button */}
              <div className="absolute top-6 right-8">
                <button onClick={() => setShowTrialModal(false)} className="text-slate-400 hover:text-red-500 text-2xl font-bold transition-colors">
                  ×
                </button>
              </div>

              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <Gift className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Unlock Free Trial</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
                You're about to use your one-time free trial for this event. This will cover the cost of <span className="text-indigo-600 font-black">1 General ticket</span>.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleFreeTrial}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-600/20"
                >
                  Claim Free Ticket
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

export default ConcertDetails;
