import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Lock, Database, Bell } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-10 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-10 md:p-14 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Legal</p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="mt-6 max-w-3xl text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
              This page explains what SykBound stores, why we store it, and how visa documents, bookings, and profile information are handled inside the platform.
            </p>
          </div>

          <div className="p-10 md:p-14 space-y-10">
            {[
              {
                icon: <Database className="w-6 h-6 text-indigo-600" />,
                title: 'Data We Collect',
                body: 'We collect account details, booking history, support requests, saved plans, visa application details, and insurance policy records that you intentionally submit through the app.'
              },
              {
                icon: <Lock className="w-6 h-6 text-indigo-600" />,
                title: 'Document Storage',
                body: 'Passport copies and photographs uploaded for visa applications are stored in Supabase Storage so the application can be reviewed and tracked from your account dashboard.'
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
                title: 'How We Use Data',
                body: 'We use your information to complete bookings, generate travel documents, issue insurance records, support your requests, and improve service reliability across the app.'
              },
              {
                icon: <Bell className="w-6 h-6 text-indigo-600" />,
                title: 'User Control',
                body: 'You can update profile information, manage bookings, and review active visa and insurance records from your dashboard. Legal or compliance records may be retained when required.'
              }
            ].map((section) => (
              <section key={section.title} className="rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{section.title}</h2>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
