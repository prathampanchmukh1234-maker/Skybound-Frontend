
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, Globe, CreditCard, ChevronRight, ChevronLeft, LogOut, Trash2, HelpCircle, Info, Lock, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { supabase } from '../services/supabase';
import Toast from '../components/Toast';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, logout, user, updateUser } = useGlobal();
  const [toastMsg, setToastMsg] = useState<{message:string, type:'success'|'error'|'info'}|null>(null);
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => setToastMsg({message, type});
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    offers: true
  });

  // Change Password State
  const [showPwModal, setShowPwModal] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // 2FA State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [totpQR, setTotpQR] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) return setPwError('Minimum 8 characters');
    if (newPw !== confirmPw) return setPwError('Passwords do not match');
    setPwLoading(true); setPwError('');
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) return setPwError(error.message);
    setPwSuccess(true);
    setTimeout(() => { 
      setShowPwModal(false); 
      setPwSuccess(false); 
      setNewPw(''); 
      setConfirmPw(''); 
    }, 2000);
  };

  const handleEnable2FA = async () => {
    setTwoFAError('');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error || !data) { 
      setTwoFAError('Failed to start 2FA setup. Try again.'); 
      return; 
    }
    setFactorId(data.id);
    setTotpQR(data.totp.qr_code);
    setShow2FAModal(true);
  };

  const handleVerify2FA = async () => {
    if (verifyCode.length !== 6) return setTwoFAError('Enter the 6-digit code from your authenticator app.');
    setTwoFALoading(true);
    setTwoFAError('');
    
    try {
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
      if (cErr || !challenge) { 
        setTwoFALoading(false); 
        return setTwoFAError('Challenge failed. Try again.'); 
      }
      
      const { error: vErr } = await supabase.auth.mfa.verify({ 
        factorId, 
        challengeId: challenge.id, 
        code: verifyCode 
      });
      
      if (vErr) {
        setTwoFALoading(false);
        return setTwoFAError('Invalid code. Check your authenticator and try again.');
      }
      
      await updateUser({ twoFaEnabled: true });
      setShow2FAModal(false);
      setVerifyCode(''); 
      setFactorId(''); 
      setTotpQR('');
    } catch (err) {
      setTwoFAError('An unexpected error occurred.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (totp) {
        await supabase.auth.mfa.unenroll({ factorId: totp.id });
      }
      await updateUser({ twoFaEnabled: false });
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleteLoading(true);
    try {
      const BASE_API_URL = import.meta.env.VITE_API_URL || '';
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call backend to delete auth user (requires service role on backend)
      const response = await fetch(`${BASE_API_URL}/api/users/${user.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete account from server');
      }

      // 1. Delete from public.users (as a backup/cleanup)
      await supabase.from('users').delete().eq('id', user.id);
      
      await logout();
      navigate('/');
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      showToast(error.message || "Failed to delete account. Please contact support.", "error");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
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

        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-slate-200 dark:border-slate-800 pb-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              System<br />
              <span className="text-indigo-600">Settings</span>
            </h1>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-[1px] w-12 bg-indigo-600"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                Configure your SykBound experience
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <SettingsIcon className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">v2.4.0-Premium</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Appearance */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Appearance</h3>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                      {theme === 'light' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Dark Mode</h4>
                      <p className="text-xs font-bold text-slate-400">Optimize for night-time viewing</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className={`w-14 h-8 rounded-full transition-all relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Notifications</h3>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
                {[
                  { id: 'email', title: 'Email Notifications', desc: 'Receive trip updates via email', icon: <Bell className="w-5 h-5" /> },
                  { id: 'push', title: 'Push Notifications', desc: 'Real-time alerts on your device', icon: <Bell className="w-5 h-5" /> },
                  { id: 'sms', title: 'SMS Alerts', desc: 'Critical alerts via text message', icon: <Bell className="w-5 h-5" /> },
                  { id: 'offers', title: 'Promotional Offers', desc: 'Exclusive deals and discounts', icon: <Bell className="w-5 h-5" /> }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id as keyof typeof notifications]})}
                      className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.id as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Security */}
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Security & Privacy</h3>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
                <button 
                  onClick={() => setShowPwModal(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Change Password</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all" />
                </button>
                <button 
                  onClick={user?.twoFaEnabled ? handleDisable2FA : handleEnable2FA}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Two-Factor Authentication</h4>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${user?.twoFaEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                        {user?.twoFaEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all" />
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
              <h4 className="text-xl font-black mb-8 tracking-tighter">Support & Legal</h4>
              <div className="space-y-6">
                <button onClick={() => navigate('/support')} className="w-full flex items-center gap-4 text-slate-500 hover:text-indigo-600 transition-colors">
                  <HelpCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Help Center</span>
                </button>
                <button onClick={() => window.open('https://sykbound.run.app/privacy', '_blank')} className="w-full flex items-center gap-4 text-slate-500 hover:text-indigo-600 transition-colors">
                  <Info className="w-5 h-5" />
                  <span className="text-sm font-bold">Privacy Policy</span>
                </button>
                <button onClick={() => window.open('https://sykbound.run.app/terms', '_blank')} className="w-full flex items-center gap-4 text-slate-500 hover:text-indigo-600 transition-colors">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-bold">Terms of Service</span>
                </button>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 p-10 rounded-[3rem] border border-red-100 dark:border-red-900/20">
              <h4 className="text-xl font-black text-red-600 mb-6 tracking-tighter">Danger Zone</h4>
              <div className="space-y-6">
                <button onClick={handleLogout} className="w-full flex items-center gap-4 text-red-600 hover:text-red-700 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-bold">Sign Out of All Devices</span>
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center gap-4 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm font-bold">Delete Account</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full relative"
            >
              <button 
                onClick={() => setShow2FAModal(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                <Shield className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Enable 2FA</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm">Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>

              <div className="space-y-6">
                <div className="flex justify-center p-4 bg-white rounded-2xl border border-slate-100">
                  <img src={totpQR} alt="2FA QR Code" className="w-48 h-48" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Verification Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all text-slate-900 dark:text-white text-center tracking-[0.5em] text-xl" 
                    placeholder="000000"
                  />
                </div>

                {twoFAError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold px-4">
                    <AlertCircle className="w-4 h-4" />
                    {twoFAError}
                  </div>
                )}

                <button 
                  onClick={handleVerify2FA}
                  disabled={twoFALoading || verifyCode.length !== 6}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {twoFALoading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPwModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full relative"
            >
              <button 
                onClick={() => setShowPwModal(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                <Lock className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Change Password</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm">Update your account password to stay secure.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
                  <input 
                    type="password" 
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all text-slate-900 dark:text-white" 
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all text-slate-900 dark:text-white" 
                    placeholder="••••••••"
                  />
                </div>

                {pwError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold px-4">
                    <AlertCircle className="w-4 h-4" />
                    {pwError}
                  </div>
                )}

                {pwSuccess && (
                  <div className="flex items-center gap-2 text-green-500 text-xs font-bold px-4">
                    <CheckCircle2 className="w-4 h-4" />
                    Password updated successfully!
                  </div>
                )}

                <button 
                  onClick={handleChangePassword}
                  disabled={pwLoading || pwSuccess}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {pwLoading ? 'Updating...' : pwSuccess ? 'Success!' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mb-8">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Delete Account?</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-sm">This action is permanent and cannot be undone. All your bookings and data will be lost.</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
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

export default Settings;
