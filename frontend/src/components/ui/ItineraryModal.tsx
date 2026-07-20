import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Compass, Sun, Moon, MapPin, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ItineraryItem {
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  category: string;
  description: string;
  location: string;
  duration: string;
}

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName?: string;
  hotelName?: string;
}

export function ItineraryModal({ isOpen, onClose, cityName = 'Maldives', hotelName }: ItineraryModalProps) {
  const [vibe, setVibe] = useState<'Relaxation' | 'Culture' | 'Adventure' | 'Gourmet'>('Relaxation');

  const itineraries: Record<string, ItineraryItem[]> = {
    Relaxation: [
      { timeSlot: 'Morning', title: 'Yoga on Private Beach', category: 'Wellness', description: 'Sunrise guided meditation and oceanfront hatha yoga.', location: 'Resort North Deck', duration: '60 min' },
      { timeSlot: 'Afternoon', title: 'Overwater Lagoon Lounge', category: 'Leisure', description: 'Snorkeling along protected coral gardens and hammock relaxation.', location: 'House Reef', duration: '2.5 hrs' },
      { timeSlot: 'Evening', title: 'Hydrotherapy & Herbal Steam', category: 'Spa', description: 'Therapeutic thermal bath and essential oil massage.', location: 'Zen Sanctuary Spa', duration: '90 min' },
    ],
    Culture: [
      { timeSlot: 'Morning', title: 'Historical Old Town Walking Tour', category: 'Heritage', description: 'Explore ancient architecture, local markets, and handicraft galleries.', location: 'Historic Quarter', duration: '2 hrs' },
      { timeSlot: 'Afternoon', title: 'Artisanal Pottery & Spice Tasting', category: 'Workshop', description: 'Hands-on pottery workshop with local craftsmen and tea pairing.', location: 'Cultural Center', duration: '90 min' },
      { timeSlot: 'Evening', title: 'Traditional Music & Performance', category: 'Arts', description: 'Open-air acoustic ensemble with native instruments and dance.', location: 'Heritage Courtyard', duration: '2 hrs' },
    ],
    Adventure: [
      { timeSlot: 'Morning', title: 'Guided Sea Kayaking & Caves', category: 'Action', description: 'Paddle through hidden sea caves and mangrove sanctuaries.', location: 'Emerald Bay', duration: '2.5 hrs' },
      { timeSlot: 'Afternoon', title: 'Scuba Diving with Sea Turtles', category: 'Excursion', description: 'PADI-guided reef dive accompanied by marine biologists.', location: 'Outer Reef Drop-off', duration: '3 hrs' },
      { timeSlot: 'Evening', title: 'Night Kayak & Bioluminescence', category: 'Experience', description: 'Paddle under starry skies to watch glowing bioluminescent plankton.', location: 'Moonlight Lagoon', duration: '90 min' },
    ],
    Gourmet: [
      { timeSlot: 'Morning', title: 'Chef-led Farmers Market Selection', category: 'Culinary', description: 'Pick fresh organic herbs and catch-of-the-day seafood with Executive Chef.', location: 'Port Market', duration: '2 hrs' },
      { timeSlot: 'Afternoon', title: 'Private Cooking Masterclass', category: 'Workshop', description: 'Prepare 3 signature regional dishes and learn secret sauce pairings.', location: 'Culinary Pavilion', duration: '2 hrs' },
      { timeSlot: 'Evening', title: '7-Course Wine Pairing Dinner', category: 'Fine Dining', description: 'Sommelier-curated multi-course dinner under the starlit gazebo.', location: 'The Signature Cellar', duration: '3 hrs' },
    ],
  };

  const currentItems = itineraries[vibe];

  const handleSave = () => {
    toast.success(`Saved your ${vibe} itinerary for ${cityName} to your profile!`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`AI Curated Travel Guide — ${cityName}`} size="xl">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Style selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 block">
            Choose Your Trip Vibe
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(['Relaxation', 'Culture', 'Adventure', 'Gourmet'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVibe(v)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                  vibe === v
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-bg-surface-hover border-border-base text-text-muted hover:text-text-base'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline list */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">
            Your Personalized Day Plan in {cityName}
          </label>
          <div className="space-y-3">
            {currentItems.map((item, index) => (
              <div
                key={item.title}
                className="p-4 rounded-2xl bg-bg-surface border border-border-base flex items-start gap-4 hover:border-border-strong transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {index === 0 ? <Sun className="w-5 h-5 text-amber-500" /> : index === 1 ? <Compass className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {item.timeSlot}
                      </span>
                      <span className="text-xs font-bold text-text-muted">• {item.category}</span>
                    </div>
                    <span className="text-xs font-mono text-text-muted">{item.duration}</span>
                  </div>
                  <h5 className="font-bold text-sm text-text-base">{item.title}</h5>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] font-medium text-text-muted mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-base">
          <p className="text-xs text-text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tailored specifically for {hotelName || 'your stay'}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleSave} icon={<Check className="w-4 h-4" />}>Save Itinerary</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
