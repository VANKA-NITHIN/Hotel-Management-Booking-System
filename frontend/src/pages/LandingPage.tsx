import { useState, useEffect, useRef } from 'react';
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
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(t('landing:voiceSearchNotSupported'));
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition', err);
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success(t('landing:listening'), { icon: '🎙️', duration: 3000 });
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearchCity(speechResult);
      toast.success(t('landing:searchingFor', { query: speechResult }), { icon: '🔍', duration: 2000 });
      setTimeout(() => {
        navigate(`/hotels?city=${encodeURIComponent(speechResult)}`);
      }, 800);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'aborted') {
        return;
      }
      if (event.error === 'no-speech') {
        toast.error(t('landing:noSpeechDetected'));
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast.error(t('landing:micAccessDenied'));
        return;
      }
      if (event.error === 'audio-capture') {
        toast.error(t('landing:noMicFound'));
        return;
      }

      toast.error(t('landing:voiceSearchError'));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
    }
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
      <section className="relative h-[85vh] min-h-[650px] max-h-[900px] overflow-hidden flex flex-col justify-end pb-12 sm:pb-20">
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
          <div className="absolute inset-0 bg-linear-to-b from-neutral-900/40 via-neutral-900/20 to-neutral-900/80" />
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
              className="text-secondary-light text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4"
            >
              {primaryBanner?.subtitle || t('landing:heroSubtitle')}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white leading-[1.1] mb-6"
            >
              {primaryBanner ? (
                primaryBanner.title
              ) : (
                <>
                  {t('landing:heroTitle1')} <br className="hidden sm:block" />
                  <span className="text-secondary-light italic">{t('landing:heroTitleHighlight')}</span> {t('landing:heroTitle2')}
                </>
              )}
            </motion.h1>
          </div>

          {/* Premium Search Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 max-w-5xl bg-white dark:bg-neutral-900 p-2 sm:p-3 rounded-2xl shadow-modal backdrop-blur-md"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative flex items-center">
                <Input
                  fullWidth
                  icon={<MapPin className="w-5 h-5 text-neutral-400" />}
                  placeholder="Where are you going?"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-800 border-transparent hover:border-border-base h-14 text-base pe-12"
                />
                <button 
                  type="button"
                  onClick={startVoiceSearch}
                  className={`absolute end-3 p-1.5 rounded-full transition-colors ${isListening ? 'bg-error/10 text-error animate-pulse' : 'text-neutral-400 hover:text-primary hover:bg-primary/10'}`}
                  aria-label="Voice Search"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <DatePicker 
                  minDate={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full sm:w-36 bg-neutral-50 dark:bg-neutral-800 border-transparent hover:border-border-base h-14"
                />
                <DatePicker 
                  minDate={checkIn || new Date().toISOString().split('T')[0]}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full sm:w-36 bg-neutral-50 dark:bg-neutral-800 border-transparent hover:border-border-base h-14"
                />
              </div>
              <div className="w-full sm:w-40 relative">
                <Input
                  fullWidth
                  icon={<Users className="w-5 h-5 text-neutral-400" />}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-800 border-transparent hover:border-border-base h-14 text-base cursor-pointer"
                  readOnly
                />
              </div>
              <Button type="submit" size="xl" className="shrink-0 h-14 px-8 w-full sm:w-auto text-base">
                {t('landing:searchButton')}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="bg-bg-surface border-b border-border-base">
        <div className="container-safe py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                {statsLoading ? (
                  <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded mx-auto mb-1" />
                ) : (
                  <div className="text-3xl font-bold text-text-base mb-1 font-serif">
                    {liveStats[stat.key] ? `${liveStats[stat.key]}+` : stat.value}
                  </div>
                )}
                <div className="text-sm font-medium text-text-muted uppercase tracking-wider">{t(`landing:${stat.key}`)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED HOTELS ═══════ */}
      <section className="section-padding bg-bg-surface-hover">
        <div className="container-safe">
          <div className="flex items-end justify-between mb-10">
            <div className="max-w-2xl">
              <h2 className="section-title">{t('landing:featuredCollections')}</h2>
              <p className="section-subtitle mt-4">{t('landing:featuredSubtitle')}</p>
            </div>
            <Link to="/hotels" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-primary-600 transition-colors">
              {t('landing:viewAllCollections')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {hotelsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : hotels && hotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotels.slice(0, 4).map((hotel, i) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState title={t('landing:noHotelsAvailable')} description={t('landing:noHotelsDescription')} action={{ label: t('landing:browseAllHotels'), to: '/hotels' }} />
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" fullWidth onClick={() => navigate('/hotels')}>
              {t('landing:viewAllHotels')}
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════ DESTINATIONS ═══════ */}
      <section className="section-padding bg-bg-surface">
        <div className="container-safe">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('landing:iconicDestinations')}</h2>
            <p className="section-subtitle mx-auto mt-4">{t('landing:destinationsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {destinationsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className={`bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-2xl ${i === 0 ? 'md:row-span-2 h-64 md:h-full' : 'h-48 md:h-[220px]'}`} />
              ))
            ) : (
              (liveDestinations.length > 0 ? liveDestinations : destinations).map((dest, i) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/hotels?city=${dest.name}`}
                    className={`relative block overflow-hidden rounded-2xl group ${i === 0 ? 'md:row-span-2 h-64 md:h-full' : 'h-48 md:h-[220px]'}`}
                  >
                    <OptimizedImage
                      src={(dest as any).imageUrl || (dest as any).image}
                      alt={dest.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-bg-surface/50 to-bg-surface z-10 pointer-events-none" />
                    <div className="absolute bottom-0 start-0 end-0 p-5 lg:p-6 z-20">
                      <h3 className="text-white font-serif font-bold text-xl lg:text-2xl">{dest.name}</h3>
                      <p className="text-white/80 text-sm mt-1">{(dest as any).hotelCount || (dest as any).hotels} {t('landing:premiumProperties')}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section-padding bg-bg-surface-hover">
        <div className="container-safe">
          <div className="text-center mb-12">
            <h2 className="section-title">{t('landing:guestExperiences')}</h2>
            <p className="section-subtitle mx-auto mt-4">{t('landing:testimonialsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonialKeys.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
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
        className={`fixed bottom-8 end-8 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-elevated flex items-center justify-center hover:-translate-y-1 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label={t('landing:scrollTop')}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
