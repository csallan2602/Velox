import React, { useState } from 'react';
import { Bicycle, Station, PlatformStats } from '../types';
import { JarvisSmartHub } from './JarvisSmartHub';
import { 
  Bike, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Leaf, 
  BatteryCharging, 
  Compass, 
  Flame, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  Users, 
  ChevronRight,
  Calculator
} from 'lucide-react';

interface LandingPageProps {
  bikes: Bicycle[];
  stations: Station[];
  stats: PlatformStats | null;
  onExploreFleet: () => void;
  onViewStations: () => void;
  onReserveBike: (bike: Bicycle) => void;
  onInspectBike: (bike: Bicycle) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  bikes,
  stations,
  stats,
  onExploreFleet,
  onViewStations,
  onReserveBike,
  onInspectBike
}) => {
  // Commute Calculator State
  const [commuteDistance, setCommuteDistance] = useState<number>(8); // 8 km daily
  const [commuteDays, setCommuteDays] = useState<number>(5); // 5 days/week

  // Calculations
  const monthlyKm = commuteDistance * 2 * commuteDays * 4; // Round trip * days * 4 weeks
  const monthlyFuelSaved = Math.round(monthlyKm * 0.16); // ~$0.16/km auto/fuel cost
  const monthlyCo2Saved = Math.round(monthlyKm * 0.21); // 0.21 kg CO2/km
  const monthlyCalories = Math.round(monthlyKm * 32); // ~32 cal/km cycling

  const featuredBikes = bikes.slice(0, 4);

  return (
    <div className="space-y-20 animate-in fade-in duration-300">
      
      {/* ── 1. HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative pt-4 sm:pt-8 pb-12 overflow-hidden">
        {/* Ambient Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (7 cols): Hero Title, Value Proposition & Action CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold w-fit border border-emerald-500/20">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              <span>Next-Gen Urban Bicycle Sharing & Rental</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-base-content leading-[1.12]">
              Ride freely. Travel green.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                Unlock your city on two wheels.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-base-content/75 max-w-2xl leading-relaxed">
              Velox connects commuters, university students, and tourists with precision-calibrated bicycles and electric assist bikes across 5 major transit hubs. Reserve online in seconds, unlock with a 4-digit PIN, and return at any dock.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreFleet}
                className="btn btn-primary text-white font-semibold gap-2 px-6 shadow-md shadow-emerald-500/20"
              >
                <Bike className="w-4 h-4" />
                <span>Explore Fleet & Reserve</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewStations}
                className="btn btn-outline border-base-300 hover:border-emerald-500 hover:bg-emerald-500/10 font-semibold gap-2 px-5"
              >
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Find Nearest Dock</span>
              </button>
            </div>

            {/* Live Trust Metrics Strip */}
            <div className="pt-4 border-t border-base-200/80 grid grid-cols-3 gap-4 max-w-lg text-xs">
              <div>
                <span className="text-base-content/50 block font-mono text-[11px]">REGISTERED FLEET</span>
                <span className="text-lg font-bold font-mono text-base-content tabular-nums">
                  {stats ? stats.totalBikes : '12+'} Bikes
                </span>
              </div>
              <div>
                <span className="text-base-content/50 block font-mono text-[11px]">ACTIVE HUBS</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {stations.length} City Docks
                </span>
              </div>
              <div>
                <span className="text-base-content/50 block font-mono text-[11px]">CO₂ OFFSET</span>
                <span className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
                  {stats ? `${stats.co2SavedKg} kg` : '184 kg'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): 3D Holographic Smart-Hub Visualizer */}
          <div className="lg:col-span-5 h-[380px] sm:h-[440px] w-full">
            <JarvisSmartHub
              activeRides={stats?.activeRentals || 3}
              co2SavedKg={stats?.co2SavedKg || 184}
            />
          </div>

        </div>
      </section>

      {/* ── 2. HOW IT WORKS (3-STEP MECHANISM) ─────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Frictionless Rental Process
          </span>
          <h2 className="text-3xl font-bold font-display text-base-content">
            How Velox Works in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-base-content/70">
            No long counter queues, paper forms, or cash deposits. Everything is digital, verified, and automated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-200/90 shadow-xs flex flex-col justify-between gap-4 group hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm font-mono border border-emerald-500/20">
                01
              </div>
              <h3 className="font-bold text-base text-base-content font-display">
                Locate & Choose Your Bike
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Browse our real-time catalogue. Filter by electric pedal-assist, mountain trail, road racer, or step-through cruiser docked at your nearest transit station.
              </p>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              Live dock availability <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-200/90 shadow-xs flex flex-col justify-between gap-4 group hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm font-mono border border-teal-500/20">
                02
              </div>
              <h3 className="font-bold text-base text-base-content font-display">
                Instant 4-Digit Unlock PIN
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Select your rental duration (hourly or full day) and get an instant digital voucher with a 4-digit PIN. Provide it to the dock operator or enter it at the kiosk.
              </p>
            </div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1">
              Automated reservation voucher <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-200/90 shadow-xs flex flex-col justify-between gap-4 group hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm font-mono border border-cyan-500/20">
                03
              </div>
              <h3 className="font-bold text-base text-base-content font-display">
                Ride & Return to Any Dock
              </h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Enjoy your commute. When finished, lock the bike at any registered dock in the city. The operator logs the return and you receive an eco-savings receipt.
              </p>
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
              Multi-dock return freedom <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED FLEET SPOTLIGHT ─────────────────────────────────── */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Calibrated For Every Commute
            </span>
            <h2 className="text-3xl font-bold font-display text-base-content">
              Featured Bicycles
            </h2>
          </div>

          <button
            onClick={onExploreFleet}
            className="btn btn-sm btn-outline btn-success text-xs font-semibold gap-1 self-start sm:self-auto"
          >
            <span>View All {bikes.length} Models</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBikes.map((bike) => (
            <div
              key={bike.id}
              className="card bg-base-100 border border-base-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-base-200">
                <img
                  src={bike.imageUrl}
                  alt={bike.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-base-100/90 text-base-content text-[11px] font-semibold tracking-wide backdrop-blur-xs">
                  {bike.category}
                </div>
                {bike.batteryPercent !== undefined && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/80 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3" />
                    <span>{bike.batteryPercent}%</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-base-content group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {bike.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1 font-medium">
                    <span>{bike.frameSize} Frame</span>
                    <span>·</span>
                    <span className="truncate">{bike.gears}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-base-content/70 mt-2 truncate">
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{bike.station}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-base-200 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ${bike.ratePerHour.toFixed(2)}
                    </span>
                    <span className="text-xs text-base-content/60">/hr</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onInspectBike(bike)}
                      className="btn btn-ghost btn-xs text-xs"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onReserveBike(bike)}
                      disabled={bike.status !== 'available'}
                      className="btn btn-primary btn-xs text-white text-xs px-3"
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. INTERACTIVE COMMUTE CALCULATOR ───────────────────────────── */}
      <section className="p-6 sm:p-8 rounded-3xl bg-base-100 border border-base-200/90 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> Eco-Mobility Savings Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-base-content">
                Calculate Your Commute Impact
              </h2>
              <p className="text-xs text-base-content/70">
                See how much money you save and carbon emissions you prevent by switching your everyday transit to Velox bicycles.
              </p>
            </div>

            {/* Slider 1: Commute Distance */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-base-content/80">One-Way Commute Distance:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm tabular-nums">
                  {commuteDistance} km
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={commuteDistance}
                onChange={(e) => setCommuteDistance(parseInt(e.target.value))}
                className="range range-sm range-success w-full"
              />
              <div className="flex justify-between text-[10px] text-base-content/50 font-mono">
                <span>2 km (Short)</span>
                <span>10 km (Urban)</span>
                <span>25 km (Long Corridor)</span>
              </div>
            </div>

            {/* Slider 2: Commute Days */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-base-content/80">Commuting Days per Week:</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono font-bold text-sm tabular-nums">
                  {commuteDays} days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={commuteDays}
                onChange={(e) => setCommuteDays(parseInt(e.target.value))}
                className="range range-sm range-accent w-full"
              />
              <div className="flex justify-between text-[10px] text-base-content/50 font-mono">
                <span>1 day</span>
                <span>3 days (Hybrid)</span>
                <span>5 days (Workweek)</span>
                <span>7 days</span>
              </div>
            </div>
          </div>

          {/* Results Metric Tiles (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-base-content/60 font-mono uppercase block">Estimated Monthly Savings</span>
                <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
                  ${monthlyFuelSaved}
                </span>
              </div>
              <span className="text-[10px] text-base-content/50 mt-2">vs car fuel / auto fares</span>
            </div>

            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-base-content/60 font-mono uppercase block">CO₂ Prevented</span>
                <span className="text-3xl font-extrabold font-mono text-teal-600 dark:text-teal-400 mt-1 block tabular-nums">
                  {monthlyCo2Saved} kg
                </span>
              </div>
              <span className="text-[10px] text-base-content/50 mt-2">Every single month</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-base-content/60 font-mono uppercase block">Calories Burned</span>
                <span className="text-3xl font-extrabold font-mono text-amber-500 mt-1 block tabular-nums">
                  {monthlyCalories.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-base-content/50 mt-2">Cardiovascular fitness</span>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. MEMBERSHIP & COMMUTER PACKAGES ──────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Transparent Pricing
          </span>
          <h2 className="text-3xl font-bold font-display text-base-content">
            Flexible Plans for Every Rider
          </h2>
          <p className="text-xs sm:text-sm text-base-content/70">
            Transparent rates with zero hidden surge pricing or unlock fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1 */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-200 shadow-xs flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-base-content/60 uppercase">Single Ride Pass</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-base-content">$2.00</span>
                <span className="text-xs text-base-content/60">/ hour</span>
              </div>
              <p className="text-xs text-base-content/70">
                Ideal for spontaneous errands, park weekend strolls, and short transit hops.
              </p>
              <ul className="space-y-2 text-xs text-base-content/80 pt-2 border-t border-base-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Standard city cruisers and MTBs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant 4-digit pickup PIN</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>No security deposit hold required</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onExploreFleet}
              className="btn btn-outline btn-sm w-full text-xs font-semibold"
            >
              Rent by Hour
            </button>
          </div>

          {/* Plan 2: Featured Commuter */}
          <div className="p-6 rounded-2xl bg-base-100 border-2 border-emerald-500 shadow-lg relative flex flex-col justify-between gap-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Student & Commuter Pass
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">$29.00</span>
                <span className="text-xs text-base-content/60">/ month</span>
              </div>
              <p className="text-xs text-base-content/70">
                For daily students and office commuters traveling between metro stations and campuses.
              </p>
              <ul className="space-y-2 text-xs text-base-content/80 pt-2 border-t border-base-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Unlimited 60-minute daily rides</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Electric Volt-E pedal assist access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Priority dock reservation hold</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onExploreFleet}
              className="btn btn-primary btn-sm text-white w-full text-xs font-semibold shadow-sm"
            >
              Get Commuter Pass
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-6 rounded-2xl bg-base-100 border border-base-200 shadow-xs flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-base-content/60 uppercase">Full Day Touring</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-base-content">$18.00</span>
                <span className="text-xs text-base-content/60">/ day</span>
              </div>
              <p className="text-xs text-base-content/70">
                For weekend adventurers touring scenic coastal roads, green park circuits, and city heritage sights.
              </p>
              <ul className="space-y-2 text-xs text-base-content/80 pt-2 border-t border-base-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>24 hours full access across any bike</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Free helmet and handlebar phone holder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Complimentary battery recharge swap</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onExploreFleet}
              className="btn btn-outline btn-sm w-full text-xs font-semibold"
            >
              Book Day Rental
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL HIGH-CONVERSION CTA BANNER ─────────────────────────── */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-mono font-semibold tracking-wider inline-block">
            READY TO RIDE?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            Start your clean urban ride across Mumbai today.
          </h2>
          <p className="text-sm text-emerald-50/90 leading-relaxed">
            Reserve your bicycle now, pick it up at any station dock, and help reduce urban traffic gridlock.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreFleet}
              className="btn bg-white text-emerald-700 hover:bg-slate-100 border-none font-bold text-xs gap-2 px-6 shadow-md"
            >
              <Bike className="w-4 h-4" />
              <span>Browse Live Fleet</span>
            </button>
            <button
              onClick={onViewStations}
              className="btn btn-ghost text-white hover:bg-white/10 font-semibold text-xs border border-white/30 px-5"
            >
              <span>Explore Dock Locations</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
