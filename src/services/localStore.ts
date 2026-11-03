import { Bicycle, Booking, Station, MaintenanceRecord, Review, PlatformStats, User } from '../types';
import { 
  INITIAL_BIKES, 
  INITIAL_STATIONS, 
  INITIAL_BOOKINGS, 
  INITIAL_MAINTENANCE, 
  INITIAL_REVIEWS, 
  INITIAL_USERS 
} from '../data/seedData';

const STORAGE_KEYS = {
  BIKES: 'velox_db_bikes',
  STATIONS: 'velox_db_stations',
  BOOKINGS: 'velox_db_bookings',
  MAINTENANCE: 'velox_db_maintenance',
  REVIEWS: 'velox_db_reviews',
  USERS: 'velox_db_users'
};

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(val);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage quota or access error:', e);
  }
}

export const localStore = {
  getStations(): Station[] {
    const stations = getStored<Station[]>(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    const bikes = this.getBikes();
    return stations.map(st => ({
      ...st,
      availableBikes: bikes.filter(b => b.station === st.name && b.status === 'available').length
    }));
  },

  getBikes(params?: { category?: string; station?: string; status?: string; search?: string }): Bicycle[] {
    let list = getStored<Bicycle[]>(STORAGE_KEYS.BIKES, INITIAL_BIKES);
    if (params?.category && params.category !== 'All') {
      list = list.filter(b => b.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.station && params.station !== 'All') {
      list = list.filter(b => b.station.toLowerCase() === params.station!.toLowerCase());
    }
    if (params?.status && params.status !== 'All') {
      list = list.filter(b => b.status.toLowerCase() === params.status!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.station.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getBikeById(id: string): Bicycle | null {
    const bikes = this.getBikes();
    return bikes.find(b => b.id === id) || null;
  },

  createBike(data: Partial<Bicycle>): Bicycle {
    const bikes = this.getBikes();
    const newBike: Bicycle = {
      id: `bk-${Date.now().toString().slice(-4)}`,
      name: data.name || 'New Commuter Bike',
      category: data.category || 'City Cruiser',
      ratePerHour: Number(data.ratePerHour || 3.0),
      ratePerDay: Number(data.ratePerDay || (data.ratePerHour ? data.ratePerHour * 6 : 18.0)),
      station: data.station || 'Central Station Terminal',
      status: 'available',
      conditionScore: 5.0,
      batteryPercent: data.category === 'Electric' ? 100 : undefined,
      gears: data.gears || 'Shimano 7-Speed',
      frameSize: data.frameSize || 'Medium',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&auto=format&fit=crop&q=80',
      description: data.description || 'Modern rental bicycle ready for urban rides.',
      totalTrips: 0
    };
    bikes.unshift(newBike);
    setStored(STORAGE_KEYS.BIKES, bikes);
    return newBike;
  },

  updateBike(id: string, data: Partial<Bicycle>): Bicycle {
    const bikes = this.getBikes();
    const idx = bikes.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Bicycle not found');
    bikes[idx] = { ...bikes[idx], ...data, id: bikes[idx].id };
    setStored(STORAGE_KEYS.BIKES, bikes);
    return bikes[idx];
  },

  deleteBike(id: string): void {
    let bikes = this.getBikes();
    bikes = bikes.filter(b => b.id !== id);
    setStored(STORAGE_KEYS.BIKES, bikes);
  },

  getBookings(params?: { email?: string; status?: string }): Booking[] {
    let list = getStored<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    if (params?.email) {
      list = list.filter(b => b.customerEmail.toLowerCase() === params.email!.toLowerCase());
    }
    if (params?.status && params.status !== 'All') {
      list = list.filter(b => b.status === params.status);
    }
    return list;
  },

  createBooking(data: {
    bicycleId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    durationHours: number;
    pickupStation: string;
    startTime?: string;
  }): Booking {
    const bikes = this.getBikes();
    const bike = bikes.find(b => b.id === data.bicycleId);
    if (!bike) throw new Error('Bicycle not found');
    if (bike.status !== 'available') {
      throw new Error(`Bicycle is currently ${bike.status}.`);
    }

    const hours = Number(data.durationHours);
    const totalAmount = Number((hours * bike.ratePerHour).toFixed(2));
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      id: `bk-res-${Date.now().toString().slice(-4)}`,
      bicycleId: bike.id,
      bicycleName: bike.name,
      category: bike.category,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || '+91 90000 00000',
      startTime: data.startTime || new Date().toISOString(),
      durationHours: hours,
      totalAmount,
      status: 'reserved',
      pickupStation: data.pickupStation || bike.station,
      pickupPin: pin,
      createdAt: new Date().toISOString()
    };

    // Update bike status to reserved
    this.updateBike(bike.id, { status: 'reserved' });

    const bookings = this.getBookings();
    bookings.unshift(newBooking);
    setStored(STORAGE_KEYS.BOOKINGS, bookings);

    return newBooking;
  },

  updateBookingStatus(id: string, status: string, returnStation?: string): { success: boolean; booking: Booking; bike?: Bicycle } {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    const booking = bookings[idx];
    booking.status = status as any;
    if (returnStation) booking.returnStation = returnStation;

    let updatedBike: Bicycle | undefined;
    if (booking.bicycleId) {
      const bikes = this.getBikes();
      const bike = bikes.find(b => b.id === booking.bicycleId);
      if (bike) {
        if (status === 'active') {
          bike.status = 'rented';
        } else if (status === 'completed') {
          bike.status = 'available';
          if (returnStation) bike.station = returnStation;
          bike.totalTrips = (bike.totalTrips || 0) + 1;
        } else if (status === 'cancelled') {
          bike.status = 'available';
        }
        this.updateBike(bike.id, bike);
        updatedBike = bike;
      }
    }

    setStored(STORAGE_KEYS.BOOKINGS, bookings);
    return { success: true, booking, bike: updatedBike };
  },

  getMaintenance(): MaintenanceRecord[] {
    return getStored<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
  },

  createMaintenance(data: Partial<MaintenanceRecord>): MaintenanceRecord {
    const list = this.getMaintenance();
    const bike = data.bicycleId ? this.getBikeById(data.bicycleId) : null;
    const newRecord: MaintenanceRecord = {
      id: `mnt-${Date.now().toString().slice(-4)}`,
      bicycleId: data.bicycleId || 'General',
      bicycleName: bike ? bike.name : 'Unassigned Bicycle',
      issueDescription: data.issueDescription || 'Reported maintenance requirement',
      reportedBy: data.reportedBy || 'Station Staff',
      priority: data.priority || 'medium',
      status: 'pending',
      cost: Number(data.cost || 0),
      date: new Date().toISOString()
    };

    if (bike) {
      this.updateBike(bike.id, { status: 'maintenance' });
    }

    list.unshift(newRecord);
    setStored(STORAGE_KEYS.MAINTENANCE, list);
    return newRecord;
  },

  updateMaintenance(id: string, data: Partial<MaintenanceRecord>): MaintenanceRecord {
    const list = this.getMaintenance();
    const idx = list.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Maintenance ticket not found');

    const record = { ...list[idx], ...data, id: list[idx].id };
    if (data.status === 'resolved' && record.bicycleId) {
      const bike = this.getBikeById(record.bicycleId);
      if (bike && bike.status === 'maintenance') {
        this.updateBike(bike.id, { status: 'available', conditionScore: 4.9 });
      }
    }

    list[idx] = record;
    setStored(STORAGE_KEYS.MAINTENANCE, list);
    return record;
  },

  getReviews(): Review[] {
    return getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  createReview(data: Partial<Review>): Review {
    const list = this.getReviews();
    const bike = data.bicycleId ? this.getBikeById(data.bicycleId) : null;
    const newRev: Review = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      bicycleId: data.bicycleId || 'General',
      bicycleName: bike ? bike.name : 'Velox Fleet',
      customerName: data.customerName || 'Verified Commuter',
      rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
      comment: data.comment || 'Smooth ride and pleasant experience.',
      date: new Date().toISOString().split('T')[0]
    };
    list.unshift(newRev);
    setStored(STORAGE_KEYS.REVIEWS, list);
    return newRev;
  },

  getStats(): PlatformStats {
    const bikes = this.getBikes();
    const bookings = this.getBookings();
    const totalTrips = bikes.reduce((sum, b) => sum + (b.totalTrips || 0), 0) + bookings.length;
    const activeRentals = bookings.filter(b => b.status === 'active').length;
    const totalBikes = bikes.length;
    const availableBikes = bikes.filter(b => b.status === 'available').length;
    const distanceCoveredKm = totalTrips * 6.5;
    const co2SavedKg = Math.round(distanceCoveredKm * 0.21);
    const caloriesBurned = Math.round(distanceCoveredKm * 32);

    return {
      totalTrips,
      activeRentals,
      totalBikes,
      availableBikes,
      co2SavedKg,
      distanceCoveredKm: Math.round(distanceCoveredKm),
      caloriesBurned,
      dbType: 'in-memory-fallback'
    };
  },

  login(credentials: { email: string; password: string }): { user: User; token: string } {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase().trim());
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password.');
    }
    const { password: _, ...cleanUser } = user;
    return {
      user: cleanUser,
      token: `velox-session-${user.id}-${Date.now()}`
    };
  },

  register(data: { name: string; email: string; password: string; phone?: string; role?: string }): { user: User; token: string } {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const cleanEmail = data.email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      phone: data.phone || '+91 90000 00000',
      role: (data.role === 'operator' ? 'operator' : 'customer') as any,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    const { password: _, ...cleanUser } = newUser;
    return {
      user: cleanUser,
      token: `velox-session-${newUser.id}-${Date.now()}`
    };
  },

  getMe(token?: string, email?: string): { user: User } {
    const users = getStored<any[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    let user = null;
    if (email) {
      user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    } else if (token) {
      user = users[0];
    }
    if (!user) throw new Error('Not authenticated');
    const { password: _, ...cleanUser } = user;
    return { user: cleanUser };
  }
};
