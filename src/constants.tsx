
import { Location, Experience, Movie, Theater, Showtime, Concert, Review, BusRoute, TrainRoute, Hotel, CabType, Activity, InsurancePlan, VisaDestination } from './types';

const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const pastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const MOVIES: Movie[] = [
  {
    id: 'm-1',
    title: 'Avengers: Doomsday',
    poster: 'https://i.ebayimg.com/images/g/HtsAAOSwNKhoS-lE/s-l1200.png',
    rating: 9.5,
    duration: '2h 45m',
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    language: 'English',
    releaseDate: futureDate(25),
    description: 'The Avengers reunite to face their greatest challenge yet: Victor von Doom, who seeks to reshape reality in his own image.',
    cast: ['Robert Downey Jr.', 'Benedict Cumberbatch', 'Tom Holland'],
    director: 'Anthony & Joe Russo',
    trailerUrl: 'https://www.youtube.com/embed/_35oQn-K6g8'
  },
  {
    id: 'm-2',
    title: 'The Batman Part II',
    poster: 'https://posterspy.com/wp-content/uploads/2025/08/batman2robin_final_deviant_diamonddead.jpg',
    rating: 8.8,
    duration: '2h 55m',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'English',
    releaseDate: futureDate(180),
    description: 'Bruce Wayne continues his journey as the Dark Knight, facing a new wave of corruption and a mysterious new adversary in Gotham City.',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Jeffrey Wright'],
    director: 'Matt Reeves',
    trailerUrl: 'https://www.youtube.com/embed/T7_zMl_ZhdQ'
  },
  {
    id: 'm-3',
    title: 'Kesari Chapter 2',
    poster: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/kesari-chapter-2-the-untold-story-of-jallianwala-bagh-et00439158-1744618984.jpg',
    rating: 8.9,
    duration: '2h 40m',
    genre: ['Action', 'History', 'Drama'],
    language: 'Hindi',
    releaseDate: pastDate(2),
    description: 'The saga continues as the legendary resistance faces new challenges in this epic historical action drama.',
    cast: ['Akshay Kumar', 'Parineeti Chopra'],
    director: 'Anurag Singh',
    trailerUrl: 'https://www.youtube.com/embed/r-7g08INMSI'
  },
  {
    id: 'm-5',
    title: 'Sikandar',
    poster: 'https://wallpapercave.com/wp/wp15331511.jpg',
    rating: 8.7,
    duration: '2h 35m',
    genre: ['Action', 'Drama'],
    language: 'Hindi',
    releaseDate: futureDate(5),
    description: 'Salman Khan returns in a powerful role as Sikandar, a man on a mission to protect his legacy.',
    cast: ['Salman Khan', 'Rashmika Mandanna'],
    director: 'A.R. Murugadoss',
    trailerUrl: 'https://www.youtube.com/embed/BAk5ZCoTWY8'
  },
  {
    id: 'm-6',
    title: 'Thunderbolts*',
    poster: 'https://m.media-amazon.com/images/I/71WUn6AkgQL._AC_UF894,1000_QL80_.jpg',
    rating: 8.2,
    duration: '2h 7m',
    genre: ['Action', 'Sci-Fi', 'Adventure'],
    language: 'English',
    releaseDate: futureDate(30),
    description: 'A group of Marvel antiheroes recruited by shadowy government forces discover they have more in common than they realize.',
    cast: ['Florence Pugh', 'Sebastian Stan', 'David Harbour'],
    director: 'Jake Schreier',
    trailerUrl: 'https://www.youtube.com/embed/-sAOWhvheK8'
  },
  {
    id: 'm-7',
    title: 'Mission: Impossible – The Final Reckoning',
    poster: 'https://deadline.com/wp-content/uploads/2025/04/Mi8_DOM_2025x3000_Online_Character_Poster_TCruiseHanging_R1.jpg?w=800',
    rating: 9.0,
    duration: '2h 40m',
    genre: ['Action', 'Adventure', 'Thriller'],
    language: 'English',
    releaseDate: futureDate(120),
    description: 'Ethan Hunt and his IMF team embark on their most dangerous mission yet, facing a global threat that could change the world forever.',
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames'],
    director: 'Christopher McQuarrie',
    trailerUrl: 'https://www.youtube.com/embed/fsQgc9pCyDU'
  },
  {
    id: 'm-8',
    title: 'Housefull 5',
    poster: 'https://cdna.artstation.com/p/assets/images/images/088/653/534/large/sakil-rahman-housefull-5-poster-design.jpg?1748865063',
    rating: 7.5,
    duration: '2h 30m',
    genre: ['Comedy', 'Drama'],
    language: 'Hindi',
    releaseDate: futureDate(90),
    description: 'The hilarious ensemble returns for another round of chaotic fun and mistaken identities in this fifth installment.',
    cast: ['Akshay Kumar', 'Riteish Deshmukh', 'Abhishek Bachchan'],
    director: 'Tarun Mansukhani',
    trailerUrl: 'https://www.youtube.com/embed/xGQuT1wm2qk'
  },
  {
    id: 'm-9',
    title: 'War 2',
    poster: 'https://images.filmibeat.com/ph-big/2025/07/war-21753707876_0.jpg',
    rating: 8.9,
    duration: '2h 45m',
    genre: ['Action', 'Thriller'],
    language: 'Hindi',
    releaseDate: futureDate(150),
    description: 'The ultimate showdown continues as two elite agents face off in a high-stakes battle across the globe.',
    cast: ['Hrithik Roshan', 'NTR Jr.', 'Kiara Advani'],
    director: 'Ayan Mukerji',
    trailerUrl: 'https://www.youtube.com/embed/9l5QY7BJmHQ'
  },
  {
    id: 'm-10',
    title: 'Dhurandhar',
    poster: 'https://cdn.district.in/movies-assets/images/cinema/1Dhurandhar_Gallery%20(1)-30c49920-c44a-11f0-a760-c9725373a5c5.jpg',
    rating: 9.2,
    duration: '2h 50m',
    genre: ['Action', 'Thriller'],
    language: 'Marathi/Hindi',
    releaseDate: pastDate(5),
    description: 'A gritty underworld drama set in the heart of Maharashtra, following the rise of a new power.',
    cast: ['Ankush Chaudhari', 'Pooja Sawant'],
    director: 'Aditya Sarpotdar',
    trailerUrl: 'https://www.youtube.com/embed/BKOVzHcjEIo'
  },
  {
    id: 'm-11',
    title: 'Dhurandhar The Revenge',
    poster: 'https://www.tribuneindia.com/sortd-service/imaginary/v22-01/jpg/large/high?url=dGhldHJpYnVuZS1zb3J0ZC1wcm8tcHJvZC1zb3J0ZC9tZWRpYTk2MjcxOGMwLTI0MzQtMTFmMS04ZWE5LTk5MGI3ZjZhOWEzOS5qcGc=',
    rating: 9.4,
    duration: '2h 55m',
    genre: ['Action', 'Thriller'],
    language: 'Marathi/Hindi',
    releaseDate: futureDate(45),
    description: 'The saga continues as the stakes get higher and the revenge gets deadlier.',
    cast: ['Ankush Chaudhari', 'Pooja Sawant'],
    director: 'Aditya Sarpotdar',
    trailerUrl: 'https://www.youtube.com/embed/NHk7scrb_9I'
  }
];

