import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { CheckCircle2, Calendar, MapPin, Users, Copy, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: {
    bookingReference: string;
    hotelName: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
    guestName: string;
  };
}

export function BookingConfirmationModal({ isOpen, onClose, booking }: BookingConfirmationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!booking) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(booking.bookingReference);
    toast.success('Booking reference copied!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="p-6 sm:p-8 text-center space-y-6">
        {/* Success Animation */}
        <div className="relative">
          {showConfetti && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <PartyPopper className="w-8 h-8 text-amber-500 absolute -top-2 -left-4 animate-bounce" />
              <PartyPopper className="w-6 h-6 text-primary absolute -top-4 right-0 animate-bounce delay-100" />
            </div>
          )}
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 ring-4 ring-success/20">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-base">Booking Confirmed!</h2>
          <p className="text-text-muted font-medium mt-1">Your luxury escape is secured, {booking.guestName.split(' ')[0]}</p>
        </div>

        {/* Booking Reference */}
        <div className="bg-bg-surface-hover rounded-2xl p-5 border border-border-base">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Booking Reference</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-extrabold text-primary tracking-widest">{booking.bookingReference}</span>
            <button
              onClick={handleCopyRef}
              className="w-8 h-8 rounded-lg bg-bg-surface border border-border-base flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
              title="Copy reference"
            >
              <Copy className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-bg-surface rounded-2xl p-5 border border-border-base text-left space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-text-base">{booking.hotelName}</p>
              <p className="text-xs text-text-muted">{booking.roomName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Check-in</p>
                <p className="text-xs font-bold text-text-base">{booking.checkIn}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Check-out</p>
                <p className="text-xs font-bold text-text-base">{booking.checkOut}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border-base">
            <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
              <Users className="w-4 h-4" /> {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
            </div>
            <span className="text-lg font-extrabold text-text-base">${booking.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1" onClick={() => { toast.success('Confirmation sent to your email!'); onClose(); }}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
