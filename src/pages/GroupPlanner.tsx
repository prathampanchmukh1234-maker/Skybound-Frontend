
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Users, Plus, CreditCard, CheckCircle2, Trash2 } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { supabase } from '../services/supabase';

const GroupPlanner: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice, user } = useGlobal();
  const [members, setMembers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGroupData();
    }
  }, [user]);

  const fetchGroupData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch members
      const { data: membersData } = await supabase
        .from('group_members')
        .select('*')
        .eq('user_id', user.id);
      
      if (membersData) setMembers(membersData);

      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('group_expenses')
        .select('*')
        .eq('user_id', user.id);
      
      if (expensesData) setExpenses(expensesData);
    } catch (err) {
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newEmail || !user) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('group_members')
        .insert([{
          user_id: user.id,
          name: newEmail.split('@')[0],
          email: newEmail,
          paid: false
        }])
        .select();

      if (error) throw error;
      if (data) setMembers([...members, data[0]]);
      setNewEmail('');
    } catch (err) {
      console.error('Error adding member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const settleAll = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // Mark all members as settled
      await supabase
        .from('group_members')
        .update({ paid: true })
        .eq('user_id', user.id);
      
      // Delete all expenses
      await supabase
        .from('group_expenses')
        .delete()
        .eq('user_id', user.id);
      
      setMembers(members.map(m => ({ ...m, paid: true })));
      setExpenses([]);
    } catch (err) {
      console.error('Error settling expenses:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const perPerson = members.length > 0 ? total / members.length : 0;

  return (
    <div className="min-h-screen pt-36 pb-24 bg-[#fcfdfe] dark:bg-slate-950 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
           <button 
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-indigo-100 transition-all shadow-sm">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
           <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Elite Group Planner</h1>
           <p className="text-slate-500 font-medium mt-2">Coordinate, split, and conquer with your travel crew.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-12">
              <section className="glass p-10 rounded-[3rem]">
                 <h3 className="font-black text-lg mb-8 uppercase tracking-widest flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-600" />
                    Travel Crew
                 </h3>
                 <div className="space-y-4 mb-8">
                    {members.length > 0 ? members.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">{m.name[0]}</div>
                            <div>
                               <div className="text-sm font-black text-slate-900 dark:text-white">{m.name}</div>
                               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.email}</div>
                            </div>
                         </div>
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${m.paid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {m.paid ? 'Settled' : 'Pending'}
                         </span>
                      </div>
                    )) : (
                      <div className="py-10 text-center text-slate-400 text-sm font-bold">No crew members yet.</div>
                    )}
                 </div>
                 <div className="flex gap-4">
                    <input 
                      type="email" placeholder="friend@travel.com"
                      className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm"
                      value={newEmail} onChange={e => setNewEmail(e.target.value)}
                    />
                    <button 
                      onClick={addMember} 
                      disabled={isSubmitting || !newEmail}
                      className="azure-btn px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-none disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                    </button>
                 </div>
              </section>
           </div>

           <div className="space-y-12">
              <section className="bg-slate-900 p-10 rounded-[3rem] text-white">
                 <h3 className="font-black text-lg mb-8 uppercase tracking-widest flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    Expense Splitter
                 </h3>
                 <div className="space-y-6 mb-10">
                    {expenses.length > 0 ? expenses.map((e, i) => (
                      <div key={i} className="flex justify-between items-center pb-4 border-b border-white/10">
                         <div>
                            <div className="font-bold text-sm">{e.description || e.desc}</div>
                            <div className="text-[10px] text-slate-400">Paid by {e.paid_by || e.paidBy}</div>
                         </div>
                         <div className="font-black">{convertPrice(e.amount)}</div>
                      </div>
                    )) : (
                      <div className="py-10 text-center text-slate-500 text-sm font-bold">All expenses settled.</div>
                    )}
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                       <span>Total Pool</span>
                       <span>{convertPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black">
                       <span>Per Explorer</span>
                       <span className="text-blue-400">{convertPrice(perPerson)}</span>
                    </div>
                 </div>
                 <button 
                  onClick={settleAll}
                  disabled={expenses.length === 0 || isSubmitting}
                  className="w-full mt-10 py-5 azure-btn rounded-2xl font-black text-[11px] uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                   Settle Expenses
                 </button>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPlanner;
