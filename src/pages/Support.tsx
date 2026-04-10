
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headset, Mail, Bot, Plus, Minus, Send, MessageSquare, Phone, LifeBuoy, ChevronLeft } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useGlobal } from '../context/GlobalContext';

import Toast from '../components/Toast';

const Support: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useGlobal();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<{message:string, type:'success'|'error'|'info'}|null>(null);
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => setToastMsg({message, type});

  const faqs = [
    { q: "How do I claim a refund for my cancelled flight?", a: "Once you cancel a booking from your dashboard, a refund is automatically calculated based on the airline policy. Credits are added to your SkyWallet within seconds." },
    { q: "Can I book a seat on Vande Bharat trains via SykBound?", a: "Yes, our Train module supports all major Indian routes including Vande Bharat and Rajdhani. Use the 'Train' tab in the search form." },
    { q: "What are SkyPoints?", a: "SkyPoints are our virtual rewards. You earn 5% of your booking value as points which can be redeemed against future bookings at 1 Point = ₹1." },
    { q: "How do I update my profile details?", a: "Go to your Dashboard, click on your profile avatar, and select 'Edit Profile'. Note: Some details require identity verification." }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('support_tickets').insert([{
        user_id: user?.id || null,
        name: formState.name,
        email: formState.email,
        message: formState.message,
        status: 'open'
      }]);

      if (error) throw error;

      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
      setIsSubmitting(false);
      showToast("Failed to send message. Please try again later.", "error");
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-24 bg-slate-50 dark:bg-slate-950 px-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="text-center mb-24">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">
             <LifeBuoy className="w-3 h-3" />
             Help Center
           </div>
           <h1 className="text-7xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white">How can we <span className="text-indigo-600">help?</span></h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-xl max-w-2xl mx-auto leading-relaxed">Quick answers and 24/7 assistance for your global journeys. Our team is always ready to assist.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
           {[
             { icon: Headset, title: 'Live Support', desc: 'Available 24/7', color: 'blue' },
             { icon: Mail, title: 'Email Support', desc: 'Responds in 2h', color: 'indigo' },
             { icon: Bot, title: 'AI Assistant', desc: 'Instant Answers', color: 'purple' }
           ].map((item, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -10 }}
               className={`p-12 bg-white dark:bg-slate-900 rounded-[3.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all cursor-pointer group`}
             >
                <div className={`w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-black uppercase text-xs tracking-widest mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-black mb-10 tracking-tight text-slate-900 dark:text-white">Frequently Asked</h2>
              <div className="space-y-4">
                {faqs.map((f, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full p-8 flex justify-between items-center text-left group"
                    >
                       <span className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{f.q}</span>
                       {activeFaq === i ? <Minus className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-slate-400" />}
                    </button>
                    {activeFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-8 pb-8 text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
                      >
                        {f.a}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h3 className="text-2xl font-black mb-4 relative z-10">Still need help?</h3>
              <p className="text-slate-400 font-medium mb-8 relative z-10">Our global support team is ready to assist you with any travel-related queries.</p>
              <div className="flex flex-wrap gap-4 relative z-10">
                <button className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  <Phone className="w-4 h-4" />
                  Call Us
                </button>
                <button className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">
                  <MessageSquare className="w-4 h-4" />
                  Live Chat
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl">
            <h2 className="text-4xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">Send a Message</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">Fill out the form below and we'll get back to you as soon as possible.</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formState.name}
                  onChange={e => setFormState({...formState, name: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] font-bold outline-none border border-transparent focus:border-indigo-600 transition-all text-slate-900 dark:text-white" 
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formState.email}
                  onChange={e => setFormState({...formState, email: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] font-bold outline-none border border-transparent focus:border-indigo-600 transition-all text-slate-900 dark:text-white" 
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formState.message}
                  onChange={e => setFormState({...formState, message: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] font-bold outline-none border border-transparent focus:border-indigo-600 transition-all text-slate-900 dark:text-white resize-none" 
                  placeholder="How can we help you today?"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800 text-center"
                >
                  <p className="text-sm font-bold text-green-600">Message sent successfully! We'll be in touch soon.</p>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </div>

      {toastMsg && (
        <Toast 
          message={toastMsg.message} 
          type={toastMsg.type} 
          onClose={() => setToastMsg(null)} 
        />
      )}
    </div>
  );
};

export default Support;
