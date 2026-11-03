import { Bicycle, Booking, Station, MaintenanceRecord, Review, PlatformStats, BikeCategory, BikeStatus } from '../types';

const API_BASE = '/api';

export const api = {
  // Stats
  async getStats(): Promise<PlatformStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch platform stats');
    return res.json();
  },

  // Health / DB status
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  // Stations
  async getStations(): Promise<Station[]> {
    const res = await fetch(`${API_BASE}/stations`);
    if (!res.ok) throw new Error('Failed to fetch stations');
    return res.json();
  },

  // Bicycles
  async getBikes(params?: { category?: string; station?: string; status?: string; search?: string }): Promise<Bicycle[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.station) query.append('station', params.station);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/bikes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bicycles');
    return res.json();
  },

  async getBikeById(id: string): Promise<Bicycle> {
    const res = await fetch(`${API_BASE}/bikes/${id}`);
    if (!res.ok) throw new Error('Failed to fetch bicycle');
    return res.json();
  },

  async createBike(data: Partial<Bicycle>): Promise<Bicycle> {
    const res = await fetch(`${API_BASE}/bikes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create bicycle');
    }
    return res.json();
  },

  async updateBike(id: string, data: Partial<Bicycle>): Promise<Bicycle> {
    const res = await fetch(`${API_BASE}/bikes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update bicycle');
    return res.json();
  },

  async deleteBike(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/bikes/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete bicycle');
  },

  // Bookings
  async getBookings(params?: { email?: string; status?: string }): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (params?.email) query.append('email', params.email);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async createBooking(data: {
    bicycleId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    durationHours: number;
    pickupStation: string;
    startTime?: string;
  }): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reserve bicycle');
    }
    return res.json();
  },

  async updateBookingStatus(id: string, status: string, returnStation?: string): Promise<{ success: boolean; booking: Booking; bike?: Bicycle }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, returnStation })
    });
    if (!res.ok) throw new Error('Failed to update booking status');
    return res.json();
  },

  // Maintenance
  async getMaintenance(): Promise<MaintenanceRecord[]> {
    const res = await fetch(`${API_BASE}/maintenance`);
    if (!res.ok) throw new Error('Failed to fetch maintenance records');
    return res.json();
  },

  async createMaintenanceRecord(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to file maintenance report');
    return res.json();
  },

  async updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update maintenance record');
    return res.json();
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async createReview(data: Partial<Review>): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  // Authentication
  async login(credentials: { email: string; password: string }): Promise<{ user: any; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; phone?: string; role?: string }): Promise<{ user: any; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMe(token?: string, email?: string): Promise<{ user: any }> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE}/auth/me${query}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch user session');
    return res.json();
  },

  async getUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }
};
