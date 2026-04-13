import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Receipt, Plane, AlertTriangle } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">Terms of Service</h1>
            <p className="mt-6 max-w-3xl text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
              These terms describe how SykBound bookings, visa assistance, insurance issuance, cancellations, and platform access work.
            </p>
          </div>

          <div className="p-10 md:p-14 space-y-10">
            {[
              {
                icon: <Plane className="w-6 h-6 text-indigo-600" />,
                title: 'Bookings and Fulfilment',
                body: 'Travel or event bookings are confirmed only after a successful transaction or other supported confirmation flow. Ticket details in the dashboard reflect the currently stored booking record.'
              },
              {
                icon: <FileText className="w-6 h-6 text-indigo-600" />,
                title: 'Visa Services',
                body: 'Visa assistance helps collect traveler details and supporting documents for review. Submission of a request does not guarantee approval by the destination country or processing authority.'
              },
              {
                icon: <Receipt className="w-6 h-6 text-indigo-600" />,
                title: 'Insurance Policies',
                body: 'Insurance premiums are generated from trip details entered in the app. Final coverage remains subject to the selected plan details and any external underwriting or compliance checks.'
              },
              {
                icon: <AlertTriangle className="w-6 h-6 text-indigo-600" />,
                title: 'Cancellations and Account Use',
                body: 'Cancellation fees, refunds, or booking updates depend on the service category and current record status. Users are responsible for accurate traveler details, valid documents, and lawful use of the platform.'
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

export default TermsOfService;
