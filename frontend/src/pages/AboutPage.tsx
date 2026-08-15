import { motion, useReducedMotion } from 'framer-motion';
import { Globe, Shield, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { OptimizedImage } from '../components/ui/Image';
import { useCompanyInfo, useStatistics } from '../hooks/useApi';

const values = [
  {
    icon: Shield,
    title: 'Uncompromising Quality',
    description: 'Every property in our portfolio is rigorously vetted to ensure it meets our exacting standards of luxury and service.',
  },
  {
    icon: Heart,
    title: 'Personalized Service',
    description: 'We believe true luxury lies in the details. Our concierge team is dedicated to anticipating and fulfilling your every need.',
  },
  {
    icon: Globe,
    title: 'Global Excellence',
    description: 'From bustling metropolises to remote island escapes, we curate the finest experiences across the globe.',
  },
];

export default function AboutPage() {
  usePageTitle('About Us');
  const reduce = useReducedMotion();
  const fadeUp = reduce ? false : { opacity: 0, y: 20 };

  const { data: companyData } = useCompanyInfo();
  const { data: statsData } = useStatistics();

  const companyInfo = (companyData || { name: 'LuxuryStay', description: "Curating the world's most extraordinary stays for the discerning traveler." }) as { name: string; description: string };
  const apiStats = (statsData || {}) as Record<string, number>;

  const dynamicStats = [
    { label: 'Global Destinations', value: apiStats.globalDestinations ? `${apiStats.globalDestinations}+` : '50+' },
    { label: 'Luxury Properties', value: apiStats.luxuryProperties ? `${apiStats.luxuryProperties}+` : '500+' },
    { label: 'Happy Guests', value: apiStats.happyGuests ? `${(apiStats.happyGuests / 1000000).toFixed(1)}M+` : '2M+' },
    { label: 'Industry Awards', value: apiStats.industryAwards ? `${apiStats.industryAwards}+` : '150+' },
  ];

  return (
    <div className="min-h-screen bg-bg-surface pt-[72px]">
      {/* Hero */}
      <section className="relative h-[420px] lg:h-[520px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=800&fit=crop"
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/50" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto pb-8">
          <motion.h1
            initial={fadeUp}
            animate={{ opacity: 1, y: 0 }}
            className="pb-1 text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight"
          >
            Redefining Luxury Travel
          </motion.h1>
          <motion.p
            initial={fadeUp}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 text-lg text-white/85 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {companyInfo.description}
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-32">
        <div className="container-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={reduce ? false : { opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-text-base mb-6 tracking-tight">Our Story</h2>
              <div className="space-y-6 text-text-muted text-lg leading-relaxed font-medium">
                <p>
                  Founded in 2024, LuxuryStay began with a simple yet ambitious vision: to create a seamless bridge between discerning travelers and the world's most exceptional hospitality experiences.
                </p>
                <p>
                  We recognized that luxury is not just about opulent surroundings; it's about intuitive service, authentic experiences, and memories that last a lifetime. Our platform was built to guarantee exactly that.
                </p>
                <p>
                  Today, we partner with over 500 of the world's finest properties, from historic palazzos in Rome to ultra-modern penthouses in Tokyo, ensuring that wherever your journey takes you, excellence awaits.
                </p>
              </div>
            </motion.div>
            <motion.div initial={reduce ? false : { opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                <OptimizedImage src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=1000&fit=crop" alt="Hotel Interior" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/20 rounded-3xl"></div>
              </div>
              <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-3xl overflow-hidden border-8 border-bg-surface shadow-xl hidden md:block">
                <OptimizedImage src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop" alt="Detail" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-primary-950 py-20 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="container-section relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 md:gap-y-0 md:divide-x md:divide-white/10">
            {dynamicStats.map((stat, i) => (
              <motion.div key={stat.label} initial={fadeUp} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-start md:px-6 first:md:ps-0">
                <div className="text-4xl md:text-5xl font-serif font-bold text-secondary tracking-tight">{stat.value}</div>
                <div className="mt-3 text-xs font-semibold text-white/70 uppercase tracking-[0.18em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values - editorial divided list */}
      <section className="py-20 lg:py-32 bg-bg-surface-hover">
        <div className="container-section">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-5">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-text-base tracking-tight">Our Core Values</h2>
              <p className="mt-4 text-lg text-text-muted font-medium max-w-sm leading-relaxed">
                The principles that guide how we curate, serve, and travel.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="divide-y divide-border-base">
                {values.map((value, i) => (
                  <motion.div
                    key={value.title}
                    initial={fadeUp}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="grid sm:grid-cols-12 gap-5 sm:gap-6 py-8 lg:py-9 items-start"
                  >
                    <div className="sm:col-span-1">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                        <value.icon className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                    <div className="sm:col-span-11">
                      <h3 className="text-2xl font-serif font-bold text-text-base tracking-tight">{value.title}</h3>
                      <p className="mt-2 text-text-muted leading-relaxed font-medium max-w-xl">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-950 dark:bg-black" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        <div className="container-section relative z-10 py-20 lg:py-24">
          <motion.div initial={fadeUp} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight text-balance">
              Your next extraordinary stay is waiting.
            </h2>
            <p className="mt-5 text-white/75 text-lg max-w-xl leading-relaxed">
              Explore our handpicked collection of hotels, resorts, and private villas across the world's most sought-after destinations.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/hotels"
                className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 text-base font-semibold text-white bg-secondary-700 hover:bg-secondary-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none"
              >
                Explore the collection <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 text-base font-semibold text-white border border-white/30 hover:border-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
              >
                Talk to our concierge
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
