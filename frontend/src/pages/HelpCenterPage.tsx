import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, FileText, Shield, ChevronRight, Calendar, CreditCard, User } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const categories = [
  { id: 'booking', name: 'Booking & Reservations', icon: Calendar, articles: 12 },
  { id: 'payment', name: 'Payments & Receipts', icon: CreditCard, articles: 8 },
  { id: 'account', name: 'Account Management', icon: User, articles: 15 },
  { id: 'policies', name: 'Hotel Policies', icon: Shield, articles: 6 },
];


const popularArticles = [
  "How do I cancel or modify my booking?",
  "What payment methods do you accept?",
  "How do I earn and redeem loyalty points?",
  "What is the standard check-in/check-out time?",
  "Are pets allowed in the hotels?",
];

export default function HelpCenterPage() {
  usePageTitle('Help Center');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-[72px]">
      {/* Search Header */}
      <div className="bg-primary pt-20 pb-28 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-serif font-bold text-white mb-8">
            How can we help you today?
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted" />
            <input
              type="text"
              placeholder="Search for articles, questions, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-bg-surface border-none shadow-xl outline-none focus:ring-2 focus:ring-primary text-lg font-medium text-text-base transition-all"
            />
          </motion.div>
        </div>
      </div>

      <div className="container-section -mt-16 pb-20 relative z-20">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-bg-surface rounded-3xl p-8 shadow-sm border border-border-base hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <cat.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-text-base mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{cat.articles} articles</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Popular Articles */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-serif font-bold text-text-base mb-6">Popular Topics</h2>
            <div className="bg-bg-surface rounded-3xl border border-border-base overflow-hidden shadow-sm">
              {popularArticles.map((article, i) => (
                <div key={i} className="group border-b border-border-base last:border-0 p-5 lg:p-6 hover:bg-bg-surface-hover cursor-pointer flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6 text-text-muted group-hover:text-secondary transition-colors" />
                    <span className="font-bold text-text-base group-hover:text-primary transition-colors">{article}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="lg:col-span-1">
            <div className="bg-bg-surface rounded-3xl p-8 shadow-sm border border-border-base sticky top-[100px]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-bold text-text-base mb-3">Still need help?</h3>
              <p className="text-text-muted font-medium mb-8 leading-relaxed">
                Can't find the answer you're looking for? Our customer support team is ready to assist you.
              </p>
              <div className="space-y-4">
                <Button className="w-full justify-center" size="lg" onClick={() => navigate('/contact')}>
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-center" size="lg" icon={<MessageCircle className="w-5 h-5" />}>
                  Live Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
