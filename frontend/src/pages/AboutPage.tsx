import { motion } from 'framer-motion';
import { Globe, Shield, Heart } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { OptimizedImage } from '../components/ui/Image';

const stats = [
  { label: 'Global Destinations', value: '50+' },
  { label: 'Luxury Properties', value: '500+' },
  { label: 'Happy Guests', value: '2M+' },
  { label: 'Industry Awards', value: '150+' },
];

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

  return (
    <div className="min-h-screen bg-bg-surface pt-[72px]">
      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=800&fit=crop"
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6"
          >
            Redefining Luxury Travel
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg text-white/80 font-medium max-w-2xl mx-auto"
          >
            Curating the world's most extraordinary stays for the discerning traveler.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32">
        <div className="container-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-text-base mb-6">Our Story</h2>
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
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
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

      {/* Stats Section */}
      <section className="bg-primary py-20 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="container-section relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center px-4">
                <div className="text-4xl md:text-5xl font-serif font-bold text-secondary mb-3">{stat.value}</div>
                <div className="text-sm text-white/70 uppercase tracking-widest font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-bg-surface-hover">
        <div className="container-section">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-text-base mb-4">Our Core Values</h2>
            <p className="text-lg text-text-muted font-medium">The principles that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-bg-surface p-8 lg:p-10 rounded-3xl shadow-sm border border-border-base hover:border-border-strong transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20">
                  <value.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-text-base mb-4">{value.title}</h3>
                <p className="text-text-muted leading-relaxed font-medium">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
