import React from 'react';
import { Bike, Shield, User, X, MapPin, Calendar, HeartHandshake, Compass, Moon, Sun, Wind, Activity, LogIn, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: 'customer' | 'operator';
  setUserRole: (role: 'customer' | 'operator') => void;
  theme: string;
  toggleTheme: () => void;
  activeBookingCount: number;
  currentUser: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  theme,
  toggleTheme,
  activeBookingCount,
  currentUser,
  onLoginClick,
  onLogout
}) => {
  if (!isOpen) return null;

  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative w-72 max-w-[80vw] bg-base-100 h-full flex flex-col justify-between shadow-2xl p-5 z-10 border-r border-base-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-base-300">
            <div className="flex items-center gap-2 font-display font-bold text-lg text-emerald-600 dark:text-emerald-400">
              <Bike className="w-5 h-5" />
              <span>Velox Bikes</span>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Account Tile */}
          <div className="mt-4 p-3 rounded-xl bg-base-200/80 border border-base-300 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-base-content truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-base-content/50 capitalize font-mono">{currentUser.role}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <User className="w-4 h-4" />
                <span>Guest Rider</span>
              </div>
            )}

            {currentUser ? (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="btn btn-ghost btn-xs text-rose-500"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  onClose();
                }}
                className="btn btn-xs btn-primary text-white text-[11px]"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Role Switcher in Mobile Drawer */}
          <div className="mt-4 p-1 bg-base-200 rounded-lg flex items-center">
            <button
              onClick={() => {
                setUserRole('customer');
                if (currentTab === 'operator') setCurrentTab('fleet');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
                userRole === 'customer'
                  ? 'bg-base-100 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-base-content/70'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Customer
            </button>
            <button
              onClick={() => {
                setUserRole('operator');
                setCurrentTab('operator');
                onClose();
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all ${
                userRole === 'operator'
                  ? 'bg-base-100 text-teal-600 dark:text-teal-400 shadow-xs font-semibold'
                  : 'text-base-content/70'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Operator
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col gap-1">
            <button
              onClick={() => navigateTo('home')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                currentTab === 'home'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-base-content/80 hover:bg-base-200'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>Home & Overview</span>
            </button>

            <button
              onClick={() => navigateTo('fleet')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                currentTab === 'fleet'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-base-content/80 hover:bg-base-200'
              }`}
            >
              <Bike className="w-4 h-4 text-emerald-500" />
              <span>Browse Fleet</span>
            </button>

            <button
              onClick={() => navigateTo('stations')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                currentTab === 'stations'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-base-content/80 hover:bg-base-200'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-500" />
              <span>Rental Stations</span>
            </button>

            <button
              onClick={() => navigateTo('bookings')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                currentTab === 'bookings'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-base-content/80 hover:bg-base-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>My Bookings</span>
              </div>
              {activeBookingCount > 0 && (
                <span className="badge badge-success badge-sm text-white font-mono">
                  {activeBookingCount}
                </span>
              )}
            </button>

            {userRole === 'operator' && (
              <button
                onClick={() => navigateTo('operator')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  currentTab === 'operator'
                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold'
                    : 'text-base-content/80 hover:bg-base-200'
                }`}
              >
                <Shield className="w-4 h-4 text-teal-500" />
                <span>Operator Dashboard</span>
              </button>
            )}

            <button
              onClick={() => navigateTo('reviews')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                currentTab === 'reviews'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-base-content/80 hover:bg-base-200'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-500" />
              <span>Reviews & Eco Telemetry</span>
            </button>
          </nav>
        </div>

        {/* Footer / Theme switch */}
        <div className="pt-4 border-t border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-base-content/60">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Green Urban Ride</span>
          </div>

          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-ghost gap-2 text-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
