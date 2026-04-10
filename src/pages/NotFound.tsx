
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-64 h-64 mb-8">
        <img 
          src="https://illustrations.popsy.co/blue/traveling.svg" 
          alt="404" 
          className="w-full h-full opacity-80"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1200'; }}
        />
      </div>
      <h1 className="text-6xl font-black text-blue-900 dark:text-blue-400 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-4">Oops! You've drifted off course.</h2>
      <p className="text-gray-500 dark:text-slate-400 max-w-md mb-8">
        The destination you are looking for doesn't exist or has been moved to a new secret location.
      </p>
      <button 
        onClick={() => navigate('/')}
        className="gradient-bg text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
      >
        BACK TO SKYBOUND
      </button>
    </div>
  );
};

export default NotFound;
