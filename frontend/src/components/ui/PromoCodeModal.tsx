import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface PromoCode {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  description: string;
  minSpend?: number;
}

const AVAILABLE_PROMOS: PromoCode[] = [
  {
    code: 'LUXURY2026',
    discountType: 'percentage',
    discountValue: 15,
    description: '15% Off Exclusive Summer Stay Package',
  },
  {
    code: 'WELCOME50',
    discountType: 'flat',
    discountValue: 50,
    description: '$50 Off your first booking on LuxuryStay',
  },
  {
    code: 'VIPMEMBER',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% Off for VIP Members & Free Breakfast',
  },
];

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPromo: (promo: PromoCode) => void;
  appliedCode?: string;
}

export function PromoCodeModal({ isOpen, onClose, onApplyPromo, appliedCode }: PromoCodeModalProps) {
  const [inputCode, setInputCode] = useState('');

  const handleApply = (codeToApply: string) => {
    const matched = AVAILABLE_PROMOS.find(p => p.code.toUpperCase() === codeToApply.trim().toUpperCase());
    if (matched) {
      onApplyPromo(matched);
      toast.success(`Promo code '${matched.code}' applied successfully!`);
      onClose();
    } else {
      toast.error('Invalid promo code. Try LUXURY2026 or WELCOME50.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply Promo Code or Coupon" size="md">
      <div className="p-4 sm:p-6 space-y-6">
        {/* Custom Code Input */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">Enter Promo Code</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. LUXURY2026"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="flex-1 bg-bg-surface-hover border border-border-base rounded-xl px-3.5 py-2.5 text-xs text-text-base font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button onClick={() => handleApply(inputCode)}>
              Apply
            </Button>
          </div>
        </div>

        {/* Available Promos List */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Exclusive Offers For You
          </label>
          <div className="space-y-3">
            {AVAILABLE_PROMOS.map((promo) => {
              const isApplied = appliedCode === promo.code;
              return (
                <div
                  key={promo.code}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    isApplied
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-bg-surface-hover border-border-base/50 hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-mono font-bold text-sm">
                      {promo.discountType === 'percentage' ? '%' : '$'}
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-text-base block tracking-wider">{promo.code}</span>
                      <p className="text-xs text-text-muted mt-0.5">{promo.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isApplied ? 'secondary' : 'outline'}
                    onClick={() => handleApply(promo.code)}
                  >
                    {isApplied ? 'Applied' : 'Use Code'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
