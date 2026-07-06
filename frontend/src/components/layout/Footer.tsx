import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const footerLinks = {
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/about' },
    { label: 'Press', to: '/about' },
    { label: 'Blog', to: '/about' },
  ],
  support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Cancellation Policy', to: '/terms' },
    { label: 'Safety Information', to: '/help' },
  ],
  legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Cookie Policy', to: '/privacy' },
    { label: 'Accessibility', to: '/help' },
  ],
  destinations: [
    { label: 'New York', to: '/hotels' },
    { label: 'Paris', to: '/hotels' },
    { label: 'Dubai', to: '/hotels' },
    { label: 'Tokyo', to: '/hotels' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-primary text-gray-400 mt-auto">
      {/* Main Footer */}
      <div className="container-section py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="LuxuryStay Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
              <span className="text-white font-serif font-bold text-lg">LuxuryStay</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-xs">
              Discover and book extraordinary hotel experiences around the world. Premium stays, unmatched service.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mb-6">
              <p className="text-white text-sm font-medium mb-2">Stay updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-secondary/50 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-dark transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-success text-xs mt-2">Thanks for subscribing!</p>
              )}
            </form>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <a href="mailto:hello@luxurystay.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" /> hello@luxurystay.com
              </a>
              <a href="tel:+18001234567" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" /> +1 (800) 123-4567
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Destinations</h4>
            <ul className="space-y-2">
              {footerLinks.destinations.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-section py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} LuxuryStay. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure payments</span>
            </div>
            <span className="text-gray-700">·</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Visa</span>
              <span>Mastercard</span>
              <span>Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
