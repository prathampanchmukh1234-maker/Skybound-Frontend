
import { supabase, isSupabaseConfigured } from './supabase';
import { User, Booking, TripPlan, PriceAlert, TravelProfile, DreamDestination, LifeTrip } from '../types';

const BASE_API_URL = import.meta.env.VITE_API_URL || '';

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) {
    const localUser = localStorage.getItem('sb_user');
    if (localUser) {
      const parsed = JSON.parse(localUser);
      return (parsed && parsed.id) ? parsed : null;
    }
    return null;
  }
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;
    
    // Fetch profile from backend instead of direct Supabase
    const response = await fetch(`${BASE_API_URL}/api/users/${user.id}`);
    if (!response.ok) {
      // Fallback to basic user info from metadata
      return {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'SykBound Member',
        email: user.email || '',
        role: 'user',
        tier: 'Standard',
        skyPoints: 0,
        walletBalance: 0,
        referralCode: `SKYBOUND${user.id.slice(0, 6).toUpperCase()}`,
        searchHistory: [],
        freeTrialUsed: false
      } as User;
    }
    
    return await response.json();
  } catch (error) { return null; }
};

export const logoutUser = async () => {
  if (isSupabaseConfigured()) await supabase.auth.signOut();
  localStorage.removeItem('sb_user');
};

export const signInWithGoogle = async (redirectTo: string) => {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo }
  });
  if (error) throw error;
};

export const createBookingRecord = async (data: any) => {
  if (!isSupabaseConfigured()) {
    const record = {
      id: 'SB-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      user_id: data.userId,
      type: data.type,
      item_id: data.itemId,
      details: data.details,
      total_price: data.totalPrice,
      status: "confirmed",
      payment_id: data.paymentId || null,
      venue: data.venue,
      travel_date: data.travel_date,
      show_time: data.show_time,
      from_city: data.from_city,
      to_city: data.to_city,
      created_at: new Date().toISOString()
    };
    const saved = JSON.parse(localStorage.getItem(`sb_bookings_${data.userId}`) || '[]');
    localStorage.setItem(`sb_bookings_${data.userId}`, JSON.stringify([record, ...saved]));
    return record;
  }

  // Ensure user exists in public.users before booking (Safety check for foreign key)
  const { data: userExists, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', data.userId)
    .single();

  if (userError && userError.code === 'PGRST116') {
    // User not in public.users, let's try to sync them from auth.users metadata
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser && authUser.id === data.userId) {
      await supabase.from('users').upsert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'SykBound Member',
        role: 'user'
      });
    }
  }

  const { data: record, error } = await supabase.from("bookings").insert([{
    user_id: data.userId,
    type: data.type,
    item_id: data.itemId,
    title: data.title,
    poster: data.poster,
    seat: data.seat,
    total_price: data.totalPrice,
    status: "confirmed",
    payment_id: data.paymentId || 'demo',
    venue: data.venue,
    travel_date: data.travel_date,
    show_time: data.show_time,
    from_city: data.from_city || data.from || null,
    to_city: data.to_city || data.to || null,
    created_at: new Date().toISOString()
  }]).select().single();

  if (error) {
    console.error("Booking insert failed:", error);
    throw error;
  }

  // FIX: Handle Wallet Deduction and SkyPoints
  const skyPointsEarned = Math.floor(data.totalPrice / 100);
  const { data: userData } = await supabase.from('users').select('wallet_balance, sky_points').eq('id', data.userId).single();
  
  if (userData) {
    const updates: any = {
      sky_points: (userData.sky_points || 0) + skyPointsEarned
    };
    if (data.walletDeduction > 0) {
      updates.wallet_balance = Math.max(0, (userData.wallet_balance || 0) - data.walletDeduction);
    }
    await supabase.from('users').update(updates).eq('id', data.userId);
  }

  return record;
};

