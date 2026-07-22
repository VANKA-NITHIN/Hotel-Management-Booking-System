import { useState } from 'react';
import { useMyReferralCode, useReferralMetrics, useReferralHistory, useApplyReferralCode } from '../../hooks/useApi';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Gift, Users, Share2, CheckCircle2, CopyCheck, Coins } from 'lucide-react';
import { Button } from './Button';
import toast from 'react-hot-toast';
import { Spinner } from './Spinner';

export function ReferralDashboard() {
  const { data: codeData, isLoading: codeLoading } = useMyReferralCode();
  const { data: metricsData, isLoading: metricsLoading } = useReferralMetrics();
  const { data: historyData, isLoading: historyLoading } = useReferralHistory();
  const applyMutation = useApplyReferralCode();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const referralCode = codeData?.data?.referralCode;
  const metrics = metricsData?.data;
  const history = historyData?.data || [];

  const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join LuxuryStay',
          text: `Use my referral code ${referralCode} to get 500 Loyalty Points when you join LuxuryStay!`,
          url: referralUrl,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopy(referralUrl);
    }
  };

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      toast.error('Please enter a referral code.');
      return;
    }
    applyMutation.mutate(inputCode, {
      onSuccess: () => {
        toast.success('Referral code applied successfully!');
        setInputCode('');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to apply code.');
      }
    });
  };

  if (codeLoading || metricsLoading || historyLoading) {
    return <div className="p-8 flex justify-center"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-surface rounded-2xl border border-border-base p-5">
          <div className="flex items-center gap-3 text-text-muted mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Total Referrals</span>
          </div>
          <div className="text-2xl font-serif font-bold text-text-base">{metrics?.totalReferrals || 0}</div>
        </div>
        <div className="bg-bg-surface rounded-2xl border border-border-base p-5">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Successful</span>
          </div>
          <div className="text-2xl font-serif font-bold text-text-base">{metrics?.successfulReferrals || 0}</div>
        </div>
        <div className="bg-bg-surface rounded-2xl border border-border-base p-5">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-2xl font-serif font-bold text-text-base">{metrics?.pendingReferrals || 0}</div>
        </div>
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Coins className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Points Earned</span>
          </div>
          <div className="text-2xl font-serif font-bold text-primary">{metrics?.totalRewardsEarned || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Share Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-surface rounded-2xl border border-border-base p-6">
            <h3 className="text-lg font-serif font-bold text-text-base mb-1">Your Referral Link</h3>
            <p className="text-sm text-text-muted mb-6">Share this link or code with your friends. You both get 500 Loyalty Points when they join!</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="p-3 bg-white rounded-xl border border-neutral-200 shrink-0">
                <QRCodeSVG value={referralUrl} size={120} level="H" />
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2 block">Referral Code</label>
                  <div className="flex items-center">
                    <div className="bg-bg-surface-hover border border-border-base border-r-0 rounded-l-xl px-4 py-2.5 font-mono font-bold text-primary text-lg flex-1 text-center">
                      {referralCode}
                    </div>
                    <button
                      onClick={() => handleCopy(referralCode || '')}
                      className="bg-bg-surface-hover border border-border-base rounded-r-xl px-4 py-3 text-text-muted hover:text-primary transition-colors flex items-center justify-center shrink-0"
                    >
                      {copied ? <CopyCheck className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    icon={<Copy className="w-4 h-4" />}
                    onClick={() => handleCopy(referralUrl)}
                  >
                    Copy Link
                  </Button>
                  <Button
                    className="flex-1"
                    icon={<Share2 className="w-4 h-4" />}
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-bg-surface rounded-2xl border border-border-base p-6 overflow-hidden flex flex-col h-full">
            <h3 className="text-lg font-serif font-bold text-text-base mb-4">Referral History</h3>
            {history.length > 0 ? (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-base text-xs font-bold uppercase tracking-wider text-text-muted">
                      <th className="pb-3 pr-4 font-medium">Friend</th>
                      <th className="pb-3 px-4 font-medium">Status</th>
                      <th className="pb-3 px-4 font-medium">Points</th>
                      <th className="pb-3 pl-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {history.map((ref, idx) => (
                      <tr key={idx} className="border-b border-border-base last:border-0 hover:bg-bg-surface-hover/50 transition-colors">
                        <td className="py-3 pr-4 font-bold text-text-base whitespace-nowrap">
                          {ref.referredUserName}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ref.status === 'REWARDED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            ref.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          }`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                          +{ref.rewardPoints}
                        </td>
                        <td className="py-3 pl-4 text-text-muted whitespace-nowrap">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 rounded-full bg-bg-surface-hover flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-text-muted text-sm max-w-[200px]">You haven't referred anyone yet. Share your code to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Apply Code Section */}
        <div className="space-y-6">
          <div className="bg-bg-surface rounded-2xl border border-border-base p-6">
            <h3 className="text-lg font-serif font-bold text-text-base mb-1">Were you referred?</h3>
            <p className="text-sm text-text-muted mb-4">Enter your friend's referral code to instantly claim 500 Loyalty Points.</p>
            <form onSubmit={handleApplyCode} className="space-y-3">
              <input
                type="text"
                placeholder="Enter referral code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full bg-bg-surface-hover border border-border-base rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
              />
              <Button
                type="submit"
                className="w-full"
                loading={applyMutation.isPending}
              >
                Apply Code
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
