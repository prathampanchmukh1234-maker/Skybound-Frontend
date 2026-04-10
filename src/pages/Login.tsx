
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { signInWithGoogle } from '../services/db';
import { useGlobal } from '../context/GlobalContext';

interface LoginProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Login: React.FC<LoginProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser, user, loadingAuth } = useGlobal();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  // Automatic redirection if user is already authenticated
  React.useEffect(() => {
    if (user && !loadingAuth) {
      if (location.state?.pendingItem) {
        navigate('/booking', { 
          state: { 
            item: location.state.pendingItem, 
            type: location.state.pendingType 
          } 
        });
      } else {
        const destination = location.state?.from || '/dashboard';
        navigate(destination, { replace: true });
      }
    }
  }, [user, loadingAuth, navigate, location.state]);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      setError("Google Login requires Supabase configuration. Use Demo Access instead.");
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      // Use origin for redirect to avoid hash router issues during the OAuth handshake
      const redirectUrl = window.location.origin;
      await signInWithGoogle(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Could not initialize Google Authentication");
      setGoogleLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const demoUser = {
        id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        name: 'SkyBound Guest',
        email: 'guest@skybound.travel',
        role: 'user',
        tier: 'Standard',
        skyPoints: 2500,
        walletBalance: 1200,
        referralCode: 'SKY2024',
        freeTrialUsed: false,
        searchHistory: [],
      };
      localStorage.setItem('sb_user', JSON.stringify(demoUser));
      await refreshUser();
      onShowToast('Logged in as Guest Explorer');
    } catch (err: any) {
      setError("Failed to initialize guest session");
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  if (!isSupabaseConfigured()) {
    setLoading(true);
    try {
      const demoUser = {
        id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        role: 'user',
        tier: 'Standard',
        skyPoints: 2500,
        walletBalance: 1200,
        referralCode: 'SKY2024',
        freeTrialUsed: false,
        searchHistory: [],
      };
      localStorage.setItem('sb_user', JSON.stringify(demoUser));
      await refreshUser();
      onShowToast('Supabase not configured. Logged in as ' + formData.email + ' (Demo Mode)', 'info');
    } catch (err: any) {
      setError("Failed to initialize guest session");
    } finally {
      setLoading(false);
    }
    return;
  }

  setLoading(true);
  try {
    let authUser = null;
    if (isLogin) {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      authUser = data.user;
      onShowToast('Welcome back to SykBound!');
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name, role: 'user' } }
      });
      if (authError) throw authError;
      authUser = data.user;
      onShowToast('Account created successfully!');
    }

    // Robust Profile Sync: Ensure user exists in public.users
    if (authUser) {
      const { error: syncError } = await supabase.from('users').upsert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || formData.name || authUser.email?.split('@')[0],
        role: 'user'
      }, { onConflict: 'id' });
      
      if (syncError) console.warn("Profile sync warning:", syncError.message);
    }

    await refreshUser();
  } catch (err: any) {
    setError(err.message || 'Authentication failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfdfe] dark:bg-gray-950 px-4 py-12 pt-32 transition-colors duration-500">
      <div className="max-w-md w-full animate-fade-up">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="gradient-bg p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h2 className="text-4xl font-black mb-3 tracking-tighter relative z-10">SkyBound</h2>
            <p className="text-blue-100 text-sm font-medium tracking-wide uppercase relative z-10 opacity-80">Identity Verified & Secured</p>
          </div>
          
          <div className="p-10">
            <button 
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full mb-4 flex items-center justify-center gap-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] group"
            >
              {googleLoading ? (
                <i className="fa-solid fa-spinner animate-spin text-blue-600"></i>
              ) : (
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  className="w-5 h-5" 
                  alt="Google" 
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.google.com/favicon.ico'; }}
                />
              )}
              <span className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </span>
            </button>

            <button 
              onClick={handleDemoLogin}
              disabled={loading || googleLoading}
              className="w-full mb-8 flex items-center justify-center gap-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800/50 py-4 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-[0.98]"
            >
              <i className="fa-solid fa-user-astronaut text-blue-600"></i>
              <span className="font-black text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Demo Guest Access
              </span>
            </button>

            <div className="relative mb-10 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <span className="relative bg-white dark:bg-slate-900 px-4 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Or Use Email</span>
            </div>

            <div className="flex border-b dark:border-slate-800 mb-10">
              <button 
                onClick={() => setIsLogin(true)} 
                className={`flex-1 pb-5 font-black text-xs uppercase tracking-[0.3em] transition-all ${isLogin ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)} 
                className={`flex-1 pb-5 font-black text-xs uppercase tracking-[0.3em] transition-all ${!isLogin ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {!isLogin && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2 mb-3 block">Full Name</label>
                  <input 
                    type="text" required 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                    placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2 mb-3 block">Identity (Email)</label>
                <input 
                  type="email" required 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                  placeholder="name@nexus.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2 mb-3 block">Secret Phrase (Password)</label>
                <input 
                  type="password" required 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                  placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              {error && (
                <div className="text-red-500 text-xs font-black text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/50 animate-shake">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full azure-btn py-5 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl disabled:opacity-50 active:scale-95 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <i className="fa-solid fa-spinner animate-spin"></i> SECURING ACCESS...
                  </span>
                ) : (isLogin ? 'AUTHORIZE ACCESS' : 'INITIALIZE CITIZENSHIP')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