export const saveTripPlan = async (plan: Partial<TripPlan>) => {
  const id = 'PLAN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const fullPlan = { ...plan, id, created_at: new Date().toISOString() };
  
  try {
    const response = await fetch(`${BASE_API_URL}/api/trip-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPlan)
    });
    if (!response.ok) throw new Error('Failed to save trip plan');
  } catch (e) {
    console.warn("Backend trip plan save failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem(`sb_plans_${plan.userId}`) || '[]');
  localStorage.setItem(`sb_plans_${plan.userId}`, JSON.stringify([fullPlan, ...saved]));
  return fullPlan;
};

export const getTripPlans = async (userId: string) => {
  if (!BASE_API_URL) {
    return JSON.parse(localStorage.getItem(`sb_plans_${userId}`) || '[]');
  }
  try {
    const response = await fetch(`${BASE_API_URL}/api/trip-plans/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch trip plans');
    const data = await response.json();
    if (data) return data;
  } catch (e) {
    console.warn("Backend trip plans fetch failed, falling back to local storage:", e);
  }
  return JSON.parse(localStorage.getItem(`sb_plans_${userId}`) || '[]');
};

export const deleteTripPlan = async (id: string) => {
  const user = await getCurrentUser();
  const userId = user?.id || 'demo';

  try {
    const response = await fetch(`${BASE_API_URL}/api/trip-plans/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete trip plan');
  } catch (e) {
    console.warn("Backend trip plan delete failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem(`sb_plans_${userId}`) || '[]');
  const filtered = saved.filter((p: any) => p.id !== id);
  localStorage.setItem(`sb_plans_${userId}`, JSON.stringify(filtered));
};

export const savePriceAlert = async (alert: Partial<PriceAlert>) => {
  const id = 'ALERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const fullAlert = { ...alert, id };
  const saved = JSON.parse(localStorage.getItem('sb_alerts') || '[]');
  localStorage.setItem('sb_alerts', JSON.stringify([fullAlert, ...saved]));
  return fullAlert;
};

export const getStoredBookings = async (userId: string) => {
  if (!isSupabaseConfigured() || userId.startsWith('demo') || userId === 'guest') {
    const saved = JSON.parse(localStorage.getItem(`sb_bookings_${userId}`) || '[]');
    return saved;
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch bookings failed:", error);
    return [];
  }
  return data || [];
};

export const cancelBooking = async (id: string) => {
  const user = await getCurrentUser();
  const userId = user?.id || 'demo';

  if (!isSupabaseConfigured()) {
    const saved = JSON.parse(localStorage.getItem(`sb_bookings_${userId}`) || '[]');
    const updated = saved.map((b: any) => b.id === id ? { ...b, status: 'cancelled' } : b);
    localStorage.setItem(`sb_bookings_${userId}`, JSON.stringify(updated));
    return 0;
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    console.error("Cancel booking failed:", error);
    throw error;
  }
  return 0;
};

export const getAdminStats = async () => {
  const bookings = JSON.parse(localStorage.getItem('sb_bookings') || '[]');
  const totalRevenue = bookings.reduce((acc: number, b: any) => acc + (b.status === 'confirmed' ? (b.totalPrice || 0) : 0), 0);
  return {
    totalRevenue,
    bookingsCount: bookings.length,
    activeUsers: 842,
    topCity: 'Goa'
  };
};

// --- Life Calendar Travel Planner Functions (Using Backend API) ---

export const getTravelProfile = async (userId: string): Promise<TravelProfile | null> => {
  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/profile/${userId}`);
    if (!response.ok) throw new Error('Profile not found');
    return await response.json();
  } catch (e) {
    console.warn("Backend profile fetch failed, falling back to local storage:", e);
    const saved = JSON.parse(localStorage.getItem('sb_travel_profile_' + userId) || 'null');
    return saved;
  }
};

export const updateTravelProfile = async (profile: Partial<TravelProfile>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const fullProfile = {
    ...profile,
    user_id: user.id,
    created_at: new Date().toISOString()
  };

  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullProfile)
    });
    if (!response.ok) throw new Error('Failed to update profile');
  } catch (e) {
    console.warn("Backend profile update failed, falling back to local storage:", e);
  }

  localStorage.setItem('sb_travel_profile_' + user.id, JSON.stringify(fullProfile));
  return fullProfile;
};

