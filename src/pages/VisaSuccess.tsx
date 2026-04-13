import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, FileText, ChevronRight } from 'lucide-react';

const VisaSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 md:p-14 shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">Visa Application Submitted</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
          Your {state?.country || 'visa'} request is now in review.
        </h1>
        <p className="mt-6 text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
          We stored your uploaded passport copy and photograph, created the application record, and queued it for verification.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference ID</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white break-all">{state?.referenceId || 'Pending confirmation'}</p>
          </div>
          <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Travel Date</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{state?.travelDate || 'To be updated'}</p>
          </div>
          <div className="rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-6 md:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Email</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white break-all">{state?.email || 'Not available'}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex-1 bg-indigo-600 text-white rounded-2xl py-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
            Go To Dashboard <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/visa')} className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl py-4 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Submit Another
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisaSuccess;
