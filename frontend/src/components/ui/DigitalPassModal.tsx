import { useEffect, useState } from 'react';
import { X, QrCode, ShieldCheck, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Button } from './Button';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef?: string;
  hotelName?: string;
  qrToken?: string;
}

export function DigitalPassModal({ isOpen, onClose, bookingRef, hotelName, qrToken }: DigitalPassModalProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins simulation for rolling refresh

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 300);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-base bg-linear-to-r from-primary-600 to-primary-700 rounded-t-xl text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Digital Pass</h3>
              <p className="text-primary-100 text-xs font-medium">Fast-Track Entry</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center">
          <div className="mb-6 text-center">
            <h4 className="text-xl font-bold text-text-base mb-1">{hotelName || 'LuxuryStay Property'}</h4>
            <p className="text-sm text-text-muted">Ref: {bookingRef}</p>
          </div>

          <div className="relative p-4 bg-white rounded-2xl shadow-sm border border-border-base mb-6 group">
            {qrToken ? (
              <QRCodeSVG 
                value={qrToken} 
                size={220}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            ) : (
              <div className="w-[220px] h-[220px] flex items-center justify-center bg-bg-surface-hover rounded-lg">
                <p className="text-text-muted text-sm font-medium">Token not available</p>
              </div>
            )}
            
            {/* Security overlays */}
            <div className="absolute top-0 start-0 w-full h-full pointer-events-none rounded-2xl ring-1 ring-inset ring-black/5" />
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-2 px-4 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              Verified Digital Key
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-surface-hover rounded-xl text-sm">
              <div className="flex items-center gap-2 text-text-base font-medium">
                <Clock className="w-4 h-4 text-primary-500" />
                Refreshes in
              </div>
              <span className="font-mono font-bold text-primary-600">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-base bg-bg-surface-hover rounded-b-xl text-center">
          <p className="text-xs text-text-muted mb-3">
            Present this code to the front desk scanner for instant check-in.
          </p>
          <Button fullWidth variant="outline" onClick={onClose}>
            Close Pass
          </Button>
        </div>
      </div>
    </Modal>
  );
}
