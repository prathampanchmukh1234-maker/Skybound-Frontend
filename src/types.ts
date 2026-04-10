
export interface Flight {
  id: string;
  airline: string;
  logo: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  rating: number;
  seatsLeft: number;
  co2Impact?: number; // kg of CO2
  ecoRating?: 'A' | 'B' | 'C' | 'D';
}

export interface Experience {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  rating: number;
  category: 'Adventure' | 'Culture' | 'Food' | 'Nature';
  mood?: string[];
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: number;
  duration: string;
  genre: string[];
  language: string;
  releaseDate: string;
  description: string;
  cast: string[];
  director: string;
  trailerUrl?: string;
}

export interface Concert {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  image: string;
  description: string;
  category: 'Music' | 'Comedy' | 'Theater' | 'Sports';
  rating: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  serviceId: string; // Movie ID or Concert ID
  rating: number;
  comment: string;
  date: string;
}

export interface Theater {
  id: string;
  name: string;
  location: string;
  distance: string;
  screenType?: string;
  layout?: string;
  totalSeats?: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterId: string;
  time: string;
  date: string;
  format: '2D' | '3D' | 'IMAX 3D' | '4DX';
  screen?: string;
  screenType: 'standard' | 'premium' | 'imax' | '4dx';
  basePrice: number;
  price: {
    normal: number;
    premium: number;
    recliner: number;
  };
}

export interface Booking {
  id: string;
  userId: string;
  type: 'flight' | 'hotel' | 'bus' | 'train' | 'sea' | 'holiday' | 'experience' | 'movie';
  itemId: string;
  details: any;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'saved_plan';
  payment_status: 'success' | 'failed' | 'pending';
  date: string;
  created_at: string;
  pointsEarned: number;
  pointsRedeemed: number;
  walletUsed: number;
  seat?: string;
  timeline?: { day: number; activities: string[] }[];
  // DB snake_case fields (from Supabase)
  user_id?: string;
  total_price?: number;
  payment_id?: string;
  // New venue/travel fields
  venue?: string;
  travel_date?: string;
  show_time?: string;
  from_city?: string;
  to_city?: string;
  // Poster and title stored directly on booking
  title?: string;
  poster?: string;
}

export interface TripPlan {
  id: string;
  userId: string;
  title: string;
  destination: string;
  budget: number;
  items: any[];
  packingList: string[];
  created_at: string;
}

export interface PriceAlert {
  id: string;
  userId: string;
  from: string;
  to: string;
  targetPrice: number;
  currentPrice: number;
}

export interface BusRoute {
  id: string;
  operator: string;
  operatorLogo: string;
  type: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  departureTime?: string; // Compatibility
  arrivalTime?: string; // Compatibility
  duration: string;
  price: number;
  rating: number;
  totalReviews: number;
  seatsAvailable: number;
  totalSeats?: number;
  occupiedSeats?: string[];
  amenities: string[];
  flexi: boolean;
  liveTracking: boolean;
  boardingPoints: string[];
  droppingPoints: string[];
  busType?: string;
  image?: string;
  distance_km?: number;
}

export interface TrainRoute {
  id: string;
  name: string;
  number: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  departureTime?: string; // Compatibility
  arrivalTime?: string; // Compatibility
  duration: string;
  price?: number; // Compatibility
  days: string[];
  classes: {
    [key: string]: {
      fare: number;
      available: number;
      status: string;
    };
  };
  train_type: string;
  rating: number;
  image?: string;
  distance_km?: number;
}

export interface Hotel {
  id: string;
  name: string;
  stars: number;
  image: string;
  pricePerNight: number;
  price?: number; // Compatibility
  originalPrice: number;
  rating: number;
  reviews: number;
  location: string;
  amenities: string[];
  cancellation: 'free' | 'paid' | 'non-refundable';
  breakfast: boolean;
  payAtHotel: boolean;
  distance?: string;
}

export interface CabType {
  id: string;
  type: string;
  name?: string; // Compatibility
  example: string;
  description?: string; // Compatibility
  image: string;
  perKm: number;
  pricePerKm?: number; // Compatibility
  baseKm: number;
  baseFare: number;
  capacity: number;
  luggage?: number; // Compatibility
  includes: string[];
  excludes: string[];
  distance_km?: number;
}

export interface Activity {
  id: string;
  title: string;
  name?: string; // Compatibility
  category: string;
  image: string;
  price: number;
  originalPrice?: number;
  duration: string;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging';
  rating: number;
  reviews: number;
  instantConfirmation: boolean;
  freeCancellation: boolean;
  includes: string[];
  location: string;
  minAge?: number;
  maxWeight?: number;
}

export interface InsurancePlan {
  id: string;
  name: string;
  price: number;
  perTrip: boolean;
  covers: string[];
  features?: string[]; // Compatibility
  color: string;
  recommended: boolean;
}

export interface VisaDestination {
  id?: string; // Compatibility
  country: string;
  flag: string;
  image?: string; // Compatibility
  type: string;
  duration: string;
  fee: number;
  price?: number; // Compatibility
  processing: string;
  processingTime?: string; // Compatibility
  onArrival: boolean;
  validity?: string; // Compatibility
}

export interface GiftCard {
  id: string;
  theme: string;
  amount: number;
  from: string;
  to: string;
  message: string;
  code: string;
  expiryDate: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  date: string;
}

export interface FareAlert {
  id: string;
  from: string;
  to: string;
  maxPrice: number;
  travelMonth: string;
  currentPrice: number;
  triggered: boolean;
  createdAt: string;
}

export interface GroupTrip {
  id: string;
  title: string;
  members: { name: string; email: string; paid: boolean }[];
  totalExpenses: number;
  sharedExpenses: { desc: string; amount: number; paidBy: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  tier: 'Standard' | 'Elite' | 'Diamond';
  skyPoints: number;
  walletBalance: number;
  referralCode: string;
  searchHistory: any[];
  freeTrialUsed: boolean;
  personality?: 'Budget Backpacker' | 'Luxury Seeker' | 'Nature Enthusiast' | 'Urban Explorer';
  phone?: string;
  avatar_url?: string;
  twoFaEnabled?: boolean;
  browseHistory?: any[];
  travelStats?: { trips: number; cities: number; km: number };
  location?: string;
  bio?: string;
}

export interface Location {
  id: string;
  name: string;
  code?: string;
  country: string;
  type: 'airport' | 'city' | 'station' | 'bus-stop';
  crowdScore?: number; // 1-100
  isGem?: boolean;
  region?: 'domestic' | 'international';
}

export interface TravelProfile {
  id: string;
  user_id: string;
  age: number;
  travel_style: 'budget' | 'luxury' | 'adventure';
  yearly_budget: number;
  created_at: string;
}

export interface DreamDestination {
  id: string;
  user_id: string;
  name: string;
  category: 'nature' | 'city' | 'adventure' | 'culture';
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  created_at: string;
}

export interface LifeTrip {
  id: string;
  user_id: string;
  destination: string;
  year: number;
  status: 'planned' | 'booked';
  created_at: string;
}
