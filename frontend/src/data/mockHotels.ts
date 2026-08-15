import type { Hotel, Room, Review, Destination } from '../types';

export const FALLBACK_DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: 'Paris',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    description: 'The City of Light, world-class dining & timeless romantic architecture.',
    featured: true,
    hotelCount: 24,
    averagePrice: 480,
    rating: 4.9,
  },
  {
    id: 2,
    name: 'Tokyo',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    description: 'Hyper-modern elegance meets serene Japanese hospitality traditions.',
    featured: true,
    hotelCount: 18,
    averagePrice: 520,
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Maldives',
    country: 'Maldives',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
    description: 'Overwater luxury villas with pristine coral lagoons.',
    featured: true,
    hotelCount: 12,
    averagePrice: 890,
    rating: 5.0,
  },
  {
    id: 4,
    name: 'New York',
    country: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    description: 'Skyline suites overlooking Manhattan and Central Park.',
    featured: true,
    hotelCount: 32,
    averagePrice: 650,
    rating: 4.8,
  },
  {
    id: 5,
    name: 'Swiss Alps',
    country: 'Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    description: 'Alpine sanctuaries, private ski chalets and spa retreats.',
    featured: true,
    hotelCount: 15,
    averagePrice: 740,
    rating: 4.9,
  },
];

export const FALLBACK_HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'The Ritz Paris Grand',
    description: 'Situated in the heart of Paris overlooking Place Vendôme, offering legendary French hospitality, Michelin-starred gastronomy, and opulent rooms adorned with gold leaf details.',
    address: '15 Place Vendôme',
    city: 'Paris',
    state: 'Île-de-France',
    country: 'France',
    latitude: 48.8675,
    longitude: 2.3294,
    phoneNumber: '+33 1 43 16 30 30',
    email: 'concierge@ritzparis.com',
    rating: 4.9,
    totalReviews: 428,
    startingPrice: 580,
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    starRating: 5,
    policies: 'Check-in from 3:00 PM. Check-out until 12:00 PM. Pets allowed upon advance notice.',
    active: true,
    images: [
      { id: 101, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1, caption: 'Grand Facade' },
      { id: 102, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 2, caption: 'Luxury Bedroom' },
      { id: 103, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 3, caption: 'Pool & Spa' },
      { id: 104, imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 4, caption: 'Fine Dining' },
    ],
    amenities: [
      { id: 1, name: 'Free Wi-Fi' },
      { id: 2, name: 'Pool' },
      { id: 3, name: 'Restaurant' },
      { id: 4, name: 'Parking' },
      { id: 5, name: 'Spa & Wellness' },
      { id: 6, name: '24/7 Security' },
    ]
  },
  {
    id: 2,
    name: 'Aman Tokyo Sanctuary',
    description: 'Occupying the top six floors of the Otemachi Tower, blending traditional Japanese architecture with minimalist modern design and panoramic views of Mount Fuji.',
    address: '1-5-6 Otemachi, Chiyoda-ku',
    city: 'Tokyo',
    state: 'Kanto',
    country: 'Japan',
    latitude: 35.6865,
    longitude: 139.7633,
    phoneNumber: '+81 3 5224 3333',
    email: 'tokyo@aman.com',
    rating: 4.95,
    totalReviews: 312,
    startingPrice: 620,
    logoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    starRating: 5,
    policies: 'Check-in 3:00 PM, Check-out 12:00 PM. Traditional tea ceremony complimentary upon arrival.',
    active: true,
    images: [
      { id: 201, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 },
      { id: 202, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 2 },
      { id: 203, imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 3 },
    ],
    amenities: [
      { id: 1, name: 'Free Wi-Fi' },
      { id: 2, name: 'Pool' },
      { id: 3, name: 'Restaurant' },
      { id: 5, name: 'Spa & Wellness' },
      { id: 7, name: 'Onsen Bath' }
    ]
  },
  {
    id: 3,
    name: 'Soneva Jani Resort',
    description: 'Exclusive overwater resort featuring retractable roofs for stargazing, private ocean slides into turquoise lagoons, and bespoke butler service.',
    address: 'Medhufaru Island, Noonu Atoll',
    city: 'Maldives',
    state: 'Noonu Atoll',
    country: 'Maldives',
    latitude: 5.6789,
    longitude: 73.2345,
    phoneNumber: '+960 656 6666',
    email: 'reservations@soneva.com',
    rating: 5.0,
    totalReviews: 518,
    startingPrice: 890,
    logoUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
    starRating: 5,
    policies: 'Seaplane transfer arranged by resort. All-inclusive culinary experiences available.',
    active: true,
    images: [
      { id: 301, imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 },
      { id: 302, imageUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 2 },
      { id: 303, imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 3 },
    ],
    amenities: [
      { id: 1, name: 'Free Wi-Fi' },
      { id: 2, name: 'Pool' },
      { id: 3, name: 'Restaurant' },
      { id: 5, name: 'Spa & Wellness' },
      { id: 8, name: 'Private Beach' }
    ]
  },
  {
    id: 4,
    name: 'The Plaza Manhattan',
    description: 'Iconic 5-star hotel located at Fifth Avenue and Central Park South, offering classic Gilded Age elegance with modern luxury amenities.',
    address: '768 5th Ave',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    latitude: 40.7648,
    longitude: -73.9744,
    phoneNumber: '+1 212 759 3000',
    email: 'plazanyc@fairmont.com',
    rating: 4.85,
    totalReviews: 640,
    startingPrice: 650,
    logoUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    starRating: 5,
    policies: 'Check-in 4:00 PM. Check-out 11:00 AM. Valet parking available.',
    active: true,
    images: [
      { id: 401, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 },
      { id: 402, imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 2 },
    ],
    amenities: [
      { id: 1, name: 'Free Wi-Fi' },
      { id: 3, name: 'Restaurant' },
      { id: 4, name: 'Parking' },
      { id: 5, name: 'Spa & Wellness' },
      { id: 6, name: '24/7 Security' }
    ]
  },
  {
    id: 5,
    name: 'The Chedi Andermatt',
    description: 'A striking alpine resort combining traditional Swiss chalet warmth with Asian design accents, private ski butler and hydrothermal spa.',
    address: 'Gotthardstrasse 40',
    city: 'Swiss Alps',
    state: 'Uri',
    country: 'Switzerland',
    latitude: 46.6331,
    longitude: 8.5954,
    phoneNumber: '+41 41 888 7474',
    email: 'info@chediandermatt.com',
    rating: 4.9,
    totalReviews: 285,
    startingPrice: 740,
    logoUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    starRating: 5,
    policies: 'Ski storage and ski pass booking available directly at concierge desk.',
    active: true,
    images: [
      { id: 501, imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 },
      { id: 502, imageUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80', isPrimary: false, sortOrder: 2 },
    ],
    amenities: [
      { id: 1, name: 'Free Wi-Fi' },
      { id: 2, name: 'Pool' },
      { id: 3, name: 'Restaurant' },
      { id: 5, name: 'Spa & Wellness' },
      { id: 9, name: 'Ski Access' }
    ]
  },
];

