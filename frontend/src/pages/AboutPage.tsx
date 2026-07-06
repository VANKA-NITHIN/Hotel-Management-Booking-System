import { motion } from 'framer-motion';
import { Globe, Shield, Heart } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

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
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="relative h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&h=800&fit=crop"
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4"
          >
            Redefining Luxury Travel
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg text-gray-200"
          >
            Curating the world's most extraordinary stays for the discerning traveler.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="section-title mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
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
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=1000&fit=crop" alt="Hotel Interior" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-2xl overflow-hidden border-8 border-white shadow-xl hidden md:block">
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop" alt="Detail" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16">
        <div className="container-section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center px-4">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">{stat.value}</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-section">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle mx-auto">The principles that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