export const CONCERTS: Concert[] = [
  {
    id: 'c-1',
    title: 'Lollapalooza India 2026',
    artist: 'Various Artists',
    venue: 'DY Patil Stadium, Mumbai',
    date: futureDate(20),
    time: '02:00 PM',
    price: 9999,
    image: 'https://in.eventfaqs.com/wp-content/uploads/sites/2/2026/01/Day-2-Lollapalooza-India-2026_11zon-scaled.jpg',
    description: 'The iconic music festival returns to Mumbai with a massive lineup of international and local artists.',
    category: 'Music',
    rating: 4.9
  },
  {
    id: 'c-2',
    title: 'Nucleya Live',
    artist: 'Nucleya',
    venue: 'Mahalakshmi Lawns, Pune',
    date: futureDate(35),
    time: '06:30 PM',
    price: 1999,
    image: 'https://img.redbull.com/images/c_crop,x_2128,y_0,h_4016,w_3212/c_fill,w_450,h_600/q_auto,f_auto/redbullcom/2019/01/23/2d50f1a5-a711-4125-afdd-8f0c622fb7f3/everything-you-need-to-know-about-nucleya-live-in-dubai-cover',
    description: 'The king of Indian bass music is back with his high-energy live set in Pune.',
    category: 'Music',
    rating: 4.8
  },
  {
    id: 'c-3',
    title: 'Arijit Singh Live',
    artist: 'Arijit Singh',
    venue: 'Jawaharlal Nehru Stadium, Mumbai',
    date: futureDate(50),
    time: '07:00 PM',
    price: 3500,
    image: 'https://m.eyeofriyadh.com/news_images/2018/12/2daee00ebf4a6.jpg',
    description: 'Experience the soulful voice of Arijit Singh in a grand live concert.',
    category: 'Music',
    rating: 4.9
  },
  {
    id: 'c-5',
    title: 'Comedy Premium League',
    artist: 'Top Comedians',
    venue: 'Balgandharva, Pune',
    date: futureDate(25),
    time: '08:00 PM',
    price: 1200,
    image: 'https://images.justwatch.com/poster/249939956/s718/comedy-premium-league.jpg',
    description: 'A night of non-stop laughter with India\'s best stand-up comedians.',
    category: 'Comedy',
    rating: 4.7
  }
];

export const calcConvenienceFee = (distanceKm: number, type: 'bus'|'train'|'cab'|'flight'|'hotel'|'movie'|'concert'|'activity'): number => {
  if (type === 'movie') return 49;
  if (type === 'concert') return 99;
  if (type === 'hotel') return 249;
  if (type === 'activity') return 79;
  if (type === 'flight') {
    if (distanceKm < 500) return 249;
    if (distanceKm < 1500) return 399;
    return 599;
  }
  // bus, train, cab — distance-based
  if (distanceKm <= 150) return 29;
  if (distanceKm <= 300) return 49;
  if (distanceKm <= 500) return 79;
  if (distanceKm <= 800) return 119;
  if (distanceKm <= 1200) return 169;
  return 229;
};

export const REVIEWS: Review[] = [
  {
    id: 'r-1',
    userId: 'u-1',
    userName: 'Rahul Sharma',
    serviceId: 'm-1',
    rating: 5,
    comment: 'Avengers: Doomsday is a visual masterpiece. The Russo brothers have done it again!',
    date: pastDate(7)
  },
  {
    id: 'r-2',
    userId: 'u-2',
    userName: 'Priya Patel',
    serviceId: 'm-1',
    rating: 4,
    comment: 'Stunning visuals, though the story follows a familiar path. Definitely a theater watch.',
    date: pastDate(14)
  },
  {
    id: 'r-3',
    userId: 'u-3',
    userName: 'Amit Verma',
    serviceId: 'c-1',
    rating: 5,
    comment: 'Coldplay in Mumbai was a dream come true. The atmosphere was electric!',
    date: pastDate(3)
  }
];

export const THEATERS: Theater[] = [
  // Pune
  { id: 't-1', name: 'PVR: Phoenix Marketcity', location: 'Viman Nagar, Pune', distance: '1.2 km', screenType: 'Premium', layout: 'premium' },
  { id: 't-2', name: 'INOX: Amanora Town Centre', location: 'Hadapsar, Pune', distance: '3.5 km', screenType: 'Standard', layout: 'standard' },
  { id: 't-3', name: 'Cinepolis: Westend Mall', location: 'Aundh, Pune', distance: '5.8 km', screenType: 'Standard', layout: 'standard' },
  { id: 't-4', name: 'PVR: Seasons Mall', location: 'Magarpatta, Pune', distance: '4.1 km', screenType: 'Standard', layout: 'standard' },
  // Mumbai
  { id: 't-5', name: 'INOX: R-City Mall', location: 'Ghatkopar, Mumbai', distance: '0.8 km', screenType: 'Premium', layout: 'premium' },
  { id: 't-6', name: 'PVR: Juhu', location: 'Juhu, Mumbai', distance: '2.3 km', screenType: 'Premium', layout: 'premium' },
  { id: 't-7', name: 'Cinepolis: Viviana Mall', location: 'Thane, Mumbai', distance: '6.2 km', screenType: 'Standard', layout: 'standard' },
  { id: 't-8', name: 'IMAX: Wadala', location: 'Wadala, Mumbai', distance: '4.7 km', screenType: 'IMAX', layout: 'imax' },
  // Delhi
  { id: 't-9', name: 'PVR: Select Citywalk', location: 'Saket, New Delhi', distance: '3.0 km', screenType: 'Premium', layout: 'premium' },
  { id: 't-10', name: 'INOX: DLF Promenade', location: 'Vasant Kunj, New Delhi', distance: '5.5 km', screenType: 'Standard', layout: 'standard' },
  // Bangalore
  { id: 't-11', name: 'PVR: Orion Mall', location: 'Rajajinagar, Bangalore', distance: '2.1 km', screenType: 'Premium', layout: 'premium' },
  { id: 't-12', name: 'INOX: Garuda Mall', location: 'Magrath Road, Bangalore', distance: '1.9 km', screenType: 'Standard', layout: 'standard' },
  // New Theaters
  { id: 't-13', name: 'PVR IMAX: Hinjewadi', location: 'Hinjewadi Phase 1, Pune', distance: '7.2 km', screenType: 'IMAX', totalSeats: 280, layout: 'imax' },
  { id: 't-14', name: 'Carnival: Kharadi', location: 'Kharadi, Pune', distance: '4.8 km', screenType: 'Standard', totalSeats: 180, layout: 'standard' },
  { id: 't-15', name: 'Cinepolis: FC Road', location: 'FC Road, Pune', distance: '3.1 km', screenType: 'Mini', totalSeats: 80, layout: 'mini' },
  { id: 't-16', name: 'PVR: Koregaon Park', location: 'Koregaon Park, Pune', distance: '2.4 km', screenType: 'Premium', totalSeats: 120, layout: 'premium' },
  { id: 't-17', name: 'INOX: Gold: Baner', location: 'Baner, Pune', distance: '5.5 km', screenType: 'Gold', totalSeats: 60, layout: 'gold' }
];

