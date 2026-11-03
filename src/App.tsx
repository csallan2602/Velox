import React, { useState, useEffect } from 'react';
import { Bicycle, Booking, Station, MaintenanceRecord, Review, PlatformStats, User } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { MobileDrawer } from './components/MobileDrawer';
import { HeroSection } from './components/HeroSection';
import { BikeCard } from './components/BikeCard';
import { BookingModal } from './components/BookingModal';
import { BikeDetailModal } from './components/BikeDetailModal';
import { CustomerBookings } from './components/CustomerBookings';
import { OperatorDashboard } from './components/OperatorDashboard';
import { StationsMap } from './components/StationsMap';
import { ReviewsAndEcoStats } from './components/ReviewsAndEcoStats';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Footer } from './components/Footer';
import { Bike, Search, Filter, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  // Theme state: daisyUI 'emerald' (light) vs 'dark'
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('velox_theme') || 'emerald';
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('velox_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return {
      id: 'usr-101',
      name: 'Allan Singh',
      email: 'allan.singh@example.com',
      role: 'customer',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: '2026-09-15'
    };
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('velox_token') || 'velox-session-usr-101-demo';
  });

  // User Role: 'customer' or 'operator'
  const [userRole, setUserRole] = useState<'customer' | 'operator'>(() => {
    return currentUser?.role === 'operator' ? 'operator' : 'customer';
  });
  
  // Navigation Tabs: 'home', 'fleet', 'stations', 'bookings', 'operator', 'reviews', 'login'
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Mobile Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Data states
  const [bikes, setBikes] = useState<Bicycle[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  // Filters
  const [selectedStation, setSelectedStation] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [reserveModalBike, setReserveModalBike] = useState<Bicycle | null>(null);
  const [inspectModalBike, setInspectModalBike] = useState<Bicycle | null>(null);

  // Loading & error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Theme synchronization with HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('velox_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'emerald' : 'dark'));
  };

  // Fetch initial data
  const loadPlatformData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedBikes, fetchedStations, fetchedBookings, fetchedMnt, fetchedReviews, fetchedStats] =
        await Promise.all([
          api.getBikes(),
          api.getStations(),
          api.getBookings(),
          api.getMaintenance(),
          api.getReviews(),
          api.getStats()
        ]);

      setBikes(fetchedBikes);
      setStations(fetchedStations);
      setBookings(fetchedBookings);
      setMaintenance(fetchedMnt);
      setReviews(fetchedReviews);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Failed to load platform data:', err);
      setError(err.message || 'Unable to connect to bicycle rental server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // Filtered bikes
  const filteredBikes = bikes.filter((b) => {
    if (selectedCategory !== 'All' && b.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedStation !== 'All' && b.station.toLowerCase() !== selectedStation.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.station.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const activeBookingCount = bookings.filter((b) => b.status === 'active' || b.status === 'reserved').length;

  const handleBookingCreated = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    // Refresh stats & bikes
    api.getBikes().then(setBikes).catch(console.error);
    api.getStats().then(setStats).catch(console.error);
  };

  const handleQuickReserve = () => {
    // Pick first available bike
    const firstAvailable = bikes.find((b) => b.status === 'available');
    if (firstAvailable) {
      setReserveModalBike(firstAvailable);
    } else {
      setCurrentTab('fleet');
    }
  };

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('velox_user', JSON.stringify(user));
    localStorage.setItem('velox_token', token);
    if (user.role === 'operator' || user.role === 'admin') {
      setUserRole('operator');
      setCurrentTab('operator');
    } else {
      setUserRole('customer');
      setCurrentTab('fleet');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('velox_user');
    localStorage.removeItem('velox_token');
    setUserRole('customer');
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onQuickReserve={handleQuickReserve}
        activeBookingCount={activeBookingCount}
        currentUser={currentUser}
        onLoginClick={() => setCurrentTab('login')}
        onLogout={handleLogout}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        theme={theme}
        toggleTheme={toggleTheme}
        activeBookingCount={activeBookingCount}
        currentUser={currentUser}
        onLoginClick={() => setCurrentTab('login')}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error notification if server fails */}
        {error && (
          <div className="alert alert-error shadow-md text-white text-xs mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </span>
            <button onClick={loadPlatformData} className="btn btn-xs btn-outline text-white">
              Retry
            </button>
          </div>
        )}

        {/* Login & Registration View */}
        {currentTab === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {/* Home / Landing Page View */}
        {currentTab === 'home' && (
          <LandingPage
            bikes={bikes}
            stations={stations}
            stats={stats}
            onExploreFleet={() => setCurrentTab('fleet')}
            onViewStations={() => setCurrentTab('stations')}
            onReserveBike={(bike) => setReserveModalBike(bike)}
            onInspectBike={(bike) => setInspectModalBike(bike)}
          />
        )}

        {/* CUSTOMER VIEWS */}
        {currentTab === 'fleet' && (
          <div className="space-y-12">
            {/* Split Hero with 3D Jarvis Smart-Hub Visualizer */}
            <HeroSection
              stations={stations}
              stats={stats}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExploreClick={() => {
                const el = document.getElementById('catalog-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Bicycle Catalog Section */}
            <section id="catalog-grid" className="space-y-6 pt-6 border-t border-base-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-display text-base-content">
                    Bicycle Fleet Catalog
                  </h2>
                  <p className="text-xs text-base-content/65 mt-1">
                    Showing {filteredBikes.length} of {bikes.length} calibrated bicycles across city hubs.
                  </p>
                </div>

                {/* Reset Filters if applied */}
                {(selectedCategory !== 'All' || selectedStation !== 'All' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedStation('All');
                      setSearchQuery('');
                    }}
                    className="btn btn-xs btn-ghost text-xs text-emerald-600 dark:text-emerald-400 self-start sm:self-auto"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>

              {/* Bike Cards Grid */}
              {loading && bikes.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card bg-base-100 border border-base-200 p-4 space-y-3 animate-pulse">
                      <div className="aspect-16/10 bg-base-300 rounded-lg" />
                      <div className="h-4 bg-base-300 rounded w-3/4" />
                      <div className="h-3 bg-base-200 rounded w-1/2" />
                      <div className="h-8 bg-base-300 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredBikes.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-base-100 border border-base-200 space-y-3">
                  <Bike className="w-10 h-10 text-base-content/30 mx-auto" />
                  <h3 className="font-bold text-base text-base-content">No Bicycles Match Criteria</h3>
                  <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                    Try clearing your search query or selecting "All Registered Stations" to view other models.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedStation('All');
                      setSearchQuery('');
                    }}
                    className="btn btn-sm btn-primary text-white text-xs"
                  >
                    Show All Fleet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredBikes.map((bike) => (
                    <BikeCard
                      key={bike.id}
                      bike={bike}
                      onReserve={(b) => setReserveModalBike(b)}
                      onInspect={(b) => setInspectModalBike(b)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Stations View */}
        {currentTab === 'stations' && (
          <StationsMap
            stations={stations}
            bikes={bikes}
            onSelectStation={(stationName) => {
              setSelectedStation(stationName);
              setCurrentTab('fleet');
            }}
          />
        )}

        {/* My Bookings View */}
        {currentTab === 'bookings' && (
          <CustomerBookings
            bookings={bookings}
            stations={stations}
            onRefreshBookings={() => {
              api.getBookings().then(setBookings);
              api.getBikes().then(setBikes);
              api.getStats().then(setStats);
            }}
            onOpenCatalog={() => setCurrentTab('fleet')}
          />
        )}

        {/* Operator Dashboard View */}
        {currentTab === 'operator' && (
          <OperatorDashboard
            bikes={bikes}
            bookings={bookings}
            stations={stations}
            maintenance={maintenance}
            stats={stats}
            onRefreshAll={loadPlatformData}
          />
        )}

        {/* Reviews & Eco Telemetry View */}
        {currentTab === 'reviews' && (
          <ReviewsAndEcoStats
            reviews={reviews}
            stats={stats}
            onRefreshReviews={() => api.getReviews().then(setReviews)}
          />
        )}

      </main>

      {/* Booking Flow Modal */}
      <BookingModal
        bike={reserveModalBike}
        isOpen={!!reserveModalBike}
        onClose={() => setReserveModalBike(null)}
        onBookingSuccess={handleBookingCreated}
        currentUser={currentUser}
      />

      {/* Bike Details Modal */}
      <BikeDetailModal
        bike={inspectModalBike}
        isOpen={!!inspectModalBike}
        onClose={() => setInspectModalBike(null)}
        onReserve={(b) => setReserveModalBike(b)}
        reviews={reviews}
      />

      {/* Quiet Footer */}
      <Footer onNavigate={(tab) => setCurrentTab(tab)} />

    </div>
  );
}
