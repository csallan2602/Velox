import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose, { Schema } from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Database Schemas & Storage Abstraction ---
let isMongoConnected = false;

// Initial Seeds
const INITIAL_STATIONS = [
  {
    id: 'st-1',
    name: 'Central Station Terminal',
    address: 'Bay 1, Grand Central Plaza, Downtown',
    totalDocks: 24,
    availableBikes: 7,
    lat: 19.0760,
    lng: 72.8777
  },
  {
    id: 'st-2',
    name: 'University Campus North Hub',
    address: 'Near Library Gate 3, University Road',
    totalDocks: 18,
    availableBikes: 5,
    lat: 19.0820,
    lng: 72.8850
  },
  {
    id: 'st-3',
    name: 'Kandivali West Metro Link',
    address: 'Station Exit 2, SV Road, Kandivali West',
    totalDocks: 20,
    availableBikes: 6,
    lat: 19.2060,
    lng: 72.8480
  },
  {
    id: 'st-4',
    name: 'Eco-Park Promenade Dock',
    address: 'Lakeview Boulevard & Green Lane',
    totalDocks: 16,
    availableBikes: 4,
    lat: 19.1130,
    lng: 72.8690
  },
  {
    id: 'st-5',
    name: 'Tech Innovation Park Station',
    address: 'Sector 5 Building A Forecourt',
    totalDocks: 22,
    availableBikes: 8,
    lat: 19.1200,
    lng: 72.8550
  }
];

