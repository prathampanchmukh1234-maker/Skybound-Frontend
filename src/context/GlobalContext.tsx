
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { User } from '../types';

interface GlobalContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currency: 'INR' | 'USD' | 'EUR';
  setCurrency: (c: 'INR' | 'USD' | 'EUR') => void;
  location: string;
  convertPrice: (price: number) => string;
  user: User | null;
  loadingAuth: boolean;
  isSyncing: boolean;
  isInitialized: boolean;
  searchHistory: any[];
  wishlist: string[];
  notifications: { id: string; title: string; message: string; date: string; read: boolean }[];
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateHistory: (search: any) => void;
  upgradeTier: (tier: 'Standard' | 'Elite' | 'Diamond') => Promise<void>;
  logout: () => Promise<void>;
  useFreeTrial: () => Promise<boolean>;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  addNotification: (title: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  updateWalletBalance: (amount: number) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('sb-theme') as any) || 'light');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [location, setLocation] = useState('New Delhi, India');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; date: string; read: boolean }[]>([]);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('sb-theme', theme);
  }, [theme]);

  const updateHistory = useCallback((search: any) => {
    if (!user) return;
    setSearchHistory(prev => {
      const updated = [search, ...prev.filter(h => h.to !== search.to)].slice(0, 5);
      localStorage.setItem(`sb_search_history_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const refreshUser = useCallback(async (session?: any) => {
    setLoadingAuth(true);
    
    try {
      if (!isSupabaseConfigured()) {
        const localUserStr = localStorage.getItem('sb_user');
        if (localUserStr) {
          try {
            const parsed = JSON.parse(localUserStr);
            if (parsed?.id) {
              setUser(parsed);
              // Load user-scoped data
              setSearchHistory(JSON.parse(localStorage.getItem(`sb_search_history_${parsed.id}`) || '[]'));
              setWishlist(JSON.parse(localStorage.getItem(`sb_wishlist_${parsed.id}`) || '[]'));
              setNotifications(JSON.parse(localStorage.getItem(`sb_notifications_${parsed.id}`) || '[]'));
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoadingAuth(false);
        return;
      }

      let currentSession = session;
      if (!currentSession) {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        currentSession = data.session;
      }

      if (currentSession?.user) {
        const { data, error } = await supabase.from('users').select('*').eq('id', currentSession.user.id).single();
        
        if (error && error.code !== 'PGRST116') {
           console.error("Profile fetch error:", error);
        }
        
        const userData: User = {
          id: data?.id || currentSession.user.id,
          name: data?.name || currentSession.user.user_metadata?.full_name || 'SykBound Member',
          email: data?.email || currentSession.user.email || '',
          role: data?.role || 'user',
          tier: data?.tier || 'Standard',
          skyPoints: data?.sky_points || 0,
          walletBalance: data?.wallet_balance || 0,
          freeTrialUsed: data?.free_trial_used || false,
          referralCode: data?.referral_code || `SKYBOUND${currentSession.user.id.slice(0,6).toUpperCase()}`,
          searchHistory: data?.search_history || [],
          avatar_url: data?.avatar_url,
          phone: data?.phone,
          twoFaEnabled: data?.two_fa_enabled || false,
          location: data?.location,
          bio: data?.bio,
        };

        // Safety Sync: Ensure user exists in public.users if fetch failed or returned nothing
        if (!data) {
          await supabase.from('users').upsert({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role
          }, { onConflict: 'id' });
        }

        setUser(userData);
        // Load user-scoped data
        setSearchHistory(JSON.parse(localStorage.getItem(`sb_search_history_${userData.id}`) || '[]'));
        setWishlist(JSON.parse(localStorage.getItem(`sb_wishlist_${userData.id}`) || '[]'));
        setNotifications(JSON.parse(localStorage.getItem(`sb_notifications_${userData.id}`) || '[]'));
      } else {
        // Fallback to local storage if no supabase session
        const localUserStr = localStorage.getItem('sb_user');
        if (localUserStr) {
          try {
            const parsed = JSON.parse(localUserStr);
            if (parsed?.id) {
              setUser(parsed);
              setSearchHistory(JSON.parse(localStorage.getItem(`sb_search_history_${parsed.id}`) || '[]'));
              setWishlist(JSON.parse(localStorage.getItem(`sb_wishlist_${parsed.id}`) || '[]'));
              setNotifications(JSON.parse(localStorage.getItem(`sb_notifications_${parsed.id}`) || '[]'));
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    } catch (e: any) {
      if (!e.message?.includes('Auth request timed out') && !e.message?.includes('FetchError')) {
        console.error("Auth sync error:", e);
      }
      setUser(null);
    } finally {
      setLoadingAuth(false);
      setIsInitialized(true);
    }
  }, []);

  const addToWishlist = useCallback((id: string) => {
    if (!user) return;
    setWishlist(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem(`sb_wishlist_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const removeFromWishlist = useCallback((id: string) => {
    if (!user) return;
    setWishlist(prev => {
      const updated = prev.filter(item => item !== id);
      localStorage.setItem(`sb_wishlist_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const addNotification = useCallback((title: string, message: string) => {
    if (!user) return;
    setNotifications(prev => {
      const newNotif = { id: Math.random().toString(36).substr(2, 9), title, message, date: new Date().toISOString(), read: false };
      const updated = [newNotif, ...prev].slice(0, 20);
      localStorage.setItem(`sb_notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const markNotificationRead = useCallback((id: string) => {
    if (!user) return;
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(`sb_notifications_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const updateWalletBalance = useCallback(async (amount: number) => {
    if (!user) return;
    const newBalance = (user.walletBalance || 0) + amount;
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', user.id);
      if (error) throw error;
      await refreshUser();
    } else {
      const updated = { ...user, walletBalance: newBalance };
      setUser(updated);
      localStorage.setItem('sb_user', JSON.stringify(updated));
    }
  }, [user, refreshUser]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    if (isSupabaseConfigured()) {
      // Map camelCase updates to snake_case for DB
      const dbUpdates: any = { ...updates };
      
      // Remove fields that shouldn't be updated in public.users
      delete dbUpdates.id;
      delete dbUpdates.email;
      
      if (updates.walletBalance !== undefined) {
        dbUpdates.wallet_balance = updates.walletBalance;
        delete dbUpdates.walletBalance;
      }
      if (updates.freeTrialUsed !== undefined) {
        dbUpdates.free_trial_used = updates.freeTrialUsed;
        delete dbUpdates.freeTrialUsed;
      }
      if (updates.skyPoints !== undefined) {
        dbUpdates.sky_points = updates.skyPoints;
        delete dbUpdates.skyPoints;
      }
      if (updates.twoFaEnabled !== undefined) {
        dbUpdates.two_fa_enabled = updates.twoFaEnabled;
        delete dbUpdates.twoFaEnabled;
      }

      // Ensure we only send fields that exist in the DB
      const { error } = await supabase.from('users').update(dbUpdates).eq('id', user.id);
      if (error) throw error;
      await refreshUser();
    } else {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('sb_user', JSON.stringify(updated));
    }
  }, [user, refreshUser]);

  const useFreeTrial = useCallback(async () => {
    if (!user || user.freeTrialUsed) return false;
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('users').update({ free_trial_used: true }).eq('id', user.id);
      if (error) throw error;
      await refreshUser();
    } else {
      const updated = { ...user, freeTrialUsed: true };
      setUser(updated);
      localStorage.setItem('sb_user', JSON.stringify(updated));
    }
    return true;
  }, [user, refreshUser]);

  const logout = useCallback(async () => {
    const userId = user?.id;
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('sb_user');
    if (userId) {
      localStorage.removeItem(`sb_search_history_${userId}`);
      localStorage.removeItem(`sb_wishlist_${userId}`);
      localStorage.removeItem(`sb_notifications_${userId}`);
    }
    setUser(null);
    setWishlist([]);
    setNotifications([]);
    setSearchHistory([]);
  }, [user]);

  const upgradeTier = useCallback(async (tier: 'Standard' | 'Elite' | 'Diamond') => {
    if (!user) return;
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('users').update({ tier }).eq('id', user.id);
      if (error) throw error;
      await refreshUser();
    } else {
      const updated = { ...user, tier };
      setUser(updated);
      localStorage.setItem('sb_user', JSON.stringify(updated));
    }
  }, [user, refreshUser]);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          refreshUser(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoadingAuth(false);
          setIsInitialized(true);
          setWishlist([]);
          setNotifications([]);
          setSearchHistory([]);
        }
      });

      // Safety timeout fallback
      const timer = setTimeout(() => {
        if (!isInitialized) {
          setIsInitialized(true);
          setLoadingAuth(false);
        }
      }, 6000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    } else {
      refreshUser();
    }
  }, [refreshUser, isInitialized]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), []);

  const convertPrice = useCallback((price: number) => {
    const rates = { INR: 1, USD: 0.012, EUR: 0.011 };
    const symbol = { INR: '₹', USD: '$', EUR: '€' };
    const converted = (price * (rates[currency] || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 });
    return `${symbol[currency] || '₹'}${converted}`;
  }, [currency]);

  return (
    <GlobalContext.Provider value={{ 
      theme, toggleTheme, currency, setCurrency, location, convertPrice, 
      user, loadingAuth, isSyncing: loadingAuth, isInitialized, searchHistory, wishlist, notifications,
      refreshUser, updateHistory, upgradeTier, logout, useFreeTrial,
      addToWishlist, removeFromWishlist, addNotification, markNotificationRead, updateWalletBalance
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within GlobalProvider');
  return context;
};
