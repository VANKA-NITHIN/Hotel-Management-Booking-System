import { useState } from 'react';
import { Wallet, TrendingUp, History, Tag, Gift, Award, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useMyWallet, useWalletTransactions, useApplyCoupon, useRedeemPoints } from './../../hooks/useApi';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Spinner } from './Spinner';
import type { WalletTransaction } from '../../types';

export function GuestWallet() {
  const { data: walletResponse, isLoading: walletLoading } = useMyWallet();
  const { data: transactionsResponse, isLoading: txLoading } = useWalletTransactions(0, 50);
  
  const wallet = walletResponse?.data;
  const transactionsData = transactionsResponse?.data;

  const applyCoupon = useApplyCoupon();
  const redeemPoints = useRedeemPoints();

  const [couponCode, setCouponCode] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  if (walletLoading) return <div className="py-12 flex justify-center"><Spinner /></div>;
  if (!wallet) return <div>Wallet not found</div>;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    applyCoupon.mutate(couponCode, {
      onSuccess: () => setCouponCode('')
    });
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(redeemAmount);
    if (isNaN(pts) || pts <= 0 || pts > wallet.rewardPoints) return;
    redeemPoints.mutate(pts, {
      onSuccess: () => setRedeemAmount('')
    });
  };

  const getTransactionIcon = (amount: number) => {
    if (amount >= 0) {
      return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-red-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-primary-700 dark:text-primary-400">Current Balance</p>
              <h3 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mt-1">
                ${wallet.balance.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-text-muted">Reward Points</p>
              <h3 className="text-3xl font-bold text-text-base mt-1">
                {wallet.rewardPoints.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-xl text-accent-600 dark:text-accent-400">
              <Gift className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-text-muted">Loyalty Tier</p>
              <h3 className="text-xl font-bold text-text-base mt-1">{wallet.loyaltyTier}</h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-text-muted">
              <span>Tier Progress</span>
              <span>{wallet.tierProgress}%</span>
            </div>
            <div className="h-2 w-full bg-bg-surface-hover rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500"
                style={{ width: `${wallet.tierProgress}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="font-semibold text-text-base mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-text-muted" /> Apply Coupon
            </h4>
            <form onSubmit={handleApplyCoupon} className="space-y-3">
              <Input 
                placeholder="Enter promo code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button fullWidth type="submit" disabled={!couponCode || applyCoupon.isPending}>
                Apply
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h4 className="font-semibold text-text-base mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-text-muted" /> Redeem Points
            </h4>
            <form onSubmit={handleRedeem} className="space-y-3">
              <p className="text-sm text-text-muted mb-2">100 points = $1.00</p>
              <Input 
                type="number"
                placeholder="Points to redeem" 
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                max={wallet.rewardPoints}
              />
              <Button fullWidth type="submit" variant="secondary" disabled={!redeemAmount || redeemPoints.isPending}>
                Convert to Balance
              </Button>
            </form>
          </Card>
        </div>

        {/* Transaction Ledger */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-6 border-b border-border-base bg-primary-600 rounded-t-xl text-white">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5" /> Transaction Ledger
            </h4>
          </div>
          <div className="divide-y divide-border-base max-h-[500px] overflow-y-auto">
            {txLoading ? (
              <div className="p-8 flex justify-center"><Spinner /></div>
            ) : transactionsData?.content?.length === 0 ? (
              <div className="p-8 text-center text-text-muted">No transactions found.</div>
            ) : (
              transactionsData?.content.map((tx: WalletTransaction) => (
                <div key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-bg-surface-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.amount >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {getTransactionIcon(tx.amount)}
                    </div>
                    <div>
                      <p className="font-medium text-text-base">{tx.description || tx.type.replace(/_/g, ' ')}</p>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                        <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">{getStatusIcon(tx.status)} {tx.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-right font-bold ${tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-text-base'}`}>
                    {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