const INITIAL_BIKES = [
  {
    id: 'bk-101',
    name: 'AeroGlide Volt-E Commuter',
    category: 'Electric',
    ratePerHour: 3.50,
    ratePerDay: 22.00,
    station: 'Central Station Terminal',
    status: 'available',
    conditionScore: 4.9,
    batteryPercent: 94,
    gears: 'Shimano Nexus 7-Speed Internal',
    frameSize: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&auto=format&fit=crop&q=80',
    description: 'High-torque pedal assist e-bike with integrated puncture-resistant tires, LED headlight, and 65km battery range. Ideal for long-range city commutes.',
    totalTrips: 142
  },
  {
    id: 'bk-102',
    name: 'Summit Apex Trail MTB',
    category: 'Mountain',
    ratePerHour: 4.00,
    ratePerDay: 26.00,
    station: 'Eco-Park Promenade Dock',
    status: 'available',
    conditionScore: 4.8,
    gears: 'SRAM Eagle 12-Speed',
    frameSize: 'Large',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
    description: 'Dual-suspension aluminum mountain bike engineered for park trails, gravel paths, and rugged elevation challenges.',
    totalTrips: 89
  },
  {
    id: 'bk-103',
    name: 'CitySprint Urban Cruiser',
    category: 'City Cruiser',
    ratePerHour: 2.00,
    ratePerDay: 14.00,
    station: 'University Campus North Hub',
    status: 'available',
    conditionScore: 4.6,
    gears: 'Shimano 3-Speed Hub',
    frameSize: 'Small',
    imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&auto=format&fit=crop&q=80',
    description: 'Step-through classic city cruiser with ergonomic swept-back handlebars, front wire luggage basket, and chain guard.',
    totalTrips: 215
  },
  {
    id: 'bk-104',
    name: 'Veloce Carbon Strada',
    category: 'Road',
    ratePerHour: 5.00,
    ratePerDay: 32.00,
    station: 'Kandivali West Metro Link',
    status: 'available',
    conditionScore: 5.0,
    gears: 'Shimano 105 22-Speed',
    frameSize: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop&q=80',
    description: 'Featherlight carbon fiber road racing bike calibrated for high speed, rapid cadence, and paved boulevard touring.',
    totalTrips: 64
  },
  {
    id: 'bk-105',
    name: 'CrossCountry Dual Hybrid',
    category: 'Hybrid',
    ratePerHour: 2.75,
    ratePerDay: 18.00,
    station: 'Tech Innovation Park Station',
    status: 'available',
    conditionScore: 4.7,
    gears: 'Shimano Altus 21-Speed',
    frameSize: 'Large',
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&auto=format&fit=crop&q=80',
    description: 'Versatile multi-surface hybrid bicycle combining road bike efficiency with mountain bike posture and hydraulic disc brakes.',
    totalTrips: 118
  },
  {
    id: 'bk-106',
    name: 'EcoRider Pulse Step-Thru E-Bike',
    category: 'Electric',
    ratePerHour: 3.50,
    ratePerDay: 22.00,
    station: 'Central Station Terminal',
    status: 'reserved',
    conditionScore: 4.9,
    batteryPercent: 88,
    gears: 'Shimano Nexus 7-Speed',
    frameSize: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=800&auto=format&fit=crop&q=80',
    description: 'Quiet motor pedal assist bike with USB phone charging dock and high-capacity removable battery pack.',
    totalTrips: 173
  },
  {
    id: 'bk-107',
    name: 'Rockhopper Roughline MTB',
    category: 'Mountain',
    ratePerHour: 4.00,
    ratePerDay: 26.00,
    station: 'Eco-Park Promenade Dock',
    status: 'maintenance',
    conditionScore: 3.8,
    gears: 'Shimano Deore 10-Speed',
    frameSize: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&auto=format&fit=crop&q=80',
    description: 'Undergoing routine rear hydraulic brake pad replacement and chain tension recalibration.',
    totalTrips: 95
  },
  {
    id: 'bk-108',
    name: 'MetroLite Commuter',
    category: 'City Cruiser',
    ratePerHour: 2.00,
    ratePerDay: 14.00,
    station: 'Kandivali West Metro Link',
    status: 'rented',
    conditionScore: 4.5,
    gears: 'Single Speed Coaster',
    frameSize: 'Small',
    imageUrl: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&auto=format&fit=crop&q=80',
    description: 'Durable, weatherized lightweight city bike with puncture-proof honeycomb solid rubber tires.',
    totalTrips: 310
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'bk-res-901',
    bicycleId: 'bk-106',
    bicycleName: 'EcoRider Pulse Step-Thru E-Bike',
    category: 'Electric',
    customerName: 'Allan Singh',
    customerEmail: 'allan.singh@example.com',
    customerPhone: '+91 98765 43210',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    durationHours: 3,
    totalAmount: 10.50,
    status: 'reserved',
    pickupStation: 'Central Station Terminal',
    pickupPin: '4821',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: 'bk-res-902',
    bicycleId: 'bk-108',
    bicycleName: 'MetroLite Commuter',
    category: 'City Cruiser',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.s@example.com',
    customerPhone: '+91 98220 11223',
    startTime: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    durationHours: 2,
    totalAmount: 4.00,
    status: 'active',
    pickupStation: 'Kandivali West Metro Link',
    pickupPin: '7392',
    createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString()
  },
  {
    id: 'bk-res-899',
    bicycleId: 'bk-101',
    bicycleName: 'AeroGlide Volt-E Commuter',
    category: 'Electric',
    customerName: 'Rohan Mehta',
    customerEmail: 'rohan.m@example.com',
    customerPhone: '+91 98111 22334',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    durationHours: 4,
    totalAmount: 14.00,
    status: 'completed',
    pickupStation: 'Central Station Terminal',
    returnStation: 'University Campus North Hub',
    pickupPin: '5510',
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_MAINTENANCE = [
  {
    id: 'mnt-301',
    bicycleId: 'bk-107',
    bicycleName: 'Rockhopper Roughline MTB',
    issueDescription: 'Rear disc brake squeal & loose chain derailleur tensioning',
    reportedBy: 'Kandivali Depot Staff',
    priority: 'high',
    status: 'in-repair',
    cost: 18.50,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mnt-299',
    bicycleId: 'bk-103',
    bicycleName: 'CitySprint Urban Cruiser',
    issueDescription: 'Front basket fastener replaced and kickstand spring oiled',
    reportedBy: 'Station Inspector Dave',
    priority: 'low',
    status: 'resolved',
    cost: 6.00,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_REVIEWS = [
  {
    id: 'rev-401',
    bicycleId: 'bk-101',
    bicycleName: 'AeroGlide Volt-E Commuter',
    customerName: 'Vikram Joshi',
    rating: 5,
    comment: 'The electric boost makes uphill climbs effortless! Battery was at 98% when I picked it up at Central Station.',
    date: '2026-11-01'
  },
  {
    id: 'rev-402',
    bicycleId: 'bk-103',
    bicycleName: 'CitySprint Urban Cruiser',
    customerName: 'Ananya Verma',
    rating: 4,
    comment: 'Very comfortable seat and smooth braking. Perfect for cruising through the university campus.',
    date: '2026-10-29'
  },
  {
    id: 'rev-403',
    bicycleId: 'bk-104',
    bicycleName: 'Veloce Carbon Strada',
    customerName: 'Devang Rao',
    rating: 5,
    comment: 'Remarkable speed and crisp shifting on the Shimano groupset. One of the best road bikes I have rented.',
    date: '2026-10-28'
  }
];

const INITIAL_USERS = [
  {
    id: 'usr-101',
    name: 'Allan Singh',
    email: 'allan.singh@example.com',
    password: 'pass123',
    role: 'customer',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-09-15'
  },
  {
    id: 'usr-102',
    name: 'Rajesh K. (Kandivali Station Master)',
    email: 'operator@velox.com',
    password: 'admin123',
    role: 'operator',
    phone: '+91 98220 55443',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-08-01'
  },
  {
    id: 'usr-103',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    password: 'pass123',
    role: 'customer',
    phone: '+91 98220 11223',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-10-10'
  }
];

// In-Memory Database store (reactive fallback & runtime store)
const memoryStore = {
  stations: [...INITIAL_STATIONS],
  bikes: [...INITIAL_BIKES],
  bookings: [...INITIAL_BOOKINGS],
  maintenance: [...INITIAL_MAINTENANCE],
  reviews: [...INITIAL_REVIEWS],
  users: [...INITIAL_USERS]
};

// Attempt MongoDB Connection if MONGODB_URI is provided
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas cluster');
    })
    .catch((err) => {
      console.warn('⚠️ MongoDB connection could not be established. Running in high-performance in-memory fallback store:', err.message);
      isMongoConnected = false;
    });
} else {
  console.log('ℹ️ MONGODB_URI not set. Running with built-in reactive seeded in-memory store.');
}

// --- API ROUTES ---

// Authentication Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  const user = memoryStore.users.find(u => u.email.toLowerCase() === String(email).toLowerCase().trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password. Use demo accounts below or register.' });
  }

  const { password: _, ...userWithoutPass } = user;
  const token = `velox-session-${user.id}-${Date.now()}`;
  res.json({ user: userWithoutPass, token });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const existing = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const assignedRole = role === 'operator' ? 'operator' : 'customer';
  const newUser = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name: String(name).trim(),
    email: cleanEmail,
    password: String(password),
    phone: phone || '+91 90000 00000',
    role: assignedRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  memoryStore.users.push(newUser);

  const { password: _, ...userWithoutPass } = newUser;
  const token = `velox-session-${newUser.id}-${Date.now()}`;
  res.status(201).json({ user: userWithoutPass, token });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const emailQuery = req.query.email as string;

  let user = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const userIdMatch = token.match(/^velox-session-(usr-\w+)-/);
    if (userIdMatch) {
      user = memoryStore.users.find(u => u.id === userIdMatch[1]);
    }
  }

  if (!user && emailQuery) {
    user = memoryStore.users.find(u => u.email.toLowerCase() === emailQuery.toLowerCase().trim());
  }

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass });
});

