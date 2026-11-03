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

import { 
  INITIAL_STATIONS, 
  INITIAL_BIKES, 
  INITIAL_BOOKINGS, 
  INITIAL_MAINTENANCE, 
  INITIAL_REVIEWS, 
  INITIAL_USERS 
} from './src/data/seedData';
import { BikeStatus, BookingStatus, MaintenanceStatus, UserRole } from './src/types';


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

  const assignedRole: UserRole = role === 'operator' ? 'operator' : 'customer';
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
    status: 'available' as BikeStatus,
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
    status: 'reserved' as BookingStatus,
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
    status: 'pending' as MaintenanceStatus,
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
