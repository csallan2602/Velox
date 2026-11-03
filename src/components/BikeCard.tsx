import React from 'react';
import { Bicycle } from '../types';
import { MapPin, BatteryCharging, Star, ShieldAlert, ArrowRight, Zap, Info } from 'lucide-react';

interface BikeCardProps {
  bike: Bicycle;
  onReserve: (bike: Bicycle) => void;
  onInspect: (bike: Bicycle) => void;
}

export const BikeCard: React.FC<BikeCardProps> = ({ bike, onReserve, onInspect }) => {
  const isAvailable = bike.status === 'available';

  const getStatusBadge = () => {
    switch (bike.status) {
      case 'available':
        return <span className="badge badge-success text-white badge-sm font-medium">Available</span>;
      case 'reserved':
        return <span className="badge badge-warning text-slate-900 badge-sm font-medium">Reserved</span>;
      case 'rented':
        return <span className="badge badge-info text-white badge-sm font-medium">On Ride</span>;
      case 'maintenance':
        return <span className="badge badge-error text-white badge-sm font-medium">In Service</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Bike Image Area */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-base-200">
        <img
          src={bike.imageUrl}
          alt={bike.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {getStatusBadge()}
          
          {bike.batteryPercent !== undefined && (
            <div className="px-2 py-0.5 rounded-full bg-slate-950/75 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs">
              <BatteryCharging className="w-3 h-3 text-emerald-400" />
              <span>{bike.batteryPercent}%</span>
            </div>
          )}
        </div>

        {/* Category Watermark strip */}
        <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-base-100/90 text-base-content text-[11px] font-semibold tracking-wide backdrop-blur-xs">
          {bike.category}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Title & Condition */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-base text-base-content group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {bike.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="tabular-nums">{bike.conditionScore.toFixed(1)}</span>
            </div>
          </div>

          {/* Clean Unboxed Metadata with Separators (Zero-Pill Compliance) */}
          <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1 font-medium">
            <span>Size: {bike.frameSize}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{bike.gears}</span>
          </div>

          {/* Station Dock */}
          <div className="flex items-center gap-1.5 text-xs text-base-content/75 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{bike.station}</span>
          </div>

          <p className="text-xs text-base-content/65 line-clamp-2 mt-2 leading-relaxed">
            {bike.description}
          </p>
        </div>

        {/* Pricing & Action */}
        <div className="pt-3 border-t border-base-200 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                ${bike.ratePerHour.toFixed(2)}
              </span>
              <span className="text-xs text-base-content/60 font-medium">/ hour</span>
            </div>
            <div className="text-[11px] text-base-content/50 font-mono">
              ${bike.ratePerDay.toFixed(2)} / full day
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onInspect(bike)}
              className="btn btn-ghost btn-xs text-base-content/70 hover:text-base-content"
              title="View Specifications"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onReserve(bike)}
              disabled={!isAvailable}
              className={`btn btn-sm text-xs font-semibold gap-1 ${
                isAvailable
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-disabled opacity-50'
              }`}
            >
              <span>{isAvailable ? 'Reserve' : bike.status}</span>
              {isAvailable && <ArrowRight className="w-3 h-3" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
