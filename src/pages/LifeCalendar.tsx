
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { 
  getTravelProfile, 
  updateTravelProfile, 
  getDreamDestinations, 
  addDreamDestination, 
  updateDreamDestination, 
  deleteDreamDestination,
  getLifeTrips,
  addLifeTrip,
  updateLifeTrip,
  deleteLifeTrip
} from '../services/db';
import { TravelProfile, DreamDestination, LifeTrip } from '../types';
import LifeProfileForm from '../components/LifeCalendar/LifeProfileForm';
import BucketList from '../components/LifeCalendar/BucketList';
import LifeTimeline from '../components/LifeCalendar/LifeTimeline';

const LifeCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { user, loadingAuth } = useGlobal();
  const [profile, setProfile] = useState<TravelProfile | null>(null);
  const [destinations, setDestinations] = useState<DreamDestination[]>([]);
  const [trips, setTrips] = useState<LifeTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const fetchData = async () => {
        const [p, d, t] = await Promise.all([
          getTravelProfile(user.id),
          getDreamDestinations(user.id),
          getLifeTrips(user.id)
        ]);
        setProfile(p);
        setDestinations(d);
        setTrips(t);
        setLoading(false);
      };
      fetchData();
    }
  }, [user, loadingAuth, navigate]);

  const handleSaveProfile = async (data: Partial<TravelProfile>) => {
    const updated = await updateTravelProfile(data);
    setProfile(updated as TravelProfile);
  };

  const handleAddDestination = async (data: Partial<DreamDestination>) => {
    const record = await addDreamDestination(data);
    setDestinations([record, ...destinations]);
  };

  const handleToggleDestination = async (id: string, completed: boolean) => {
    await updateDreamDestination(id, { is_completed: completed });
    setDestinations(destinations.map(d => d.id === id ? { ...d, is_completed: completed } : d));
  };

  const handleDeleteDestination = async (id: string) => {
    await deleteDreamDestination(id);
    setDestinations(destinations.filter(d => d.id !== id));
  };

  const handleAddTrip = async (data: Partial<LifeTrip>) => {
    const record = await addLifeTrip(data);
    setTrips([...trips, record].sort((a, b) => a.year - b.year));
  };

  const handleDeleteTrip = async (id: string) => {
    await deleteLifeTrip(id);
    setTrips(trips.filter(t => t.id !== id));
  };

  const handleBookTrip = (trip: LifeTrip) => {
    // Redirect to search with the destination
    navigate(`/?from=${trip.destination}&type=flight`);
  };

  if (loadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] dark:bg-slate-950 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="mb-16">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Legacy Planner</span>
          <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Life Travel Calendar</h1>
          <p className="text-slate-400 font-medium mt-2 text-lg">Design your lifetime of adventures, year by year.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-12">
            <LifeProfileForm initialData={profile} onSave={handleSaveProfile} />
            
            <div className="glass p-8 rounded-[2.5rem] bg-blue-600 text-white">
              <h3 className="text-xl font-black mb-4">Smart Suggestion</h3>
              <p className="text-blue-100 text-sm font-medium mb-6">
                Based on your {profile?.travel_style || 'budget'} style, we recommend visiting 
                <span className="font-black text-white ml-1">Iceland</span> in 2027 for optimal weather and pricing.
              </p>
              <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">
                Add to Timeline
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-16">
            <LifeTimeline 
              trips={trips} 
              onAdd={handleAddTrip} 
              onDelete={handleDeleteTrip} 
              onBook={handleBookTrip}
            />
            
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Bucket List</h2>
              <BucketList 
                destinations={destinations} 
                onAdd={handleAddDestination} 
                onToggle={handleToggleDestination} 
                onDelete={handleDeleteDestination} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeCalendar;
