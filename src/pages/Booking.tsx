
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { createBookingRecord, saveTripPlan } from '../services/db';
import { supabase } from '../services/supabase';
import SeatSelector from '../components/SeatSelector';
import { SmartPackingList, TripCostBreakdown } from '../components/PlanningWidgets';
import { Tag, ShieldCheck, CreditCard, ChevronLeft } from 'lucide-react';
import { calcConvenienceFee } from '../constants';

const loadRazorpay = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

import Toast from '../components/Toast';

const Booking: React.FC<{onShowToast: any}> = ({ onShowToast }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { convertPrice, user, refreshUser } = useGlobal();
  const [step, setStep] = useState(1);
  const [usePoints, setUsePoints] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [hasClaimedFree, setHasClaimedFree] = useState(false);
  const [freeAvailable, setFreeAvailable] = useState(false);
  const [toastMsg, setToastMsg] = useState<{message:string, type:'success'|'error'|'info'}|null>(null);
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => setToastMsg({message, type});
  
  const { item, type } = state || {};

  const isFreeDemo = useMemo(() => user?.email?.includes('demo') || user?.email?.includes('test'), [user]);

  useEffect(() => {
    const checkFree = async () => {
      if (!user || type !== 'movie' || !item?.id) return;
      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', item.id)
        .eq('is_free', true)
        .gte('created_at', today);

      setFreeAvailable(!(data && data.length > 0));
    };

    if (user && type === 'movie') checkFree();
  }, [user, item, type]);

  useEffect(() => {
    const checkFreeClaim = async () => {
      if (!user || !isFreeDemo || !item?.id) return;
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .eq('payment_id', 'demo');
      
      if (data && data.length > 0) {
        setHasClaimedFree(true);
      }
    };
    checkFreeClaim();
  }, [user, isFreeDemo, item]);

  useEffect(() => {
    // FIX 1: Skip seat selection if already done in Buses.tsx
    if (type === 'bus' && item?.seats && step === 1) {
      setStep(2);
    }

    const claimed = sessionStorage.getItem('skybound_claimed_coupon');
    if (claimed) {
      try {
        const coupon = JSON.parse(claimed);
        // Check if coupon is still valid (e.g., within 24 hours)
        if (Date.now() - coupon.timestamp < 24 * 60 * 60 * 1000) {
          setAppliedCoupon(coupon);
          onShowToast(`Coupon ${coupon.code} auto-applied!`, "success");
        }
      } catch (e) {
        console.error("Error parsing claimed coupon", e);
      }
    }
  }, []);

  if (!item) return <div className="pt-40 text-center font-black text-slate-400">Path Error: No item selected.</div>;

  const convenienceFee = calcConvenienceFee(item.distance_km || 0, type);
  const basePrice = item.price + convenienceFee;
  
  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'FLASHBUS40' && type === 'bus') {
      discount = basePrice * 0.40;
    } else if (appliedCoupon.code === 'FIRSTHOTEL500' && type === 'hotel') {
      discount = Math.min(500, basePrice);
    } else if (appliedCoupon.code === 'ZEROTRAIN' && type === 'train') {
      discount = convenienceFee; // Zero convenience fee
    }
  }

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.toUpperCase().trim();
    if (!code) return;

    let valid = false;
    let desc = '';
    
    if (code === 'FLASHBUS40' && type === 'bus') {
      valid = true;
      desc = '40% OFF on Buses';
    } else if (code === 'FIRSTHOTEL500' && type === 'hotel') {
      valid = true;
      desc = 'Flat ₹500 OFF on Hotels';
    } else if (code === 'ZEROTRAIN' && type === 'train') {
      valid = true;
      desc = 'Zero Convenience Fee';
    }

    if (valid) {
      setAppliedCoupon({ code, desc, timestamp: Date.now() });
      onShowToast(`Coupon ${code} applied!`, "success");
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code for this service.');
    }
  };

  const pointsValue = usePoints ? Math.min(user?.skyPoints || 0, basePrice - discount) : 0;
  const walletValue = useWallet ? Math.min(user?.walletBalance || 0, basePrice - discount - pointsValue) : 0;
  const finalPrice = basePrice - discount - pointsValue - walletValue;

  const handlePayment = async () => {
    setLoading(true);
    
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    const bookingData = {
      userId: user?.id || 'guest',
      type,
      itemId: item.id,
      title: item.title || item.operator || item.name || item.airline || 'SykBound Service',
      poster: item.poster || item.image || item.logo || item.operatorLogo || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600',
      seat: selectedSeat ? [selectedSeat] : [],
      totalPrice: finalPrice,
      walletDeduction: walletValue,
      paymentId: null,
      venue: item.venue,
      travel_date: item.travel_date,
      show_time: item.show_time,
      from_city: item.from_city,
      to_city: item.to_city
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
        navigate("/payment-success");
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
        body: JSON.stringify({ amount: finalPrice }),
      });
      if (!orderRes.ok) throw new Error('Order creation failed');
      const orderData = await orderRes.json();
      orderId = orderData.orderId;
    } catch (err) {
      console.error('Failed to create Razorpay order:', err);
      setLoading(false);
      onShowToast('Payment initialization failed. Please try again.', 'error');
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      order_id: orderId,
      name: "SykBound",
      description: "Booking Payment",
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
        navigate("/payment-success");
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

    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if already claimed today for this movie
      if (type === 'movie') {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .eq('movie_id', item.id)
          .eq('is_free', true)
          .gte('created_at', today);

        if (data && data.length > 0) {
          showToast('Free ticket already claimed today', 'info');
          setLoading(false);
          setFreeAvailable(false);
          return;
        }
      }

      // Create booking
      const { error } = await supabase.from('bookings').insert([{
        user_id: user.id,
        type,
        item_id: item.id,
        movie_id: type === 'movie' ? item.id : null,
        title: item.title || item.operator || item.name || item.airline || 'SykBound Service',
        poster: item.poster || item.image || item.logo || item.operatorLogo || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600',
        seat: selectedSeat ? [selectedSeat] : [],
        total_price: 0,
        payment_id: type === 'movie' ? 'FREE_DAILY' : 'FREE_DEMO',
        status: 'confirmed',
        is_free: true,
        venue: item.venue,
        travel_date: item.travel_date,
        show_time: item.show_time,
        from_city: item.from_city,
        to_city: item.to_city,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      await refreshUser();
      setLoading(false);
      navigate('/payment-success');
    } catch (err) {
      console.error('Free booking failed:', err);
      setLoading(false);
      showToast('Free booking failed. Please try again.', 'error');
    }
  };

  const handleSaveToVault = async () => {
    if (!user) {
      onShowToast("Please sign in to save plans to your vault.", "info");
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setLoading(true);
    await saveTripPlan({
      userId: user.id,
      title: `${type.toUpperCase()} to ${item.to || item.destination}`,
      destination: item.to || item.destination,
      budget: finalPrice,
      items: [item]
    });
    setLoading(false);
    onShowToast("Plan saved to your vault!", "info");
    navigate('/dashboard');
  };

  const isTransport = ['bus', 'train', 'flight'].includes(type);

  const LoginCTA = ({ message }: { message: string }) => (
    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-10 rounded-[3rem] text-center">
      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mx-auto mb-6 shadow-lg">
        <i className="fa-solid fa-lock"></i>
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Member Privilege</h3>
      <p className="text-sm font-medium text-slate-500 mb-8">{message}</p>
      <button 
        onClick={() => navigate('/login', { state: { from: location.pathname + location.search } })}
        className="azure-btn px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
      >
        Sign In to Unlock
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#fcfdfe] dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
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

        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-16 px-10 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 ${step >= s ? 'azure-btn' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300'}`}>
                {s < step ? <i className="fa-solid fa-check"></i> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-[2px] mx-4 ${step > s ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            {step === 1 && (
              <div className="animate-fade-up">
                {isTransport ? (
                  user ? (
                    <>
                      <SeatSelector type={type} onSelect={setSelectedSeat} selectedSeat={selectedSeat} />
                      <div className="mt-12 flex justify-end">
                        <button 
                          onClick={() => setStep(2)} 
                          disabled={!selectedSeat && type !== 'flight'} 
                          className="azure-btn px-16 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                        >
                          Confirm Selection
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-8">
                      <div className="opacity-40 pointer-events-none grayscale">
                        <SeatSelector type={type} onSelect={() => {}} selectedSeat={null} />
                      </div>
                      <LoginCTA message="Seat selection is only available for SkyBound members. Sign in to choose your favorite spot!" />
                      <div className="flex justify-center mt-8">
                        <button onClick={() => setStep(2)} className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">Continue as Guest (Auto-assigned Seat)</button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="py-20 text-center">
                    <h2 className="text-3xl font-black tracking-tighter mb-8">Ready to book your {type}?</h2>
                    <button onClick={() => setStep(2)} className="azure-btn px-16 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl">Continue to Review</button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-up space-y-12">
                <h2 className="text-4xl font-black tracking-tighter">Review & Rewards</h2>
                <div className="glass p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-8 pb-8 border-b dark:border-slate-800">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{item.airline || item.title}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Order Summary</p>
                    </div>
                    <div className="text-2xl font-black text-blue-600">{convertPrice(item.price)}</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                      <span>Convenience Fee</span>
                      <span>{convertPrice(convenienceFee)}</span>
                    </div>
                    {appliedCoupon && discount > 0 && (
                      <div className="flex justify-between items-center text-sm font-black text-green-600">
                        <span className="flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          Coupon Applied ({appliedCoupon.code})
                        </span>
                        <span>-{convertPrice(discount)}</span>
                      </div>
                    )}
                    
                    {/* Manual Coupon Input */}
                    {!appliedCoupon && (
                      <div className="pt-4 space-y-2">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Enter Coupon Code"
                            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                          />
                          <button 
                            onClick={handleApplyCoupon}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-[10px] font-bold text-red-500 ml-2">{couponError}</p>}
                      </div>
                    )}

                    <div className="flex justify-between text-2xl font-black pt-8 border-t dark:border-slate-800 text-slate-900 dark:text-white">
                      <span>Total Pay</span>
                      <span className="text-blue-600">{convertPrice(finalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button onClick={() => setStep(3)} className="azure-btn flex-1 py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl">Secure Checkout</button>
                  <button 
                    onClick={handleSaveToVault} 
                    className="flex-1 py-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {!user && <i className="fa-solid fa-lock text-[9px] opacity-40"></i>}
                    Save to Vault
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-up py-10">
                <h2 className="text-4xl font-black mb-8 tracking-tighter text-center">Authorize Payment</h2>
                <div className="max-w-md mx-auto glass p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
                      <CreditCard className="w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-medium">You are paying <span className="font-black text-slate-900 dark:text-white">{convertPrice(finalPrice)}</span> for your booking.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {freeAvailable && (
                      <button 
                        onClick={handleFreeTicket}
                        disabled={loading}
                        className="azure-btn w-full py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Tag className="w-5 h-5" />
                            🎟 Claim Free Ticket (Today Only)
                          </>
                        )}
                      </button>
                    )}
                    
                    <button 
                      onClick={handlePayment}
                      disabled={loading}
                      className="azure-btn w-full py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="w-5 h-5" />
                            Pay {convertPrice(finalPrice)} via Razorpay
                          </>
                        )}
                      </button>
                    <button 
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className="w-full py-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      Go Back
                    </button>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                    <i className="fa-solid fa-lock text-indigo-600"></i>
                    256-bit Secure Encryption
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-20 animate-fade-up">
                <div className="w-32 h-32 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner"><i className="fa-solid fa-check"></i></div>
                <h1 className="text-5xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white">Confirmed!</h1>
                <p className="text-slate-500 font-medium max-w-xs mx-auto mb-12">Your journey is now architected. Check your dashboard for the electronic ticket.</p>
                <div className="flex justify-center gap-6 mt-12">
                  <button onClick={() => navigate('/dashboard')} className="azure-btn px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Manage Trip</button>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-5 space-y-10">
            <TripCostBreakdown total={finalPrice} />
            {/* Fix: use item.to or item.destination instead of the undefined toCity variable */}
            <SmartPackingList destination={item.to || item.destination || 'Selected Destination'} type={type} />
          </aside>
        </div>
      </div>

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

export default Booking;
