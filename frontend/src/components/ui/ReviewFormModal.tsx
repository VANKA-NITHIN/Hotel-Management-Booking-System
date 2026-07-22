import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Star, Send, ShieldCheck, Camera, X } from 'lucide-react';
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
  const [valueRating, setValueRating] = useState(5);
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = () => {
    // Simulate photo upload
    const mockPhotos = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=300&h=300&fit=crop'
    ];
    setPhotos([...photos, mockPhotos[Math.floor(Math.random() * mockPhotos.length)]]);
  };

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
        cleanlinessRating: cleanliness,
        serviceRating: service,
        locationRating: location,
        valueRating: valueRating,
        comment: title ? `${title} — ${comment}` : comment,
        photos,
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
          <div className="bg-bg-surface-hover p-2.5 rounded-xl border border-border-base/50 text-center">
            <span className="text-text-muted font-medium block mb-1">Value</span>
            <select
              value={valueRating}
              onChange={(e) => setValueRating(Number(e.target.value))}
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

        {/* Photos Upload Simulation */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5 block">Add Photos</label>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {photos.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border-base">
                <img src={url} alt="Review" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handlePhotoUpload}
              className="w-16 h-16 rounded-xl border-2 border-dashed border-border-strong flex flex-col items-center justify-center shrink-0 hover:border-primary hover:bg-primary/5 transition-colors text-text-muted"
            >
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Add</span>
            </button>
          </div>
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
