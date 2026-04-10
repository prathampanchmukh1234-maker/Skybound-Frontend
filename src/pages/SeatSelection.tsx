import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Armchair, ShieldCheck, Zap, CreditCard, Gift, CheckCircle2, Loader2, Calendar, Tag, MapPin, Clock } from 'lucide-react';
import { SHOWTIMES, MOVIES, THEATERS } from '../constants';
import { createBookingRecord } from '../services/db';
import { useGlobal } from '../context/GlobalContext';
import { motion, AnimatePresence } from 'framer-motion';
import SeatSelector from '../components/SeatSelector';
import { supabase } from '../services/supabase';

const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

import Toast from '../components/Toast';

const SeatSelection: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const { convertPrice, user, useFreeTrial, refreshUser } = useGlobal();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasClaimedFree, setHasClaimedFree] = useState(false);
  const [freeAvailable, setFreeAvailable] = useState(false);
  const [toastMsg, setToastMsg] = useState<{message:string, type:'success'|'error'|'info'}|null>(null);
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => setToastMsg({message, type});

  const showtime = useMemo(() => SHOWTIMES.find(s => s.id === showtimeId), [showtimeId]);
  const movie = useMemo(() => MOVIES.find(m => m.id === showtime?.movieId), [showtime]);
  const theater = useMemo(() => THEATERS.find(t => t.id === showtime?.theaterId), [showtime]);

  const isFreeDemo = useMemo(() => user?.email?.includes('demo') || user?.email?.includes('test'), [user]);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!showtimeId) return;
      const { data, error } = await supabase
        .from('bookings')
        .select('seat')
        .eq('item_id', showtimeId)
        .eq('status', 'confirmed');
      
      if (data) {
        const allBooked = data.flatMap(b => b.seat || []);
        setBookedSeats(allBooked);
      }
    };

    fetchBookedSeats();

    // Real-time subscription for seat updates
    const channel = supabase
      .channel(`seats-${showtimeId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'bookings',
        filter: `item_id=eq.${showtimeId}`
      }, (payload) => {
        if (payload.new && payload.new.status === 'confirmed') {
          setBookedSeats(prev => [...prev, ...(payload.new.seat || [])]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showtimeId]);

  useEffect(() => {
    const run = async () => {
      if (!user || !movie) return;
      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', movie.id)
        .eq('is_free', true)
        .gte('created_at', today);

      setFreeAvailable(!(data && data.length > 0));
    };

    if (user) run();
  }, [user, movie]);

  useEffect(() => {
    const checkFreeClaim = async () => {
      if (!user || !isFreeDemo || !showtimeId) return;
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', showtimeId)
        .eq('payment_id', 'demo');
      
      if (data && data.length > 0) {
        setHasClaimedFree(true);
      }
    };
    checkFreeClaim();
  }, [user, isFreeDemo, showtimeId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTrialModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const isComingSoon = useMemo(() => {
    if (!movie?.releaseDate) return false;
    const today = new Date();
    const release = new Date(movie.releaseDate);
    return release > today;
  }, [movie]);

  if (!showtime || !movie || !theater) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = Array.from({ length: 14 }, (_, i) => i + 1);

  const getSeatPrice = (seatId: string) => {
    const row = seatId.charAt(0);
    // FIXED: Row-based pricing logic
    // FRONT (cheap)
    if (['A', 'B', 'C'].includes(row)) return showtime.basePrice;
    // MIDDLE (best view)
    if (['D', 'E', 'F'].includes(row)) return showtime.basePrice + 80;
    // BACK (premium)
    if (['G', 'H'].includes(row)) return showtime.basePrice + 150;
    
    return showtime.basePrice;
  };

  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((acc, seatId) => {
      return acc + getSeatPrice(seatId);
    }, 0);
  }, [selectedSeats, showtime.basePrice]);

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // FIXED: Validation before booking
    if (!selectedSeats.length) {
      showToast('Please select seats', 'error');
      return;
    }

    if (!user.freeTrialUsed && selectedSeats.length === 1) {
      setShowTrialModal(true);
      return;
    }

    // FIXED: Double booking prevention
    const { data: latestBookings } = await supabase
      .from('bookings')
      .select('seat')
      .eq('item_id', showtimeId)
      .eq('status', 'confirmed');
    
    const currentlyBooked = latestBookings?.flatMap(b => b.seat || []) || [];
    const isAnySeatTaken = selectedSeats.some(s => currentlyBooked.includes(s));

    if (isAnySeatTaken) {
      showToast('One or more selected seats are already booked. Please choose different seats.', 'error');
      // Refresh booked seats
      setBookedSeats(currentlyBooked);
      setLoading(false);
      return;
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    const bookingData = {
      userId: user.id,
      type: 'movie',
      itemId: showtimeId,
      title: movie.title,
      poster: movie.poster,
      seat: selectedSeats,
      totalPrice: totalPrice,
      paymentId: null,
      venue: theater.name,
      travel_date: showtime.date,
      show_time: showtime.time
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
      description: `Movie Booking: ${movie.title}`,
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

  // FIXED: 1 FREE TICKET PER DAY PER MOVIE
  const handleFreeTicket = async () => {
    if (!user) {
      showToast('Login required', 'error');
      return;
    }

    if (!selectedSeats.length) {
      showToast('Select seats first', 'error');
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if already claimed today for this movie
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', movie.id)
        .eq('is_free', true)
        .gte('created_at', today);

      if (data && data.length > 0) {
        showToast('Free ticket already claimed today', 'info');
        setLoading(false);
        setFreeAvailable(false);
        return;
      }

      // Create booking
      const { error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        type: 'movie',
        item_id: showtimeId,
        movie_id: movie.id,
        showtime_id: showtime.id,
        title: movie.title,
        poster: movie.poster,
        seat: selectedSeats,
        total_price: 0,
        payment_id: 'FREE_DAILY',
        status: 'confirmed',
        is_free: true,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      await refreshUser();
      setLoading(false);
      setBookingSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error('Free booking failed:', err);
      setLoading(false);
      showToast('Free booking failed. Please try again.', 'error');
    }
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
      .eq('item_id', showtimeId);

    if (existing?.length) {
      showToast('Free ticket already claimed', 'info');
      setShowTrialModal(false);
      return;
    }

    // FIXED: Double booking prevention
    const { data: latestBookings } = await supabase
      .from('bookings')
      .select('seat')
      .eq('item_id', showtimeId)
      .eq('status', 'confirmed');
    
    const currentlyBooked = latestBookings?.flatMap(b => b.seat || []) || [];
    const isAnySeatTaken = selectedSeats.some(s => currentlyBooked.includes(s));

    if (isAnySeatTaken) {
      showToast('One or more selected seats are already booked. Please choose different seats.', 'error');
      setBookedSeats(currentlyBooked);
      setIsBooking(false);
      return;
    }

    setIsBooking(true);
    const success = await useFreeTrial();
    if (success) {
      const bookingData = {
        user_id: user.id,
        type: 'movie',
        item_id: showtimeId,
        movie_id: movie.id,
        showtime_id: showtime.id,
        title: movie.title,
        poster: movie.poster,
        seat: selectedSeats,
        total_price: 0,
        payment_id: 'free_trial',
        status: 'confirmed',
        is_free: true,
        venue: theater.name,
        travel_date: showtime.date,
        show_time: showtime.time,
        created_at: new Date().toISOString()
      };

      // FIXED: SAVE TO SUPABASE
      const { error } = await supabase.from('bookings').insert([bookingData]);

      if (error) {
        console.error(error);
        showToast('Booking failed', 'error');
        setIsBooking(false);
        return;
      }

      await refreshUser();
      setTimeout(() => {
        setIsBooking(false);
        navigate('/payment-success');
      }, 1500);
    } else {
      setIsBooking(false);
      showToast('Failed to process free trial. Please try again.', 'error');
    }
  };

  const handleFreeDemoClaim = async () => {
    if (hasClaimedFree) return;
    setLoading(true);
    try {
      await createBookingRecord({
        userId: user?.id,
        type: 'movie',
        itemId: showtimeId,
        title: movie.title,
        poster: movie.poster,
        seat: selectedSeats,
        totalPrice: 0,
        paymentId: 'demo'
      });
      setBookingSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(movie ? `/movies/${movie.id}` : '/movies')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-12 transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {movie?.title || 'Movies'}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <SeatSelector 
                type="movie"
                onSelect={toggleSeat}
                selectedSeat={null}
                selectedSeats={selectedSeats}
                bookedSeats={bookedSeats}
                showtime={showtime}
                convertPrice={convertPrice}
              />

              <div className="flex flex-wrap justify-center gap-8 mt-16 pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-800"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reserved</span>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recliner</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prime</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Classic</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'; }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{showtime.format}</p>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{showtime.screen}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Armchair className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-500">Selected Seats</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-500">Total Price</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-indigo-600">{convertPrice(totalPrice)}</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Starting from ₹{showtime.basePrice}</p>
                    </div>
                  </div>
                </div>

                {freeAvailable && (
                  <button
                    disabled={selectedSeats.length === 0 || loading}
                    onClick={handleFreeTicket}
                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 mb-4 ${
                      selectedSeats.length === 0 || loading
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/20'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Tag className="w-4 h-4" />
                        🎟 Claim Free Ticket (Today Only)
                      </>
                    )}
                  </button>
                )}

                <button
                  disabled={selectedSeats.length === 0 || loading || isBooking}
                  onClick={handlePayment}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                    selectedSeats.length === 0 || loading || isBooking
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'
                  }`}
                >
                    {loading || isBooking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay {convertPrice(totalPrice)} via Razorpay
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
                    <h4 className="text-lg font-black mb-2">First Ticket is Free!</h4>
                    <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                      New to SykBound? Enjoy your first movie ticket on us. No credit card required for your first booking.
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
                Your tickets for <span className="text-white font-black">{movie.title}</span> have been secured. Redirecting to your dashboard...
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
                You're about to use your one-time free trial for this booking. This will cover the cost of <span className="text-indigo-600 font-black">1 ticket</span>.
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

export default SeatSelection;
