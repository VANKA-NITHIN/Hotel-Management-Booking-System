import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSubmitContact } from '../hooks/useApi';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export default function ContactPage() {
  usePageTitle('Contact Us');
  const [loading, setLoading] = useState(false);
  const submitContact = useSubmitContact();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    setLoading(true);
    
    submitContact.mutate(
      {
        firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value,
        lastName: (form.elements.namedItem('lastName') as HTMLInputElement).value,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
        message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      },
      {
        onSuccess: () => {
          setLoading(false);
          toast.success('Message sent successfully! Our team will get back to you shortly.');
          form.reset();
        },
        onError: () => {
          setLoading(false);
          toast.error('Failed to send message. Please try again.');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-28 pb-20">
      <div className="container-section">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-text-base mb-6">Get in Touch</h1>
          <p className="text-lg text-text-muted font-medium">
            Whether you have a question about a booking, need assistance with your account, or want to partner with us, our team is here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-6">
            <div className="bg-primary rounded-3xl p-8 lg:p-10 text-white h-full flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-bold mb-8 text-white">Contact Information</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60 font-bold uppercase tracking-wider mb-1">Call Us (24/7)</p>
                      <a href="tel:+18001234567" className="text-lg font-medium hover:text-secondary transition-colors">+1 (800) 123-4567</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <Mail className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60 font-bold uppercase tracking-wider mb-1">Email Us</p>
                      <a href="mailto:support@luxurystay.com" className="text-lg font-medium hover:text-secondary transition-colors break-all">support@luxurystay.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60 font-bold uppercase tracking-wider mb-1">Headquarters</p>
                      <p className="text-lg font-medium leading-relaxed">123 Luxury Avenue<br />New York, NY 10001<br />United States</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                     <MessageSquare className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Live Chat Available</p>
                    <p className="text-sm text-white/70 font-medium mt-0.5">Response time: ~2 mins</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <div className="bg-bg-surface rounded-3xl border border-border-base p-8 lg:p-10 shadow-sm h-full">
              <h3 className="text-2xl font-serif font-bold text-text-base mb-8">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" id="firstName" placeholder="John" required />
                  <Input label="Last Name" id="lastName" placeholder="Doe" required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input type="email" label="Email Address" id="email" placeholder="john@example.com" required />
                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold text-text-base mb-1.5">Subject</label>
                    <div className="relative">
                       <select id="subject" className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-medium text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none" required>
                         <option value="">Select a topic...</option>
                         <option value="booking">Booking Inquiry</option>
                         <option value="support">Customer Support</option>
                         <option value="partnership">Partnership Opportunity</option>
                         <option value="other">Other</option>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">▼</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-text-base mb-1.5">Message</label>
                  <textarea id="message" rows={6} required className="w-full bg-bg-surface-hover border border-border-base hover:border-border-strong rounded-xl px-4 py-3 text-sm font-medium text-text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y min-h-[140px]" placeholder="How can we help you?"></textarea>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto px-10" icon={<Send className="w-4 h-4" />}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