app.get('/api/auth/users', (req: Request, res: Response) => {
  const sanitized = memoryStore.users.map(({ password, ...u }) => u);
  res.json(sanitized);
});

// Health & System Info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'Velox Bicycle Rental Platform',
    dbType: isMongoConnected ? 'mongodb' : 'in-memory-fallback',
    timestamp: new Date().toISOString(),
    stationsCount: memoryStore.stations.length,
    bikesCount: memoryStore.bikes.length,
    activeBookings: memoryStore.bookings.filter(b => b.status === 'active' || b.status === 'reserved').length
  });
});

// Platform Telemetry & Eco Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const totalTrips = memoryStore.bikes.reduce((acc, b) => acc + (b.totalTrips || 0), 0) + memoryStore.bookings.length;
  const activeRentals = memoryStore.bookings.filter(b => b.status === 'active').length;
  const totalBikes = memoryStore.bikes.length;
  const availableBikes = memoryStore.bikes.filter(b => b.status === 'available').length;
  
  // Real-world green mobility calculations:
  // Average ride ~ 6.5 km; 1 km on bicycle saves ~ 0.21 kg of CO2 compared to cars
  const distanceCoveredKm = totalTrips * 6.5;
  const co2SavedKg = Math.round(distanceCoveredKm * 0.21);
  const caloriesBurned = Math.round(distanceCoveredKm * 32);

  res.json({
    totalTrips,
    activeRentals,
    totalBikes,
    availableBikes,
    co2SavedKg,
    distanceCoveredKm: Math.round(distanceCoveredKm),
    caloriesBurned,
    dbType: isMongoConnected ? 'mongodb' : 'in-memory-fallback'
  });
});

