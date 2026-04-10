import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, Loader2 } from 'lucide-react';
import { Review } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useGlobal } from '../context/GlobalContext';

interface ReviewSystemProps {
  serviceId: string;
  serviceType: string;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ serviceId, serviceType }) => {
  const { user } = useGlobal();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('service_id', serviceId)
          .order('created_at', { ascending: false });
        
        if (data) {
          const mappedReviews: Review[] = data.map(r => ({
            id: r.id,
            userId: r.user_id,
            userName: r.user_name,
            serviceId: r.service_id,
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          }));
          setReviews(mappedReviews);
        }
      } else {
        const local = localStorage.getItem(`reviews_${serviceId}`);
        if (local) setReviews(JSON.parse(local));
      }
      setLoading(false);
    };

    loadReviews();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const reviewData = {
      user_id: user?.id || null,
      user_name: user?.name || 'Guest',
      service_id: serviceId,
      service_type: serviceType,
      rating: newRating,
      comment: newComment.trim()
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
      
      if (data) {
        const newReview: Review = {
          id: data.id,
          userId: data.user_id,
          userName: data.user_name,
          serviceId: data.service_id,
          rating: data.rating,
          comment: data.comment,
          date: new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        setReviews(prev => [newReview, ...prev]);
      }
    } else {
      const newReview: Review = {
        id: `r-${Date.now()}`,
        userId: user?.id || 'guest',
        userName: user?.name || 'Guest',
        serviceId,
        rating: newRating,
        comment: newComment.trim(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      const updated = [newReview, ...reviews];
      setReviews(updated);
      localStorage.setItem(`reviews_${serviceId}`, JSON.stringify(updated));
    }

    setNewComment('');
    setNewRating(5);
    setSubmitting(false);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-500">{averageRating} / 5.0 ({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        newRating >= star ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${newRating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Experience</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tell us what you thought..."
                  className="w-full h-32 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Post Review
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white">{review.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar className="w-3 h-3" />
                    {review.date}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 font-bold italic">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem;
