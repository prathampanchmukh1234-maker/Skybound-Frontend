import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, ShieldCheck, FileText, Clock, CheckCircle2, X, Upload, ArrowRight, ArrowLeft, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { VISA_DESTINATIONS } from '../constants';
import { useGlobal } from '../context/GlobalContext';
import { saveVisaApplication, uploadVisaDocument } from '../services/travelServices';

type VisaFormData = {
  fullName: string;
  passportNumber: string;
  email: string;
  phone: string;
  travelDate: string;
  purpose: string;
};

type VisaDocumentState = {
  passportCopy: File | null;
  photograph: File | null;
};

const EMPTY_FORM: VisaFormData = {
  fullName: '',
  passportNumber: '',
  email: '',
  phone: '',
  travelDate: '',
  purpose: 'Tourist'
};

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const Visa: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useGlobal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<VisaFormData>(EMPTY_FORM);
  const [documents, setDocuments] = useState<VisaDocumentState>({
    passportCopy: null,
    photograph: null
  });

  const filteredDestinations = useMemo(
    () => VISA_DESTINATIONS.filter((d) => d.country.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const closeModal = () => {
    setSelectedCountry(null);
    setStep(1);
    setErrorMessage('');
    setFormData(EMPTY_FORM);
    setDocuments({ passportCopy: null, photograph: null });
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.passportNumber.trim() || !formData.email.trim() || !formData.phone.trim()) {
        return 'Please complete all personal details before continuing.';
      }
      return '';
    }

    if (currentStep === 2) {
      if (!formData.travelDate || !formData.purpose) {
        return 'Please add your travel date and visa purpose.';
      }

      if (new Date(formData.travelDate) < new Date(new Date().toDateString())) {
        return 'Travel date must be today or later.';
      }

      return '';
    }

    if (!documents.passportCopy || !documents.photograph) {
      return 'Please upload both the passport copy and the photograph.';
    }

    return '';
  };

  const handleNextStep = () => {
    const validationMessage = validateStep(step);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage('');
    setStep((current) => Math.min(3, current + 1));
  };

  const handleFileChange = (documentType: keyof VisaDocumentState, file?: File | null) => {
    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage('Only JPG, PNG, or WEBP images are supported for visa documents.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Each document must be under 5MB.');
      return;
    }

    setErrorMessage('');
    setDocuments((current) => ({
      ...current,
      [documentType]: file
    }));
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/visa' } });
      return;
    }

    if (!selectedCountry) {
      setErrorMessage('Please select a visa destination first.');
      return;
    }

    const validationMessage = validateStep(3);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const [passportUpload, photographUpload] = await Promise.all([
        uploadVisaDocument(user.id, 'passport', documents.passportCopy as File),
        uploadVisaDocument(user.id, 'photograph', documents.photograph as File)
      ]);

      const applicationRecord = await saveVisaApplication({
        user_id: user.id,
        country: selectedCountry.country,
        full_name: formData.fullName.trim(),
        passport_number: formData.passportNumber.trim().toUpperCase(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        travel_date: formData.travelDate,
        purpose: formData.purpose,
        status: 'pending',
        fee: selectedCountry.fee,
        passport_copy_path: `${passportUpload.bucket}/${passportUpload.path}`,
        passport_copy_url: passportUpload.publicUrl,
        photograph_path: `${photographUpload.bucket}/${photographUpload.path}`,
        photograph_url: photographUpload.publicUrl
      });

      navigate('/visa/success', {
        state: {
          country: selectedCountry.country,
          referenceId: applicationRecord?.id || `VISA-${Date.now()}`,
          email: formData.email.trim(),
          travelDate: formData.travelDate,
          purpose: formData.purpose
        }
      });
      closeModal();
    } catch (err: any) {
      console.error('Visa application failed:', err);
      setErrorMessage(err?.message || 'Unable to submit your visa application right now.');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadCard = (label: 'Passport Copy' | 'Photograph', key: keyof VisaDocumentState) => {
    const selectedFile = documents[key];

    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{label}</label>
        <label className="block border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-600 transition-all cursor-pointer group">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleFileChange(key, event.target.files?.[0])}
          />
          <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 mx-auto mb-4 transition-colors" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {selectedFile ? 'Replace file' : 'Click to upload'}
          </p>
          <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400 break-all">
            {selectedFile ? selectedFile.name : 'PNG, JPG or WEBP up to 5MB'}
          </p>
        </label>
      </div>
    );
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-24">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Globe className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Mobility</span>
              </div>
              <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Visa Assistance. Simplified.</h1>
              <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-lg">Expert guidance for tourist, business, and transit visas to over 50+ countries.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
              <input
                type="text"
                placeholder="Search country (e.g. Thailand, Dubai)"
                className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900 rounded-[2rem] font-bold text-lg outline-none border border-slate-100 dark:border-slate-800 shadow-xl focus:border-indigo-600 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              {['Dubai', 'Thailand', 'Singapore', 'Vietnam', 'Europe'].map((pop) => (
                <button key={pop} onClick={() => setSearchTerm(pop)} className="px-6 py-3 bg-white dark:bg-slate-900 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-indigo-600 transition-all uppercase tracking-widest">
                  {pop}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {[
              { icon: <FileText className="w-8 h-8 text-indigo-600" />, title: 'Paperless', desc: 'Upload documents once and keep every application traceable.' },
              { icon: <Clock className="w-8 h-8 text-indigo-600" />, title: 'Fast Track', desc: 'Know the processing timeline before you submit.' },
              { icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />, title: 'Secure', desc: 'Passport copy and photo are stored in Supabase Storage.' },
              { icon: <CheckCircle2 className="w-8 h-8 text-indigo-600" />, title: 'Expert Review', desc: 'Each request is prepared for manual verification.' }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-2">{feature.title}</h4>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((dest, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={dest.flag}
                    alt={dest.country}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1200';
                    }}
                  />
                  <div className="absolute top-8 left-8 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                    {dest.type}
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{dest.country}</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Time</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{dest.processing}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">{dest.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <span className="text-3xl font-black text-indigo-600 tracking-tighter">₹{dest.fee}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Total Fee</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCountry(dest);
                        setStep(1);
                        setErrorMessage('');
                      }}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all active:scale-95"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">No destinations found</h3>
              <p className="text-slate-500 font-bold mt-2">Try searching for another country or region.</p>
            </div>
          )}
        </div>

        <div className="mt-40 bg-slate-900 dark:bg-indigo-600 rounded-[4rem] p-16 md:p-24 text-white">
          <div className="max-w-3xl">
            <h2 className="text-6xl font-black tracking-tighter mb-12 leading-none">Standard Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white/80">Valid passport with at least 6 months validity.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white/80">Recent passport-size photograph with a plain background.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white/80">Confirmed return travel and accommodation when required.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white/80">Financial proof may still be requested for selected countries.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCountry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-12">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Visa Application</h3>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">{selectedCountry.country} • {selectedCountry.type}</p>
                  </div>
                  <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-12 relative">
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                        step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>

                <div className="space-y-8">
                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                          placeholder="As per passport"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Passport Number</label>
                        <input
                          type="text"
                          value={formData.passportNumber}
                          onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                          placeholder="Enter number"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Travel Date</label>
                          <input
                            type="date"
                            value={formData.travelDate}
                            onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Purpose</label>
                          <select
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border border-transparent focus:border-indigo-600 transition-all"
                          >
                            <option>Tourist</option>
                            <option>Business</option>
                            <option>Transit</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                        <h5 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Required Documents</h5>
                        <ul className="space-y-3">
                          {['Passport Copy', 'Recent Photograph', 'Travel details for review'].map((doc) => (
                            <li key={doc} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderUploadCard('Passport Copy', 'passportCopy')}
                        {renderUploadCard('Photograph', 'photograph')}
                      </div>
                      <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Uploaded files are saved in secure Supabase Storage before the application is submitted.</p>
                      </div>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
                      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                      <p className="text-sm font-bold leading-relaxed">{errorMessage}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                    {step > 1 && (
                      <button
                        onClick={() => {
                          setErrorMessage('');
                          setStep(step - 1);
                        }}
                        className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                    )}
                    <button
                      onClick={() => (step < 3 ? handleNextStep() : handleApply())}
                      disabled={loading}
                      className="flex-[2] px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : step < 3 ? 'Next Step' : 'Submit Application'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Visa;
