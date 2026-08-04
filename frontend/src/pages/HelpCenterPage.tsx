import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, FileText, Shield, ChevronRight, ChevronDown, Calendar, CreditCard, User, HelpCircle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useFaqs } from '../hooks/useApi';

export default function HelpCenterPage() {
  usePageTitle('Help Center');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const { data: faqs = [] } = useFaqs();

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [faqs, searchQuery]);

  const dynamicCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    faqs.forEach(faq => {
      const cat = faq.category || 'General';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const iconMap: Record<string, any> = {
      'booking': Calendar,
      'payment': CreditCard,
      'account': User,
      'policies': Shield,
    };

    return Array.from(catMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase(),
      name,
      icon: iconMap[name.toLowerCase()] || HelpCircle,
      articles: count
    }));
  }, [faqs]);

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-[72px]">
      {/* Search Header */}
      <div className="bg-primary pt-20 pb-28 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 end-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-serif font-bold text-white mb-8">
            How can we help you today?
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
            <Search className="absolute start-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted" />
            <input
              type="text"
              placeholder="Search for articles, questions, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-14 pe-6 py-4 rounded-2xl bg-bg-surface border-none shadow-xl outline-none focus:ring-2 focus:ring-primary text-lg font-medium text-text-base transition-all"
            />
          </motion.div>
        </div>
      </div>

      <div className="container-section -mt-16 pb-20 relative z-20">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {dynamicCategories.map((cat, i) => (
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
          {/* FAQs List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-serif font-bold text-text-base mb-6">
              {searchQuery ? 'Search Results' : 'Popular Topics'}
            </h2>
            <div className="bg-bg-surface rounded-3xl border border-border-base overflow-hidden shadow-sm">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="group border-b border-border-base last:border-0">
                    <div 
                      className="p-5 lg:p-6 hover:bg-bg-surface-hover cursor-pointer flex items-center justify-between transition-colors"
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="w-6 h-6 text-text-muted group-hover:text-secondary transition-colors" />
                        <span className="font-bold text-text-base group-hover:text-primary transition-colors">{faq.question}</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-bg-surface-hover"
                        >
                          <div className="p-5 lg:p-6 pt-0 text-text-muted leading-relaxed border-t border-border-base/50">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-text-muted font-medium">
                  No articles found matching your search.
                </div>
              )}
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
