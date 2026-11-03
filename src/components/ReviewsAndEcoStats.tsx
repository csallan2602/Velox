import React, { useState } from 'react';
import { Review, PlatformStats } from '../types';
import { api } from '../services/api';
import { Star, Leaf, Award, Heart, MessageSquare, Send, CheckCircle2, Flame, Bike, ShieldCheck, Sparkles } from 'lucide-react';

interface ReviewsAndEcoStatsProps {
  reviews: Review[];
  stats: PlatformStats | null;
  onRefreshReviews: () => void;
}

export const ReviewsAndEcoStats: React.FC<ReviewsAndEcoStatsProps> = ({
  reviews,
  stats,
  onRefreshReviews
}) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    setLoading(true);
    try {
      await api.createReview({
        customerName: customerName || 'Community Cyclist',
        rating,
        comment
      });
      setComment('');
      setCustomerName('');
      setToast('Thank you! Your community review has been posted.');
      onRefreshReviews();
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {toast && (
        <div className="alert alert-success shadow-md text-white font-medium text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {toast}
          </span>
          <button onClick={() => setToast(null)} className="btn btn-ghost btn-xs text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-base-200 pb-5">
        <h2 className="text-2xl font-bold font-display text-base-content">
          Community Reviews & Eco-Impact Telemetry
        </h2>
        <p className="text-xs text-base-content/65 mt-1">
          Every bicycle ride offsets vehicular carbon emissions and promotes green urban mobility across Mumbai and beyond.
        </p>
      </div>

      {/* Quantitative Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              CO₂ Carbon Offset
            </span>
            <Leaf className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 my-3 tabular-nums">
            {stats ? `${stats.co2SavedKg} kg` : '184 kg'}
          </div>
          <p className="text-xs text-base-content/70">
            Calculated at ~0.21 kg CO₂ saved per km compared to standard combustion engine passenger vehicles.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent border border-teal-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 uppercase">
              Distance Commuted
            </span>
            <Bike className="w-5 h-5 text-teal-500" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-teal-600 dark:text-teal-400 my-3 tabular-nums">
            {stats ? `${stats.distanceCoveredKm.toLocaleString()} km` : '5,460 km'}
          </div>
          <p className="text-xs text-base-content/70">
            Total clean mileage completed across city university corridors, parks, and downtown stations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase">
              Health & Vitality
            </span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-amber-500 my-3 tabular-nums">
            {stats ? stats.caloriesBurned.toLocaleString() : '174,000'}
          </div>
          <p className="text-xs text-base-content/70">
            Active calories burned by students, commuters, and tourists choosing healthy cycling.
          </p>
        </div>
      </div>

      {/* Reviews Grid & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Review Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70 font-mono">
              Verified Rider Feedback ({reviews.length})
            </h3>
            <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>4.9 Platform Rating</span>
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-base-100 border border-base-200/90 shadow-xs text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-base-content">{rev.customerName}</span>
                      <span className="text-[10px] text-base-content/40 ml-2">· {rev.bicycleName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-base-content/80 leading-relaxed">
                  "{rev.comment}"
                </p>

                <span className="text-[10px] text-base-content/40 font-mono block">
                  Reviewed on {rev.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Review Card (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-base-100 border border-base-200 shadow-xs">
          <h3 className="font-bold text-sm font-display text-base-content flex items-center gap-1.5 mb-1">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            Share Your Experience
          </h3>
          <p className="text-xs text-base-content/65 mb-4">
            Did you enjoy your rental? Let operators and fellow riders know how the bike performed.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-base-content/70">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Allan S."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-base-content/70">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-base-content/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-base-content/70">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comfortable seat, easy pickup at Central Station..."
                className="textarea textarea-bordered text-xs h-24"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm btn-primary text-white w-full text-xs gap-1.5"
            >
              {loading ? <span className="loading loading-spinner loading-xs" /> : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Review</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Academic Project Citation & Declaration */}
      <div className="p-5 rounded-2xl bg-base-200/60 border border-base-300 text-xs text-base-content/70 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-base-content">
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Project Synopsis Specification & Certification</span>
        </div>
        <p className="leading-relaxed">
          Based on the Third Year B.Sc. Computer Science Mini Project Synopsis titled <em>"Bicycle Rental System – A Web-Based Bicycle Rental Platform"</em> submitted by <strong>Nadar AllanSingh</strong> (Roll No: 41, Seat No: 24TCS064, Nirmala Memorial Foundation College, Kandivali, Mumbai). Engineered with React.js, Tailwind CSS with daisyUI, Express backend, and MongoDB Atlas persistence.
        </p>
      </div>

    </div>
  );
};
