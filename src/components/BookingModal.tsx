import React, { useState } from 'react';
import { Bicycle, Booking } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, Calendar, Clock, MapPin, CheckCircle, ShieldCheck, QrCode, AlertCircle, ArrowRight, User, Mail, Phone, Sparkles } from 'lucide-react';

interface BookingModalProps {
  bike: Bicycle | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  currentUser?: any;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  bike,
  isOpen,
  onClose,
  onBookingSuccess,
  currentUser
}) => {
  if (!isOpen || !bike) return null;

  const [step, setStep] = useState<'form' | 'voucher'>('form');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || 'Allan Singh');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || 'allan.singh@example.com');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '+91 98765 43210');
  const [startTime, setStartTime] = useState<string>(
    new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Financial calculations
  const isFullDay = durationHours >= 8;
  const rentalFee = isFullDay ? bike.ratePerDay : Number((durationHours * bike.ratePerHour).toFixed(2));
  const ecoDiscount = 1.00; // $1.00 community green discount
  const totalAmount = Math.max(1.0, Number((rentalFee - ecoDiscount).toFixed(2)));

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setError('Please provide your name and email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const booking = await api.createBooking({
        bicycleId: bike.id,
        customerName,
        customerEmail,
        customerPhone,
        durationHours,
        pickupStation: bike.station,
        startTime: new Date(startTime).toISOString()
      });

      setConfirmedBooking(booking);
      setStep('voucher');
      onBookingSuccess(booking);

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#14B8A6', '#34D399']
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete reservation.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('form');
    setError(null);
    setConfirmedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/50">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold font-display text-base-content">
              {step === 'form' ? 'Reserve Bicycle' : 'Reservation Voucher'}
            </span>
            <span className="badge badge-sm badge-success text-white font-mono">
              {bike.category}
            </span>
          </div>

          <button
            onClick={handleResetAndClose}
            className="btn btn-ghost btn-circle btn-xs"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleConfirmReservation} className="p-6 flex flex-col gap-5">
            {/* Bike Header Summary */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-base-200/60 border border-base-300/60">
              <img
                src={bike.imageUrl}
                alt={bike.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-base-content truncate">{bike.name}</h4>
                <div className="flex items-center gap-2 text-xs text-base-content/60 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="truncate">{bike.station}</span>
                </div>
                <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${bike.ratePerHour.toFixed(2)}/hr · ${bike.ratePerDay.toFixed(2)}/day
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Rental Duration & Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Rental Duration
                </label>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'} {isFullDay ? '(Day Rate applied)' : ''}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value))}
                className="range range-sm range-success w-full"
              />

              <div className="flex justify-between text-[10px] text-base-content/50 font-mono px-1">
                <span>1h</span>
                <span>3h</span>
                <span>6h</span>
                <span>8h (Full Day)</span>
                <span>12h</span>
              </div>
            </div>

            {/* Pickup Schedule */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                Pickup Date & Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input input-sm input-bordered w-full font-mono text-xs"
                required
              />
            </div>

            {/* Rider Information */}
            <div className="space-y-3 pt-2 border-t border-base-200">
              <span className="text-xs font-bold text-base-content uppercase tracking-wider">
                Rider Contact Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-base-content/70">Full Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-base-content/40" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="input input-sm input-bordered w-full pl-8"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-base-content/70">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-base-content/40" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="input input-sm input-bordered w-full pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-base-content/70">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-base-content/40" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="rider@example.com"
                    className="input input-sm input-bordered w-full pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-base-200/80 border border-base-300 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-base-content/70">
                <span>Rental Base ({durationHours} hrs):</span>
                <span>${rentalFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Eco-Mobility Subsidy:
                </span>
                <span>-${ecoDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-base-content pt-1.5 border-t border-base-300">
                <span>Total Due at Counter:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-lg tabular-nums">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="btn btn-sm btn-ghost text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-sm btn-primary text-white text-xs gap-1.5 px-5 shadow-sm"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <span>Confirm & Get Voucher</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Confirmation Voucher */
          <div className="p-6 flex flex-col gap-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-display text-base-content">
                Reservation Confirmed!
              </h3>
              <p className="text-xs text-base-content/70 mt-1 max-w-sm mx-auto">
                Your bicycle is reserved at the dock. Present the 4-digit PIN to the station operator or counter kiosk to unlock.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="p-5 rounded-2xl bg-base-200/90 border border-emerald-500/30 text-left space-y-4">
              <div className="flex items-center justify-between border-b border-base-300 pb-3">
                <div>
                  <span className="text-[10px] text-base-content/50 uppercase font-mono tracking-wider">
                    Voucher Number
                  </span>
                  <div className="font-mono font-bold text-sm text-base-content">
                    {confirmedBooking?.id}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-base-content/50 uppercase font-mono tracking-wider">
                    Unlock PIN
                  </span>
                  <div className="font-mono font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 tracking-widest tabular-nums">
                    {confirmedBooking?.pickupPin}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-base-content/50 uppercase font-mono">Bicycle</span>
                  <div className="font-semibold text-base-content truncate">{bike.name}</div>
                </div>
                <div>
                  <span className="text-[10px] text-base-content/50 uppercase font-mono">Pickup Station</span>
                  <div className="font-semibold text-base-content truncate">{confirmedBooking?.pickupStation}</div>
                </div>
                <div>
                  <span className="text-[10px] text-base-content/50 uppercase font-mono">Reserved Rider</span>
                  <div className="font-semibold text-base-content truncate">{confirmedBooking?.customerName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-base-content/50 uppercase font-mono">Total Amount</span>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${confirmedBooking?.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="btn btn-sm btn-primary text-white text-xs px-6"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
