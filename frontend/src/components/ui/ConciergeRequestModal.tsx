import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Sparkles, Car, Wine, Clock, Heart, Utensils, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConciergeOption {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: typeof Car;
}

const CONCIERGE_SERVICES: ConciergeOption[] = [
  { id: 'shuttle', title: 'Airport Luxury Transfer', description: 'Chauffeur pickup in Mercedes E-Class', price: '$85', icon: Car },
  { id: 'welcome_drink', title: 'Champagne & Fruit Platter', description: 'Chilled Moët & Chandon upon arrival', price: '$120', icon: Wine },
  { id: 'late_checkout', title: 'Guaranteed Late Check-out', description: 'Extend check-out until 4:00 PM', price: '$50', icon: Clock },
  { id: 'pillow_menu', title: 'Pillow & Bedding Customization', description: 'Memory foam, feather, or hypoallergenic pillows', price: 'Free', icon: Heart },
  { id: 'dietary', title: 'Custom Chef Preparation', description: 'Personalized vegan, gluten-free, or halal meal plan', price: '$65', icon: Utensils },
];

interface ConciergeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName?: string;
  bookingId?: number;
}

export function ConciergeRequestModal({ isOpen, onClose, hotelName }: ConciergeRequestModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 && !notes.trim()) {
      toast.error('Please select at least one service or enter special instructions');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Concierge request received! The hotel team will prepare your stay.');
      setSelectedServices([]);
      setNotes('');
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Concierge Services — ${hotelName || 'LuxuryStay'}`} size="lg">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Personalized Hospitality</h4>
            <p className="text-xs text-text-muted mt-0.5">
              Customize your upcoming stay. Your requests will be sent directly to the hotel front desk team.
            </p>
          </div>
        </div>

        {/* Service Options List */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 block">
            Select Enhancement Services
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONCIERGE_SERVICES.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const IconComp = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'bg-bg-surface-hover border-border-base hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-bg-surface text-text-muted'}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-text-base">{service.title}</h5>
                      <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-primary block">{service.price}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary mt-1 inline-block" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">
            Additional Special Instructions / Flight Details
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Arriving on flight BA123 at 3:30 PM. Celebrating an anniversary."
            className="w-full bg-bg-surface-hover border border-border-base rounded-xl p-3.5 text-xs text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[90px]"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-base">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} icon={<Send className="w-4 h-4" />}>
            Send Request to Hotel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
