import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ResortActivity {
  id: string;
  title: string;
  category: 'Dining' | 'Wellness' | 'Adventure' | 'Excursion';
  price: number;
  duration: string;
  description: string;
  image: string;
}

const RESORT_ACTIVITIES: ResortActivity[] = [
  {
    id: 'beach_dinner',
    title: 'Private Candlelight Beach Dinner',
    category: 'Dining',
    price: 180,
    duration: '2.5 Hours',
    description: 'Exclusive 4-course seafood menu prepared by your private chef under the stars.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
  },
  {
    id: 'sunset_cruise',
    title: 'Catamaran Sunset Cruise & Champagne',
    category: 'Excursion',
    price: 140,
    duration: '3 Hours',
    description: 'Glide across coastal waters with free-flowing champagne and live acoustic saxophone.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop',
  },
  {
    id: 'couples_massage',
    title: 'Deep Tissue Couples Aromatherapy',
    category: 'Wellness',
    price: 220,
    duration: '90 Mins',
    description: 'Full-body relaxation massage using organic essential oils in a beachside cabana.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop',
  },
  {
    id: 'wine_tasting',
    title: 'Sommelier Wine & Cheese Masterclass',
    category: 'Dining',
    price: 95,
    duration: '2 Hours',
    description: 'Sample 6 rare vintage wines paired with artisanal international cheeses.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop',
  },
];

interface ResortActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName?: string;
}

export function ResortActivityModal({ isOpen, onClose, hotelName }: ResortActivityModalProps) {
  const { formatPrice } = useCurrency();
  const [selectedId, setSelectedId] = useState<string>('beach_dinner');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0] || '');
  const [time, setTime] = useState<string>('19:00');
  const [guests, setGuests] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedActivity = RESORT_ACTIVITIES.find(a => a.id === selectedId) || RESORT_ACTIVITIES[0]!;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Reserved ${selectedActivity.title} for ${guests} guests on ${date} at ${time}!`);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Exclusive Experiences — ${hotelName || 'LuxuryStay'}`} size="xl">
      <form onSubmit={handleBooking} className="p-4 sm:p-6 space-y-6">
        {/* Activity Selection Grid */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 block">
            Select Resort Experience
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RESORT_ACTIVITIES.map((act) => {
              const isSelected = act.id === selectedId;
              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedId(act.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex gap-3 ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-1 ring-primary/30 shadow-sm'
                      : 'bg-bg-surface border-border-base hover:border-border-strong'
                  }`}
                >
                  <img src={act.image} alt={act.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bg-surface-hover text-text-muted uppercase">
                        {act.category}
                      </span>
                      <span className="text-xs font-extrabold text-primary">{formatPrice(act.price)}</span>
                    </div>
                    <h5 className="font-bold text-xs text-text-base truncate">{act.title}</h5>
                    <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Activity Details & Time Slot selection */}
        <div className="bg-bg-surface-hover/60 p-5 rounded-2xl border border-border-base space-y-4">
          <div className="flex items-center justify-between border-b border-border-base pb-3">
            <div>
              <h4 className="font-bold text-sm text-text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {selectedActivity.title}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">Duration: {selectedActivity.duration}</p>
            </div>
            <span className="text-lg font-bold text-primary">{formatPrice(selectedActivity.price * guests)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-text-muted block mb-1">Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-surface border border-border-base rounded-xl p-2.5 text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="font-bold text-text-muted block mb-1">Preferred Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-bg-surface border border-border-base rounded-xl p-2.5 text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="10:00">10:00 AM</option>
                <option value="14:00">2:00 PM</option>
                <option value="17:00">5:00 PM (Sunset)</option>
                <option value="19:00">7:00 PM (Dinner)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-text-muted block mb-1">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-bg-surface border border-border-base rounded-xl p-2.5 text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n} Guests</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} icon={<CheckCircle2 className="w-4 h-4" />}>
            Confirm Reservation ({formatPrice(selectedActivity.price * guests)})
          </Button>
        </div>
      </form>
    </Modal>
  );
}
