import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Waves, Shield, Heart, Share2, Users, Bed, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { useHotel, useRooms, useHotelReviews, useToggleWishlist, useWishlist, useCreateReview, useLikeReview } from '../hooks/useApi';
import { LocationMap } from '../components/ui/LocationMap';
import { fetchNearbyPOIs, POICategory, POI } from '../api/overpass';
import { HotelDetailSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePersistentState } from '../hooks/usePersistentState';
import type { Hotel, Room, Review } from '../types';
import { Button } from '../components/ui/Button';
import { DatePicker } from '../components/ui/DatePicker';
import { ReviewCard } from '../components/ui/ReviewCard';
import { AIReviewSummary } from '../components/ui/AIReviewSummary';
import { OptimizedImage } from '../components/ui/Image';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

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
  const { isSignedIn } = useAuth();
  const { data: wishlistData } = useWishlist(isSignedIn ?? false);
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

  const createReview = useCreateReview();
  const likeReview = useLikeReview();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<POICategory>('restaurant');
  const [pois, setPois] = useState<POI[]>([]);

  const toggleRoomSelection = (roomId: number) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please sign in to write a review');
      return;
    }
    if (reviewComment.trim().length < 10) {
      toast.error('Review comment must be at least 10 characters');
      return;
    }
    createReview.mutate(
      { hotelId, rating: reviewRating, comment: reviewComment },
      { onSuccess: () => { setShowReviewForm(false); setReviewComment(''); setReviewRating(5); } }
    );
  };

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

  const tabs = ['overview', 'rooms', 'reviews', 'policies', 'location'];

  if (hotelLoading) return <HotelDetailSkeleton />;
  if (!hotel) return (
    <div className="min-h-screen bg-bg-surface pt-20 flex items-center justify-center">
      <EmptyState title="Hotel not found" description="The hotel you're looking for doesn't exist." action={{ label: 'Browse Hotels', to: '/hotels' }} />
    </div>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : hotel.rating?.toFixed(1) || '4.5';

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-16">
      {/* Image Gallery */}
      <section className="bg-bg-surface border-b border-border-base pb-4">
        <div className="container-section pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-64 sm:h-80 md:h-[500px]">
            <button
              onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden group cursor-pointer"
            >
              <OptimizedImage src={displayImages[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" priority={true} />
            </button>
            {displayImages.slice(1, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true); }}
                className="hidden md:block relative overflow-hidden group cursor-pointer"
              >
                <OptimizedImage src={img} alt={`${hotel.name} ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                {i === 3 && (
                  <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center group-hover:bg-neutral-900/50 transition-colors">
                    <span className="text-white font-medium text-lg">+{Math.max(0, displayImages.length - 5)} more</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center" 
            onClick={() => setLightboxOpen(false)}
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + displayImages.length) % displayImages.length); }} className="absolute left-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft className="w-6 h-6" /></button>
            <motion.img 
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src={displayImages[lightboxIndex]} 
              alt="" 
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" 
              onClick={(e) => e.stopPropagation()} 
            />
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % displayImages.length); }} className="absolute right-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"><ChevronRight className="w-6 h-6" /></button>
            <div className="absolute bottom-6 text-white font-medium bg-black/50 px-4 py-1.5 rounded-full">{lightboxIndex + 1} / {displayImages.length}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container-section py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hotel Header */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {Array.from({ length: hotel.starRating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-secondary fill-secondary" />
                    ))}
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text-base mb-3 leading-tight">{hotel.name}</h1>
                  <p className="flex items-center gap-2 text-base text-text-muted">
                    <MapPin className="w-4 h-4" />
                    {hotel.address}, {hotel.city}, {hotel.country}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (!isSignedIn) {
                        toast.error('Please sign in to add to your wishlist');
                        return;
                      }
                      toggleWishlist.mutate(hotel.id);
                    }}
                    className="w-12 h-12 rounded-full bg-bg-surface border border-border-base flex items-center justify-center hover:bg-bg-surface-hover hover:border-border-strong transition-all shadow-sm"
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-text-muted'}`} />
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: hotel.name,
                          text: `Check out ${hotel.name} on LuxuryStay!`,
                          url: window.location.href,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-bg-surface border border-border-base flex items-center justify-center hover:bg-bg-surface-hover hover:border-border-strong transition-all shadow-sm"
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Rating summary */}
              <div className="flex items-center gap-4 mt-6 p-4 bg-bg-surface rounded-2xl border border-border-base shadow-sm">
                <div className="w-16 h-16 rounded-xl bg-primary text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-bold leading-none">{avgRating}</span>
                  <span className="text-[10px] font-medium opacity-70 tracking-wider mt-1">OUT OF 5</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-text-base">
                    {Number(avgRating) >= 4.5 ? 'Exceptional' : Number(avgRating) >= 4 ? 'Excellent' : Number(avgRating) >= 3.5 ? 'Very Good' : 'Good'}
                  </p>
                  <p className="text-sm text-text-muted font-medium mt-0.5">{hotel.totalReviews || reviews.length} verified reviews</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border-base sticky top-[72px] z-20 bg-bg-surface-hover pt-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-bold capitalize whitespace-nowrap transition-colors border-b-2 rounded-t-lg ${
                      activeTab === tab ? 'border-primary text-primary bg-bg-surface' : 'border-transparent text-text-muted hover:text-text-base hover:bg-bg-surface/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="bg-bg-surface rounded-2xl p-6 sm:p-8 border border-border-base shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-text-base mb-4">About this property</h3>
                  <p className="text-base text-text-muted leading-relaxed">{hotel.description || 'Experience world-class luxury and impeccable service at this stunning property. Featuring spacious rooms, exceptional dining, and state-of-the-art amenities designed for the discerning traveler.'}</p>
                </div>
                <div className="bg-bg-surface rounded-2xl p-6 sm:p-8 border border-border-base shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-text-base mb-6">Premium Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(hotel.amenities && hotel.amenities.length > 0
                      ? hotel.amenities.map(a => ({ icon: amenityIcons[a.name] || Shield, name: a.name }))
                      : defaultAmenities
                    ).map((amenity) => (
                      <div key={amenity.name} className="flex items-center gap-3 p-4 rounded-xl bg-bg-surface-hover border border-border-base/50">
                        <amenity.icon className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-text-base">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'rooms' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                {rooms.length > 0 ? rooms.map((room) => (
                  <div key={room.id} className="bg-bg-surface rounded-2xl border border-border-base p-5 flex flex-col sm:flex-row gap-6 shadow-sm hover:border-border-strong transition-colors">
                    <div className="sm:w-64 h-48 rounded-xl overflow-hidden shrink-0 bg-bg-surface-hover relative group">
                      <OptimizedImage
                        src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop'}
                        alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-text-base">{room.name}</h4>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">{room.roomType?.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-2xl font-bold text-text-base">${room.pricePerNight}</span>
                          <span className="text-xs font-medium text-text-muted block">/ night</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-text-muted mt-3">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {room.maxGuests} guests</span>
                        <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {room.bedCount} {room.bedType || 'bed'}</span>
                        <span className="flex items-center gap-1.5">{room.size}m²</span>
                      </div>
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {room.amenities.slice(0, 4).map((a) => (
                            <span key={a} className="px-2.5 py-1 rounded-md bg-bg-surface-active text-[11px] font-semibold text-text-base tracking-wide uppercase">{a}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-5">
                        <Button
                          variant={selectedRooms.includes(room.id!) ? 'primary' : 'outline'}
                          fullWidth
                          onClick={() => toggleRoomSelection(room.id!)}
                        >
                          {selectedRooms.includes(room.id!) ? 'Selected' : 'Select Room'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <EmptyState title="No rooms available" description="Try different dates or check back later." />
                )}
                
                <AnimatePresence>
                  {selectedRooms.length > 0 && (
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      className="fixed bottom-0 left-0 right-0 p-4 bg-bg-surface border-t border-border-base shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between lg:px-[15%] 2xl:px-[25%]"
                    >
                      <div>
                        <p className="text-lg font-bold text-text-base">{selectedRooms.length} Room{selectedRooms.length > 1 ? 's' : ''} Selected</p>
                      </div>
                      <Button onClick={() => navigate(`/booking?hotelId=${hotel.id}&roomId=${selectedRooms.join(',')}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}>
                        Continue to Checkout
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
                
                {/* AI Review Summary Widget */}
                <AIReviewSummary reviews={reviews} hotelName={hotel.name} />

                <div className="space-y-6 mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-text-base">All Verified Reviews</h3>
                    <Button variant="outline" onClick={() => {
                      if (!isSignedIn) {
                        toast.error('Please sign in to write a review');
                        return;
                      }
                      setShowReviewForm(!showReviewForm);
                    }}>
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.form 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={submitReview} 
                        className="bg-bg-surface-hover p-6 rounded-2xl border border-border-base shadow-sm overflow-hidden"
                      >
                        <h4 className="font-bold mb-4 text-text-base">Share your experience</h4>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-text-muted mb-2">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="focus:outline-none"
                              >
                                <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-secondary text-secondary' : 'text-border-strong'}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-text-muted mb-2">Comment</label>
                          <textarea 
                            className="w-full bg-bg-surface border border-border-base rounded-xl p-4 min-h-[120px] text-text-base focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Tell us about your stay (min 10 characters)..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            required
                            minLength={10}
                          />
                        </div>
                        <Button type="submit" disabled={createReview.isPending}>
                          {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {reviews.length > 0 ? reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      id={`review-${review.id}`}
                      author={{ name: review.guestName || 'Anonymous Guest', isVerified: true }}
                      rating={review.rating}
                      date={new Date(review.createdAt || Date.now()).toLocaleDateString()}
                      content={review.comment}
                      likes={0}
                      onLike={() => {
                        if (!isSignedIn) {
                          toast.error('Please sign in to like a review');
                          return;
                        }
                        likeReview.mutate(review.id!);
                      }}
                    />
                  )) : (
                    <EmptyState title="No reviews yet" description="Be the first to share your experience!" />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'policies' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="bg-bg-surface rounded-2xl border border-border-base p-6 sm:p-8 space-y-6 shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-text-base">Hotel Policies</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0" />
                        <div>
                          <p className="font-bold text-text-base">Check-in</p>
                          <p className="text-text-muted mt-0.5">3:00 PM - 11:00 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0" />
                        <div>
                          <p className="font-bold text-text-base">Check-out</p>
                          <p className="text-text-muted mt-0.5">Until 11:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0" />
                        <div>
                          <p className="font-bold text-text-base">Cancellation</p>
                          <p className="text-text-muted mt-0.5">Free cancellation up to 48 hours before check-in</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0" />
                        <div>
                          <p className="font-bold text-text-base">Children & Extra Beds</p>
                          <p className="text-text-muted mt-0.5">Children of all ages are welcome.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success shrink-0" />
                        <div>
                          <p className="font-bold text-text-base">Pets</p>
                          <p className="text-text-muted mt-0.5">Pets are allowed on request. Charges may apply.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {hotel.policies && (
                    <div className="mt-6 pt-6 border-t border-border-base">
                      <h4 className="font-bold text-text-base mb-2">Additional Information</h4>
                      <p className="text-sm text-text-muted leading-relaxed">{hotel.policies}</p>
                    </div>
                  )}
                </div>
              </motion.div>

          {/* Location Tab */}
          {activeTab === 'location' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(['restaurant', 'attraction', 'hospital', 'atm', 'shopping', 'park'] as POICategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1 rounded-full text-sm capitalize ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-bg-surface text-text-muted'} transition-colors`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <LocationMap hotel={hotel!} pois={pois} />
            </motion.div>
          )}
            )}
          </div>

          {/* Right Sidebar - Booking Widget */}
          <div id="booking-widget" className="lg:block lg:col-span-1">
            <div className="bg-bg-surface rounded-2xl border border-border-base p-6 lg:sticky lg:top-[100px] shadow-elevated">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-text-base">${hotel.startingPrice || 199}</span>
                <span className="text-sm font-medium text-text-muted uppercase tracking-wider">/ night</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <DatePicker 
                    label="Check-in"
                    minDate={new Date().toISOString().split('T')[0]}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div>
                  <DatePicker 
                    label="Check-out"
                    minDate={checkIn || new Date().toISOString().split('T')[0]}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-base mb-1.5">Guests</label>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(Number(e.target.value))} 
                    className="w-full bg-bg-surface border border-border-base hover:border-border-strong rounded-lg px-4 py-2.5 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-border-focus transition-colors"
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="border-t border-border-base pt-4 mb-6 space-y-3 text-sm">
                  <div className="flex justify-between text-text-base">
                    <span>${hotel.startingPrice} × {nights} nights</span>
                    <span className="font-medium">${(hotel.startingPrice || 199) * nights}</span>
                  </div>
                  <div className="flex justify-between text-text-base">
                    <span>Taxes & fees (12%)</span>
                    <span className="font-medium">${Math.round((hotel.startingPrice || 199) * nights * 0.12)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-text-base pt-3 border-t border-border-base">
                    <span>Total</span>
                    <span>${Math.round((hotel.startingPrice || 199) * nights * 1.12)}</span>
                  </div>
                </div>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={() => navigate(`/booking?hotelId=${hotel.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
                disabled={!checkIn || !checkOut}
              >
                {checkIn && checkOut ? 'Reserve Now' : 'Select Dates'}
              </Button>

              <p className="text-xs font-medium text-text-muted text-center mt-4 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-base p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-text-base">${hotel.startingPrice || 199}</span>
            <span className="text-xs font-medium text-text-muted uppercase">/ night</span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">{checkIn && checkOut ? `${nights} nights selected` : 'Select dates'}</p>
        </div>
        <Button
          size="md"
          onClick={() => {
            if (checkIn && checkOut) {
              navigate(`/booking?hotelId=${hotel.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
            } else {
              document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth' });

  // Fetch POIs when location tab is active or category changes
  useEffect(() => {
    if (activeTab === 'location' && hotel && hotel.latitude && hotel.longitude) {
      fetchNearbyPOIs(hotel.latitude, hotel.longitude, selectedCategory)
        .then(data => setPois(data))
        .catch(err => console.error('Failed to fetch POIs', err));
    }
  }, [activeTab, hotel?.id, selectedCategory]);
            }
          }}
        >
          {checkIn && checkOut ? 'Reserve' : 'Select Dates'}
        </Button>
      </div>
    </div>
  );
}