export const getDreamDestinations = async (userId: string): Promise<DreamDestination[]> => {
  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/destinations/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch destinations');
    return await response.json();
  } catch (e) {
    console.warn("Backend destinations fetch failed, falling back to local storage:", e);
    const saved = JSON.parse(localStorage.getItem('sb_dream_destinations_' + userId) || '[]');
    return saved;
  }
};

export const addDreamDestination = async (destination: Partial<DreamDestination>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const record = {
    ...destination,
    id: 'DREAM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    user_id: user.id,
    is_completed: false,
    created_at: new Date().toISOString()
  } as DreamDestination;

  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error('Failed to add destination');
  } catch (e) {
    console.warn("Backend destination add failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem('sb_dream_destinations_' + user.id) || '[]');
  localStorage.setItem('sb_dream_destinations_' + user.id, JSON.stringify([record, ...saved]));
  return record;
};

export const updateDreamDestination = async (id: string, updates: Partial<DreamDestination>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/destinations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update destination');
  } catch (e) {
    console.warn("Backend destination update failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem('sb_dream_destinations_' + user.id) || '[]');
  const updated = saved.map((d: any) => d.id === id ? { ...d, ...updates } : d);
  localStorage.setItem('sb_dream_destinations_' + user.id, JSON.stringify(updated));
};

export const deleteDreamDestination = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/destinations/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete destination');
  } catch (e) {
    console.warn("Backend destination delete failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem('sb_dream_destinations_' + user.id) || '[]');
  const filtered = saved.filter((d: any) => d.id !== id);
  localStorage.setItem('sb_dream_destinations_' + user.id, JSON.stringify(filtered));
};

export const getLifeTrips = async (userId: string): Promise<LifeTrip[]> => {
  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/trips/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch trips');
    return await response.json();
  } catch (e) {
    console.warn("Backend trips fetch failed, falling back to local storage:", e);
    const saved = JSON.parse(localStorage.getItem('sb_life_trips_' + userId) || '[]');
    return saved.sort((a: any, b: any) => a.year - b.year);
  }
};

export const addLifeTrip = async (trip: Partial<LifeTrip>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const record = {
    ...trip,
    id: 'LIFE-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    user_id: user.id,
    status: 'planned',
    created_at: new Date().toISOString()
  } as LifeTrip;

  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error('Failed to add trip');
  } catch (e) {
    console.warn("Backend trip add failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem('sb_life_trips_' + user.id) || '[]');
  localStorage.setItem('sb_life_trips_' + user.id, JSON.stringify([record, ...saved]));
  return record;
};

export const updateLifeTrip = async (id: string, updates: Partial<LifeTrip>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/trips/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update trip');
  } catch (e) {
    console.warn("Backend trip update failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem('sb_life_trips_' + user.id) || '[]');
  const updated = saved.map((t: any) => t.id === id ? { ...t, ...updates } : t);
  localStorage.setItem('sb_life_trips_' + user.id, JSON.stringify(updated));
};

export const deleteLifeTrip = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  try {
    const response = await fetch(`${BASE_API_URL}/api/life-calendar/trips/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete trip');
  } catch (e) {
    console.warn("Backend trip delete failed, falling back to local storage:", e);
  }

  const saved = JSON.parse(localStorage.getItem('sb_life_trips_' + user.id) || '[]');
  const filtered = saved.filter((t: any) => t.id !== id);
  localStorage.setItem('sb_life_trips_' + user.id, JSON.stringify(filtered));
};