export const SHOWTIMES: Showtime[] = [
  // Avengers: Doomsday (m-1) - Release: futureDate(25)
  { id: 's-1',  movieId: 'm-1', theaterId: 't-1', time: '10:30 AM', date: futureDate(27), format: 'IMAX 3D', screen: 'IMAX', screenType: 'imax', basePrice: 400, price: { normal: 550, premium: 850, recliner: 1350 } },
  { id: 's-2',  movieId: 'm-1', theaterId: 't-1', time: '02:15 PM', date: futureDate(27), format: 'IMAX 3D', screen: 'IMAX', screenType: 'imax', basePrice: 450, price: { normal: 600, premium: 900, recliner: 1450 } },
  { id: 's-3',  movieId: 'm-1', theaterId: 't-1', time: '07:00 PM', date: futureDate(28), format: '4DX',     screen: '4DX', screenType: '4dx', basePrice: 500, price: { normal: 700, premium: 1000, recliner: 1600 } },
  { id: 's-4',  movieId: 'm-1', theaterId: 't-2', time: '11:00 AM', date: futureDate(27), format: '2D',      screen: 'Audi 1', screenType: 'standard', basePrice: 180, price: { normal: 280, premium: 420, recliner: 700 } },
  { id: 's-5',  movieId: 'm-1', theaterId: 't-2', time: '03:30 PM', date: futureDate(27), format: '3D',      screen: 'Audi 2', screenType: 'premium', basePrice: 250, price: { normal: 380, premium: 580, recliner: 950 } },
  
  // The Batman Part II (m-2) - Release: futureDate(180)
  { id: 's-10', movieId: 'm-2', theaterId: 't-1', time: '01:00 PM', date: futureDate(182), format: '2D',      screen: 'Audi 2', screenType: 'premium', basePrice: 220, price: { normal: 300, premium: 480, recliner: 800 } },
  { id: 's-11', movieId: 'm-2', theaterId: 't-3', time: '04:30 PM', date: futureDate(182), format: '3D',      screen: 'Audi 1', screenType: 'standard', basePrice: 180, price: { normal: 380, premium: 580, recliner: 950 } },
  
  // Kesari Chapter 2 (m-3) - Release: pastDate(2)
  { id: 's-15', movieId: 'm-3', theaterId: 't-2', time: '10:00 AM', date: futureDate(1), format: '2D',      screen: 'Audi 3', screenType: 'standard', basePrice: 150, price: { normal: 280, premium: 420, recliner: 700 } },
  { id: 's-16', movieId: 'm-3', theaterId: 't-4', time: '01:30 PM', date: futureDate(1), format: '3D',      screen: 'Audi 1', screenType: 'standard', basePrice: 180, price: { normal: 350, premium: 550, recliner: 900 } },
  
  // Sikandar (m-5) - Release: futureDate(5)
  { id: 's-23', movieId: 'm-5', theaterId: 't-4', time: '10:30 AM', date: futureDate(7), format: '2D',      screen: 'Audi 2', screenType: 'premium', basePrice: 200, price: { normal: 250, premium: 380, recliner: 620 } },
  { id: 's-24', movieId: 'm-5', theaterId: 't-6', time: '03:15 PM', date: futureDate(7), format: '3D',      screen: 'Audi 1', screenType: 'standard', basePrice: 180, price: { normal: 330, premium: 520, recliner: 850 } },

  // Thunderbolts* (m-6) - Release: futureDate(30)
  { id: 's-6-1', movieId: 'm-6', theaterId: 't-1', time: '11:00 AM', date: futureDate(32), format: '2D', screen: 'Audi 3', screenType: 'standard', basePrice: 150, price: { normal: 250, premium: 400, recliner: 700 } },
  { id: 's-6-2', movieId: 'm-6', theaterId: 't-5', time: '03:00 PM', date: futureDate(32), format: '3D', screen: 'Audi 2', screenType: 'premium', basePrice: 220, price: { normal: 350, premium: 550, recliner: 900 } },
  
  // Mission: Impossible – The Final Reckoning (m-7) - Release: futureDate(45)
  { id: 's-7-1', movieId: 'm-7', theaterId: 't-8', time: '12:00 PM', date: futureDate(47), format: 'IMAX 3D', screen: 'IMAX', screenType: 'imax', basePrice: 400, price: { normal: 600, premium: 900, recliner: 1500 } },
  { id: 's-7-2', movieId: 'm-7', theaterId: 't-13', time: '07:00 PM', date: futureDate(47), format: 'IMAX 3D', screen: 'IMAX', screenType: 'imax', basePrice: 450, price: { normal: 700, premium: 1100, recliner: 1800 } },
  
  // Housefull 5 (m-8) - Release: futureDate(60)
  { id: 's-8-1', movieId: 'm-8', theaterId: 't-2', time: '10:30 AM', date: futureDate(62), format: '2D', screen: 'Audi 4', screenType: 'standard', basePrice: 150, price: { normal: 200, premium: 350, recliner: 600 } },
  { id: 's-8-2', movieId: 'm-8', theaterId: 't-4', time: '06:30 PM', date: futureDate(62), format: '2D', screen: 'Audi 2', screenType: 'premium', basePrice: 200, price: { normal: 250, premium: 400, recliner: 700 } },
  
  // War 2 (m-9) - Release: futureDate(120)
  { id: 's-9-1', movieId: 'm-9', theaterId: 't-1', time: '01:00 PM', date: futureDate(122), format: '2D', screen: 'Audi 1', screenType: 'standard', basePrice: 180, price: { normal: 300, premium: 500, recliner: 900 } },
  { id: 's-9-2', movieId: 'm-9', theaterId: 't-6', time: '08:00 PM', date: futureDate(122), format: 'IMAX 3D', screen: 'IMAX', screenType: 'imax', basePrice: 450, price: { normal: 600, premium: 900, recliner: 1500 } },

  // Dhurandhar (m-10) - Release: pastDate(5)
  { id: 's-10-1', movieId: 'm-10', theaterId: 't-15', time: '11:30 AM', date: futureDate(1), format: '2D', screen: 'Audi 1', screenType: 'standard', basePrice: 150, price: { normal: 200, premium: 350, recliner: 600 } },
  { id: 's-10-2', movieId: 'm-10', theaterId: 't-16', time: '04:30 PM', date: futureDate(1), format: '2D', screen: 'Audi 1', screenType: 'premium', basePrice: 200, price: { normal: 300, premium: 450, recliner: 750 } },

  // Dhurandhar The Revenge (m-11) - Release: futureDate(45)
  { id: 's-11-1', movieId: 'm-11', theaterId: 't-13', time: '01:30 PM', date: futureDate(46), format: 'IMAX 3D', screen: 'IMAX', screenType: 'imax', basePrice: 400, price: { normal: 550, premium: 850, recliner: 1350 } },
  { id: 's-11-2', movieId: 'm-11', theaterId: 't-17', time: '09:00 PM', date: futureDate(46), format: '2D', screen: 'Gold', screenType: 'premium', basePrice: 500, price: { normal: 800, premium: 1200, recliner: 2000 } },
];

