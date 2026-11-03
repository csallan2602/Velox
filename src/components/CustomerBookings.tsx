import React, { useState, useEffect } from 'react';
import { Booking, Station } from '../types';
import { api } from '../services/api';
import { Clock, MapPin, CheckCircle, AlertCircle, Star, Sparkles, Send, RotateCcw } from 'lucide-react';

interface CustomerBookingsProps {
  bookings: Booking[];
  stations: Station[];
  onRefreshBookings: () => void;
  onOpenCatalog: () => void;
}

export const CustomerBookings: React.FC<CustomerBookingsProps> = ({
  bookings,
  stations,
  onRefreshBookings,
  onOpenCatalog
}) => {
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [returnModalBooking, setReturnModalBooking] = useState<Booking | null>(null);
  const [returnStation, setReturnStation] = useState<string>(stations[0]?.name || 'Central Station Terminal');
  const [returnLoading, setReturnLoading] = useState<boolean>(false);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeOrReserved = bookings.filter(b => b.status === 'reserved' || b.status === 'active');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const handleStartRide = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'active');
      setToastMsg('Ride started! Enjoy your eco-friendly commute.');
      onRefreshBookings();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to start ride');
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnModalBooking) return;
    setReturnLoading(true);
    try {
      await api.updateBookingStatus(returnModalBooking.id, 'completed', returnStation);
      setToastMsg(`Bicycle successfully returned to ${returnStation}!`);
      const completedBooking = returnModalBooking;
      setReturnModalBooking(null);
      onRefreshBookings();

      // Open review dialog after return
      setReviewBooking(completedBooking);
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to return bicycle');
    } finally {
      setReturnLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    setReviewLoading(true);
    try {
      await api.createReview({
        bicycleId: reviewBooking.bicycleId,
        customerName: reviewBooking.customerName,
        rating,
        comment: comment || 'Great ride and smooth handling!'
      });
      setReviewBooking(null);
      setComment('');
      setToastMsg('Thank you for rating your ride!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="alert alert-success shadow-lg text-white font-medium text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg(null)} className="btn btn-ghost btn-xs text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-base-content">
            My Rentals & Reservation Vouchers
          </h2>
          <p className="text-xs text-base-content/65 mt-1">
            Track your ongoing rides, view pickup unlock PINs, or record bicycle returns at any registered dock.
          </p>
        </div>

        <button
          onClick={onOpenCatalog}
          className="btn btn-sm btn-primary text-white text-xs gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rent Another Bike</span>
        </button>
      </div>

      {/* Active & Reserved Bookings */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70 font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          Active Reservations & Rides ({activeOrReserved.length})
        </h3>

        {activeOrReserved.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-base-100 border border-base-200/90 space-y-3">
            <p className="text-sm text-base-content/60">
              You do not have any active bicycle reservations at the moment.
            </p>
            <button
              onClick={onOpenCatalog}
              className="btn btn-sm btn-outline btn-success text-xs font-semibold"
            >
              Explore Available Bicycles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrReserved.map((booking) => (
              <div
                key={booking.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 bg-base-100 ${
                  booking.status === 'active'
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : 'border-base-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-base-content/50 uppercase">
                      Voucher: {booking.id}
                    </span>
                    <span
                      className={`badge badge-sm font-medium ${
                        booking.status === 'active'
                          ? 'badge-success text-white animate-pulse'
                          : 'badge-warning text-slate-900'
                      }`}
                    >
                      {booking.status === 'active' ? '● Riding Now' : 'Reserved at Dock'}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-base-content mt-2">
                    {booking.bicycleName}
                  </h4>

                  {/* Dock & Duration Details */}
                  <div className="mt-2 text-xs space-y-1 text-base-content/70">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Pickup: {booking.pickupStation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Duration: {booking.durationHours} hours (Paid: ${booking.totalAmount.toFixed(2)})</span>
                    </div>
                  </div>

                  {/* PIN Display */}
                  <div className="mt-4 p-3 rounded-xl bg-base-200 flex items-center justify-between border border-base-300">
                    <div>
                      <span className="text-[10px] text-base-content/50 uppercase font-mono block">
                        Station Pickup PIN
                      </span>
                      <span className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                        {booking.pickupPin}
                      </span>
                    </div>
                    <span className="text-[11px] text-base-content/60 text-right max-w-[140px]">
                      Provide code to counter or scan at dock
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-base-200 flex items-center justify-end gap-2">
                  {booking.status === 'reserved' && (
                    <button
                      onClick={() => handleStartRide(booking.id)}
                      className="btn btn-sm btn-primary text-white text-xs gap-1"
                    >
                      <span>Unlock & Start Ride</span>
                    </button>
                  )}

                  {booking.status === 'active' && (
                    <button
                      onClick={() => {
                        setReturnModalBooking(booking);
                        setReturnStation(booking.pickupStation);
                      }}
                      className="btn btn-sm btn-success text-white text-xs gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return Bicycle to Dock</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Rental History Table */}
      <section className="space-y-4 pt-4 border-t border-base-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/70 font-mono">
          Rental History ({pastBookings.length})
        </h3>

        {pastBookings.length === 0 ? (
          <p className="text-xs text-base-content/50 italic">
            Completed rides will appear here with timestamps and eco-savings receipts.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-base-200 bg-base-100">
            <table className="table table-zebra table-sm w-full">
              <thead>
                <tr className="text-base-content/60 text-xs">
                  <th>Voucher ID</th>
                  <th>Bicycle</th>
                  <th>Pickup Dock</th>
                  <th>Return Dock</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {pastBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono font-bold text-base-content/80">{b.id}</td>
                    <td className="font-semibold text-base-content">{b.bicycleName}</td>
                    <td>{b.pickupStation}</td>
                    <td>{b.returnStation || b.pickupStation}</td>
                    <td className="font-mono">{b.durationHours} hrs</td>
                    <td className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${b.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm text-[11px] capitalize">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Return Bicycle Modal */}
      {returnModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-base-100 rounded-2xl p-6 shadow-2xl border border-base-300 space-y-4">
            <h3 className="text-lg font-bold font-display text-base-content">
              Confirm Bicycle Return
            </h3>
            <p className="text-xs text-base-content/70">
              Returning <strong>{returnModalBooking.bicycleName}</strong>. Select the station dock where you have locked the bicycle.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-base-content/80">Return Docking Station</label>
              <select
                value={returnStation}
                onChange={(e) => setReturnStation(e.target.value)}
                className="select select-sm select-bordered w-full"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} (Total Docks: {st.totalDocks})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReturnModalBooking(null)}
                className="btn btn-sm btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                disabled={returnLoading}
                className="btn btn-sm btn-success text-white text-xs px-4"
              >
                {returnLoading ? <span className="loading loading-spinner loading-xs" /> : 'Confirm Dock Lock & Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Ride Feedback Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form onSubmit={handleSubmitReview} className="w-full max-w-md bg-base-100 rounded-2xl p-6 shadow-2xl border border-base-300 space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <h3 className="text-base font-bold font-display text-base-content flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Rate Your Ride Experience
              </h3>
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="btn btn-ghost btn-circle btn-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-base-content/70">
              How was your ride on <strong>{reviewBooking.bicycleName}</strong>? Your feedback helps station mechanics maintain quality and safety.
            </p>

            {/* Star Rating Selector */}
            <div className="flex flex-col gap-1.5 items-center py-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-base-content/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono font-semibold text-amber-500">
                {rating} of 5 Stars
              </span>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-base-content/70">Comments & Bike Condition Feedback</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Brakes worked smoothly, seat was comfortable, gears shifted crisply..."
                className="textarea textarea-bordered text-xs h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="btn btn-sm btn-ghost text-xs"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={reviewLoading}
                className="btn btn-sm btn-primary text-white text-xs gap-1 px-4"
              >
                {reviewLoading ? <span className="loading loading-spinner loading-xs" /> : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
