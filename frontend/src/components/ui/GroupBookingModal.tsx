import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar, Building2, Palmtree } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './Button';
import { Input } from './Input';

interface GroupBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName?: string;
}

const EVENT_TYPES = [
  { id: 'wedding', name: 'Wedding & Celebration', icon: HeartIcon },
  { id: 'corporate', name: 'Corporate Event', icon: Building2 },
  { id: 'conference', name: 'Conference / Seminar', icon: Users },
  { id: 'tour', name: 'Tour Group', icon: Palmtree },
  { id: 'other', name: 'Other Group Stay', icon: Calendar },
];

// Helper icon since Heart isn't imported from lucide-react in this exact snippet yet
function HeartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function GroupBookingModal({ isOpen, onClose, hotelName }: GroupBookingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    eventType: '',
    roomCount: '',
    guestCount: '',
    dateRange: '',
    name: '',
    email: '',
    phone: '',
    requirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.eventType || !formData.roomCount || !formData.guestCount) {
        toast.error('Please fill in all event details');
        return;
      }
      setStep(2);
    } else {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please provide your contact details');
        return;
      }
      // Simulate API call for group booking quote
      toast.promise(
        new Promise(resolve => setTimeout(resolve, 1500)),
        {
          loading: 'Submitting your request...',
          success: 'Quote request submitted successfully! Our team will contact you within 24 hours.',
          error: 'Failed to submit request.',
        }
      ).then(() => {
        onClose();
        setTimeout(() => setStep(1), 500); // reset state after close animation
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-bg-surface rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-border-base">
              <div>
                <h2 className="text-xl font-bold text-text-base">Request Group Booking</h2>
                <p className="text-sm text-text-muted mt-1">{hotelName || 'LuxuryStay Property'}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-bg-surface-hover text-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute start-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border-base rounded-full -z-10"></div>
                <div className="absolute start-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : '100%' }}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-bg-surface text-text-muted border-2 border-border-base'}`}>1</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-bg-surface text-text-muted border-2 border-border-base'}`}>2</div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-text-base mb-3">Event Type</label>
                        <div className="grid grid-cols-2 gap-3">
                          {EVENT_TYPES.map(type => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, eventType: type.id })}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                formData.eventType === type.id
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border-base hover:border-border-strong text-text-muted hover:text-text-base'
                              }`}
                            >
                              <type.icon className="w-6 h-6" />
                              <span className="text-xs font-bold text-center">{type.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-base mb-1.5">Est. Rooms</label>
                          <Input
                            type="number"
                            placeholder="e.g. 15"
                            value={formData.roomCount}
                            onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-base mb-1.5">Est. Guests</label>
                          <Input
                            type="number"
                            placeholder="e.g. 30"
                            value={formData.guestCount}
                            onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Preferred Dates / Range</label>
                        <Input
                          placeholder="e.g. Mid-October, specific dates..."
                          value={formData.dateRange}
                          onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Full Name</label>
                        <Input
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-base mb-1.5">Email Address</label>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-base mb-1.5">Phone Number</label>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-base mb-1.5">Special Requirements</label>
                        <textarea
                          placeholder="Catering, AV equipment, specific room configurations..."
                          className="w-full bg-bg-surface border border-border-base hover:border-border-strong focus:border-border-focus rounded-lg px-4 py-3 text-sm text-text-base focus:outline-none focus:ring-2 focus:ring-border-focus/20 transition-all min-h-[100px] resize-y"
                          value={formData.requirements}
                          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="pt-6 border-t border-border-base flex gap-4">
                  {step === 2 && (
                    <Button type="button" variant="outline" fullWidth onClick={() => setStep(1)}>
                      Back
                    </Button>
                  )}
                  <Button type="submit" fullWidth>
                    {step === 1 ? 'Continue' : 'Request Quote'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
