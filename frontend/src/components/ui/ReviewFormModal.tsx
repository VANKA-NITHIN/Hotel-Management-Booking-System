import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Star, Send, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateReview } from '../../hooks/useApi';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: number | string;
  hotelName: string;
}

export function ReviewFormModal({ isOpen, onClose, hotelId, hotelName }: ReviewFormModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [cleanliness, setCleanliness] = useState(5);
  const [service, setService] = useState(5);
  const [location, setLocation] = useState(5);

  const createReviewMutation = useCreateReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter review comments.');
      return;
    }

    createReviewMutation.mutate(
      {
        hotelId: Number(hotelId),
        rating,
        comment: title ? `${title} — ${comment}` : comment,
      },
      {
        onSuccess: () => {
          toast.success('Thank you! Your review has been published.');
          onClose();
          setTitle('');
          setComment('');
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to submit review. Please try again.');
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review ${hotelName}`} size="md">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
        {/* Star Rating Header */}
        <div className="text-center bg-bg-surface-hover p-4 rounded-2xl border border-border-base/50">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Overall Experience</p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-text-muted/40 fill-transparent'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-primary mt-2">
            {rating === 5 ? '🌟 Exceptional' : rating === 4 ? '👍 Very Good' : rating === 3 ? '👌 Average' : '👎 Poor'}
          </p>
        </div>

        {/* Detailed Category Ratings */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-bg-surface-hover p-2.5 rounded-xl border border-border-base/50 text-center">
            <span className="text-text-muted font-medium block mb-1">Cleanliness</span>
            <select
              value={cleanliness}
              onChange={(e) => setCleanliness(Number(e.target.value))}
              className="bg-bg-surface border border-border-base rounded-lg px-2 py-1 font-bold text-text-base text-xs w-full focus:outline-none"
            >
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
            </select>
          </div>
          <div className="bg-bg-surface-hover p-2.5 rounded-xl border border-border-base/50 text-center">
            <span className="text-text-muted font-medium block mb-1">Service</span>
            <select
              value={service}
              onChange={(e) => setService(Number(e.target.value))}
              className="bg-bg-surface border border-border-base rounded-lg px-2 py-1 font-bold text-text-base text-xs w-full focus:outline-none"
            >
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
            </select>
          </div>
          <div className="bg-bg-surface-hover p-2.5 rounded-xl border border-border-base/50 text-center">
            <span className="text-text-muted font-medium block mb-1">Location</span>
            <select
              value={location}
              onChange={(e) => setLocation(Number(e.target.value))}
              className="bg-bg-surface border border-border-base rounded-lg px-2 py-1 font-bold text-text-base text-xs w-full focus:outline-none"
            >
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} / 5</option>)}
            </select>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5 block">Review Headline</label>
          <input
            type="text"
            placeholder="e.g., Unforgettable luxury and world-class service!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-bg-surface-hover border border-border-base rounded-xl px-3.5 py-2.5 text-xs text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Review Comment */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5 block">Your Experience</label>
          <textarea
            rows={4}
            placeholder="Share details of your stay, room comfort, dining experience, staff hospitality..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-bg-surface-hover border border-border-base rounded-xl p-3.5 text-xs text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Your review will be marked as a Verified Guest Submission.</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={<Send className="w-4 h-4" />} loading={createReviewMutation.isPending}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
