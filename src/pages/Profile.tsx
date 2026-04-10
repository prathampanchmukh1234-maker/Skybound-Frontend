
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, ShieldCheck, Camera, ChevronLeft, Save, Globe, Briefcase, Calendar, Ticket } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { getStoredBookings } from '../services/db';
import { supabase } from '../services/supabase';
import { Booking } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, convertPrice, updateUser } = useGlobal();
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || 'Pratham Panchmukh',
    email: user?.email || 'prathampanchmukh1234@gmail.com',
    phone: user?.phone || '+91 98765 43210',
    location: user?.location || 'Pune, India',
    bio: user?.bio || 'Avid traveler and tech enthusiast. Always looking for the next adventure.'
  });

  useEffect(() => {
    const fetchBookings = async () => {
      if (user?.id) {
        // FIXED: DASHBOARD NOT SHOWING BOOKINGS
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        
        setBookings(data || []);
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [user]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File too large (max 5MB)');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setPhotoError('Invalid file type (JPG, PNG, WEBP, GIF only)');
      return;
    }

    setPhotoUploading(true);
    setPhotoError('');

    try {
      // Attempt to create bucket if it doesn't exist (fails silently if exists)
      await supabase.storage.createBucket('avatars', { public: true });
      
      const path = `${user.id}/avatar_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      
      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          setPhotoError('Storage bucket "avatars" not found. Please create it in Supabase Dashboard.');
        } else {
          setPhotoError(uploadError.message);
        }
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await updateUser({ avatar_url: data.publicUrl } as any);
    } catch (err: any) {
      setPhotoError(err.message || 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
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

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
            <div className="absolute -bottom-16 left-12">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center text-5xl shadow-2xl overflow-hidden">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {photoUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
              </div>
              {photoError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{photoError}</p>}
            </div>
          </div>

          <div className="pt-20 pb-12 px-12">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{formData.name}</h1>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{formData.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{user?.tier || 'Premium'} Member</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${isEditing ? 'bg-green-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
              >
                {isEditing ? <Save className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Personal Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Mail className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Address</span>
                        {isEditing ? (
                          <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none"
                          />
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-white">{formData.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Phone className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Phone Number</span>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none"
                          />
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-white">{formData.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">About Me</h4>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {isEditing ? (
                      <textarea 
                        value={formData.bio} 
                        onChange={e => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-transparent font-medium text-slate-600 dark:text-slate-400 outline-none resize-none h-24"
                      />
                    ) : (
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{formData.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Travel Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                      <Globe className="w-6 h-6 text-indigo-600 mb-2" />
                      <span className="text-2xl font-black text-slate-900 dark:text-white block">12</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Countries</span>
                    </div>
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-100 dark:border-purple-800">
                      <Briefcase className="w-6 h-6 text-purple-600 mb-2" />
                      <span className="text-2xl font-black text-slate-900 dark:text-white block">45</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trips</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Membership</h4>
                  <div className="p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">SkyBound Elite</span>
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="space-y-1 mb-8">
                        <span className="text-xs font-bold text-white/60 block">Current Balance</span>
                        <span className="text-3xl font-black tracking-tighter">{convertPrice(user?.wallet_balance || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                        <span>Points: {user?.skyPoints || 0}</span>
                        <span className="text-indigo-400">Upgrade Plan</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Bookings</h4>
                    <button onClick={() => navigate('/dashboard')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {loadingBookings ? (
                      <div className="p-4 text-center text-[10px] font-black text-slate-400 uppercase">Loading...</div>
                    ) : bookings.length > 0 ? (
                      bookings.map(b => (
                        <div key={b.id} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <Ticket className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white truncate block">{b.title || 'Booking'}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(b.created_at || b.date).toLocaleDateString()}</span>
                          </div>
                          <div className="text-[10px] font-black text-indigo-600">{convertPrice(b.total_price || b.totalPrice)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No bookings yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
