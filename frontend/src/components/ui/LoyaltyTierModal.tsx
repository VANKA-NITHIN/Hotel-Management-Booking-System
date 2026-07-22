import { Modal } from './Modal';
import { Crown, CheckCircle2 } from 'lucide-react';

interface TierInfo {
  name: string;
  minPoints: number;
  badgeColor: string;
  perks: string[];
}

const LOYALTY_TIERS: TierInfo[] = [
  {
    name: 'Silver Member',
    minPoints: 0,
    badgeColor: 'bg-slate-400/10 text-slate-500 border-slate-400/30',
    perks: ['5% Bonus Loyalty Points', 'Complimentary Bottled Water', 'Late Check-out subject to availability'],
  },
  {
    name: 'Gold Elite',
    minPoints: 1000,
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    perks: ['15% Bonus Loyalty Points', 'Free High-Speed Wi-Fi', 'Welcome Amenities Package', 'Guaranteed Room Upgrade'],
  },
  {
    name: 'Platinum VIP',
    minPoints: 3000,
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
    perks: ['25% Bonus Loyalty Points', 'Executive Lounge & Spa Access', 'Complimentary Daily Breakfast', '4:00 PM Late Check-out'],
  },
  {
    name: 'Diamond Founder',
    minPoints: 7500,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    perks: ['50% Bonus Loyalty Points', 'Personal 24/7 Butler Service', 'Airport Chauffeur Transfers', 'Unlimited Spa & Dining Credits'],
  },
];

interface LoyaltyTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints?: number;
}

import { useTranslation } from 'react-i18next';

export function LoyaltyTierModal({ isOpen, onClose, currentPoints = 1250 }: LoyaltyTierModalProps) {
  const { t } = useTranslation(['wallet', 'common']);
  
  const currentTier = LOYALTY_TIERS.slice().reverse().find(t => currentPoints >= t.minPoints) || LOYALTY_TIERS[0]!;
  const nextTier = LOYALTY_TIERS.find(t => t.minPoints > currentPoints);

  const pointsToNext = nextTier ? nextTier.minPoints - currentPoints : 0;
  const progressPercent = nextTier
    ? Math.min(100, Math.round((currentPoints / nextTier.minPoints) * 100))
    : 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="LuxuryStay Loyalty & VIP Tiers" size="lg">
      <div className="p-4 sm:p-6 space-y-6">
        {/* User Current Tier Banner */}
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${currentTier.badgeColor}`}>
                {currentTier.name}
              </span>
              <h4 className="text-lg font-bold text-text-base mt-1 flex items-center gap-2">
                {currentPoints.toLocaleString()} <span className="text-xs font-normal text-text-muted">{t('wallet:loyaltyPoints', 'Loyalty Points')}</span>
              </h4>
            </div>
          </div>

          {nextTier && (
            <div className="sm:text-end w-full sm:w-auto">
              <p className="text-xs text-text-muted">
                {t('wallet:pointsToNextLevel', { points: pointsToNext, level: nextTier.name })}
              </p>
              <div className="w-full sm:w-36 h-2 bg-bg-surface-hover rounded-full overflow-hidden mt-1.5 border border-border-base">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Tiers Breakdown */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">Tier Privileges & Requirements</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LOYALTY_TIERS.map((tier) => {
              const isCurrent = tier.name === currentTier.name;
              return (
                <div
                  key={tier.name}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-bg-surface border-primary shadow-sm ring-1 ring-primary/20'
                      : 'bg-bg-surface-hover/50 border-border-base'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${tier.badgeColor}`}>
                      {tier.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-text-muted">{tier.minPoints} pts</span>
                  </div>
                  <ul className="space-y-2 text-xs text-text-base">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
