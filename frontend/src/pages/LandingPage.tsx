import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, Users, Building2, Bed, ArrowRight, ArrowUp, MapPin, Mic } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HotelCard from '../components/ui/HotelCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useFeaturedHotels, useBanners, usePublicStats, useFeaturedDestinations, useFaqs } from '../hooks/useApi';
import type { Hotel } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Accordion } from '../components/ui/Accordion';
import { ReviewCard } from '../components/ui/ReviewCard';
import { OptimizedImage } from '../components/ui/Image';
import { useTranslation } from 'react-i18next';
import { VoiceSearchModal } from '../components/voice/VoiceSearchModal';

const statsData = [
  { value: '500+', key: 'luxuryHotels', icon: Building2 },
  { value: '2M+', key: 'happyGuests', icon: Users },
  { value: '150+', key: 'awardsWon', icon: Award },
  { value: '10K+', key: 'premiumRooms', icon: Bed },
];

const testimonialKeys = ['sarah', 'michael', 'emily', 'james'];

const destinations = [
  { name: 'Paris', country: 'France', hotels: 120, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop' },
  { name: 'Maldives', country: 'Indian Ocean', hotels: 85, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop' },
  { name: 'Tokyo', country: 'Japan', hotels: 95, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop' },
  { name: 'New York', country: 'USA', hotels: 150, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop' },
  { name: 'Dubai', country: 'UAE', hotels: 110, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop' },
  { name: 'Bali', country: 'Indonesia', hotels: 90, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop' },
];

const faqKeys = ['1', '2', '3', '4'];

export default function LandingPage() {
  const { t } = useTranslation(['landing', 'common']);
  usePageTitle(t('common:home'));
  const navigate = useNavigate();
  
  const { data: featuredHotels, isLoading: hotelsLoading } = useFeaturedHotels();
  const hotels = featuredHotels?.data as Hotel[] | undefined;

  const { data: bannersResponse, isLoading: bannersLoading } = useBanners();
  const banners = bannersResponse || [];
  const primaryBanner = banners.length > 0 ? banners[0] : null;

  const { data: statsResponse, isLoading: statsLoading } = usePublicStats();
  const liveStats = statsResponse || {};

  const { data: destinationsResponse, isLoading: destinationsLoading } = useFeaturedDestinations();
  const liveDestinations = destinationsResponse || [];

  const { data: faqsResponse, isLoading: faqsLoading } = useFaqs();
  const liveFaqs = faqsResponse || [];

  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

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

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* ═══════ HERO ═══════ */}
      <section className="relative h-[90vh] min-h-[650px] max-h-[950px] overflow-hidden flex flex-col justify-end pb-16 sm:pb-24">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {bannersLoading ? (
            <div className="w-full h-full bg-neutral-800 animate-pulse" />
          ) : (
            <OptimizedImage
              src={primaryBanner?.imageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=80"}
              alt="Luxury hotel"
              className="w-full h-[120%] object-cover"
              priority={true}
            />
          )}
          {/* Refined gradient overlay for deeper contrast and luxury feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 w-full container-safe"
        >
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-secondary-300 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-5"
            >
              {primaryBanner?.subtitle || t('landing:heroSubtitle')}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white leading-tight mb-8"
            >
              {primaryBanner ? (
                primaryBanner.title
              ) : (
                <>
                  {t('landing:heroTitle1')} <br className="hidden sm:block" />
                  <span className="text-secondary-400 italic font-light">{t('landing:heroTitleHighlight')}</span> {t('landing:heroTitle2')}
                </>
              )}
            </motion.h1>
          </div>

          {/* Premium Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-5xl bg-white/95 dark:bg-neutral-950/90 p-3 sm:p-4 rounded-2xl shadow-modal backdrop-blur-xl border border-white/20 dark:border-white/10"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative flex items-center">
                <Input
                  fullWidth
                  icon={<MapPin className="w-5 h-5 text-neutral-400" />}
                  placeholder="Where are you going?"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[56px] text-base pe-12 rounded-xl transition-all"
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
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <DatePicker 
                  minDate={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full sm:w-[150px] bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[56px] rounded-xl transition-all"
                />
                <DatePicker 
                  minDate={checkIn || new Date().toISOString().split('T')[0]}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full sm:w-[150px] bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[56px] rounded-xl transition-all"
                />
              </div>
              <div className="w-full sm:w-[160px] relative">
                <Input
                  fullWidth
                  icon={<Users className="w-5 h-5 text-neutral-400" />}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-[56px] text-base cursor-pointer rounded-xl transition-all"
                  readOnly
                />
              </div>
              <Button type="submit" className="shrink-0 h-[56px] px-8 w-full sm:w-auto text-base rounded-xl font-semibold shadow-md hover:shadow-lg">
                {t('landing:searchButton')}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="bg-bg-surface border-b border-border-base">
        <div className="container-safe py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: "easeOut", duration: 0.6 }}
                className="text-center group flex flex-col items-center"
              >
                <div className="w-14 h-14 mb-5 bg-neutral-50 dark:bg-neutral-900 border border-border-base rounded-2xl shadow-sm flex items-center justify-center group-hover:border-secondary group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                </div>
                {statsLoading ? (
                  <div className="h-10 w-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded mx-auto mb-2" />
                ) : (
                  <div className="text-4xl font-bold text-text-base mb-2 font-serif tracking-tight">
                    {liveStats[stat.key] ? `${liveStats[stat.key]}+` : stat.value}
                  </div>
                )}
                <div className="text-sm font-semibold text-text-muted uppercase tracking-[0.15em]">{t(`landing:${stat.key}`)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED HOTELS ═══════ */}
      <section className="section-padding bg-bg-surface-sunken">
        <div className="container-safe">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <h2 className="section-title">{t('landing:featuredCollections')}</h2>
              <p className="section-subtitle">{t('landing:featuredSubtitle')}</p>
            </div>
            <Link to="/hotels" className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary transition-colors underline-offset-4 hover:underline">
              {t('landing:viewAllCollections')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {hotelsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : hotels && hotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {hotels.slice(0, 4).map((hotel, i) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} />
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

      {/* ═══════ DESTINATIONS ═══════ */}
      <section className="section-padding bg-bg-surface">
        <div className="container-safe">
          <div className="text-center mb-16">
            <h2 className="section-title">{t('landing:iconicDestinations')}</h2>
            <p className="section-subtitle mx-auto">{t('landing:destinationsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {destinationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className={`bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-2xl ${i === 0 ? 'md:row-span-2 h-72 md:h-full' : 'h-52 md:h-[260px]'}`} />
              ))
            ) : (
              (liveDestinations.length > 0 ? liveDestinations : destinations).map((dest, i) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ease: "easeOut", duration: 0.6 }}
                  className={`${i === 0 ? 'md:row-span-2 h-72 md:h-full' : 'h-52 md:h-[260px]'}`}
                >
                  <Link
                    to={`/hotels?city=${dest.name}`}
                    className="relative block w-full h-full overflow-hidden rounded-2xl group shadow-card hover:shadow-elevated transition-shadow"
                  >
                    <OptimizedImage
                      src={(dest as any).imageUrl || (dest as any).image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-[0.16,1,0.3,1]"
                    />
                    {/* Multi-layered gradient for text legibility without muddying the image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    <div className="absolute bottom-0 start-0 end-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-serif font-bold text-2xl lg:text-3xl mb-1">{dest.name}</h3>
                      <p className="text-white/90 text-sm font-medium tracking-wide">{(dest as any).hotelCount || (dest as any).hotels} {t('landing:premiumProperties')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section-padding bg-bg-surface-sunken">
        <div className="container-safe">
          <div className="text-center mb-16">
            <h2 className="section-title">{t('landing:guestExperiences')}</h2>
            <p className="section-subtitle mx-auto">{t('landing:testimonialsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonialKeys.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: "easeOut" }}
              >
                <ReviewCard
                  id={`review-${i}`}
                  author={{ name: t(`landing:testimonials.${key}.name`), isVerified: true, avatarUrl: undefined }}
                  rating={5}
                  date={t('landing:recentStay')}
                  content={t(`landing:testimonials.${key}.text`)}
                  roomType={t(`landing:testimonials.${key}.role`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section-padding bg-bg-surface">
        <div className="container-safe">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title">{t('landing:faq')}</h2>
              <p className="section-subtitle mx-auto mt-4">{t('landing:faqSubtitle')}</p>
            </div>
            {faqsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`faq-skeleton-${i}`} className="h-16 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg w-full" />
                ))}
              </div>
            ) : (
              <Accordion items={liveFaqs.length > 0 
                ? liveFaqs.map(faq => ({ id: faq.id.toString(), title: faq.question, content: faq.answer }))
                : faqKeys.map(key => ({
                    id: key,
                    title: t(`landing:faq${key}Title`),
                    content: t(`landing:faq${key}Content`)
                }))
              } />
            )}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary-900 dark:bg-black" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        
        <div className="container-safe relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              {t('landing:ctaTitle')}
            </h2>
            <p className="text-white/80 text-lg mb-10">
              {t('landing:ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={() => navigate('/hotels')} className="w-full sm:w-auto">
                {t('landing:exploreCollection')}
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate('/about')} className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:border-white">
                {t('common:learnMore')}
              </Button>
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
