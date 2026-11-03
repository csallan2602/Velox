import { Bicycle, Booking, Station, MaintenanceRecord, Review, PlatformStats, User } from '../types';
import { localStore } from './localStore';

// Configurable API base: supports VITE_API_URL, localStorage override, or default '/api'
const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('velox_api_url');
    if (custom) return custom.replace(/\/$/, '');
  }
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return '/api';
};

// Safe fetch wrapper with timeout and automatic localStore fallback
async function safeFetch<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackFn?: () => T
): Promise<T> {
  const url = `${getApiBase()}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }

    // If server returned 404/500/502 and we have a fallback, use it
    if (fallbackFn) {
      console.warn(`[Velox API] Server returned ${res.status} for ${endpoint}. Using local fallback store.`);
      return fallbackFn();
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${res.status}`);
  } catch (err: any) {
    if (fallbackFn) {
      console.warn(`[Velox API] Network or proxy error on ${endpoint}. Using resilient local store fallback:`, err.message);
      return fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Stats
  async getStats(): Promise<PlatformStats> {
    return safeFetch<PlatformStats>('/stats', undefined, () => localStore.getStats());
  },

  // Health
  async getHealth(): Promise<any> {
    return safeFetch<any>('/health', undefined, () => ({
      status: 'healthy',
      system: 'Velox Bicycle Rental Platform (Local Fallback)',
      dbType: 'in-memory-fallback',
      timestamp: new Date().toISOString()
    }));
  },

  // Stations
  async getStations(): Promise<Station[]> {
    return safeFetch<Station[]>('/stations', undefined, () => localStore.getStations());
  },

  // Bicycles
  async getBikes(params?: { category?: string; station?: string; status?: string; search?: string }): Promise<Bicycle[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.station) query.append('station', params.station);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return safeFetch<Bicycle[]>(`/bikes${queryString}`, undefined, () => localStore.getBikes(params));
  },

  async getBikeById(id: string): Promise<Bicycle> {
    return safeFetch<Bicycle>(`/bikes/${id}`, undefined, () => {
      const bike = localStore.getBikeById(id);
      if (!bike) throw new Error('Bicycle not found');
      return bike;
    });
  },

  async createBike(data: Partial<Bicycle>): Promise<Bicycle> {
    return safeFetch<Bicycle>(
      '/bikes',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.createBike(data)
    );
  },

  async updateBike(id: string, data: Partial<Bicycle>): Promise<Bicycle> {
    return safeFetch<Bicycle>(
      `/bikes/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.updateBike(id, data)
    );
  },

  async deleteBike(id: string): Promise<void> {
    return safeFetch<void>(
      `/bikes/${id}`,
      { method: 'DELETE' },
      () => localStore.deleteBike(id)
    );
  },

  // Bookings
  async getBookings(params?: { email?: string; status?: string }): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (params?.email) query.append('email', params.email);
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return safeFetch<Booking[]>(`/bookings${queryString}`, undefined, () => localStore.getBookings(params));
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
    return safeFetch<Booking>(
      '/bookings',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.createBooking(data)
    );
  },

  async updateBookingStatus(id: string, status: string, returnStation?: string): Promise<{ success: boolean; booking: Booking; bike?: Bicycle }> {
    return safeFetch<{ success: boolean; booking: Booking; bike?: Bicycle }>(
      `/bookings/${id}/status`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, returnStation })
      },
      () => localStore.updateBookingStatus(id, status, returnStation)
    );
  },

  // Maintenance
  async getMaintenance(): Promise<MaintenanceRecord[]> {
    return safeFetch<MaintenanceRecord[]>('/maintenance', undefined, () => localStore.getMaintenance());
  },

  async createMaintenanceRecord(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return safeFetch<MaintenanceRecord>(
      '/maintenance',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.createMaintenance(data)
    );
  },

  async updateMaintenanceRecord(id: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    return safeFetch<MaintenanceRecord>(
      `/maintenance/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.updateMaintenance(id, data)
    );
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    return safeFetch<Review[]>('/reviews', undefined, () => localStore.getReviews());
  },

  async createReview(data: Partial<Review>): Promise<Review> {
    return safeFetch<Review>(
      '/reviews',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.createReview(data)
    );
  },

  // Authentication
  async login(credentials: { email: string; password: string }): Promise<{ user: any; token: string }> {
    return safeFetch<{ user: any; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      },
      () => localStore.login(credentials)
    );
  },

  async register(data: { name: string; email: string; password: string; phone?: string; role?: string }): Promise<{ user: any; token: string }> {
    return safeFetch<{ user: any; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => localStore.register(data)
    );
  },

  async getMe(token?: string, email?: string): Promise<{ user: any }> {
    return safeFetch<{ user: any }>(
      `/auth/me${email ? `?email=${encodeURIComponent(email)}` : ''}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      },
      () => localStore.getMe(token, email)
    );
  },

  async getUsers(): Promise<any[]> {
    return safeFetch<any[]>('/auth/users', undefined, () => {
      const users = (localStore as any).getUsers?.() || [];
      return users;
    });
  }
};
