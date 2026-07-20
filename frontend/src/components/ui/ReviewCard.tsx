import { Star, ThumbsUp, MoreHorizontal } from 'lucide-react';
import { Avatar } from './Avatar';

export interface ReviewProps {
  id: string;
  author: {
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  rating: number;
  date: string;
  content: string;
  likes?: number;
  roomType?: string;
  onLike?: () => void;
}

export function ReviewCard({
  author,
  rating,
  date,
  content,
  likes = 0,
  roomType,
  onLike,
}: ReviewProps) {
  return (
    <div className="p-5 sm:p-6 bg-bg-surface rounded-xl border border-border-base transition-all hover:border-border-strong">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar 
            src={author.avatarUrl} 
            alt={author.name} 
            initials={author.name.charAt(0)} 
            size="md"
          />
          <div>
            <h4 className="text-sm font-semibold text-text-base flex items-center gap-1.5">
              {author.name}
              {author.isVerified && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded flex items-center font-bold uppercase tracking-wider">
                  Verified Stay
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rating 
                        ? 'text-secondary fill-secondary' 
                        : 'text-neutral-200 dark:text-neutral-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs text-text-muted">{date}</span>
            </div>
          </div>
        </div>
        
        <button className="text-text-muted hover:text-text-base p-1 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-text-base leading-relaxed mb-4">
        {content}
      </p>

      <div className="flex items-center justify-between mt-auto">
        {roomType ? (
          <span className="text-xs font-medium text-text-muted bg-bg-surface-active px-2.5 py-1 rounded-md">
            Stayed in {roomType}
          </span>
        ) : (
          <span />
        )}
        
        <button 
          onClick={onLike}
          className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-base transition-colors group"
        >
          <ThumbsUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          <span>Helpful {likes > 0 && `(${likes})`}</span>
        </button>
      </div>
    </div>
  );
}