export const BUS_ROUTES: BusRoute[] = [
  {
    id: 'b-1',
    operator: 'Zingbus',
    operatorLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400',
    type: 'Electric AC Sleeper',
    from: 'Pune', to: 'Mumbai',
    departure: '06:00 AM', arrival: '09:15 AM', duration: '3h 15m',
    price: 399, rating: 4.6, totalReviews: 2847,
    seatsAvailable: 12, totalSeats: 36,
    occupiedSeats: ['1A', '1B', '2C', '2D', '5A', '5B', '10C', '10D'],
    amenities: ['wifi', 'charging', 'water', 'blanket', 'liveTracking', 'cctv'],
    flexi: true, liveTracking: true,
    boardingPoints: ['Swargate', 'Shivajinagar', 'Wakad'],
    droppingPoints: ['Dadar', 'Bandra', 'Andheri', 'Borivali'],
    busType: 'Volvo Multi-Axle Semi-Sleeper',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200',
    distance_km: 150
  },
  {
    id: 'b-2',
    operator: 'NueGo',
    operatorLogo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=400',
    type: 'Electric AC Chair Car',
    from: 'Pune', to: 'Nashik',
    departure: '07:30 AM', arrival: '10:45 AM', duration: '3h 15m',
    price: 299, rating: 4.8, totalReviews: 1203,
    seatsAvailable: 24, totalSeats: 40,
    occupiedSeats: ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A'],
    amenities: ['wifi', 'charging', 'cctv', 'liveTracking'],
    flexi: true, liveTracking: true,
    boardingPoints: ['Shivajinagar', 'Pimpri'],
    droppingPoints: ['CBS Nashik', 'Nashik Road'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200',
    distance_km: 212
  },
  {
    id: 'b-3',
    operator: 'IntrCity SmartBus',
    operatorLogo: 'https://images.unsplash.com/photo-1464208398033-ab3f496df0e7?q=80&w=400',
    type: 'AC Sleeper',
    from: 'Pune', to: 'Goa',
    departure: '10:00 PM', arrival: '07:30 AM', duration: '9h 30m',
    price: 799, rating: 4.5, totalReviews: 4521,
    seatsAvailable: 8, totalSeats: 30,
    occupiedSeats: ['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D', '3A', '3B'],
    amenities: ['wifi', 'charging', 'blanket', 'meal', 'liveTracking'],
    flexi: false, liveTracking: true,
    boardingPoints: ['Swargate', 'Katraj', 'Warje'],
    droppingPoints: ['Panaji', 'Calangute', 'Mapusa'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200',
    distance_km: 450
  },
  {
    id: 'b-4',
    operator: 'MSRTC Shivneri',
    operatorLogo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=400',
    type: 'AC Luxury',
    from: 'Pune', to: 'Mumbai',
    departure: '05:30 AM', arrival: '08:45 AM', duration: '3h 15m',
    price: 350, rating: 4.3, totalReviews: 18720,
    seatsAvailable: 30, totalSeats: 45,
    occupiedSeats: ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B'],
    amenities: ['ac', 'charging'],
    flexi: false, liveTracking: false,
    boardingPoints: ['Pune Station', 'Swargate'],
    droppingPoints: ['Mumbai Central', 'Dadar', 'Borivali'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200',
    distance_km: 150
  }
];

export const TRAIN_ROUTES: TrainRoute[] = [
  {
    id: 'tr-1',
    name: 'Deccan Queen',
    number: '12123',
    from: 'Pune', to: 'Mumbai CST',
    departure: '07:15 AM', arrival: '10:35 AM', duration: '3h 20m',
    days: ['Mon','Tue','Wed','Thu','Fri','Sat'],
    classes: {
      'CC': { fare: 355, available: 42, status: 'AVAILABLE' },
      'FC': { fare: 870, available: 12, status: 'AVAILABLE' },
      '2S': { fare: 155, available: 0, status: 'WL 12' }
    },
    train_type: 'Superfast',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1474487543412-1a05136b073a?q=80&w=1200',
    distance_km: 150
  },
  {
    id: 'tr-2',
    name: 'Vande Bharat Express',
    number: '20677',
    from: 'Pune', to: 'Shirdi',
    departure: '06:00 AM', arrival: '09:30 AM', duration: '3h 30m',
    days: ['Mon','Wed','Fri','Sun'],
    classes: {
      'EC': { fare: 1285, available: 8, status: 'AVAILABLE' },
      'CC': { fare: 755, available: 24, status: 'AVAILABLE' }
    },
    train_type: 'Vande Bharat',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1532105956691-9a3a0e109d80?q=80&w=1200',
    distance_km: 200
  },
  {
    id: 'tr-3',
    name: 'Azad Hind Express',
    number: '12129',
    from: 'Pune', to: 'Howrah',
    departure: '04:55 PM', arrival: '08:20 AM', duration: '39h 25m',
    days: ['Tue','Fri'],
    classes: {
      '1A': { fare: 4250, available: 6, status: 'AVAILABLE' },
      '2A': { fare: 2480, available: 18, status: 'AVAILABLE' },
      '3A': { fare: 1680, available: 0, status: 'RAC 8' },
      'SL': { fare: 650, available: 0, status: 'WL 45' }
    },
    train_type: 'Express',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dcaf76d?q=80&w=1200',
    distance_km: 1800
  }
];

export const HOTELS_DATA: Hotel[] = [
  // Dubai hotels
  { id:'h-dubai-1', name:'Atlantis The Palm', stars:5, image:'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200', pricePerNight:35000, originalPrice:45000, rating:4.9, reviews:8240, location:'Palm Jumeirah, Dubai', amenities:['pool','spa','gym','wifi','parking','restaurant','waterpark'], cancellation:'free', breakfast:true, payAtHotel:false, distance:'Palm Jumeirah' },
  { id:'h-dubai-2', name:'Burj Al Arab Jumeirah', stars:5, image:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200', pricePerNight:95000, originalPrice:120000, rating:5.0, reviews:4120, location:'Jumeirah Beach, Dubai', amenities:['pool','spa','gym','wifi','parking','restaurant','bar','concierge'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'Jumeirah Beach' },
  
  // Goa hotels
  { id:'h-goa-1', name:'Taj Exotica Resort & Spa', stars:5, image:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200', pricePerNight:18000, originalPrice:24000, rating:4.8, reviews:3150, location:'Benaulim, Goa', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:true, distance:'Beachfront' },
  { id:'h-goa-2', name:'W Goa', stars:5, image:'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200', pricePerNight:22000, originalPrice:30000, rating:4.7, reviews:1820, location:'Vagator, Goa', amenities:['pool','spa','gym','wifi','parking','restaurant','bar','nightclub'], cancellation:'free', breakfast:true, payAtHotel:false, distance:'Vagator Beach' },
  
  // Delhi hotels
  { id:'h-delhi-1', name:'The Leela Palace', stars:5, image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', pricePerNight:25000, originalPrice:32000, rating:4.9, reviews:5640, location:'Chanakyapuri, New Delhi', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:false, distance:'Diplomatic Enclave' },
  { id:'h-delhi-2', name:'ITC Maurya', stars:5, image:'https://images.unsplash.com/photo-1551882547-ff43c63e8c24?q=80&w=1200', pricePerNight:15000, originalPrice:20000, rating:4.8, reviews:4230, location:'Sardar Patel Marg, New Delhi', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:true, distance:'Central Delhi' },
  
  // Bangalore hotels
  { id:'h-blr-1', name:'The Ritz-Carlton', stars:5, image:'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200', pricePerNight:16000, originalPrice:22000, rating:4.8, reviews:2140, location:'Residency Road, Bangalore', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:false, distance:'CBD' },
  { id:'h-blr-2', name:'Conrad Bengaluru', stars:5, image:'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200', pricePerNight:14000, originalPrice:18000, rating:4.7, reviews:1560, location:'Ulsoor Lake, Bangalore', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:true, distance:'Lake View' },
  
  // Hyderabad hotels
  { id:'h-hyd-1', name:'Taj Falaknuma Palace', stars:5, image:'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200', pricePerNight:45000, originalPrice:60000, rating:5.0, reviews:1240, location:'Engine Bowli, Hyderabad', amenities:['pool','spa','gym','wifi','parking','restaurant','bar','library'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'Heritage Palace' },
  { id:'h-hyd-2', name:'Park Hyatt Hyderabad', stars:5, image:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200', pricePerNight:12000, originalPrice:16000, rating:4.8, reviews:2340, location:'Banjara Hills, Hyderabad', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:true, distance:'Banjara Hills' },
  
  // Jaipur hotels
  { id:'h-jaipur-1', name:'Rambagh Palace', stars:5, image:'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200', pricePerNight:55000, originalPrice:75000, rating:5.0, reviews:1840, location:'Bhawani Singh Road, Jaipur', amenities:['pool','spa','gym','wifi','parking','restaurant','bar','gardens'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'Palace Grounds' },
  { id:'h-jaipur-2', name:'Fairmont Jaipur', stars:5, image:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1200', pricePerNight:18000, originalPrice:25000, rating:4.8, reviews:3120, location:'Riico, Jaipur', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:true, distance:'Kukas' },
  
  // Manali hotels
  { id:'h-manali-1', name:'Span Resort & Spa', stars:5, image:'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200', pricePerNight:15000, originalPrice:20000, rating:4.9, reviews:1240, location:'Kullu-Manali Highway', amenities:['pool','spa','gym','wifi','parking','restaurant','river-view'], cancellation:'free', breakfast:true, payAtHotel:false, distance:'River Side' },
  
  // Singapore hotels
  { id:'h-sin-1', name:'Marina Bay Sands', stars:5, image:'https://images.unsplash.com/photo-1525625239514-46446f1f4405?q=80&w=1200', pricePerNight:45000, originalPrice:55000, rating:4.9, reviews:15240, location:'Bayfront Ave, Singapore', amenities:['pool','spa','gym','wifi','parking','restaurant','casino','infinity-pool'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'Marina Bay' },
  { id:'h-sin-2', name:'Raffles Hotel', stars:5, image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', pricePerNight:65000, originalPrice:80000, rating:5.0, reviews:4120, location:'Beach Road, Singapore', amenities:['pool','spa','gym','wifi','parking','restaurant','bar','heritage'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'Civic District' },
  
  // London hotels
  { id:'h-lon-1', name:'The Savoy', stars:5, image:'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200', pricePerNight:75000, originalPrice:95000, rating:4.9, reviews:5120, location:'Strand, London', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'West End' },
  { id:'h-lon-2', name:'The Ritz London', stars:5, image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', pricePerNight:85000, originalPrice:110000, rating:5.0, reviews:3120, location:'Piccadilly, London', amenities:['spa','gym','wifi','parking','restaurant','bar','afternoon-tea'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'Mayfair' },
  
  // Bangkok hotels
  { id:'h-bkk-1', name:'Mandarin Oriental', stars:5, image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', pricePerNight:35000, originalPrice:45000, rating:5.0, reviews:6120, location:'Charoen Krung Rd, Bangkok', amenities:['pool','spa','gym','wifi','parking','restaurant','bar','river-view'], cancellation:'paid', breakfast:true, payAtHotel:false, distance:'Riverside' },
  
  // Chennai hotels
  { id:'h-maa-1', name:'ITC Grand Chola', stars:5, image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', pricePerNight:12000, originalPrice:16000, rating:4.8, reviews:8120, location:'Guindy, Chennai', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:true, distance:'Guindy' },
  
  // Kolkata hotels
  { id:'h-ccu-1', name:'ITC Sonar', stars:5, image:'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', pricePerNight:10000, originalPrice:14000, rating:4.7, reviews:5120, location:'EM Bypass, Kolkata', amenities:['pool','spa','gym','wifi','parking','restaurant','bar'], cancellation:'free', breakfast:true, payAtHotel:true, distance:'Salt Lake' },

  // Original hotels (kept for compatibility)
    {
      id: 'h-1',
      name: 'The Taj Mahal Palace',
      stars: 5,
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200',
      pricePerNight: 28000,
    originalPrice: 35000,
    rating: 4.9, reviews: 12450,
    location: 'Colaba, Mumbai',
    amenities: ['pool', 'spa', 'gym', 'wifi', 'parking', 'restaurant', 'bar', 'concierge'],
    cancellation: 'free',
    breakfast: true,
    payAtHotel: false,
    distance: '0.1 km from Gateway of India'
  },
  {
    id: 'h-2',
    name: 'JW Marriott Walnut Grove',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dd85b?q=80&w=1200',
    pricePerNight: 22000,
    originalPrice: 28000,
    rating: 4.8, reviews: 2891,
    location: 'Mussoorie, Uttarakhand',
    amenities: ['pool', 'spa', 'gym', 'wifi', 'parking', 'restaurant'],
    cancellation: 'free',
    breakfast: true,
    payAtHotel: true,
    distance: 'Mountain View'
  },
  {
    id: 'h-3',
    name: 'Oberoi Udaivilas',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200',
    pricePerNight: 45000,
    originalPrice: 55000,
    rating: 5.0, reviews: 5107,
    location: 'Udaipur, Rajasthan',
    amenities: ['wifi', 'parking', 'restaurant', 'gym', 'Private Pool', 'Lake View'],
    cancellation: 'paid',
    breakfast: true,
    payAtHotel: true
  },
  {
    id: 'h-4',
    name: 'The Westin Pune Koregaon Park',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200',
    pricePerNight: 10200,
    originalPrice: 15500,
    rating: 4.9, reviews: 1820,
    location: 'Koregaon Park, Pune',
    amenities: ['pool', 'spa', 'gym', 'wifi', 'parking', 'restaurant', 'bar'],
    cancellation: 'free',
    breakfast: true,
    payAtHotel: false
  }
];

export const CAB_TYPES: CabType[] = [
  { id: 'cab-1', type: 'Hatchback', example: 'WagonR / Alto', image: 'https://hurryupcabs.com/images/category_content/luxury-suv-taxi-web.webp', 
    perKm: 11, baseKm: 250, baseFare: 2750, capacity: 4,
    includes: ['250 km included', 'Fuel', 'Driver allowance'],
    excludes: ['Tolls', 'Parking', 'State permits'],
    distance_km: 250 },
  { id: 'cab-2', type: 'Sedan', example: 'Dzire / Etios', image: 'https://content.jdmagicbox.com/comp/nagpur/v9/0712px712.x712.220331233014.i6v9/catalogue/shri-bala-sai-tours-and-travels-gopal-nagar-nagpur-car-rental-17fw86h7he.jpg',
    perKm: 14, baseKm: 250, baseFare: 3500, capacity: 4,
    includes: ['250 km included', 'Fuel', 'Driver allowance', 'Water bottle'],
    excludes: ['Tolls', 'Parking', 'State permits'],
    distance_km: 250 },
  { id: 'cab-3', type: 'SUV', example: 'Ertiga / Innova', image: 'https://vstaxiservice.com/wp-content/uploads/2025/06/outstation-cab-in-delhi-1024x1024.jpg',
    perKm: 18, baseKm: 250, baseFare: 4500, capacity: 6,
    includes: ['250 km included', 'Fuel', 'Driver allowance', 'WiFi'],
    excludes: ['Tolls', 'State permits'],
    distance_km: 250 },
  { id: 'cab-4', type: 'Premium SUV', example: 'Crysta / XUV700', image: 'https://cdn-s3.autocarindia.com/legacy/cdni/News/Screenshot%202025-03-06%20at%2015-23-24%20LX%20500d%20digital%20brochure%20-%20https___www.lexusindia.co.in_wp-content_uploads_2025_03_LX-500d-digital-brochure.pdf.png?w=700&c=0',
    perKm: 22, baseKm: 250, baseFare: 5500, capacity: 6,
    includes: ['250 km included', 'Fuel', 'Professional Chauffeur', 'WiFi', 'Water & Snacks'],
    excludes: ['Tolls', 'State permits'],
    distance_km: 250 },
  { id: 'cab-5', type: 'Tempo Traveller', example: '12-Seater', image: 'https://punetours.com/wp-content/uploads/2021/01/26-seater-travller.jpg',
    perKm: 28, baseKm: 250, baseFare: 7000, capacity: 12,
    includes: ['250 km included', 'Fuel', 'Driver allowance'],
    excludes: ['Tolls', 'State permits', 'Parking'],
    distance_km: 250 }
];

export const ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Hot Air Balloon Safari',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
    price: 8500, originalPrice: 10500,
    duration: '1 hour', difficulty: 'Easy',
    rating: 4.8, reviews: 1240,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Equipment', 'Certified Instructor', 'GoPro Video', 'Certificate'],
    location: 'Lonavala, Maharashtra',
    minAge: 12, maxWeight: 100
  },
  {
    id: 'act-2',
    title: 'Scuba Diving',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200',
    price: 4500, originalPrice: 6000,
    duration: '2 hours',
    rating: 4.9, reviews: 3870,
    instantConfirmation: true, freeCancellation: false,
    includes: ['Expert Guide', 'Equipment', 'Water', 'First Aid'],
    location: 'Andaman Islands',
    difficulty: 'Moderate'
  },
  {
    id: 'act-3',
    title: 'Pune Heritage Food Walk',
    category: 'Food Tours',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200',
    price: 1200, originalPrice: 1800,
    duration: '3 hours',
    rating: 4.9, reviews: 657,
    instantConfirmation: true, freeCancellation: true,
    includes: ['7 Food Stops', 'Expert Guide', 'Drinks'],
    location: 'Kasba Peth, Pune'
  },
  {
    id: 'act-4',
    title: 'Mumbai Street Food & Heritage Walk',
    category: 'Food Tours',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200',
    price: 1800, originalPrice: 2400,
    duration: '3 hours',
    rating: 4.8, reviews: 932,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Local Tastings', 'Guide', 'Fort Area Walk'],
    location: 'Fort, Mumbai'
  },
  {
    id: 'act-5',
    title: 'Sunset Cruise Experience',
    category: 'Nature',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200',
    price: 2200, originalPrice: 3000,
    duration: '2 hours',
    rating: 4.7, reviews: 684,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Cruise Access', 'Welcome Drink', 'Live Music'],
    location: 'Gateway of India, Mumbai'
  },
  {
    id: 'act-6',
    title: 'Old Delhi Food Trail',
    category: 'Food Tours',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200',
    price: 1600, originalPrice: 2100,
    duration: '3 hours',
    rating: 4.9, reviews: 1284,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Food Tastings', 'Rickshaw Ride', 'Local Expert'],
    location: 'Chandni Chowk, New Delhi'
  },
  {
    id: 'act-7',
    title: 'Goa Watersports Combo',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
    price: 3500, originalPrice: 4800,
    duration: '4 hours',
    rating: 4.8, reviews: 2140,
    instantConfirmation: true, freeCancellation: false,
    includes: ['Parasailing', 'Jet Ski', 'Banana Ride', 'Safety Gear'],
    location: 'Calangute, Goa'
  },
  {
    id: 'act-8',
    title: 'Bangalore Craft Brewery Trail',
    category: 'Food Tours',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200',
    price: 2400, originalPrice: 3200,
    duration: '3 hours',
    rating: 4.7, reviews: 512,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Brewery Hops', 'Tasting Flights', 'Host'],
    location: 'Indiranagar, Bangalore'
  },
  {
    id: 'act-9',
    title: 'Hyderabad Heritage & Biryani Tour',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea?q=80&w=1200',
    price: 1900, originalPrice: 2500,
    duration: '4 hours',
    rating: 4.8, reviews: 741,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Charminar Walk', 'Biryani Tasting', 'Guide'],
    location: 'Charminar, Hyderabad'
  },
  {
    id: 'act-10',
    title: 'Chennai Marina Cultural Walk',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=1200',
    price: 1400, originalPrice: 1900,
    duration: '2.5 hours',
    rating: 4.6, reviews: 403,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Local Guide', 'Snacks', 'Historic Stories'],
    location: 'Marina Beach, Chennai'
  },
  {
    id: 'act-11',
    title: 'Kolkata Tram & Market Experience',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1200',
    price: 1350, originalPrice: 1800,
    duration: '3 hours',
    rating: 4.7, reviews: 366,
    instantConfirmation: true, freeCancellation: true,
    includes: ['Tram Ride', 'Market Stop', 'Guide'],
    location: 'College Street, Kolkata'
  }
];

export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'ins-1',
    name: 'Basic Travel Shield',
    price: 299,
    perTrip: true,
    covers: ['Flight Delay ₹5,000', 'Trip Cancellation ₹25,000', 'Medical ₹5 Lakh', 'Baggage Loss ₹10,000'],
    color: 'blue',
    recommended: false
  },
  {
    id: 'ins-2',
    name: 'Premium Travel Guard',
    price: 599,
    perTrip: true,
    covers: ['Flight Delay ₹15,000', 'Trip Cancellation ₹1 Lakh', 'Medical ₹20 Lakh', 'Baggage Loss ₹50,000', 'Passport Loss ₹5,000'],
    color: 'indigo',
    recommended: true
  },
  {
    id: 'ins-3',
    name: 'Elite Explorer',
    price: 999,
    perTrip: true,
    covers: ['Flight Delay ₹25,000', 'Trip Cancellation ₹2 Lakh', 'Medical ₹50 Lakh', 'Adventure Sports', 'Baggage Loss ₹1 Lakh', 'Emergency Evacuation'],
    color: 'purple',
    recommended: false
  }
];

export const VISA_DESTINATIONS: VisaDestination[] = [
  { country: 'UAE', flag: 'https://www.desertrosetourism.com/wp-content/uploads/2025/04/UAE-FLAG.jpg', type: 'E-Visa', duration: '30 days', fee: 3500, processing: '24-48 hours', onArrival: false },
  { country: 'Thailand', flag: 'https://www.travoticholidays.com/wp-content/uploads/2025/05/thailand-visitor-guide-things-to-do-4406.jpg', type: 'Visa on Arrival', duration: '30 days', fee: 2000, processing: 'On Arrival', onArrival: true },
  { country: 'USA', flag: 'https://v2doverseas.com/wp-content/uploads/2024/11/statue-liberty-usa.jpg', type: 'Appointment Required', duration: '10 years', fee: 15000, processing: '15-30 days', onArrival: false },
  { country: 'UK', flag: 'https://hblimg.mmtcdn.com/content/hubble/img/countryimgs/mmt/destination/m_United_Kingdom_country_images_1_l_983_1602.jpg', type: 'Online Application', duration: '6 months', fee: 12000, processing: '10-15 days', onArrival: false },
  { country: 'Singapore', flag: 'https://pohcdn.com/sites/default/files/styles/node__blog_post__bp_banner/public/live_banner/Singapore-3.jpg', type: 'E-Visa', duration: '30 days', fee: 3000, processing: '2-3 days', onArrival: false },
  { country: 'Maldives', flag: 'https://www.thetravelmagazine.net/wp-content/uploads/Bodu.jpg', type: 'Free on Arrival', duration: '30 days', fee: 0, processing: 'On Arrival', onArrival: true },
  { country: 'Japan', flag: 'https://www.pettitts.co.uk/img/containers/assets/destinations/6-north-central-asia/1-japan/main-pages/guides/a-guide-to-the-best-cities-in-japan/nara-koriyama-castle.jpg/4a9a429bd67b1379b0f7b45bb70626fd/nara-koriyama-castle.webp', type: 'Application Required', duration: '90 days', fee: 5500, processing: '5-7 days', onArrival: false },
  { country: 'Australia', flag: 'https://res.cloudinary.com/worldpackers/image/upload/c_fill,f_auto,q_auto,w_1024/v1/guides/article_cover/dupkeyphu41gaskx13ff?_a=BACAGSGT', type: 'ETA', duration: '1 year', fee: 4500, processing: '24-72 hours', onArrival: false },
  { country: 'Canada', flag: 'https://matrix.in/cdn/shop/articles/canada3_960x.jpg?v=1709210626', type: 'eTA required', duration: '5 years', fee: 7000, processing: '72 hours', onArrival: false },
  { country: 'Indonesia', flag: 'https://internationalliving.com/_next/image/?url=https%3A%2F%2Fimages.ctfassets.net%2Fwv75stsetqy3%2F5aVcaSmaRFpuCQwtBZ4gDj%2Fbfd16f55bc32a377bbfdf73c1e0af2e1%2FIndonesia.jpg%3Fq%3D60%26fit%3Dfill%26fm%3Dwebp&w=3840&q=60', type: 'Visa on Arrival', duration: '30 days', fee: 2500, processing: 'On Arrival', onArrival: true }
];

const calcDaysLeft = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const LONG_WEEKENDS_2026 = [
  { holiday: 'Maharashtra Day', date: 'May 1', extendedTo: 'Apr 30-May 3 (4 days)', daysLeft: calcDaysLeft('2026-05-01'), popular: ['Goa', 'Konkan', 'Maldives'], discount: 'Up to 25% off', deals: ['Goa', 'Konkan', 'Maldives'] },
  { holiday: 'Buddha Purnima', date: 'May 12', extendedTo: 'May 10-13 (4 days)', daysLeft: calcDaysLeft('2026-05-12'), popular: ['Bodh Gaya', 'Darjeeling', 'Sikkim'], discount: 'Up to 30% off hotels', deals: ['Bodh Gaya', 'Darjeeling', 'Sikkim', 'Bhutan'] },
  { holiday: 'Eid ul-Adha', date: 'Jun 6', extendedTo: 'Jun 5-8 (4 days)', daysLeft: calcDaysLeft('2026-06-06'), popular: ['Dubai', 'Turkey', 'Bali'], discount: 'Flat ₹2000 off', deals: ['Dubai', 'Turkey', 'Bali'] },
  { holiday: 'Independence Day', date: 'Aug 15', extendedTo: 'Aug 14-17 (4 days)', daysLeft: calcDaysLeft('2026-08-15'), popular: ['Manali', 'Leh', 'Kashmir'], discount: 'Flat ₹1500 off flights', deals: ['Manali', 'Leh-Ladakh', 'Spiti', 'Kashmir'] },
  { holiday: 'Ganesh Chaturthi', date: 'Aug 27', extendedTo: 'Aug 26-31 (6 days)', daysLeft: calcDaysLeft('2026-08-27'), popular: ['Goa', 'Konkan', 'Alibag'], discount: '40% off on Pune packages', deals: ['Goa', 'Konkan', 'Alibag', 'Tarkarli'] },
  { holiday: 'Dussehra', date: 'Oct 2', extendedTo: 'Oct 1-5 (5 days)', daysLeft: calcDaysLeft('2026-10-02'), popular: ['Bali', 'Thailand', 'Dubai'], discount: 'Up to 25% on international', deals: ['Bali', 'Thailand', 'Dubai', 'Singapore'] },
  { holiday: 'Diwali', date: 'Oct 20', extendedTo: 'Oct 18-24 (7 days)', daysLeft: calcDaysLeft('2026-10-20'), popular: ['Jaipur', 'Udaipur', 'Varanasi'], discount: 'Up to 50% — Diwali Mega Sale', deals: ['Jaipur', 'Udaipur', 'Varanasi', 'Ayodhya'] },
];

export const WEEKEND_GETAWAYS_PUNE = [
  { name: 'Mahabaleshwar', duration: '3 hrs', price: '₹4,500', img: 'https://hikerwolf.com/wp-content/uploads/2020/09/lodwick_point1.jpg' },
  { name: 'Lonavala', duration: '1.5 hrs', price: '₹2,800', img: 'https://gos3.ibcdn.com/ed6a8e8a08c411e8bc5d0a9df65c8753.jpg' },
  { name: 'Alibaug', duration: '3 hrs', price: '₹3,200', img: 'https://ocean6holidays.com/wp-content/uploads/2025/02/alibaug-tour-3.jpg' },
  { name: 'Nashik', duration: '2.5 hrs', price: '₹3,800', img: 'https://s7ap1.scene7.com/is/image/incredibleindia/1-trimbakeshwar-nashik--maharashtra_-city-hero?qlt=82&ts=1726675387974' },
  { name: 'Shirdi', duration: '4 hrs', price: '₹2,500', img: 'https://www.templewalks.com/wp-content/uploads/2025/06/Shirdi-temple-1024x576.png' },
  { name: 'Lavasa', duration: '1 hr', price: '₹2,200', img: 'https://www.tourmyindia.com/weekend-tours/images/pune-lavasa-tour2.webp' }
];

export const HIDDEN_GEMS_MAPPING: Record<string, string> = {
  'Goa': 'Gokarna',
  'Manali': 'Jibhi',
  'Paris': 'Lyon',
  'Bali': 'Lombok',
  'Shimla': 'Mashobra',
  'London': 'Bristol',
  'New York': 'Philadelphia',
  'Tokyo': 'Osaka',
  'Srinagar': 'Doodhpathri',
  'Leh': 'Nubra Valley'
};

export const LOCATIONS: Location[] = [
  { id: 'PNQ', name: 'Pune', code: 'PNQ', country: 'India', type: 'airport', crowdScore: 60, region: 'domestic' },
  { id: 'DEL', name: 'New Delhi', code: 'DEL', country: 'India', type: 'airport', crowdScore: 85, region: 'domestic' },
  { id: 'BOM', name: 'Mumbai', code: 'BOM', country: 'India', type: 'airport', crowdScore: 90, region: 'domestic' },
  { id: 'BLR', name: 'Bangalore', code: 'BLR', country: 'India', type: 'airport', crowdScore: 75, region: 'domestic' },
  { id: 'HYD', name: 'Hyderabad', code: 'HYD', country: 'India', type: 'airport', crowdScore: 65, region: 'domestic' },
  { id: 'MAA', name: 'Chennai', code: 'MAA', country: 'India', type: 'airport', crowdScore: 70, region: 'domestic' },
  { id: 'CCU', name: 'Kolkata', code: 'CCU', country: 'India', type: 'airport', crowdScore: 80, region: 'domestic' },
  { id: 'GOA', name: 'Goa', code: 'GOX', country: 'India', type: 'airport', crowdScore: 95, region: 'domestic' },
  { id: 'LHR', name: 'London', code: 'LHR', country: 'UK', type: 'airport', crowdScore: 90, region: 'international' },
  { id: 'DXB', name: 'Dubai', code: 'DXB', country: 'UAE', type: 'airport', crowdScore: 80, region: 'international' },
  { id: 'SIN', name: 'Singapore', code: 'SIN', country: 'Singapore', type: 'airport', crowdScore: 75, region: 'international' },
  { id: 'BKK', name: 'Bangkok', code: 'BKK', country: 'Thailand', type: 'airport', crowdScore: 85, region: 'international' }
];

export const CATEGORIZED_DESTINATIONS = {
  trending: [
    { 
      name: 'Kyoto', 
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200', 
      tag: 'Cultural Heritage', 
      price: '₹85,000' 
    },
    { 
      name: 'Santorini', 
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200', 
      tag: 'Romantic Getaway', 
      price: '₹1,45,000' 
    },
    { 
      name: 'Reykjavik', 
      image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=1200', 
      tag: 'Arctic Adventure', 
      price: '₹1,15,000' 
    }
  ]
};

export const AIRLINES = [
  { name: 'IndiGo', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/IndiGo_Airlines_logo.svg/300px-IndiGo_Airlines_logo.svg.png', rating: 4.8, avgCo2: 120 },
  { name: 'Air India', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Air_India_logo.svg/300px-Air_India_logo.svg.png', rating: 4.2, avgCo2: 150 },
  { name: 'Vistara', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Vistara_logo.svg/300px-Vistara_logo.svg.png', rating: 4.9, avgCo2: 130 },
  { name: 'SpiceJet', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/SpiceJet_logo.svg/300px-SpiceJet_logo.svg.png', rating: 4.0, avgCo2: 140 }
];

export const FLIGHTS = [
  { id: 'f-1', airline: 'IndiGo', from: 'Pune', to: 'Mumbai', departure: '06:10 AM', arrival: '07:05 AM', duration: '0h 55m', price: 2450, rating: 4.8 },
  { id: 'f-2', airline: 'Air India', from: 'Pune', to: 'Delhi', departure: '08:45 AM', arrival: '11:00 AM', duration: '2h 15m', price: 5800, rating: 4.2 },
  { id: 'f-3', airline: 'Vistara', from: 'Delhi', to: 'Mumbai', departure: '11:30 AM', arrival: '13:45 PM', duration: '2h 15m', price: 6200, rating: 4.9 },
  { id: 'f-4', airline: 'IndiGo', from: 'Mumbai', to: 'Goa', departure: '14:15 PM', arrival: '15:20 PM', duration: '1h 05m', price: 3200, rating: 4.7 },
  { id: 'f-5', airline: 'SpiceJet', from: 'Pune', to: 'Bangalore', departure: '17:00 PM', arrival: '18:30 PM', duration: '1h 30m', price: 4100, rating: 4.0 },
  { id: 'f-6', airline: 'Vistara', from: 'Bangalore', to: 'Delhi', departure: '19:45 PM', arrival: '22:30 PM', duration: '2h 45m', price: 7500, rating: 4.9 }
];

export const HOLIDAYS = [
  { 
    id: 'hp-1', title: 'Eco-Luxury Maldives', destination: 'Male', duration: '5D/4N', price: 85000, rating: 4.9, 
    highlights: ['Solar Powered Villa', 'Coral Restoration', 'Organic Food'], image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200',
    mood: ['relax', 'romantic']
  },
  { 
    id: 'hp-goa', title: 'Goa Coastal Retreat', destination: 'Goa', duration: '4D/3N', price: 25000, rating: 4.7, 
    highlights: ['Private Beach Access', 'Heritage Walk', 'Casino Voucher'], image: 'https://images.unsplash.com/photo-1512100356956-c1227c3317bb?q=80&w=1200',
    mood: ['relax', 'party']
  },
  { 
    id: 'hp-del', title: 'Historic Delhi Royal Tour', destination: 'New Delhi', duration: '3D/2N', price: 18000, rating: 4.5, 
    highlights: ['Luxury Lutyens Stay', 'Old Delhi Food Walk', 'VIP Red Fort Visit'], image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200',
    mood: ['culture']
  },
  { 
    id: 'hp-bom', title: 'Mumbai Skyline Luxury', destination: 'Mumbai', duration: '3D/2N', price: 22000, rating: 4.6, 
    highlights: ['Taj Palace Stay', 'Marine Drive Sunset Tour', 'Bolly-Insights'], image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1200',
    mood: ['urban', 'luxury']
  },
  { 
    id: 'hp-lon', title: 'London Royal Experience', destination: 'London', duration: '6D/5N', price: 125000, rating: 4.8, 
    highlights: ['Afternoon Tea at Ritz', 'Private Eye Tour', 'Buckingham VIP'], image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200',
    mood: ['culture', 'luxury']
  },
  { 
    id: 'hp-par', title: 'Parisian Romance Extravaganza', destination: 'Paris', duration: '5D/4N', price: 135000, rating: 4.9, 
    highlights: ['Seine River Dinner', 'Eiffel VIP Access', 'Louvre Night Tour'], image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200',
    mood: ['romantic', 'luxury']
  },
  { 
    id: 'hp-sin', title: 'Singapore City Heights', destination: 'Singapore', duration: '4D/3N', price: 65000, rating: 4.8, 
    highlights: ['Marina Bay Sands Access', 'Gardens by the Bay', 'Sentosa Fun Pass'], image: 'https://images.unsplash.com/photo-1525625239514-46446f1f4405?q=80&w=1200',
    mood: ['urban', 'luxury']
  }
];

export const BUS_OPERATORS = [
  { 
    name: 'Zingbus', 
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=200',
    rating: 4.6, 
    type: 'Electric AC Sleeper' 
  },
  { 
    name: 'RedBus Premium', 
    logo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=200',
    rating: 4.4, 
    type: 'Volvo Multi-Axle' 
  },
  { 
    name: 'IntrCity SmartBus', 
    logo: 'https://images.unsplash.com/photo-1464208398033-ab3f496df0e7?q=80&w=200',
    rating: 4.5, 
    type: 'AC Semi-Sleeper' 
  },
  { 
    name: 'MSRTC Shivneri', 
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=200',
    rating: 4.3, 
    type: 'AC Luxury' 
  },
  { 
    name: 'Orange Travels', 
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=200',
    rating: 4.2, 
    type: 'AC Sleeper' 
  },
  { 
    name: 'SRS Travels', 
    logo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=200',
    rating: 4.1, 
    type: 'Non-AC Sleeper' 
  }
];

export const TRAINS = [
  { 
    name: 'Vande Bharat Exp', 
    number: '22436', 
    logo: 'https://images.unsplash.com/photo-1474487543412-1a05136b073a?q=80&w=200',
    rating: 4.9, 
    classes: ['EC', 'CC'] 
  },
  { 
    name: 'Rajdhani Express', 
    number: '12423', 
    logo: 'https://images.unsplash.com/photo-1532105956691-9a3a0e109d80?q=80&w=200',
    rating: 4.7, 
    classes: ['1A', '2A', '3A'] 
  },
  { 
    name: 'Shatabdi Express', 
    number: '12007', 
    logo: 'https://images.unsplash.com/photo-1515162816999-a0c47dcaf76d?q=80&w=200',
    rating: 4.6, 
    classes: ['CC', 'EC'] 
  },
  { 
    name: 'Deccan Queen', 
    number: '12123', 
    logo: 'https://images.unsplash.com/photo-1474487543412-1a05136b073a?q=80&w=200',
    rating: 4.5, 
    classes: ['CC', 'FC', '2S'] 
  },
  { 
    name: 'Duronto Express', 
    number: '12267', 
    logo: 'https://images.unsplash.com/photo-1532105956691-9a3a0e109d80?q=80&w=200',
    rating: 4.4, 
    classes: ['1A', '2A', '3A', 'SL'] 
  },
  { 
    name: 'Garib Rath', 
    number: '12113', 
    logo: 'https://images.unsplash.com/photo-1515162816999-a0c47dcaf76d?q=80&w=200',
    rating: 4.1, 
    classes: ['3A'] 
  }
];
