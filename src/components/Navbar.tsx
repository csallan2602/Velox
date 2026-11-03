import React from 'react';
import { Bike, Moon, Sun, Shield, User, Menu, Sparkles, Navigation, LogIn, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: 'customer' | 'operator';
  setUserRole: (role: 'customer' | 'operator') => void;
  theme: string;
  toggleTheme: () => void;
  onOpenDrawer: () => void;
  onQuickReserve: () => void;
  activeBookingCount: number;
  currentUser: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  theme,
  toggleTheme,
  onOpenDrawer,
  onQuickReserve,
  activeBookingCount,
  currentUser,
  onLoginClick,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-base-300 bg-base-100/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenDrawer}
            className="btn btn-ghost btn-circle btn-sm md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-display whitespace-nowrap"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bike className="w-5 h-5" />
            </div>
            <span>Velox Bikes</span>
          </button>
        </div>

        {/* Zone 2: Single-line Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-base-content/80">
          <button
            onClick={() => setCurrentTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'home' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Home
          </button>

          <button
            onClick={() => setCurrentTab('fleet')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'fleet' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Fleet Catalog
          </button>

          <button
            onClick={() => setCurrentTab('stations')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'stations' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Stations & Docks
          </button>

          <button
            onClick={() => setCurrentTab('bookings')}
            className={`relative transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'bookings' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            My Bookings
            {activeBookingCount > 0 && (
              <span className="badge badge-success badge-xs ml-1.5 font-mono text-[10px] text-white">
                {activeBookingCount}
              </span>
            )}
          </button>

          {userRole === 'operator' && (
            <button
              onClick={() => setCurrentTab('operator')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 text-teal-600 dark:text-teal-400 ${
                currentTab === 'operator' ? 'font-bold underline underline-offset-4' : 'font-semibold'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Operator Command</span>
            </button>
          )}

          <button
            onClick={() => setCurrentTab('reviews')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'reviews' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Reviews & Eco Stats
          </button>
        </nav>

        {/* Zone 3: Actions (Role Switch, Dark Mode, Primary CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Role Switcher */}
          <div className="hidden lg:flex items-center p-0.5 bg-base-200 rounded-lg border border-base-300">
            <button
              onClick={() => {
                setUserRole('customer');
                if (currentTab === 'operator') setCurrentTab('fleet');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                userRole === 'customer'
                  ? 'bg-base-100 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => {
                setUserRole('operator');
                setCurrentTab('operator');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                userRole === 'operator'
                  ? 'bg-base-100 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                  : 'text-base-content/70 hover:text-base-content'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Operator</span>
            </button>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Toggle light and dark theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 p-1 pl-2 bg-base-200 rounded-xl border border-base-300 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[11px] overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <span className="font-semibold text-base-content max-w-[90px] truncate hidden sm:inline">
                {currentUser.name.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-rose-500"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="btn btn-sm btn-outline border-base-300 text-xs font-semibold gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary Action Button */}
          <button
            onClick={onQuickReserve}
            className="btn btn-sm btn-primary text-white gap-1.5 shadow-sm font-medium whitespace-nowrap shrink-0"
          >
            <Bike className="w-4 h-4" />
            <span className="hidden sm:inline">Reserve Bike</span>
            <span className="sm:hidden">Rent</span>
          </button>
        </div>

      </div>
    </header>
  );
};
