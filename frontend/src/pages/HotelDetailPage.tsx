import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Waves, Shield, Heart, Share2, Users, Bed, ChevronLeft, ChevronRight, X, Calendar, Check } from 'lucide-react';
import { useHotel, useRooms, useHotelReviews, useToggleWishlist, useWishlist } from '../hooks/useApi';
import { HotelDetailSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePersistentState } from '../hooks/usePersistentState';
import type { Hotel, Room, Review } from '../types';

const amenityIcons: Record<string, typeof Wifi> = {
  'Free Wi-Fi': Wifi, 'Parking': Car, 'Restaurant': UtensilsCrossed,
  'Pool': Waves, '24/7 Security': Shield, 'Concierge': Star,
};

const defaultAmenities = [
  { icon: Wifi, name: 'Free Wi-Fi' }, { icon: Car, name: 'Parking' },
  { icon: UtensilsCrossed, name: 'Restaurant' }, { icon: Waves, name: 'Pool' },
  { icon: Shield, name: '24/7 Security' },
];

export default function HotelDetailPage() {
  usePageTitle('Hotel Details');
  const { id } = useParams();
  const navigate = useNavigate();
  const hotelId = Number(id) || 1;

  const { data: hotelData, isLoading: hotelLoading } = useHotel(hotelId);
  const { data: roomsData } = useRooms(hotelId);
  const { data: reviewsData } = useHotelReviews(hotelId);
  const toggleWishlist = useToggleWishlist();
  const { data: wishlistData } = useWishlist();
  const wishlistHotels = wishlistData?.data || [];

  const [activeTab, setActiveTab] = useState('overview');
  const [checkIn, setCheckIn] = usePersistentState('hotel_detail_checkIn', '');
  const [checkOut, setCheckOut] = usePersistentState('hotel_detail_checkOut', '');
  const [guests, setGuests] = usePersistentState('hotel_detail_guests', 2);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hotel = hotelData?.data as Hotel | undefined;
  const rooms = (roomsData?.data?.content || []) as Room[];
  const reviews = (reviewsData?.data || []) as Review[];
  const isWishlisted = wishlistHotels.some((h: Hotel) => h.id === hotelId);

  useEffect(() => {
    if (hotelId) {
      try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed_hotels') || '[]');
        const updated = [hotelId, ...recentlyViewed.filter((id: number) => id !== hotelId)].slice(0, 10);
        localStorage.setItem('recently_viewed_hotels', JSON.stringify(updated));
      } catch (error) {
        console.warn('Could not save recently viewed hotels', error);
      }
    }
  }, [hotelId]);

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const displayImages = [
    hotel?.logoUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop',
  ];

  const tabs = ['overview', 'rooms', 'reviews', 'policies'];

  if (hotelLoading) return <HotelDetailSkeleton />;
  if (!hotel) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <EmptyState title="Hotel not found" description="The hotel you're looking for doesn't exist." action={{ label: 'Browse Hotels', to: '/hotels' }} />
    </div>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : hotel.rating?.toFixed(1) || '4.5';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Image Gallery */}
      <section className="bg-white">
        <div className="container-section py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden h-64 sm:h-80 md:h-96">
            <button
              onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden group cursor-pointer"
            >
              <img src={displayImages[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </button>
            {displayImages.slice(1, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
                className="hidden md:block relative overflow-hidden group cursor-pointer"
              >
                <img src={img} alt={`${hotel.name} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                {i === 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">+{Math.max(0, displayImages.length - 5)} more</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + displayImages.length) % displayImages.length); }} className="absolute left-4 text-white/70 hover:text-white"><ChevronLeft className="w-8 h-8" /></button>
          <img src={displayImages[lightboxIndex]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % displayImages.length); }} className="absolute right-4 text-white/70 hover:text-white"><ChevronRight className="w-8 h-8" /></button>
          <div className="absolute bottom-4 text-white/50 text-sm">{lightboxIndex + 1} / {displayImages.length}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-section py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {Array.from({ length: hotel.starRating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-secondary fill-secondary" />
                    ))}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <p className="flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {hotel.address}, {hotel.city}, {hotel.country}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleWishlist.mutate(hotel.id)}
                    className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                  </button>
                  <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Rating summary */}
              <div className="flex items-center gap-4 mt-4 p-4 bg-white rounded-xl border border-gray-100">
                <div className="w-14 h-14 rounded-xl bg-primary text-white flex flex-col items-center justify-center">
                  <span className="text-lg font-bold leading-none">{avgRating}</span>
                  <span className="text-[9px] opacity-60">/ 5</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {Number(avgRating) >= 4.5 ? 'Exceptional' : Number(avgRating) >= 4 ? 'Excellent' : Number(avgRating) >= 3.5 ? 'Very Good' : 'Good'}
                  </p>
                  <p className="text-sm text-gray-500">{hotel.totalReviews || reviews.length} reviews</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white rounded-t-xl">
              <div className="flex gap-0 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">About this hotel</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{hotel.description || 'Experience world-class luxury and impeccable service at this stunning property. Featuring spacious rooms, exceptional dining, and state-of-the-art amenities designed for the discerning traveler.'}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(hotel.amenities && hotel.amenities.length > 0
                      ? hotel.amenities.map(a => ({ icon: amenityIcons[a.name] || Shield, name: a.name }))
                      : defaultAmenities
                    ).map((amenity) => (
                      <div key={amenity.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <amenity.icon className="w-4 h-4 text-secondary shrink-0" />
                        <span className="text-sm text-gray-700">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rooms' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {rooms.length > 0 ? rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-5">
                    <div className="sm:w-48 h-36 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <img
                        src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop'}
                        alt={room.name} className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{room.name}</h4>
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{room.roomType?.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xl font-bold text-gray-900">${room.pricePerNight}</span>
                          <span className="text-xs text-gray-400 block">/night</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room.maxGuests} guests</span>
                        <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {room.bedCount} {room.bedType || 'bed'}</span>
                        <span>{room.size}m²</span>
                        {room.view && <span>{room.view} view</span>}
                      </div>
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.amenities.slice(0, 4).map((a) => (
                            <span key={a} className="badge-neutral text-[10px]">{a}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4">
                        <button
                          onClick={() => navigate(`/booking?hotelId=${hotel.id}&roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
                          className="btn-primary btn-sm"
                        >
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <EmptyState title="No rooms available" description="Try different dates or check back later." />
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-secondary fill-secondary" />
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-gray-200" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                )) : (
                  <EmptyState title="No reviews yet" description="Be the first to share your experience!" />
                )}
              </motion.div>
            )}

            {activeTab === 'policies' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Hotel Policies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-gray-700">Check-in: 3:00 PM</span></div>
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-gray-700">Check-out: 11:00 AM</span></div>
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-gray-700">Free cancellation 48h before</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-gray-700">Children welcome</span></div>
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-gray-700">No smoking</span></div>
                      <div className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-gray-700">Pets allowed on request</span></div>
                    </div>
                  </div>
                  {hotel.policies && (
                    <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">{hotel.policies}</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Sidebar — Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-24">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-gray-900">${hotel.startingPrice || 199}</span>
                <span className="text-sm text-gray-400">/night</span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                      className="input-field pl-10 text-sm py-2.5" min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                      className="input-field pl-10 text-sm py-2.5" min={checkIn || new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Guests</label>
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input-field text-sm py-2.5">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="border-t border-gray-100 pt-3 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>${hotel.startingPrice} × {nights} nights</span>
                    <span>${(hotel.startingPrice || 199) * nights}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & fees</span>
                    <span>${Math.round((hotel.startingPrice || 199) * nights * 0.12)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>${Math.round((hotel.startingPrice || 199) * nights * 1.12)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/booking?hotelId=${hotel.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
                className="btn-primary w-full"
                disabled={!checkIn || !checkOut}
              >
                {checkIn && checkOut ? 'Reserve Now' : 'Select Dates'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