// Stations API
app.get('/api/stations', (req: Request, res: Response) => {
  // Compute live available bikes per station
  const stationsWithLiveCounts = memoryStore.stations.map(st => {
    const liveAvailable = memoryStore.bikes.filter(b => b.station === st.name && b.status === 'available').length;
    return {
      ...st,
      availableBikes: liveAvailable
    };
  });
  res.json(stationsWithLiveCounts);
});

// Bicycles API
app.get('/api/bikes', (req: Request, res: Response) => {
  const { category, station, status, search } = req.query;
  let result = [...memoryStore.bikes];

  if (category && category !== 'All') {
    result = result.filter(b => b.category.toLowerCase() === String(category).toLowerCase());
  }
  if (station && station !== 'All') {
    result = result.filter(b => b.station.toLowerCase() === String(station).toLowerCase());
  }
  if (status && status !== 'All') {
    result = result.filter(b => b.status.toLowerCase() === String(status).toLowerCase());
  }
  if (search) {
    const query = String(search).toLowerCase();
    result = result.filter(b =>
      b.name.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      b.station.toLowerCase().includes(query) ||
      b.description.toLowerCase().includes(query)
    );
  }

  res.json(result);
});

app.get('/api/bikes/:id', (req: Request, res: Response) => {
  const bike = memoryStore.bikes.find(b => b.id === req.params.id);
  if (!bike) {
    return res.status(404).json({ error: 'Bicycle not found' });
  }
  res.json(bike);
});

app.post('/api/bikes', (req: Request, res: Response) => {
  const { name, category, ratePerHour, ratePerDay, station, gears, frameSize, imageUrl, description } = req.body;
  if (!name || !category || !ratePerHour || !station) {
    return res.status(400).json({ error: 'Missing required bicycle fields' });
  }

  const newBike = {
    id: `bk-${Date.now().toString().slice(-4)}`,
    name,
    category,
    ratePerHour: Number(ratePerHour),
    ratePerDay: Number(ratePerDay || ratePerHour * 6),
    station,
    status: 'available',
    conditionScore: 5.0,
    batteryPercent: category === 'Electric' ? 100 : undefined,
    gears: gears || 'Standard Multi-Gear',
    frameSize: frameSize || 'Medium',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&auto=format&fit=crop&q=80',
    description: description || 'High-performance rental bicycle ready for riders.',
    totalTrips: 0
  };

  memoryStore.bikes.unshift(newBike);
  res.status(201).json(newBike);
});

app.put('/api/bikes/:id', (req: Request, res: Response) => {
  const index = memoryStore.bikes.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Bicycle not found' });
  }

  const current = memoryStore.bikes[index];
  const updated = {
    ...current,
    ...req.body,
    id: current.id
  };

  memoryStore.bikes[index] = updated;
  res.json(updated);
});

app.delete('/api/bikes/:id', (req: Request, res: Response) => {
  const initialLen = memoryStore.bikes.length;
  memoryStore.bikes = memoryStore.bikes.filter(b => b.id !== req.params.id);
  if (memoryStore.bikes.length === initialLen) {
    return res.status(404).json({ error: 'Bicycle not found' });
  }
  res.json({ success: true, message: 'Bicycle removed from inventory' });
});

