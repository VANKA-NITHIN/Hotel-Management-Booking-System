import { Modal } from './Modal';
import { Button } from './Button';
import { Check, X } from 'lucide-react';
import type { Room } from '../../types';
import { useCurrency } from '../../contexts/CurrencyContext';
import { OptimizedImage } from './Image';

interface RoomComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  onSelectRoom?: (room: Room) => void;
}

export function RoomComparisonModal({ isOpen, onClose, rooms, onSelectRoom }: RoomComparisonModalProps) {
  const { formatPrice } = useCurrency();

  if (!rooms || rooms.length === 0) return null;

  const featuresList = [
    { label: 'Room Size', render: (r: Room) => `${r.size || r.maxGuests * 250 || 450} sq ft` },
    { label: 'Max Occupancy', render: (r: Room) => `${r.maxGuests} Guests` },
    { label: 'Bed Type', render: (r: Room) => `${r.bedCount || 1} ${r.bedType || 'King Bed'}` },
    { label: 'Breakfast Included', render: (r: Room) => r.pricePerNight > 250 ? true : false },
    { label: 'Free Cancellation', render: () => true },
    { label: 'Ocean / Skyline View', render: (r: Room) => (r.view || r.roomType || r.name)?.toLowerCase().includes('suite') || (r.roomType || r.name)?.toLowerCase().includes('deluxe') ? true : false },
    { label: 'Private Jacuzzi', render: (r: Room) => r.pricePerNight > 350 ? true : false },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compare Room Types" size="xl">
      <div className="p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="p-3 bg-bg-surface-hover border border-border-base text-xs font-bold text-text-muted uppercase w-1/4">
                Feature
              </th>
              {rooms.map((room) => (
                <th key={room.id} className="p-4 bg-bg-surface border border-border-base text-center w-1/3 min-w-[200px]">
                  <div className="w-full h-28 rounded-xl overflow-hidden mb-3">
                    <OptimizedImage
                      src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop'}
                      alt={room.name || room.roomType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-text-base line-clamp-1">{room.name || room.roomType}</h4>
                  <p className="text-primary font-extrabold text-base mt-1">
                    {formatPrice(room.pricePerNight)}
                    <span className="text-xs text-text-muted font-normal"> /night</span>
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            {featuresList.map((feat) => (
              <tr key={feat.label} className="hover:bg-bg-surface-hover/50 transition-colors">
                <td className="p-3 border border-border-base font-bold text-text-base bg-bg-surface-hover/30">
                  {feat.label}
                </td>
                {rooms.map((room) => {
                  const val = feat.render(room);
                  return (
                    <td key={room.id} className="p-3 border border-border-base text-center text-text-base font-medium">
                      {typeof val === 'boolean' ? (
                        val ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-500">
                            <X className="w-4 h-4" />
                          </span>
                        )
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {onSelectRoom && (
              <tr>
                <td className="p-3 border border-border-base"></td>
                {rooms.map((room) => (
                  <td key={room.id} className="p-3 border border-border-base text-center">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onSelectRoom(room);
                        onClose();
                      }}
                    >
                      Select Room
                    </Button>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
