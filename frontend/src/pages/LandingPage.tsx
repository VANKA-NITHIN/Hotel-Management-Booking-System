import { useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent } from 'framer-motion';
import { ArrowRight, ArrowUp, MapPin, Mic, Quote, Star, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HotelCard from '../components/ui/HotelCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useFeaturedHotels, useBanners, usePublicStats, useFeaturedDestinations, useFaqs, useTestimonials } from '../hooks/useApi';
import type { Hotel, Banner, Review, Faq, Destination } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Accordion } from '../components/ui/Accordion';
import { ReviewCard } from '../components/ui/ReviewCard';
import { OptimizedImage } from '../components/ui/Image';
import { useTranslation } from 'react-i18next';
import { VoiceSearchModal } from '../components/voice/VoiceSearchModal';

// Hero background used when the banner API is unavailable (keeps the first
// paint visual and gives mobile LCP a sized, optimized image).
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop';

const DEFAULT_STATS: Record<string, number> = {
  luxuryHotels: 140,
  happyGuests: 48000,
  awardsWon: 42,
  premiumRooms: 3600,
};

const DEFAULT_DESTINATIONS: Destination[] = [
  { id: 1, name: 'Paris', country: 'France', hotelCount: 24, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80', featured: true, averagePrice: 420, rating: 4.8 },
  { id: 2, name: 'Tokyo', country: 'Japan', hotelCount: 18, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80', featured: true, averagePrice: 480, rating: 4.7 },
  { id: 3, name: 'Maldives', country: 'Maldives', hotelCount: 12, imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80', featured: true, averagePrice: 680, rating: 4.9 },
  { id: 4, name: 'New York', country: 'USA', hotelCount: 32, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80', featured: true, averagePrice: 450, rating: 4.6 },
  { id: 5, name: 'Swiss Alps', country: 'Switzerland', hotelCount: 15, imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80', featured: true, averagePrice: 520, rating: 4.9 },
  { id: 6, name: 'Dubai', country: 'UAE', hotelCount: 29, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80', featured: true, averagePrice: 380, rating: 4.7 },
];

const DEFAULT_TESTIMONIALS: Review[] = [
  {
    id: 1,
    hotelId: 1,
    userName: 'Elena Rostova',
    rating: 5,
    comment: 'The level of personalized attention and discretion was beyond exquisite. Our stay at the Grand Chateau was pure perfection.',
    createdAt: '2026-07-15T00:00:00Z',
    roomName: 'Presidential Suite',
    verified: true,
  },
  {
    id: 2,
    hotelId: 1,
    userName: 'Marcus Vance',
    rating: 5,
    comment: 'LuxuryStay made booking our anniversary retreat seamless. The private butler service was an unforgettable touch.',
    createdAt: '2026-07-20T00:00:00Z',
    roomName: 'Overwater Villa',
    verified: true,
  },
  {
    id: 3,
    hotelId: 1,
    userName: 'Sophia Chen',
    rating: 5,
    comment: 'Impeccable curation. Every hotel in their portfolio represents the pinnacle of hospitality and architectural elegance.',
    createdAt: '2026-08-01T00:00:00Z',
    roomName: 'Penthouse Loft',
    verified: true,
  },
  {
    id: 4,
    hotelId: 1,
    userName: 'David Miller',
    rating: 5,
    comment: 'From digital check-in to bespoke concierge arrangements, LuxuryStay defines modern luxury travel.',
    createdAt: '2026-08-05T00:00:00Z',
    roomName: 'Alpine Chalet',
    verified: true,
  },
];

const DEFAULT_FAQS: Faq[] = [
  {
    id: 1,
    question: 'How does LuxuryStay curate its hotel collection?',
    active: true,
    displayOrder: 1,
    answer: 'Every property undergoes a rigorous 120-point inspection covering service standards, architectural design, gastronomy, and privacy protocols before joining our invitation-only portfolio.',
  },
  {
    id: 2,
    question: 'What benefits do LuxuryStay members receive?',
    active: true,
    displayOrder: 2,
    answer: 'Members enjoy complimentary room upgrades upon availability, early check-in/late check-out privileges, daily artisanal breakfast, and dedicated 24/7 AI Concierge support.',
  },
  {
    id: 3,
    question: 'What is your cancellation and flexibility policy?',
    active: true,
    displayOrder: 3,
    answer: 'Most bookings offer flexible cancellation up to 48 hours prior to arrival with 100% refund, alongside seamless date modification through your guest portal.',
  },
  {
    id: 4,
    question: 'How works the instant digital pass check-in?',
    active: true,
    displayOrder: 4,
    answer: 'Upon booking confirmation, your digital key pass generates automatically in your guest portal, allowing contactless mobile access to your suite upon arrival.',
  },
];

const DEFAULT_HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Aman Tokyo Sanctuary',
    description: 'A serene urban sanctuary soaring high above the financial district with panoramic views of Mount Fuji.',
    city: 'Tokyo',
    state: 'Tokyo',
    country: 'Japan',
    address: 'The Otemachi Tower, 1-5-6 Otemachi, Chiyoda-ku',
    phoneNumber: '+81 3 1234 5678',
    email: 'stay@amantokyo.jp',
    rating: 4.9,
    totalReviews: 328,
    startingPrice: 1250,
    starRating: 5,
    active: true,
    amenities: [{ id: 1, name: 'Spa' }, { id: 2, name: 'Pool' }, { id: 3, name: 'Fine Dining' }, { id: 4, name: 'Concierge' }],
    images: [{ id: 1, imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80', isPrimary: true, caption: 'Lobby', sortOrder: 1 }],
  },
  {
    id: 2,
    name: 'Cheval Blanc Paris',
    description: 'Overlooking the Seine, an iconic art-deco haven crafted by Peter Marino with Michelin-starred dining.',
    city: 'Paris',
    state: 'Île-de-France',
    country: 'France',
    address: '8 Quai du Louvre, 75001 Paris',
    phoneNumber: '+33 1 2345 6789',
    email: 'reservations@chevalblanc.paris',
    rating: 4.95,
    totalReviews: 412,
    startingPrice: 1680,
    starRating: 5,
    active: true,
    amenities: [{ id: 5, name: 'Dior Spa' }, { id: 6, name: 'Rooftop Terrace' }, { id: 7, name: 'Seine Views' }, { id: 8, name: 'Butler Service' }],
    images: [{ id: 2, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80', isPrimary: true, caption: 'Exterior', sortOrder: 1 }],
  },
  {
    id: 3,
    name: 'Soneva Jani Maldives',
    description: 'Overwater bungalows featuring retractable roofs for stargazing and private waterslides into crystal lagoons.',
    city: 'Maldives',
    state: 'Noonu Atoll',
    country: 'Maldives',
    address: 'Medhufaru Island, Noonu Atoll',
    phoneNumber: '+960 660 8888',
    email: 'reserve@soneva.com',
    rating: 4.98,
    totalReviews: 520,
    startingPrice: 2400,
    starRating: 5,
    active: true,
    amenities: [{ id: 9, name: 'Private Pool' }, { id: 10, name: 'Overwater Cinema' }, { id: 11, name: 'Observatory' }, { id: 12, name: 'Personal Chef' }],
    images: [{ id: 3, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80', isPrimary: true, caption: 'Villa', sortOrder: 1 }],
  },
  {
    id: 4,
    name: 'Burj Al Arab Jumeirah',
    description: 'The world\'s most opulent sail-shaped hotel with private helipad, gold-leaf interiors, and duplex suites.',
    city: 'Dubai',
    state: 'Dubai',
    country: 'UAE',
    address: 'Jumeirah Beach Road, Dubai',
    phoneNumber: '+971 4 301 7777',
    email: 'stay@burjalarab.com',
    rating: 4.92,
    totalReviews: 890,
    startingPrice: 1950,
    starRating: 5,
    active: true,
    amenities: [{ id: 13, name: 'Helipad' }, { id: 14, name: 'Private Beach' }, { id: 15, name: 'Underwater Dining' }, { id: 16, name: 'Rolls-Royce Chauffeur' }],
    images: [{ id: 4, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80', isPrimary: true, caption: 'Atrium', sortOrder: 1 }],
  },
];

export default function LandingPage() {
  const { t } = useTranslation(['landing', 'common']);
  usePageTitle(t('common:home'));
  const navigate = useNavigate();

  const { data: featuredHotels, isLoading: hotelsLoading } = useFeaturedHotels();
  const hotels = (featuredHotels?.data && (featuredHotels.data as Hotel[]).length > 0 ? featuredHotels.data : DEFAULT_HOTELS) as Hotel[];

  const { data: bannersResponse, isLoading: bannersLoading } = useBanners();
  const banners = (bannersResponse || []) as Banner[];
  const primaryBanner = banners.length > 0 ? banners[0] : null;

  const { data: statsResponse, isLoading: statsLoading } = usePublicStats();
  const liveStats = (statsResponse && Object.keys(statsResponse).length > 0 ? statsResponse : DEFAULT_STATS) as Record<string, number>;

  const { data: destinationsResponse, isLoading: destinationsLoading } = useFeaturedDestinations();
  const liveDestinations = ((destinationsResponse as Destination[])?.length ? destinationsResponse as Destination[] : DEFAULT_DESTINATIONS);

  const { data: faqsResponse, isLoading: faqsLoading } = useFaqs();
  const liveFaqs = ((faqsResponse as Faq[])?.length ? faqsResponse as Faq[] : DEFAULT_FAQS);

  const { data: testimonialsResponse, isLoading: testimonialsLoading } = useTestimonials();
  const liveTestimonials = ((testimonialsResponse as Review[])?.length ? testimonialsResponse as Review[] : DEFAULT_TESTIMONIALS);

  const featuredReview = liveTestimonials[0];
  const reviewCards = liveTestimonials.slice(1, 4);

  // Motion
  const reduce = useReducedMotion();
  const revealInitial = reduce ? false : { opacity: 0, y: 24 };
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const [showScrollTop, setShowScrollTop] = useState(false);
  useMotionValueEvent(scrollY, 'change', (latest) => setShowScrollTop(latest > 600));

  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(t('landing:voiceSearchNotSupported'));
      return;
    }
    setIsVoiceModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/hotels?city=${encodeURIComponent(searchCity.trim())}`);
    } else {
      navigate('/hotels');
    }
  };

  return (
    <div className="min-h-screen">
      {/* ═══════ HERO (taste-skill: max 4 text elements, CTA above fold) ═══════ */}
      <section className="relative min-h-[max(100dvh,650px)] overflow-hidden flex flex-col justify-end pb-20 sm:pb-28">
        <motion.div style={{ y: reduce ? 0 : heroY }} className="absolute inset-0">
          {bannersLoading ? (
            <div className="w-full h-full bg-neutral-800 animate-pulse" />
          ) : primaryBanner ? (
            <OptimizedImage
              src={primaryBanner.imageUrl}
              alt={primaryBanner.title || 'Luxury hotel'}
              className="w-full h-[120%] object-cover"
              priority={true}
            />
          ) : (
            <OptimizedImage
              src={DEFAULT_HERO_IMAGE}
              alt="Luxury hotel"
              className="w-full h-[120%] object-cover"
              priority={true}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/30" />
        </motion.div>

        <motion.div
          style={{ opacity: reduce ? 1 : heroOpacity }}
          className="relative z-10 w-full container-safe"
        >
          <div className="max-w-3xl">
            {/* 1. Eyebrow */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-secondary-300 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-5"
            >
              {primaryBanner?.subtitle || t('landing:heroSubtitle')}
            </motion.p>
            {/* 2. Headline (max 2 lines) */}
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="pb-1 text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight text-balance"
            >
              {primaryBanner ? (
                primaryBanner.title
              ) : (
                <>
                  {t('landing:heroTitle1')}{' '}
                  <span className="italic font-light text-secondary-300">{t('landing:heroTitleHighlight')}</span>{' '}
                  {t('landing:heroTitle2')}
                </>
              )}
            </motion.h1>
            {/* 3. Subtext (max 20 words) */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-white/70 text-lg max-w-xl leading-relaxed"
            >
              {t('landing:ctaSubtitle')}
            </motion.p>
            {/* 4. Primary CTA (visible without scroll) */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                to="/hotels"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 text-base font-semibold text-white bg-secondary-700 hover:bg-secondary-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none"
              >
                {t('landing:exploreCollection')} <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 text-base font-semibold text-white/90 border border-white/25 hover:border-white/60 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
              >
                {t('common:learnMore')}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════ FLOATING SEARCH (extracted from hero per taste-skill 4.7) ═══════ */}
      <section className="search-float">
        <div className="container-safe">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="search-float-inner max-w-5xl mx-auto"
          >
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2.5 sm:gap-3">
              <div className="flex-1 relative flex items-center">
                <Input
                  fullWidth
                  aria-label={t('landing:searchPlaceholder')}
                  icon={<MapPin className="w-5 h-5 text-neutral-400" />}
                  placeholder={t('landing:searchPlaceholder')}
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[52px] text-base pe-12 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className="absolute end-3 p-2 rounded-full transition-all text-neutral-400 hover:text-primary hover:bg-primary/10 active:scale-95"
                  aria-label="Voice Search"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full lg:w-auto">
                <DatePicker
                  aria-label="Check-in date"
                  minDate={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full sm:w-[150px] bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[52px] rounded-xl transition-all"
                />
                <DatePicker
                  aria-label="Check-out date"
                  minDate={checkIn || new Date().toISOString().split('T')[0]}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full sm:w-[150px] bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[52px] rounded-xl transition-all"
                />
              </div>
              <div className="w-full lg:w-[160px] relative">
                <Input
                  fullWidth
                  aria-label={t('landing:guestsPlaceholder')}
                  icon={<Users className="w-5 h-5 text-neutral-400" />}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[52px] text-base cursor-pointer rounded-xl transition-all"
                  readOnly
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 shrink-0 h-[52px] px-8 w-full sm:w-auto text-base font-semibold text-white bg-secondary-700 hover:bg-secondary-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none"
              >
                {t('landing:searchButton')}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ═══════ STATS (taste-skill: cards, no border-per-row hairlines) ═══════ */}
      {(statsLoading || Object.keys(liveStats).length > 0) && (
        <section className="section-padding-lg bg-bg-surface">
          <div className="container-safe">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`stat-skeleton-${i}`} className="stat-card">
                    <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded mb-3" />
                    <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
                  </div>
                ))
              ) : (
                Object.entries(liveStats).map(([key, value], i) => (
                  <motion.div
                    key={key}
                    initial={revealInitial}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="stat-card"
                  >
                    <div className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight text-text-base">
                      {value}
                      <span className="text-secondary">+</span>
                    </div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                      {t(`landing:${key}`)}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ FEATURED HOTELS - asymmetric card grid ═══════ */}
      <section className="section-padding-lg bg-bg-surface-sunken">
        <div className="container-safe">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div className="max-w-2xl">
              <h2 className="section-title">{t('landing:featuredCollections')}</h2>
              <p className="section-subtitle">{t('landing:featuredSubtitle')}</p>
            </div>
            <Link to="/hotels" className="hidden sm:inline-flex items-center gap-2 text-secondary font-semibold hover:text-secondary-800 dark:hover:text-secondary-300 transition-colors underline-offset-4 hover:underline">
              {t('landing:viewAllCollections')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {hotelsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : hotels && hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              {hotels.slice(0, 4).map((hotel, i) => (
                <motion.div
                  key={hotel.id}
                  initial={revealInitial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={i === 0 || i === 3 ? 'md:col-span-7' : 'md:col-span-5'}
                >
                  <HotelCard hotel={hotel} index={i} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title={t('landing:noHotelsAvailable')} description={t('landing:noHotelsDescription')} action={{ label: t('landing:browseAllHotels'), to: '/hotels' }} />
          )}

          <div className="mt-10 text-center sm:hidden">
            <Button variant="outline" className="w-full" onClick={() => navigate('/hotels')}>
              {t('landing:viewAllHotels')}
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════ DESTINATIONS - image bento ═══════ */}
      <section className="section-padding-lg bg-bg-surface">
        <div className="container-safe">
          <div className="max-w-2xl mb-14">
            <h2 className="section-title">{t('landing:iconicDestinations')}</h2>
            <p className="section-subtitle">{t('landing:destinationsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {destinationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className={`bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-2xl ${i === 0 ? 'md:row-span-2 h-72 md:h-full' : 'h-52 md:h-[260px]'}`} />
              ))
            ) : liveDestinations.length > 0 ? (
              liveDestinations.map((dest, i) => (
                <motion.div
                  key={dest.name}
                  initial={revealInitial}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`${i === 0 ? 'md:row-span-2 h-72 md:h-full' : 'h-52 md:h-[260px]'}`}
                >
                  <Link
                    to={`/hotels?city=${dest.name}`}
                    className="relative block w-full h-full overflow-hidden rounded-2xl group shadow-card hover:shadow-elevated transition-shadow"
                  >
                    <OptimizedImage
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-[0.16,1,0.3,1]"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />

                    <div className="absolute bottom-0 start-0 end-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-serif font-bold text-2xl lg:text-3xl mb-1">{dest.name}</h3>
                      <p className="text-white/90 text-sm font-medium tracking-wide">{dest.hotelCount} {t('landing:premiumProperties')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState title={t('landing:noDestinations')} description={t('landing:noDestinationsDesc')} action={{ label: t('landing:browseAllHotels'), to: '/hotels' }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS - editorial quote + card grid ═══════ */}
      <section className="section-padding-lg bg-bg-surface-sunken">
        <div className="container-safe">
          {testimonialsLoading ? (
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-5 space-y-4">
                <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
                <div className="h-5 w-80 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
                <div className="h-40 w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-2xl" />
              </div>
              <div className="lg:col-span-7 grid gap-6 md:grid-cols-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`test-skeleton-${i}`} className="h-48 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-2xl w-full" />
                ))}
              </div>
            </div>
          ) : liveTestimonials.length > 0 ? (
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              {/* Left: header + featured quote */}
              <div className={reviewCards.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'}>
                <div className="max-w-md">
                  <h2 className="section-title">{t('landing:guestExperiences')}</h2>
                  <p className="section-subtitle">{t('landing:testimonialsSubtitle')}</p>
                </div>
                {featuredReview && (
                  <figure className="mt-10 lg:mt-14 max-w-md">
                    <Quote className="w-9 h-9 text-secondary/60" strokeWidth={1.5} aria-hidden="true" />
                    <blockquote className="mt-5 font-serif text-xl lg:text-2xl leading-snug text-text-base line-clamp-3">
                      "{featuredReview.comment}"
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-primary-900 text-white flex items-center justify-center font-serif font-semibold text-lg">
                        {(featuredReview.userName || 'G').charAt(0)}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-text-base">{featuredReview.userName || 'Guest'}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-sm text-text-muted">
                          <Star className="w-3.5 h-3.5 text-secondary fill-secondary" aria-hidden="true" />
                          {featuredReview.rating}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                )}
              </div>

              {/* Right: review cards */}
              {reviewCards.length > 0 && (
                <div className="lg:col-span-7 grid gap-6 md:grid-cols-2">
                  {reviewCards.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={revealInitial}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className={reviewCards.length === 3 && i === 2 ? 'md:col-span-2' : ''}
                    >
                      <ReviewCard
                        id={`review-${review.id}`}
                        author={{ name: review.userName || 'Guest', isVerified: review.verified, avatarUrl: undefined }}
                        rating={review.rating}
                        date={new Date(review.createdAt || Date.now()).toLocaleDateString()}
                        content={review.comment}
                        roomType={review.roomName || t('landing:recentStay')}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState title={t('landing:noTestimonials')} description={t('landing:noTestimonialsDesc')} />
          )}
        </div>
      </section>

      {/* ═══════ FAQ - two-column interactive ═══════ */}
      <section className="section-padding-lg bg-bg-surface">
        <div className="container-safe">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="section-title">{t('landing:faq')}</h2>
              <p className="section-subtitle">{t('landing:faqSubtitle')}</p>
            </div>
            <div className="lg:col-span-7">
              {faqsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`faq-skeleton-${i}`} className="h-16 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg w-full" />
                  ))}
                </div>
              ) : liveFaqs.length > 0 ? (
                <Accordion items={liveFaqs.map(faq => ({ id: faq.id.toString(), title: faq.question, content: faq.answer }))} />
              ) : (
                <EmptyState title={t('landing:noFaqs')} description={t('landing:noFaqsDesc')} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA - dark full-bleed band ═══════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-950 dark:bg-neutral-950" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80')] opacity-15 bg-cover bg-center" />

        <div className="container-safe relative z-10 section-padding-lg">
          <motion.div
            initial={revealInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight text-balance">
              {t('landing:ctaTitle')}
            </h2>
            <p className="mt-5 text-white/70 text-lg max-w-xl leading-relaxed">
              {t('landing:ctaSubtitle')}
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/hotels"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 text-base font-semibold text-white bg-secondary-700 hover:bg-secondary-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none"
              >
                {t('landing:exploreCollection')} <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 text-base font-semibold text-white border border-white/25 hover:border-white/60 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
              >
                {t('landing:contactUs', { defaultValue: 'Contact Us' })}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 p-3 rounded-full bg-bg-surface/80 backdrop-blur-md border border-border-base text-text-base shadow-lg hover:shadow-xl hover:border-border-strong hover:-translate-y-1 transition-all z-40 focus:outline-none focus:ring-2 focus:ring-secondary/50 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyFilters={(voiceCity, voiceAmenities, voiceSearch) => {
          let url = '/hotels?';
          const params = new URLSearchParams();
          if (voiceCity) params.set('city', voiceCity);
          if (voiceSearch) params.set('search', voiceSearch);
          if (voiceAmenities.length > 0) params.set('amenities', voiceAmenities.join(','));
          navigate(url + params.toString());
        }}
      />
    </div>
  );
}
