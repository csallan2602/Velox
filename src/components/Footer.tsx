import React from 'react';
import { Bike, Shield, Heart, Globe, Server, Database } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-base-300 bg-base-100 text-base-content/75 py-10 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold font-display text-emerald-600 dark:text-emerald-400">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Bike className="w-4 h-4" />
              </div>
              <span>Velox Bicycle Rental Platform</span>
            </div>
            <p className="text-xs text-base-content/65 max-w-md leading-relaxed">
              Empowering urban commuters, students, and tourists with sustainable, zero-emission bicycle mobility. Seamless digital reservations, verified docks, and real-time fleet maintenance.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-base-content uppercase font-mono tracking-wider">
              Navigation
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-600 transition-colors">
                  Home & Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('fleet')} className="hover:text-emerald-600 transition-colors">
                  Browse Bicycle Fleet
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('stations')} className="hover:text-emerald-600 transition-colors">
                  Rental Station Docks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bookings')} className="hover:text-emerald-600 transition-colors">
                  My Bookings & Vouchers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('operator')} className="hover:text-emerald-600 transition-colors">
                  Station Operator Command
                </button>
              </li>
            </ul>
          </div>

          {/* Cloud & Architecture */}
          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-base-content uppercase font-mono tracking-wider">
              Deployment Architecture
            </span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-base-content/70">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Frontend: React on Vercel</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <Server className="w-3.5 h-3.5 text-teal-500" />
                <span>Backend: Express on Render</span>
              </div>
              <div className="flex items-center gap-2 text-base-content/70">
                <Database className="w-3.5 h-3.5 text-cyan-500" />
                <span>Database: MongoDB Atlas</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-base-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/50">
          <p>© {new Date().getFullYear()} Velox Bicycle Rental System. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Third Year B.Sc. Computer Science Mini Project by <strong>Nadar AllanSingh</strong> · Nirmala Memorial Foundation College
          </p>
        </div>

      </div>
    </footer>
  );
};
