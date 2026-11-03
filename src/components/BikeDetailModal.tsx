import React from 'react';
import { Bicycle, Review } from '../types';
import { X, Star, MapPin, BatteryCharging, ShieldCheck, Wrench, ArrowRight, Check } from 'lucide-react';

interface BikeDetailModalProps {
  bike: Bicycle | null;
  isOpen: boolean;
  onClose: () => void;
  onReserve: (bike: Bicycle) => void;
  reviews: Review[];
}

export const BikeDetailModal: React.FC<BikeDetailModalProps> = ({
  bike,
  isOpen,
  onClose,
  onReserve,
  reviews
}) => {
  if (!isOpen || !bike) return null;

  const bikeReviews = reviews.filter(r => r.bicycleId === bike.id || r.bicycleName === bike.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold font-display text-base-content">
              {bike.name}
            </span>
            <span className="badge badge-sm badge-success text-white font-mono">
              {bike.category}
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs"
            aria-label="Close details dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          
          {/* Main Visual & Key Badges */}
          <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-base-200">
            <img
              src={bike.imageUrl}
              alt={bike.name}
              className="w-full h-full object-cover"
            />
            {bike.batteryPercent !== undefined && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>{bike.batteryPercent}% Charged (65km range)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 font-mono">
              Overview & Specifications
            </h4>
            <p className="text-sm text-base-content/80 mt-1 leading-relaxed">
              {bike.description}
            </p>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[10px] text-base-content/50 uppercase font-mono">Gearing</span>
              <div className="font-semibold text-xs text-base-content mt-0.5 truncate">{bike.gears}</div>
            </div>

            <div className="p-3 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[10px] text-base-content/50 uppercase font-mono">Frame Size</span>
              <div className="font-semibold text-xs text-base-content mt-0.5">{bike.frameSize}</div>
            </div>

            <div className="p-3 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[10px] text-base-content/50 uppercase font-mono">Condition</span>
              <div className="font-semibold text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{bike.conditionScore.toFixed(1)} / 5.0</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-base-200/70 border border-base-300">
              <span className="text-[10px] text-base-content/50 uppercase font-mono">Trips Completed</span>
              <div className="font-semibold text-xs text-base-content mt-0.5 font-mono">{bike.totalTrips} rides</div>
            </div>
          </div>

          {/* Station Dock Location */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-base-content">Docked at: {bike.station}</div>
              <p className="text-xs text-base-content/65 mt-0.5">
                Ready for immediate pickup. Return can be performed at any registered city hub.
              </p>
            </div>
          </div>

          {/* Customer Reviews for this model */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 font-mono">
                Rider Reviews ({bikeReviews.length})
              </h4>
              <div className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>4.9 Average</span>
              </div>
            </div>

            {bikeReviews.length === 0 ? (
              <p className="text-xs text-base-content/50 italic">
                No individual reviews logged yet. Be the first to rent and rate this bike!
              </p>
            ) : (
              <div className="space-y-2.5">
                {bikeReviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-lg bg-base-200/60 border border-base-300 text-xs">
                    <div className="flex items-center justify-between text-base-content/70">
                      <span className="font-semibold text-base-content">{rev.customerName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-base-content/75 mt-1.5 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-base-content/40 mt-1 block font-mono">{rev.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 px-6 border-t border-base-200 bg-base-200/50 flex items-center justify-between">
          <div>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${bike.ratePerHour.toFixed(2)}
            </span>
            <span className="text-xs text-base-content/60"> / hour</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost text-xs"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onReserve(bike);
              }}
              disabled={bike.status !== 'available'}
              className="btn btn-sm btn-primary text-white text-xs gap-1.5"
            >
              <span>{bike.status === 'available' ? 'Proceed to Book' : `Currently ${bike.status}`}</span>
              {bike.status === 'available' && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
