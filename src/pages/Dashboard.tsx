
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getStoredBookings, getTripPlans, cancelBooking, deleteTripPlan } from '../services/db';
import { useGlobal } from '../context/GlobalContext';
import ETicketModal from '../components/ETicketModal';
import { Booking, User, TripPlan } from '../types';
import { supabase } from '../services/supabase';
import { formatBookingDate, getBookingDisplayTime, getBookingExperienceDisplay, getBookingVenueInfo } from '../utils/ticketUtils';

const Dashboard: React.FC<{onShowToast: any}> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const { convertPrice, user: globalUser, loadingAuth, isSyncing, refreshUser } = useGlobal();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);

  const getSeatDisplay = (booking: Booking) =>
    Array.isArray(booking.seat) ? booking.seat.join(', ') : (booking.seat || 'Standard');

  useEffect(() => {
    if (loadingAuth || isSyncing) return;
    
    if (!globalUser) {
      navigate('/login', { state: { from: '/dashboard' } });
      return;
    }

    const fetch = async () => {
      if (!globalUser) return;
      
      // FIXED: DASHBOARD NOT SHOWING BOOKINGS
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', globalUser.id)
        .order('created_at', { ascending: false });
      
      setBookings(bookingsData || []);
      
      const savedPlans = await getTripPlans(globalUser.id);
      setPlans(savedPlans);
      setLoading(false);
    };
    
    if (globalUser) {
      fetch();
    }
  }, [globalUser, loadingAuth, isSyncing, navigate]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const refund = await cancelBooking(bookingId);
      onShowToast(`Booking cancelled. Refund of ${convertPrice(refund)} initiated.`, "success");
      
      // Refresh global user state to update wallet balance in UI
      await refreshUser();
      
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', globalUser?.id)
        .order('created_at', { ascending: false });
      setBookings(bookingsData || []);
      setCancellingBooking(null);
    } catch (error: any) {
      onShowToast(error.message, "error");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteTripPlan(planId);
      onShowToast("Trip plan removed from vault", "success");
      const savedPlans = await getTripPlans(globalUser?.id || 'demo');
      setPlans(savedPlans);
    } catch (error: any) {
      onShowToast("Failed to remove plan", "error");
    }
  };

  if (loadingAuth || loading) return (
    <div className="min-h-screen pt-40 flex flex-col items-center justify-center bg-[#fcfdfe] dark:bg-slate-950">
      <div className="w-16 h-16 azure-btn rounded-2xl flex items-center justify-center animate-bounce shadow-2xl mb-6 text-white text-2xl">
        <i className="fa-solid fa-paper-plane"></i>
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400 animate-pulse">
        Synchronizing Journeys...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#fcfdfe] dark:bg-slate-950 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl azure-btn flex items-center justify-center text-3xl shadow-xl">👤</div>
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 block">{globalUser?.tier || 'Standard'} Member</span>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{globalUser?.name}</h1>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-[9px] font-black text-indigo-600 uppercase border border-indigo-100 dark:border-indigo-800">
                <i className="fa-solid fa-brain"></i> Persona: Strategic Traveler
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="glass px-8 py-4 rounded-[2rem] border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-1">SkyPoints</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{globalUser?.skyPoints || 0}</div>
             </div>
             <div className="glass px-8 py-4 rounded-[2rem] border border-slate-100">
                <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Wallet Balance</div>
                <div className="text-xl font-black text-indigo-600">{convertPrice(globalUser?.walletBalance || 0)}</div>
             </div>
             <button onClick={() => navigate('/group-planner')} className="glass px-8 py-4 rounded-[2rem] border border-slate-100 hover:border-blue-500 transition-all flex items-center gap-3">
                <i className="fa-solid fa-users text-blue-600"></i>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Group Planner</span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h3 className="font-black text-lg uppercase tracking-widest text-slate-900 dark:text-white mb-10">Active Timeline</h3>
              <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-6 pl-12 space-y-12">
                {bookings.filter(b => b.status === 'confirmed').length > 0 ? (
                  bookings.filter(b => b.status === 'confirmed').map((b) => (
                    <div key={b.id} className="relative group">
                      {(() => {
                        const venueInfo = getBookingVenueInfo(b);
                        const bookingTime = getBookingDisplayTime(b);
                        const bookingExperience = getBookingExperienceDisplay(b);
                        return (
                          <>
                      <div className="absolute -left-[61px] top-0 w-12 h-12 rounded-2xl azure-btn flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110 overflow-hidden">
                        {b.poster ? (
                          <img src={b.poster} alt={b.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          b.type === 'flight' ? '✈️' : b.type === 'hotel' ? '🏨' : b.type === 'movie' ? '🎬' : b.type === 'concert' ? '🎸' : b.type === 'service' ? '🛠️' : '🚌'
                        )}
                      </div>
                      <div className="glass p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                              {b.title || (b.details as any)?.airline || (b.details as any)?.title}
                              {(b as any).is_free && (
                                <span className="ml-3 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded text-[9px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800">FREE</span>
                              )}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {b.type === 'movie' || b.type === 'concert' || b.type === 'service' ? (
                                <span>{getSeatDisplay(b)}</span>
                              ) : (
                                <span>{(b.details as any)?.from} <i className="fa-solid fa-arrow-right mx-1 text-blue-500"></i> {(b.details as any)?.to || (b.details as any)?.destination}</span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => setSelectedTicket(b)} className="px-6 py-2.5 azure-btn rounded-xl text-[10px] font-black uppercase tracking-widest shadow-none">View Ticket</button>
                            <button onClick={() => setCancellingBooking(b.id)} className="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">Cancel</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-bold text-slate-500">
                          {venueInfo.venueName && (
                            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-4 py-3">
                              <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">Venue</span>
                              <span className="text-slate-900 dark:text-white leading-tight">{venueInfo.venueName}</span>
                            </div>
                          )}
                          {venueInfo.location && (
                            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-4 py-3">
                              <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">Area / City</span>
                              <span className="text-slate-900 dark:text-white leading-tight">{venueInfo.location}</span>
                            </div>
                          )}
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-4 py-3">
                            <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">Date</span>
                            <span className="text-slate-900 dark:text-white">{formatBookingDate(b)}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl px-4 py-3">
                            <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">{(bookingTime || bookingExperience) ? 'Time / Experience' : 'Booking ID'}</span>
                            <span className="text-slate-900 dark:text-white break-all">{[bookingTime, bookingExperience].filter(Boolean).join(' • ') || b.id}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-slate-500">
                          <span>ID: {b.id}</span>
                          <span>•</span>
                          <span>Fare: {convertPrice(b.total_price ?? b.totalPrice)}</span>
                        </div>
                      </div>
                          </>
                        );
                      })()}
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-slate-400">No active bookings found. Ready for your next adventure?</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-widest">Start Searching</button>
                  </div>
                )}
              </div>
            </section>

            {plans.length > 0 && (
              <section>
                <h3 className="font-black text-lg uppercase tracking-widest text-slate-900 dark:text-white mb-10">Travel Vault (Saved Plans)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {plans.map(plan => (
                    <div key={plan.id} className="glass p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all group">
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600"><i className="fa-solid fa-bookmark"></i></div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved on {new Date(plan.created_at).toLocaleDateString()}</span>
                          <button onClick={() => handleDeletePlan(plan.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{plan.title}</h4>
                      <p className="text-sm font-bold text-slate-500 mb-6">Budget Configuration: {convertPrice(plan.budget)}</p>
                      <button onClick={() => navigate('/booking', { state: { item: plan.items[0], type: 'saved' } })} className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">Complete Booking</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {bookings.filter(b => b.status === 'cancelled').length > 0 && (
              <section className="opacity-60 grayscale">
                <h3 className="font-black text-lg uppercase tracking-widest text-slate-900 dark:text-white mb-10">Cancelled History</h3>
                <div className="space-y-6">
                  {bookings.filter(b => b.status === 'cancelled').map((b) => (
                    <div key={b.id} className="glass p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white">{b.title || (b.details as any)?.airline || (b.details as any)?.title}</h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {(b.details as any)?.from} <i className="fa-solid fa-arrow-right mx-1"></i> {(b.details as any)?.to || (b.details as any)?.destination}
                          </p>
                        </div>
                        <div className="px-4 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/50">
                          Cancelled
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
             <div className="glass p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <h4 className="text-xl font-black mb-6 tracking-tighter">SkyBound Perks</h4>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <i className="fa-solid fa-crown text-amber-500"></i>
                      <span className="text-xs font-bold">Elite Lounge Access</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <i className="fa-solid fa-wifi text-blue-500"></i>
                      <span className="text-xs font-bold">Free In-flight WiFi</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <i className="fa-solid fa-shield-halved text-emerald-500"></i>
                      <span className="text-xs font-bold">Premium Insurance</span>
                   </div>
                </div>
             </div>
          </aside>
        </div>
      </div>

      {selectedTicket && <ETicketModal booking={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      
      {cancellingBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-sm w-full">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mb-8">
              <i className="fa-solid fa-circle-exclamation text-2xl"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Cancel Booking?</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Are you sure you want to cancel this booking? A 20% cancellation fee will apply to your refund.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCancellingBooking(null)} className="py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest">No, Keep It</button>
              <button onClick={() => handleCancelBooking(cancellingBooking)} className="py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