// Bookings API
app.get('/api/bookings', (req: Request, res: Response) => {
  const { email, status } = req.query;
  let result = [...memoryStore.bookings];
  if (email) {
    result = result.filter(b => b.customerEmail.toLowerCase() === String(email).toLowerCase());
  }
  if (status && status !== 'All') {
    result = result.filter(b => b.status === status);
  }
  res.json(result);
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const { bicycleId, customerName, customerEmail, customerPhone, durationHours, pickupStation, startTime } = req.body;
  if (!bicycleId || !customerName || !customerEmail || !durationHours) {
    return res.status(400).json({ error: 'Missing booking parameters' });
  }

  const bike = memoryStore.bikes.find(b => b.id === bicycleId);
  if (!bike) {
    return res.status(404).json({ error: 'Bicycle not found' });
  }

  if (bike.status !== 'available') {
    return res.status(400).json({ error: `Bicycle is currently ${bike.status}. Please choose an available bicycle.` });
  }

  const hours = Number(durationHours);
  const totalAmount = Number((hours * bike.ratePerHour).toFixed(2));
  const pin = Math.floor(1000 + Math.random() * 9000).toString();

  const newBooking = {
    id: `bk-res-${Date.now().toString().slice(-4)}`,
    bicycleId: bike.id,
    bicycleName: bike.name,
    category: bike.category,
    customerName,
    customerEmail,
    customerPhone: customerPhone || '+91 90000 00000',
    startTime: startTime || new Date().toISOString(),
    durationHours: hours,
    totalAmount,
    status: 'reserved',
    pickupStation: pickupStation || bike.station,
    pickupPin: pin,
    createdAt: new Date().toISOString()
  };

  // Mark bike as reserved
  bike.status = 'reserved';

  memoryStore.bookings.unshift(newBooking);
  res.status(201).json(newBooking);
});

// Booking Status Transition (Operator check-out / check-in return / cancellation)
app.put('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { status, returnStation } = req.body;
  const booking = memoryStore.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const bike = memoryStore.bikes.find(b => b.id === booking.bicycleId);
  booking.status = status;

  if (returnStation) {
    booking.returnStation = returnStation;
  }

  if (bike) {
    if (status === 'active') {
      bike.status = 'rented';
    } else if (status === 'completed') {
      bike.status = 'available';
      if (returnStation) {
        bike.station = returnStation;
      }
      bike.totalTrips = (bike.totalTrips || 0) + 1;
    } else if (status === 'cancelled') {
      bike.status = 'available';
    }
  }

  res.json({ success: true, booking, bike });
});

// Maintenance API
app.get('/api/maintenance', (req: Request, res: Response) => {
  res.json(memoryStore.maintenance);
});

app.post('/api/maintenance', (req: Request, res: Response) => {
  const { bicycleId, issueDescription, reportedBy, priority, cost } = req.body;
  const bike = memoryStore.bikes.find(b => b.id === bicycleId);

  const newRecord = {
    id: `mnt-${Date.now().toString().slice(-4)}`,
    bicycleId: bicycleId || 'General',
    bicycleName: bike ? bike.name : 'Unassigned Bicycle',
    issueDescription,
    reportedBy: reportedBy || 'Station Staff',
    priority: priority || 'medium',
    status: 'pending',
    cost: Number(cost || 0),
    date: new Date().toISOString()
  };

  if (bike) {
    bike.status = 'maintenance';
  }

  memoryStore.maintenance.unshift(newRecord);
  res.status(201).json(newRecord);
});

app.put('/api/maintenance/:id', (req: Request, res: Response) => {
  const index = memoryStore.maintenance.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Maintenance ticket not found' });
  }

  const record = memoryStore.maintenance[index];
  const updated = {
    ...record,
    ...req.body,
    id: record.id
  };

  if (req.body.status === 'resolved') {
    const bike = memoryStore.bikes.find(b => b.id === record.bicycleId);
    if (bike && bike.status === 'maintenance') {
      bike.status = 'available';
      bike.conditionScore = 4.9;
    }
  }

  memoryStore.maintenance[index] = updated;
  res.json(updated);
});

// Reviews API
app.get('/api/reviews', (req: Request, res: Response) => {
  res.json(memoryStore.reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { bicycleId, customerName, rating, comment } = req.body;
  const bike = memoryStore.bikes.find(b => b.id === bicycleId);

  const newReview = {
    id: `rev-${Date.now().toString().slice(-4)}`,
    bicycleId: bicycleId || 'General',
    bicycleName: bike ? bike.name : 'Velox Fleet',
    customerName: customerName || 'Verified Commuter',
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    comment: comment || 'Smooth and pleasant rental experience.',
    date: new Date().toISOString().split('T')[0]
  };

  memoryStore.reviews.unshift(newReview);
  res.status(201).json(newReview);
});

// Vite Mount in Dev / Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚲 Velox Bicycle Rental Server running on http://localhost:${PORT}`);
  });
}

startServer();