export const FALLBACK_ROOMS: Record<number, Room[]> = {
  1: [
    {
      id: 101,
      hotelId: 1,
      name: 'Deluxe Vendôme Suite',
      description: 'Elegant master suite featuring high ceilings, French silk draping, marble fireplace and private terrace overlooking Place Vendôme.',
      roomType: 'SUITE',
      pricePerNight: 580,
      maxGuests: 2,
      maxChildren: 1,
      bedCount: 1,
      bedType: 'King Size',
      floor: 3,
      size: 65,
      view: 'Place Vendôme View',
      status: 'AVAILABLE',
      cleaningStatus: 'CLEAN',
      active: true,
      roomNumber: 301,
      amenities: ['Free Wi-Fi', 'Marble Bath', 'Espresso Machine', '24h Butler', 'City View'],
      images: [
        { id: 1001, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
      ]
    },
    {
      id: 102,
      hotelId: 1,
      name: 'Presidential Royal Suite',
      description: 'Palatial suite with crystal chandeliers, private dining room for 8, grand piano and 24-hour dedicated butler service.',
      roomType: 'PRESIDENTIAL',
      pricePerNight: 1250,
      maxGuests: 4,
      maxChildren: 2,
      bedCount: 2,
      bedType: 'Super King',
      floor: 4,
      size: 140,
      view: 'Garden & City View',
      status: 'AVAILABLE',
      cleaningStatus: 'CLEAN',
      active: true,
      roomNumber: 401,
      amenities: ['Free Wi-Fi', 'Jacuzzi', 'Private Dining', 'Chauffeur Service', 'Balcony'],
      images: [
        { id: 1002, imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
      ]
    }
  ],
  2: [
    {
      id: 201,
      hotelId: 2,
      name: 'Fuji Premier Suite',
      description: 'Serene suite with traditional tatami seating, floor-to-ceiling windows with direct views of Mount Fuji and private Hinoki wood soaking tub.',
      roomType: 'SUITE',
      pricePerNight: 620,
      maxGuests: 2,
      maxChildren: 1,
      bedCount: 1,
      bedType: 'King Size',
      floor: 35,
      size: 85,
      view: 'Mount Fuji View',
      status: 'AVAILABLE',
      cleaningStatus: 'CLEAN',
      active: true,
      roomNumber: 3502,
      amenities: ['Free Wi-Fi', 'Hinoki Tub', 'Bose Sound System', 'Tea Set', 'Skyline View'],
      images: [
        { id: 2001, imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
      ]
    }
  ],
  3: [
    {
      id: 301,
      hotelId: 3,
      name: 'Ocean Villa with Water Slide',
      description: 'Overwater sanctuary featuring a retractable master roof for stargazing, private infinity pool, and water slide leading straight into the ocean.',
      roomType: 'OCEAN_VIEW',
      pricePerNight: 890,
      maxGuests: 3,
      maxChildren: 2,
      bedCount: 1,
      bedType: 'King Size',
      floor: 1,
      size: 180,
      view: 'Ocean Lagoon View',
      status: 'AVAILABLE',
      cleaningStatus: 'CLEAN',
      active: true,
      roomNumber: 12,
      amenities: ['Private Pool', 'Ocean Slide', 'Star Roof', 'Barefoot Butler', 'Glass Floor'],
      images: [
        { id: 3001, imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80', isPrimary: true, sortOrder: 1 }
      ]
    }
  ]
};

export const FALLBACK_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: 1,
      hotelId: 1,
      rating: 5,
      userName: 'Sophia Montgomery',
      comment: 'An absolute masterpiece of hospitality. The attention to detail, from the rose-scented bath salts to the personal butler service, was beyond comparison.',
      createdAt: '2026-07-15T10:00:00Z',
      verified: true,
      likes: 24
    },
    {
      id: 2,
      hotelId: 1,
      rating: 5,
      userName: 'Alexander Wright',
      comment: 'The Michelin dining at Ritz Paris was unforgettable. Truly the gold standard for global luxury hotels.',
      createdAt: '2026-08-01T14:30:00Z',
      verified: true,
      likes: 18
    }
  ]
};
