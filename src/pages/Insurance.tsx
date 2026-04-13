import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Calendar, CheckCircle2, AlertCircle, ChevronLeft, Users, Globe2, Loader2 } from 'lucide-react';
import { INSURANCE_PLANS } from '../constants';
import { useGlobal } from '../context/GlobalContext';
import { saveInsurancePolicy } from '../services/travelServices';

type QuoteFormState = {
  destination: string;
  region: 'domestic' | 'asia' | 'worldwide';
  travelers: string;
  startDate: string;
  endDate: string;
};

const REGION_MULTIPLIER: Record<QuoteFormState['region'], number> = {
  domestic: 1,
  asia: 1.18,
  worldwide: 1.42
};

const Insurance: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useGlobal();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(INSURANCE_PLANS.find((plan) => plan.recommended)?.id || INSURANCE_PLANS[0].id);
  const [quoteForm, setQuoteForm] = useState<QuoteFormState>({
    destination: '',
    region: 'asia',
    travelers: '1',
    startDate: '',
    endDate: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [quoteReady, setQuoteReady] = useState(false);
  const [policySummary, setPolicySummary] = useState<{ policyId: string; premium: number; planName: string } | null>(null);

  const selectedPlan = useMemo(
    () => INSURANCE_PLANS.find((plan) => plan.id === selectedPlanId) || INSURANCE_PLANS[0],
    [selectedPlanId]
  );

  const tripDays = useMemo(() => {
    if (!quoteForm.startDate || !quoteForm.endDate) {
      return 0;
    }

    const start = new Date(quoteForm.startDate);
    const end = new Date(quoteForm.endDate);
    const diff = end.getTime() - start.getTime();

    if (Number.isNaN(diff) || diff < 0) {
      return 0;
    }

    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [quoteForm.endDate, quoteForm.startDate]);

  const travelerCount = Math.max(1, Number.parseInt(quoteForm.travelers, 10) || 1);

  const calculatedPremium = useMemo(() => {
    if (!quoteReady || !tripDays) {
      return null;
    }

    const tripDurationFactor = 1 + Math.max(0, tripDays - 1) * 0.075;
    const travelerFactor = 1 + Math.max(0, travelerCount - 1) * 0.55;
    const subtotal = selectedPlan.price * REGION_MULTIPLIER[quoteForm.region] * tripDurationFactor * travelerFactor;
    return Math.round(subtotal);
  }, [quoteForm.region, quoteReady, selectedPlan.price, travelerCount, tripDays]);

  const validateQuote = () => {
    if (!selectedPlan) {
      return 'Please choose an insurance plan first.';
    }
    if (!quoteForm.destination.trim()) {
      return 'Please enter your destination.';
    }
    if (!quoteForm.startDate || !quoteForm.endDate) {
      return 'Please choose your travel dates.';
    }
    if (tripDays <= 0) {
      return 'Return date must be the same day or later than the departure date.';
    }
    if (new Date(quoteForm.startDate) < new Date(new Date().toDateString())) {
      return 'Travel start date must be today or later.';
    }
    if (travelerCount > 9) {
      return 'For more than 9 travelers, please contact support for a group quote.';
    }
    return '';
  };

  const handleCalculate = async () => {
    const validationMessage = validateQuote();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      setQuoteReady(false);
      return;
    }

    setErrorMessage('');
    setIsCalculating(true);
    setPolicySummary(null);

    await new Promise((resolve) => setTimeout(resolve, 600));

    setQuoteReady(true);
    setIsCalculating(false);
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/insurance' } });
      return;
    }

    const validationMessage = validateQuote();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    if (!calculatedPremium) {
      setErrorMessage('Please calculate your premium before issuing the policy.');
      return;
    }

    setErrorMessage('');
    setIsPurchasing(true);

    try {
      const policy = await saveInsurancePolicy({
        user_id: user.id,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        destination: quoteForm.destination.trim(),
        region: quoteForm.region,
        travelers: travelerCount,
        start_date: quoteForm.startDate,
        end_date: quoteForm.endDate,
        trip_days: tripDays,
        premium: calculatedPremium,
        status: 'issued'
      });

      setPolicySummary({
        policyId: policy?.id || `POL-${Date.now()}`,
        premium: calculatedPremium,
        planName: selectedPlan.name
      });
    } catch (err: any) {
      console.error('Insurance purchase failed:', err);
      setErrorMessage(err?.message || 'Unable to issue the policy right now.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start mb-24">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">SykBound Care</span>
              </div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Travel with Peace of Mind.</h1>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-lg">Choose a plan, enter your trip dates, and generate a premium based on region, trip length, and traveler count.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  <input
                    type="text"
                    placeholder="Thailand"
                    value={quoteForm.destination}
                    onChange={(e) => {
                      setQuoteForm({ ...quoteForm, destination: e.target.value });
                      setQuoteReady(false);
                    }}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Region</label>
                <div className="relative">
                  <Globe2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  <select
                    value={quoteForm.region}
                    onChange={(e) => {
                      setQuoteForm({ ...quoteForm, region: e.target.value as QuoteFormState['region'] });
                      setQuoteReady(false);
                    }}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                  >
                    <option value="domestic">Domestic</option>
                    <option value="asia">Asia</option>
                    <option value="worldwide">Worldwide</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Travelers</label>
                <div className="relative">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={quoteForm.travelers}
                    onChange={(e) => {
                      setQuoteForm({ ...quoteForm, travelers: e.target.value });
                      setQuoteReady(false);
                    }}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  <input
                    type="date"
                    value={quoteForm.startDate}
                    onChange={(e) => {
                      setQuoteForm({ ...quoteForm, startDate: e.target.value });
                      setQuoteReady(false);
                    }}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600" />
                  <input
                    type="date"
                    value={quoteForm.endDate}
                    onChange={(e) => {
                      setQuoteForm({ ...quoteForm, endDate: e.target.value });
                      setQuoteReady(false);
                    }}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="md:col-span-2 bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Premium'}
              </button>

              {errorMessage && (
                <div className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-bold leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {calculatedPremium && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Estimated Premium</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">₹{calculatedPremium}</span>
                      <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                        {selectedPlan.name} • {tripDays} day{tripDays > 1 ? 's' : ''} • {travelerCount} traveler{travelerCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button onClick={handleBuy} disabled={isPurchasing} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
                      {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Issue Policy
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="relative space-y-8">
            {policySummary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-[2.5rem] p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Policy Issued</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Reference {policySummary.policyId}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                  {policySummary.planName} has been issued for {quoteForm.destination}. Total premium: ₹{policySummary.premium}.
                </p>
              </motion.div>
            )}

            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quote Logic</h3>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">How premium is calculated</p>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {[
                  'Selected plan decides the base premium.',
                  'Longer trips increase the premium gradually day by day.',
                  'Regional multiplier adjusts domestic, Asia, and worldwide risk.',
                  'Additional travelers add group coverage cost.',
                  'Policy can only be issued after valid dates are entered.'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{selectedPlan.price}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Plan Price</span>
                </div>
                <button onClick={() => setSelectedPlanId(selectedPlan.id)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">
                  Selected
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {INSURANCE_PLANS.map((plan) => {
            const isActive = plan.id === selectedPlanId;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-slate-900 p-10 rounded-[3rem] border transition-all group ${isActive ? 'border-indigo-600 shadow-2xl' : 'border-slate-100 dark:border-slate-800 hover:shadow-2xl'}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{plan.name}</h3>
                    {plan.recommended && <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-indigo-600">Recommended</p>}
                  </div>
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.covers.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-black text-indigo-600 tracking-tighter">₹{plan.price}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Premium</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setQuoteReady(false);
                      setPolicySummary(null);
                    }}
                    className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white'}`}
                  >
                    {isActive ? 'Selected' : 'Choose Plan'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-40">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-16 text-center">Hassle-free Claims</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Inform Us', desc: 'Call our 24/7 helpline or use the SykBound app.' },
              { step: '02', title: 'Submit Info', desc: 'Upload necessary documents digitally.' },
              { step: '03', title: 'Verification', desc: 'Our experts review your claim instantly.' },
              { step: '04', title: 'Settlement', desc: 'Direct transfer to your bank or SykBound Wallet.' }
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                <div className="text-6xl font-black text-slate-50 dark:text-slate-800 absolute -top-4 -right-4 group-hover:text-indigo-600/10 transition-colors">{s.step}</div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-4 relative z-10">{s.title}</h4>
                <p className="text-sm font-bold text-slate-500 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
