import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, Users, Building2, Bed, ArrowRight, ArrowUp, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HotelCard from '../components/ui/HotelCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useFeaturedHotels } from '../hooks/useApi';
import type { Hotel } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
import { Accordion } from '../components/ui/Accordion';
import { ReviewCard } from '../components/ui/ReviewCard';
import { OptimizedImage } from '../components/ui/Image';

const stats = [
  { value: '500+', label: 'Luxury Hotels', icon: Building2 },
  { value: '2M+', label: 'Happy Guests', icon: Users },
  { value: '150+', label: 'Awards Won', icon: Award },
  { value: '10K+', label: 'Premium Rooms', icon: Bed },
];

const testimonials = [
  { name: 'Sarah Johnson', role: 'Business Traveler', rating: 5, text: 'An absolutely extraordinary experience. The attention to detail and level of service exceeded all expectations. Will definitely return.', avatar: 'SJ' },
  { name: 'Michael Chen', role: 'Vacation Guest', rating: 5, text: 'The most luxurious stay I have ever experienced. The spa treatments were world-class and the ocean views breathtaking.', avatar: 'MC' },
  { name: 'Emily Rodriguez', role: 'Family Vacation', rating: 5, text: 'Perfect for our family getaway. The kids loved the pool and activities while we enjoyed the fine dining. Highly recommended!', avatar: 'ER' },
  { name: 'James Wilson', role: 'Honeymoon', rating: 5, text: 'They made our honeymoon magical. The beachfront villa was stunning and the private dining experience unforgettable.', avatar: 'JW' },
];

const destinations = [
  { name: 'Paris', country: 'France', hotels: 120, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop' },
  { name: 'Maldives', country: 'Indian Ocean', hotels: 85, image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop' },
  { name: 'Tokyo', country: 'Japan', hotels: 95, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop' },
  { name: 'New York', country: 'USA', hotels: 150, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop' },
  { name: 'Dubai', country: 'UAE', hotels: 110, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop' },
  { name: 'Bali', country: 'Indonesia', hotels: 90, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop' },
];

const faqs = [
  { id: '1', title: 'How do I make a reservation?', content: 'Simply search for your destination, select your dates and preferred hotel, choose a room, and complete the booking. You will receive instant confirmation via email.' },
  { id: '2', title: 'What is the cancellation policy?', content: 'Most properties offer free cancellation up to 48 hours before check-in. Some special rates may have different terms, which are clearly displayed during booking.' },
  { id: '3', title: 'Are there loyalty rewards?', content: 'Yes! Our LuxuryStay Rewards program lets you earn points on every booking. Points can be redeemed for free nights, room upgrades, and exclusive member experiences.' },
  { id: '4', title: 'How do I contact customer support?', content: 'Our concierge team is available 24/7 via phone at +1 (800) 123-4567, email at support@luxurystay.com, or through the in-app chat assistant.' },
];

export default function LandingPage() {
  usePageTitle('Home');
  const navigate = useNavigate();
  const { data: featuredHotels, isLoading: hotelsLoading } = useFeaturedHotels();
  const hotels = featuredHotels?.data as Hotel[] | undefined;

  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests');

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
          <OptimizedImage
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=80"
            alt="Luxury hotel"
            className="w-full h-[120%] object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-linear-to-b from-neutral-900/40 via-neutral-900/20 to-neutral-900/80" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 w-full container-section"
        >
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-secondary-light text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4"
            >
              The New Standard of Luxury
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white leading-[1.1] mb-6"
            >
              Curated stays for the <br className="hidden sm:block" />
              <span className="text-secondary-light italic">extraordinary</span> traveler.
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
              <div className="flex-1 relative">
                <Input
                  fullWidth
                  icon={<MapPin className="w-5 h-5 text-neutral-400" />}
                  placeholder="Where are you going?"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-800 border-transparent hover:border-border-base h-14 text-base"
                />
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
                Search
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="bg-bg-surface border-b border-border-base">
        <div className="container-section py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-text-base mb-1 font-serif">{stat.value}</div>
                <div className="text-sm font-medium text-text-muted uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED HOTELS ═══════ */}
      <section className="section-padding bg-bg-surface-hover">
        <div className="container-section">
          <div className="flex items-end justify-between mb-10">
            <div className="max-w-2xl">
              <h2 className="section-title">Featured Collections</h2>
              <p className="section-subtitle mt-4">Discover our handpicked selection of extraordinary properties, designed to provide the ultimate luxury experience.</p>
            </div>
            <Link to="/hotels" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-primary-600 transition-colors">
              View all collections <ArrowRight className="w-4 h-4" />
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
            <EmptyState title="No hotels available" description="Check back soon for new listings." action={{ label: 'Browse All Hotels', to: '/hotels' }} />
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" fullWidth onClick={() => navigate('/hotels')}>
              View all hotels
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════ DESTINATIONS ═══════ */}
      <section className="section-padding bg-bg-surface">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="section-title">Iconic Destinations</h2>
            <p className="section-subtitle mx-auto mt-4">Immerse yourself in the world's most sought-after locations, curated for the discerning traveler.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {destinations.map((dest, i) => (
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
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-surface/50 to-bg-surface z-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 z-20">
                    <h3 className="text-white font-serif font-bold text-xl lg:text-2xl">{dest.name}</h3>
                    <p className="text-white/80 text-sm mt-1">{dest.hotels} Premium Properties</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section-padding bg-bg-surface-hover">
        <div className="container-section">
          <div className="text-center mb-12">
            <h2 className="section-title">Guest Experiences</h2>
            <p className="section-subtitle mx-auto mt-4">Hear what our members have to say about their unforgettable journeys.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ReviewCard
                  id={`review-${i}`}
                  author={{ name: t.name, isVerified: true, avatarUrl: undefined }}
                  rating={t.rating}
                  date="Recent Stay"
                  content={t.text}
                  roomType={t.role}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section-padding bg-bg-surface">
        <div className="container-section">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle mx-auto mt-4">Everything you need to know before you book.</p>
            </div>
            <Accordion items={faqs} />
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary-900 dark:bg-black" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        
        <div className="container-section relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Ready to elevate your travel experience?
            </h2>
            <p className="text-white/80 text-lg mb-10">
              Join our exclusive community and unlock access to the world's most extraordinary properties.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={() => navigate('/hotels')} className="w-full sm:w-auto">
                Explore Collection
              </Button>
              <Button variant="outline" size="xl" onClick={() => navigate('/about')} className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:border-white">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-elevated flex items-center justify-center hover:-translate-y-1 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
