export type BikeStatus = 'available' | 'reserved' | 'rented' | 'maintenance';
export type BikeCategory = 'Electric' | 'Mountain' | 'Road' | 'City Cruiser' | 'Hybrid';
export type FrameSize = 'Small' | 'Medium' | 'Large';

export interface Bicycle {
  id: string;
  name: string;
  category: BikeCategory;
  ratePerHour: number;
  ratePerDay: number;
  station: string;
  status: BikeStatus;
  conditionScore: number; // 1.0 - 5.0
  batteryPercent?: number; // For e-bikes
  gears: string;
  frameSize: FrameSize;
  imageUrl: string;
  description: string;
  totalTrips: number;
}

export type BookingStatus = 'reserved' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bicycleId: string;
  bicycleName: string;
  category: BikeCategory;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startTime: string; // ISO
  durationHours: number;
  totalAmount: number;
  status: BookingStatus;
  pickupStation: string;
  returnStation?: string;
  pickupPin: string;
  createdAt: string;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'pending' | 'in-repair' | 'resolved';

export interface MaintenanceRecord {
  id: string;
  bicycleId: string;
  bicycleName: string;
  issueDescription: string;
  reportedBy: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  cost: number;
  date: string;
}

export interface Review {
  id: string;
  bicycleId: string;
  bicycleName: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  totalDocks: number;
  availableBikes: number;
  lat: number;
  lng: number;
}

export interface PlatformStats {
  totalTrips: number;
  activeRentals: number;
  totalBikes: number;
  availableBikes: number;
  co2SavedKg: number;
  distanceCoveredKm: number;
  caloriesBurned: number;
  dbType: 'mongodb' | 'in-memory-fallback';
}

export type UserRole = 'customer' | 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  joinedDate: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

