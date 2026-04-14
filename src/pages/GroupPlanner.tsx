import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Users, Plus, CreditCard, CheckCircle2, Trash2, Wallet } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import { supabase } from '../services/supabase';

const membersKey = (userId: string) => `sb_group_members_${userId}`;
const expensesKey = (userId: string) => `sb_group_expenses_${userId}`;

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const GroupPlanner: React.FC = () => {
  const navigate = useNavigate();
  const { convertPrice, user } = useGlobal();
  const [members, setMembers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', paidBy: '' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGroupData();
    }
  }, [user]);

  useEffect(() => {
    if (user && !expenseForm.paidBy) {
      setExpenseForm((prev) => ({ ...prev, paidBy: user.name || user.email || 'Trip Organizer' }));
    }
  }, [user, expenseForm.paidBy]);

  const fetchGroupData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const { data: expensesData, error: expensesError } = await supabase
        .from('group_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_settled', false)
        .order('created_at', { ascending: false });

      if (membersError || expensesError) {
        setMembers(readLocal(membersKey(user.id), []));
        setExpenses(readLocal(expensesKey(user.id), []));
      } else {
        setMembers(membersData || []);
        setExpenses(expensesData || []);
      }
    } catch (err) {
      console.error('Error fetching group data:', err);
      setMembers(readLocal(membersKey(user.id), []));
      setExpenses(readLocal(expensesKey(user.id), []));
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newEmail || !user) return;
    setIsSubmitting(true);
    try {
      const normalizedEmail = newEmail.trim().toLowerCase();
      if (!normalizedEmail || members.some((member) => member.email?.toLowerCase() === normalizedEmail)) {
        return;
      }

      const memberPayload = {
        user_id: user.id,
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        paid: false
      };

      const { data, error } = await supabase
        .from('group_members')
        .insert([memberPayload])
        .select()
        .single();

      if (error) {
        const fallbackMembers = [...members, { ...memberPayload, id: crypto.randomUUID(), created_at: new Date().toISOString() }];
        setMembers(fallbackMembers);
        writeLocal(membersKey(user.id), fallbackMembers);
      } else if (data) {
        setMembers([...members, data]);
      }

      setNewEmail('');
    } catch (err) {
      console.error('Error adding member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addExpense = async () => {
    if (!user) return;
    const amount = Number(expenseForm.amount);
    if (!expenseForm.description.trim() || !expenseForm.paidBy.trim() || Number.isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    try {
      const expensePayload = {
        user_id: user.id,
        description: expenseForm.description.trim(),
        amount,
        paid_by: expenseForm.paidBy.trim(),
        is_settled: false
      };

      const { data, error } = await supabase
        .from('group_expenses')
        .insert([expensePayload])
        .select()
        .single();

      if (error) {
        const fallbackExpenses = [{ ...expensePayload, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...expenses];
        setExpenses(fallbackExpenses);
        writeLocal(expensesKey(user.id), fallbackExpenses);
      } else if (data) {
        setExpenses([data, ...expenses]);
      }

      setExpenseForm({ description: '', amount: '', paidBy: user.name || user.email || 'Trip Organizer' });
    } catch (err) {
      console.error('Error adding expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!user) return;
    const nextMembers = members.filter((member) => member.id !== memberId);
    setMembers(nextMembers);

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('id', memberId)
      .eq('user_id', user.id);

    if (error) {
      writeLocal(membersKey(user.id), nextMembers);
    }
  };

  const removeExpense = async (expenseId: string) => {
    if (!user) return;
    const nextExpenses = expenses.filter((expense) => expense.id !== expenseId);
    setExpenses(nextExpenses);

    const { error } = await supabase
      .from('group_expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', user.id);

    if (error) {
      writeLocal(expensesKey(user.id), nextExpenses);
    }
  };

  const settleAll = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const settledAt = new Date().toISOString();
      const nextMembers = members.map((member) => ({ ...member, paid: true }));
      setMembers(nextMembers);
      setExpenses([]);

      const membersUpdate = await supabase
        .from('group_members')
        .update({ paid: true })
        .eq('user_id', user.id);

      const expensesUpdate = await supabase
        .from('group_expenses')
        .update({ is_settled: true, settled_at: settledAt })
        .eq('user_id', user.id)
        .eq('is_settled', false);

      if (membersUpdate.error || expensesUpdate.error) {
        writeLocal(membersKey(user.id), nextMembers);
        writeLocal(expensesKey(user.id), []);
      }
    } catch (err) {
      console.error('Error settling expenses:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = useMemo(() => expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0), [expenses]);
  const travelerCount = Math.max(1, members.length + 1);
  const perPerson = travelerCount > 0 ? total / travelerCount : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-24 bg-[#fcfdfe] dark:bg-slate-950 px-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
          <p className="text-slate-500 font-medium mt-2">Coordinate your crew, track shared costs, and settle the full trip split in one place.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-12">
            <section className="glass p-10 rounded-[3rem]">
              <h3 className="font-black text-lg mb-8 uppercase tracking-widest flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                Travel Crew
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      {(user?.name || user?.email || 'T')[0]}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{user?.name || 'Trip Organizer'}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.email || 'Organizer'}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-green-50 text-green-600">
                    Host
                  </span>
                </div>

                {members.length > 0 ? members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">{m.name[0]}</div>
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">{m.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${m.paid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {m.paid ? 'Settled' : 'Pending'}
                      </span>
                      <button onClick={() => removeMember(m.id)} className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center text-slate-400 text-sm font-bold">No crew members yet.</div>
                )}
              </div>
              <div className="flex gap-4">
                <input 
                  type="email"
                  placeholder="friend@travel.com"
                  className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
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

            <section className="glass p-10 rounded-[3rem]">
              <h3 className="font-black text-lg mb-8 uppercase tracking-widest flex items-center gap-3">
                <Wallet className="w-5 h-5 text-blue-600" />
                Add Shared Expense
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Dinner, cab, hotel deposit..."
                  className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="1"
                    placeholder="Amount"
                    className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Paid by"
                    className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm"
                    value={expenseForm.paidBy}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, paidBy: e.target.value }))}
                  />
                </div>
                <button
                  onClick={addExpense}
                  disabled={isSubmitting || !expenseForm.description || !expenseForm.amount || !expenseForm.paidBy}
                  className="azure-btn px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-none disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Expense
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
                {expenses.length > 0 ? expenses.map((e) => (
                  <div key={e.id} className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div>
                      <div className="font-bold text-sm">{e.description || e.desc}</div>
                      <div className="text-[10px] text-slate-400">Paid by {e.paid_by || e.paidBy}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-black">{convertPrice(Number(e.amount || 0))}</div>
                      <button onClick={() => removeExpense(e.id)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Split Between</span>
                  <span>{travelerCount} traveler{travelerCount > 1 ? 's' : ''}</span>
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
