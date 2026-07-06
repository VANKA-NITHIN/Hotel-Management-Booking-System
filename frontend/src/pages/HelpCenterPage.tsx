import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, FileText, Shield, ChevronRight, Calendar, CreditCard, User } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Search Header */}
      <div className="bg-primary pt-16 pb-24 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">How can we help you today?</h1>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for articles, questions, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 border-none shadow-lg outline-none focus:ring-2 focus:ring-secondary text-base"
          />
        </div>
      </div>

      <div className="container-section -mt-12 pb-16">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-secondary transition-colors cursor-pointer group"
            >
              <cat.icon className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.articles} articles</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Articles */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Topics</h2>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              {popularArticles.map((article, i) => (
                <div key={i} className="group border-b border-gray-100 last:border-0 p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-secondary" />
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">{article}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Still need help?</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Can't find the answer you're looking for? Our customer support team is ready to assist you.
              </p>
              <div className="space-y-3">
                <Link to="/contact" className="btn-primary w-full justify-center">
                  Contact Support
                </Link>
                <button className="btn-outline w-full justify-center">
                  <MessageCircle className="w-4 h-4 mr-2" /> Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
