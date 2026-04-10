
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-slate-950">
      <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-8">
        <span className="text-5xl">❌</span>
      </div>
      <h1 className="text-4xl font-black text-red-600 mb-4 tracking-tighter">Payment Failed</h1>
      <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-w-md">
        Something went wrong during the transaction. Your account has not been charged.
      </p>
      <button 
        onClick={() => navigate(-1)} 
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all"
      >
        Retry Payment
      </button>
    </div>
  );
};

export default PaymentFailed;
