import { useState } from 'react';
import { Modal } from './Modal';
import { Compass, Sparkles } from 'lucide-react';
import { OptimizedImage } from './Image';

interface TourSpot {
  id: string;
  name: string;
  description: string;
  image: string;
  hotspots: { title: string; x: number; y: number }[];
}

const TOUR_SPOTS: TourSpot[] = [
  {
    id: 'suite',
    name: 'Presidential Ocean Suite',
    description: 'Spacious 1,200 sq ft luxury suite with floor-to-ceiling ocean views.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&h=900&fit=crop',
    hotspots: [
      { title: 'King Size Pillow-top Bed', x: 30, y: 55 },
      { title: 'Private Balcony Jacuzzi', x: 75, y: 40 },
    ],
  },
  {
    id: 'pool',
    name: 'Rooftop Infinity Pool',
    description: 'Panoramic skyline views with temperature-controlled lounge cabanas.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=900&fit=crop',
    hotspots: [
      { title: 'Sun Loungers', x: 25, y: 65 },
      { title: 'Poolside Bar', x: 80, y: 50 },
    ],
  },
  {
    id: 'spa',
    name: 'Zen Wellness Spa',
    description: 'Hydrotherapy pools, herbal saunas, and private treatment sanctuaries.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&h=900&fit=crop',
    hotspots: [
      { title: 'Hydrotherapy Bath', x: 40, y: 60 },
      { title: 'Aromatherapy Cabin', x: 70, y: 45 },
    ],
  },
];

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName?: string;
}

export function VirtualTourModal({ isOpen, onClose, hotelName }: VirtualTourModalProps) {
  const [activeSpotId, setActiveSpotId] = useState('suite');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const spot = TOUR_SPOTS.find(s => s.id === activeSpotId) || TOUR_SPOTS[0]!;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Interactive 360° Tour — ${hotelName || 'LuxuryStay'}`} size="xl">
      <div className="p-4 sm:p-6 space-y-4">
        {/* Navigation tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-border-base pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {TOUR_SPOTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSpotId(s.id);
                  setActiveHotspot(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeSpotId === s.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-bg-surface-hover text-text-muted hover:text-text-base'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-primary flex items-center gap-1.5 shrink-0">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" /> 360° Panoramic View
          </span>
        </div>

        {/* Viewport canvas */}
        <div className="relative w-full h-[360px] sm:h-[450px] rounded-2xl overflow-hidden bg-black group border border-border-base">
          <OptimizedImage
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Overlay info banner */}
          <div className="absolute top-4 start-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white max-w-sm">
            <h4 className="font-bold text-sm">{spot.name}</h4>
            <p className="text-xs text-white/80 mt-0.5">{spot.description}</p>
          </div>

          {/* Hotspots */}
          {spot.hotspots.map((hs) => (
            <div
              key={hs.title}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              onClick={() => setActiveHotspot(hs.title)}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-primary border-2 border-white items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>
              {activeHotspot === hs.title && (
                <div className="absolute bottom-8 start-1/2 -translate-x-1/2 bg-bg-surface text-text-base border border-border-base px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl whitespace-nowrap z-20">
                  {hs.title}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
