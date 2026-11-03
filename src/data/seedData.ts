import { Bicycle, Booking, Station, MaintenanceRecord, Review, User } from '../types';

export const INITIAL_STATIONS: Station[] = [
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

export const INITIAL_BIKES: Bicycle[] = [
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

export const INITIAL_BOOKINGS: Booking[] = [
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

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
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

export const INITIAL_REVIEWS: Review[] = [
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

export const INITIAL_USERS: (User & { password: string })[] = [
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
