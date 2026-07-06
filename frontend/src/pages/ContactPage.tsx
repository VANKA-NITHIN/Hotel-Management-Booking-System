import { useState } from 'react';

import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function ContactPage() {
  usePageTitle('Contact Us');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Message sent successfully! Our team will get back to you shortly.');
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container-section">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-600">
            Whether you have a question about a booking, need assistance with your account, or want to partner with us, our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-primary rounded-2xl p-8 text-white h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium mb-1">Call Us (24/7)</p>
                      <a href="tel:+18001234567" className="text-lg hover:text-secondary transition-colors">+1 (800) 123-4567</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium mb-1">Email Us</p>
                      <a href="mailto:support@luxurystay.com" className="text-lg hover:text-secondary transition-colors break-all">support@luxurystay.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium mb-1">Headquarters</p>
                      <p className="text-lg leading-relaxed">123 Luxury Avenue<br />New York, NY 10001<br />United States</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-secondary shrink-0" />
                  <div>
                    <p className="font-medium">Live Chat Available</p>
                    <p className="text-sm text-gray-400">Response time: ~2 mins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                    <input type="text" id="firstName" required className="input-field" placeholder="John" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input type="text" id="lastName" required className="input-field" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" id="email" required className="input-field" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <select id="subject" className="input-field" required>
                      <option value="">Select a topic...</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea id="message" rows={6} required className="input-field resize-y min-h-[120px]" placeholder="How can we help you?"></textarea>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto px-8">
                    {loading ? 'Sending...' : (
                      <>Send Message <Send className="w-4 h-4 ml-2" /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
