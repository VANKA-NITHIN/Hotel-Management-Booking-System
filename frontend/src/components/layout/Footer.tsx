import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { useSubscribeNewsletter, useCompanyInfo } from '../../hooks/useApi';

const footerLinks = {
  company: [
    { label: 'About LuxuryStay', to: '/about' },
    { label: 'Careers', to: '/about' },
    { label: 'Press & Media', to: '/about' },
    { label: 'Sustainability', to: '/about' },
    { label: 'Affiliates', to: '/about' },
  ],
  support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Cancellation Policy', to: '/terms' },
    { label: 'Safety Information', to: '/help' },
    { label: 'Sitemap', to: '/hotels' },
  ],
  legal: [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Cookie Policy', to: '/privacy' },
    { label: 'Accessibility', to: '/help' },
  ],
  destinations: [
    { label: 'Hotels in New York', to: '/hotels?dest=new_york' },
    { label: 'Hotels in Paris', to: '/hotels?dest=paris' },
    { label: 'Hotels in Dubai', to: '/hotels?dest=dubai' },
    { label: 'Hotels in Tokyo', to: '/hotels?dest=tokyo' },
    { label: 'Hotels in London', to: '/hotels?dest=london' },
  ],
};

const SocialIcon = ({ type }: { type: 'instagram' | 'twitter' | 'linkedin' }) => {
  switch (type) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
  }
};

const socialLinks = [
  { type: 'instagram' as const, href: '#', label: 'Instagram' },
  { type: 'twitter' as const, href: '#', label: 'Twitter' },
  { type: 'linkedin' as const, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companyInfoResponse } = useCompanyInfo();
  const companyInfo = companyInfoResponse;
  const subscribeNewsletter = useSubscribeNewsletter();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    subscribeNewsletter.mutate(email, {
      onSuccess: () => {
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
        setIsSubmitting(false);
      },
      onError: () => {
        toast.error('Failed to subscribe. Please try again.');
        setIsSubmitting(false);
      }
    });
  };

  return (
    <footer className="bg-primary text-neutral-400 mt-auto overflow-hidden">
      {/* Top Banner */}
      <div className="border-b border-white/5 bg-white/5">
        <div className="container-section py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Unlock Secret Deals</h3>
              <p className="text-sm text-neutral-400 mt-1">Sign up for our newsletter and save up to 20% on your first booking.</p>
            </div>
          </div>
          
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex gap-2 max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-secondary transition-colors"
              required
            />
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="shrink-0"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-section py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 lg:pe-8">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <img src="/favicon.svg" alt="LuxuryStay Logo" className="w-10 h-10 rounded-xl" />
                <span className="text-white font-serif font-bold text-2xl tracking-tight">LuxuryStay</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 mb-8">
              Experience the world's most extraordinary hotels, resorts, and private villas. Curated for the modern traveler seeking unparalleled luxury and uncompromising service.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 text-sm mb-8">
              {companyInfo?.contacts?.map(contact => (
                <div key={contact.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    {contact.type.toLowerCase().includes('email') ? <Mail className="w-4 h-4 text-neutral-300" /> :
                     contact.type.toLowerCase().includes('phone') ? <Phone className="w-4 h-4 text-neutral-300" /> :
                     <MapPin className="w-4 h-4 text-neutral-300" />}
                  </div>
                  <span>{contact.value}</span>
                </div>
              )) || (
                <>
                  <a href="mailto:concierge@luxurystay.com" className="flex items-center gap-3 hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Mail className="w-4 h-4 text-neutral-300" />
                    </div>
                    concierge@luxurystay.com
                  </a>
                  <a href="tel:+18005550199" className="flex items-center gap-3 hover:text-white transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Phone className="w-4 h-4 text-neutral-300" />
                    </div>
                    +1 (800) 555-0199
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-neutral-300" />
                    </div>
                    <span>One World Trade Center<br/>Suite 4500, NY 10007</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {companyInfo?.socialLinks?.map((social) => (
                <a 
                  key={social.id} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all hover:-translate-y-1"
                  aria-label={social.platform}
                >
                  <SocialIcon type={(social.platform.toLowerCase() as any)} />
                </a>
              )) || socialLinks.map((social) => (
                <a 
                  key={social.label} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <SocialIcon type={social.type} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
            <ul className="space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-secondary transition-colors inline-block py-1.5">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Support</h4>
            <ul className="space-y-3.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-secondary transition-colors inline-block py-1.5">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-3.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-secondary transition-colors inline-block py-1.5">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Top Destinations</h4>
            <ul className="space-y-3.5">
              {footerLinks.destinations.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-secondary transition-colors inline-block py-1.5">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="container-section py-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium">
            <span>{companyInfo?.copyrightText || `© ${new Date().getFullYear()} LuxuryStay Inc. All rights reserved.`}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Secure Checkout</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dummy payment icons for visual premium feel */}
              <div className="w-10 h-6 bg-white rounded border border-neutral-200 flex items-center justify-center overflow-hidden">
                <span className="text-[10px] font-bold text-blue-800 italic">VISA</span>
              </div>
              <div className="w-10 h-6 bg-white rounded border border-neutral-200 flex items-center justify-center overflow-hidden">
                <div className="flex -space-x-2">
                  <div className="w-4 h-4 rounded-full bg-red-500/80 mix-blend-multiply"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-500/80 mix-blend-multiply"></div>
                </div>
              </div>
              <div className="w-10 h-6 bg-white rounded border border-neutral-200 flex items-center justify-center overflow-hidden">
                <span className="text-[10px] font-bold text-blue-500">AMEX</span>
              </div>
              <div className="h-6 px-2 bg-[#02042b] rounded border border-neutral-800 flex items-center justify-center overflow-hidden">
                <span className="text-[10px] font-bold text-white tracking-widest">RAZORPAY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
