
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bookingType = state?.type;
  const destination = state?.destination;
  const title = state?.title;

  const message = bookingType === 'flight'
    ? `Your tickets for the flight to ${destination || 'your destination'} have been secured. Redirecting to your dashboard...`
    : `Your booking for ${title || 'your trip'} has been confirmed. You can view your tickets in the dashboard.`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white dark:bg-slate-950">
      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-8">
        <span className="text-5xl">🎉</span>
      </div>
      <h1 className="text-4xl font-black text-green-600 mb-4 tracking-tighter">
        {bookingType === 'flight' ? 'Booking Confirmed!' : 'Payment Successful'}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-w-md">
        {message}
      </p>
      <button 
        onClick={() => navigate('/dashboard')} 
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all"
      >
        Go To Dashboard
      </button>
    </div>
  );
};

export default PaymentSuccess;
