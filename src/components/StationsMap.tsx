import React from 'react';
import { Station, Bicycle } from '../types';
import { MapPin, Navigation, Bike, Compass, CheckCircle2 } from 'lucide-react';

interface StationsMapProps {
  stations: Station[];
  bikes: Bicycle[];
  onSelectStation: (stationName: string) => void;
}

export const StationsMap: React.FC<StationsMapProps> = ({
  stations,
  bikes,
  onSelectStation
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-base-content">
            Registered Station Docks & Hubs
          </h2>
          <p className="text-xs text-base-content/65 mt-1">
            Pick up or drop off your bicycle at any official dock across the city network. Click any station to browse bikes stationed there.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
          <Compass className="w-4 h-4 animate-spin text-emerald-500" style={{ animationDuration: '20s' }} />
          <span>5 City Hubs Active</span>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stations.map((st) => {
          const stationBikes = bikes.filter(b => b.station === st.name);
          const availableBikes = stationBikes.filter(b => b.status === 'available');
          const occupancy = Math.round((stationBikes.length / st.totalDocks) * 100);

          return (
            <div
              key={st.id}
              className="p-5 rounded-2xl bg-base-100 border border-base-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-base-content">{st.name}</h4>
                      <span className="text-[10px] text-base-content/50 font-mono">{st.id}</span>
                    </div>
                  </div>

                  <span className={`badge badge-sm font-medium ${
                    availableBikes.length > 0 ? 'badge-success text-white' : 'badge-ghost text-base-content/50'
                  }`}>
                    {availableBikes.length} Available
                  </span>
                </div>

                <p className="text-xs text-base-content/70 mt-3 flex items-start gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-base-content/40 shrink-0 mt-0.5" />
                  <span>{st.address}</span>
                </p>

                {/* Dock Capacity Gauge */}
                <div className="mt-4 p-3 rounded-xl bg-base-200/60 border border-base-300/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-base-content/60">Docks Occupied:</span>
                    <span className="font-bold text-base-content">
                      {stationBikes.length} / {st.totalDocks} ({occupancy}%)
                    </span>
                  </div>

                  <progress
                    className={`progress w-full ${
                      occupancy > 80 ? 'progress-warning' : 'progress-success'
                    }`}
                    value={stationBikes.length}
                    max={st.totalDocks}
                  />

                  <div className="flex items-center justify-between text-[11px] text-base-content/60 pt-0.5">
                    <span>Electric Boost: {stationBikes.filter(b => b.category === 'Electric').length}</span>
                    <span>Standard: {stationBikes.filter(b => b.category !== 'Electric').length}</span>
                  </div>
                </div>
              </div>

              {/* Station Action */}
              <button
                onClick={() => onSelectStation(st.name)}
                className="btn btn-sm btn-outline btn-success w-full text-xs font-semibold gap-1.5"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>View Bicycles at this Dock ({availableBikes.length})</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
