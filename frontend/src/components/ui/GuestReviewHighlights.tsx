import { Star, ThumbsUp, Quote, BarChart2 } from 'lucide-react';
import { useHotelReviewAnalytics, useHotelReviews } from '../../hooks/useApi';
import { Spinner } from './Spinner';

interface GuestHighlight {
  name: string;
  country: string;
  rating: number;
  comment: string;
  stayDate: string;
  helpful: number;
  avatar: string;
}

const HIGHLIGHTS: GuestHighlight[] = [
  {
    name: 'Sophie Chen',
    country: 'Singapore',
    rating: 5,
    comment: 'Absolutely breathtaking views from our oceanfront suite. The staff anticipated every need before we even asked. Will return annually.',
    stayDate: 'Jun 2026',
    helpful: 42,
    avatar: 'SC',
  },
  {
    name: 'James Harlow',
    country: 'United Kingdom',
    rating: 5,
    comment: 'The private beach dinner was the highlight of our honeymoon. Michelin-quality cuisine with impeccable service under the stars.',
    stayDate: 'May 2026',
    helpful: 38,
    avatar: 'JH',
  },
  {
    name: 'Anika Patel',
    country: 'India',
    rating: 4,
    comment: 'The spa was world-class — the aromatherapy treatment completely reset my energy. Pool area could use more cabana space during peak hours.',
    stayDate: 'Jun 2026',
    helpful: 27,
    avatar: 'AP',
  },
];

interface GuestReviewHighlightsProps {
  hotelName?: string;
  className?: string;
}

export function GuestReviewHighlights({ className = '' }: GuestReviewHighlightsProps) {
  // If no hotelId is passed via context, assume 1 for demo purposes
  const hotelId = 1;
  const { data: analyticsRes, isLoading: analyticsLoading } = useHotelReviewAnalytics(hotelId);
  const { data: reviewsRes } = useHotelReviews(hotelId);

  const analytics = analyticsRes?.data;
  const realReviews = reviewsRes?.data || [];
  
  if (analyticsLoading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Analytics Overview */}
      {analytics && analytics.totalReviews > 0 && (
        <div className="bg-bg-surface rounded-2xl border border-border-base p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif font-bold text-text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> Review Analytics
            </h3>
            <div className="text-end">
              <span className="text-2xl font-bold text-text-base">{analytics.averageRating.toFixed(1)}</span>
              <span className="text-sm text-text-muted"> / 5</span>
              <p className="text-xs text-text-muted">Based on {analytics.totalReviews} reviews</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <div className="flex justify-between mb-1"><span className="text-text-muted">Cleanliness</span><span className="font-bold">{analytics.averageCleanliness.toFixed(1)}</span></div>
              <div className="h-1.5 bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-primary-500" style={{ width: `${(analytics.averageCleanliness / 5) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-text-muted">Service</span><span className="font-bold">{analytics.averageService.toFixed(1)}</span></div>
              <div className="h-1.5 bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-primary-500" style={{ width: `${(analytics.averageService / 5) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-text-muted">Location</span><span className="font-bold">{analytics.averageLocation.toFixed(1)}</span></div>
              <div className="h-1.5 bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-primary-500" style={{ width: `${(analytics.averageLocation / 5) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-text-muted">Value</span><span className="font-bold">{analytics.averageValue.toFixed(1)}</span></div>
              <div className="h-1.5 bg-bg-surface-hover rounded-full overflow-hidden">
                <div className="h-full bg-primary-500" style={{ width: `${(analytics.averageValue / 5) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-bold text-text-base">Guest Highlights</h3>
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Most Helpful Reviews</span>
      </div>

      <div className="space-y-3">
        {(realReviews.length > 0 ? realReviews.slice(0, 3) : HIGHLIGHTS).map((review: any) => (
          <div
            key={review.id || review.name}
            className="bg-bg-surface rounded-2xl border border-border-base p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold overflow-hidden">
                {review.userImage ? (
                  <img src={review.userImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  (review.userName || review.name || 'G')[0]
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-sm text-text-base">{review.userName || review.name}</p>
                    <p className="text-[11px] text-text-muted">{review.country || 'Verified Guest'} • {review.stayDate || new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-border-strong'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="relative ps-4 border-s-2 border-primary/20">
                  <Quote className="w-3 h-3 text-primary/40 absolute -left-1.5 -top-0.5 bg-bg-surface" />
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{review.comment}</p>
                </div>

                {/* Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {review.photos.map((photo: string, idx: number) => (
                      <div key={idx} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-bg-surface-hover">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Helpful */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review.likes || review.helpful || 0} found this helpful</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
