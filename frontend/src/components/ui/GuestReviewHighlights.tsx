import { Star, ThumbsUp, Quote } from 'lucide-react';

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
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-bold text-text-base">Guest Highlights</h3>
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Most Helpful Reviews</span>
      </div>

      <div className="space-y-3">
        {HIGHLIGHTS.map((review) => (
          <div
            key={review.name}
            className="bg-bg-surface rounded-2xl border border-border-base p-5 hover:border-border-strong transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                {review.avatar}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-sm text-text-base">{review.name}</p>
                    <p className="text-[11px] text-text-muted">{review.country} • {review.stayDate}</p>
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
                <div className="relative pl-4 border-l-2 border-primary/20">
                  <Quote className="w-3 h-3 text-primary/40 absolute -left-1.5 -top-0.5 bg-bg-surface" />
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{review.comment}</p>
                </div>

                {/* Helpful */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review.helpful} found this helpful</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
