
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-slate-950">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-8">
        <span className="text-5xl">🎉</span>
      </div>
      <h1 className="text-4xl font-black text-green-600 mb-4 tracking-tighter">Payment Successful</h1>
      <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-w-md">
        Your booking has been confirmed. You can view your tickets in the dashboard.
      </p>
      <button 
        onClick={() => navigate('/')} 
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all"
      >
        Go Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
