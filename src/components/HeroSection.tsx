import React from 'react';
import { JarvisSmartHub } from './JarvisSmartHub';
import { Search, MapPin, Bike, BatteryCharging, Leaf, ShieldCheck, Flame, Compass } from 'lucide-react';
import { Station, PlatformStats } from '../types';

interface HeroSectionProps {
  stations: Station[];
  stats: PlatformStats | null;
  selectedStation: string;
  setSelectedStation: (station: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stations,
  stats,
  selectedStation,
  setSelectedStation,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onExploreClick
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-12">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Grid: Left Proposition + Right 3D Smart-Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (7 cols): Proposition & Fast Filter */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium w-fit border border-emerald-500/20">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-Carbon Community Cycling Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-base-content leading-[1.15]">
              Ride freely. Explore your city with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                instant bicycle rentals.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-base-content/75 max-w-2xl leading-relaxed">
              Find, reserve, and unlock calibrated electric, road, mountain, and cruiser bicycles from registered station docks. Real-time availability, clear hourly rates, and zero manual paperwork.
            </p>

            {/* Quick Filter Box */}
            <div className="p-4 rounded-2xl bg-base-100 shadow-lg border border-base-200/90 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Station Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Pickup Station
                  </label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="select select-sm select-bordered w-full font-medium"
                  >
                    <option value="All">All Registered Stations</option>
                    {stations.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.availableBikes} bikes)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Text */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Model or Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electric, Shimano, MTB..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input input-sm input-bordered w-full"
                  />
                </div>
              </div>

              {/* Category Segmented Tabs */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-base-200">
                <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                  {['All', 'Electric', 'Mountain', 'Road', 'City Cruiser'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={onExploreClick}
                  className="btn btn-sm btn-primary text-white gap-1 font-medium whitespace-nowrap shrink-0 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Fleet</span>
                </button>
              </div>
            </div>

            {/* Micro Trust Markers */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-base-content/70 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Safety-Inspected Fleet
              </span>
              <span className="flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-teal-500" />
                E-Bikes Ready at 90%+ Charge
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-500" />
                Multi-Station Flexible Returns
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): 3D Holographic Smart-Hub Visualizer */}
          <div className="lg:col-span-5 h-[380px] sm:h-[420px] w-full">
            <JarvisSmartHub
              activeRides={stats?.activeRentals || 3}
              co2SavedKg={stats?.co2SavedKg || 184}
            />
          </div>

        </div>

        {/* 4-Column Live Metric Strip below the hero */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-base-100 border border-base-200/80 shadow-xs flex flex-col">
            <span className="text-xs text-base-content/60 font-medium">Total Community Trips</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {stats ? stats.totalTrips.toLocaleString() : '840+'}
            </div>
            <span className="text-[11px] text-base-content/50 mt-1">Across 5 city docks</span>
          </div>

          <div className="p-4 rounded-xl bg-base-100 border border-base-200/80 shadow-xs flex flex-col">
            <span className="text-xs text-base-content/60 font-medium">Active Bikes on Road</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-teal-600 dark:text-teal-400 mt-1">
              {stats ? stats.activeRentals : '6'}
            </div>
            <span className="text-[11px] text-base-content/50 mt-1">Real-time live telemetry</span>
          </div>

          <div className="p-4 rounded-xl bg-base-100 border border-base-200/80 shadow-xs flex flex-col">
            <span className="text-xs text-base-content/60 font-medium">Estimated CO₂ Saved</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {stats ? `${stats.co2SavedKg} kg` : '184 kg'}
            </div>
            <span className="text-[11px] text-base-content/50 mt-1">vs fossil-fuel vehicular travel</span>
          </div>

          <div className="p-4 rounded-xl bg-base-100 border border-base-200/80 shadow-xs flex flex-col">
            <span className="text-xs text-base-content/60 font-medium">Rider Calories Burned</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-500 mt-1">
              {stats ? stats.caloriesBurned.toLocaleString() : '28,000'}
            </div>
            <span className="text-[11px] text-base-content/50 mt-1">Active healthy lifestyle</span>
          </div>
        </div>

      </div>
    </section>
  );
};
