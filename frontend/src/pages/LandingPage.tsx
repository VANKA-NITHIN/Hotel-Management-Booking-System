import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Star, Award, Users, Building2, Bed, ArrowRight, ChevronDown, ArrowUp, Search, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HotelCard from '../components/ui/HotelCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useFeaturedHotels } from '../hooks/useApi';
import type { Hotel } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

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
  { q: 'How do I make a reservation?', a: 'Simply search for your destination, select your dates and preferred hotel, choose a room, and complete the booking. You will receive instant confirmation via email.' },
  { q: 'What is the cancellation policy?', a: 'Most properties offer free cancellation up to 48 hours before check-in. Some special rates may have different terms, which are clearly displayed during booking.' },
  { q: 'Are there loyalty rewards?', a: 'Yes! Our LuxuryStay Rewards program lets you earn points on every booking. Points can be redeemed for free nights, room upgrades, and exclusive member experiences.' },
  { q: 'How do I contact customer support?', a: 'Our concierge team is available 24/7 via phone at +1 (800) 123-4567, email at support@luxurystay.com, or through the in-app chat assistant.' },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="border-b border-gray-100 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer focus:outline-none group"
        aria-expanded={open}
      >
        <h4 className="font-medium text-gray-900 pr-4 group-hover:text-secondary transition-colors">{q}</h4>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-gray-500 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=1080&fit=crop&q=80"
            alt="Luxury hotel"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-secondary-light text-sm font-semibold tracking-widest uppercase mb-4"
          >
            Premium Hotel Booking
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white max-w-4xl leading-[1.1] mb-5"
          >
            Find your perfect
            <br />
            <span className="text-gradient">luxury stay</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/70 text-base sm:text-lg max-w-xl mb-8"
          >
            Discover extraordinary hotels worldwide. Book with confidence, travel with elegance.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleSearch}
            className="w-full max-w-2xl"
          >
            <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-xl p-1.5 shadow-modal">
              <div className="flex items-center gap-2 flex-1 px-4">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Where do you want to stay?"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-2.5 rounded-lg shrink-0">
                <Search className="w-4 h-4 mr-1.5" />
                Search
              </button>
            </div>
          </motion.form>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-6 mt-8 text-white/50 text-xs"
          >
            <span className="flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-current text-secondary" /> 4.9 rated by guests
            </span>
            <span className="hidden sm:block">·</span>
            <span className="hidden sm:block">Free cancellation</span>
            <span className="hidden sm:block">·</span>
            <span className="hidden sm:block">Best price guarantee</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-section py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED HOTELS ═══════ */}
      <section className="section-padding bg-gray-50">
        <div className="container-section">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Hotels</h2>
              <p className="section-subtitle">Handpicked stays for extraordinary experiences</p>
            </div>
            <Link to="/hotels" className="btn-link hidden sm:flex">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {hotelsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : hotels && hotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {hotels.slice(0, 8).map((hotel, i) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState title="No hotels available" description="Check back soon for new listings." action={{ label: 'Browse All Hotels', to: '/hotels' }} />
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link to="/hotels" className="btn-outline">View all hotels</Link>
          </div>
        </div>
      </section>

      {/* ═══════ DESTINATIONS ═══════ */}
      <section className="section-padding bg-white">
        <div className="container-section">
          <div className="text-center mb-10">
            <h2 className="section-title">Popular Destinations</h2>
            <p className="section-subtitle mx-auto">Explore our most sought-after locations around the world</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  className={`relative block overflow-hidden rounded-xl group ${i === 0 ? 'md:row-span-2 h-64 md:h-full' : 'h-48 md:h-52'}`}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">{dest.name}</h3>
                    <p className="text-white/70 text-sm">{dest.hotels} hotels</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section-padding bg-gray-50">
        <div className="container-section">
          <div className="text-center mb-10">
            <h2 className="section-title">What Our Guests Say</h2>
            <p className="section-subtitle mx-auto">Real experiences from real travelers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-secondary fill-secondary" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{t.text}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section-padding bg-white">
        <div className="container-section">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle mx-auto">Everything you need to know</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 px-6">
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="bg-primary">
        <div className="container-section py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
              Ready to book your next stay?
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Join millions of travelers who trust LuxuryStay for their premium hotel bookings.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/hotels" className="btn-primary btn-lg">
                Browse Hotels
              </Link>
              <Link to="/about" className="btn-outline btn-lg border-white/20 text-white hover:bg-white/10 hover:border-white/30">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        aria-label="Scroll to top"
      >
        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-elevated flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ArrowUp className="w-4 h-4 text-gray-600" />
        </div>
      </button>
    </div>
  );
}
