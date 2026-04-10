
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../services/db';
import { useGlobal } from '../context/GlobalContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard: React.FC = () => {
  const { convertPrice, user, loadingAuth } = useGlobal();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loadingAuth && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      getAdminStats().then(setStats);
    }
  }, [user]);

  if (loadingAuth || !user || user.role !== 'admin') {
    return null;
  }

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue',
      data: [120000, 190000, 150000, 220000, 310000, 280000],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  if (!stats) return <div className="pt-40 text-center font-black">Decrypting Admin Secure Layer...</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
           <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.6em] mb-4 block">Platform Control Center</span>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">SkyBound Command</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
           <div className="glass p-10 rounded-[3rem] border-b-4 border-blue-600">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-4">Total Revenue</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{convertPrice(stats.totalRevenue)}</div>
              <div className="text-xs font-bold text-green-500 mt-2">↑ 12% vs last month</div>
           </div>
           <div className="glass p-10 rounded-[3rem] border-b-4 border-indigo-600">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-4">Bookings</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.bookingsCount}</div>
              <div className="text-xs font-bold text-blue-500 mt-2">98% Success rate</div>
           </div>
           <div className="glass p-10 rounded-[3rem] border-b-4 border-purple-600">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-4">Active Users</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.activeUsers}</div>
              <div className="text-xs font-bold text-purple-500 mt-2">Real-time sessions</div>
           </div>
           <div className="glass p-10 rounded-[3rem] border-b-4 border-pink-600">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-4">Top Destination</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.topCity}</div>
              <div className="text-xs font-bold text-pink-500 mt-2">High demand alert</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="glass p-12 rounded-[4rem]">
              <h3 className="font-black text-lg mb-10 uppercase tracking-widest">Revenue Analytics</h3>
              <div className="h-80"><Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }} /></div>
           </div>
           <div className="glass p-12 rounded-[4rem]">
              <h3 className="font-black text-lg mb-10 uppercase tracking-widest">Market Distribution</h3>
              <div className="space-y-8">
                 {[
                   { label: 'Domestic Flights', val: 65, color: 'bg-blue-600' },
                   { label: 'Hotels', val: 20, color: 'bg-indigo-600' },
                   { label: 'International', val: 15, color: 'bg-purple-600' }
                 ].map((bar, i) => (
                   <div key={i}>
                      <div className="flex justify-between text-[11px] font-black uppercase mb-3"><span>{bar.label}</span><span>{bar.val}%</span></div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div className={`h-full ${bar.color} transition-all duration-1000`} style={{ width: `${bar.val}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
