import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import type { Hotel } from '../../types';
import { useToggleWishlist, useWishlist } from '../../hooks/useApi';

interface HotelCardProps {
  hotel: Hotel;
  index?: number;
  variant?: 'grid' | 'list';
}

export default function HotelCard({ hotel, index = 0, variant = 'grid' }: HotelCardProps) {
  const toggleWishlist = useToggleWishlist();
  const { data: wishlistResponse } = useWishlist();
  const wishlistHotels = wishlistResponse?.data || [];
  const isWishlisted = wishlistHotels.some((h: Hotel) => h.id === hotel.id);

  const imageUrl = hotel.logoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4 }}
        className="group flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-elevated"
      >
        <Link to={`/hotels/${hotel.id}`} className="sm:w-72 relative overflow-hidden shrink-0">
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-52 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist.mutate(hotel.id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
          </button>
        </Link>

        <div className="flex-1 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {hotel.city}, {hotel.country}
              </p>
              <Link to={`/hotels/${hotel.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-secondary transition-colors leading-tight">
                  {hotel.name}
                </h3>
              </Link>
            </div>
            <div className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-md shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-bold">{hotel.rating?.toFixed(1) || '4.5'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1 mb-auto">
            {Array.from({ length: hotel.starRating || 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-secondary fill-secondary" />
            ))}
            <span className="text-xs text-gray-400 ml-1">({hotel.totalReviews || 0} reviews)</span>
          </div>

          <div className="flex items-end justify-between pt-4 mt-4 border-t border-gray-50">
            <div>
              <span className="text-xs text-gray-400">From</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-gray-900">${hotel.startingPrice || 199}</span>
                <span className="text-xs text-gray-400">/night</span>
              </div>
            </div>
            <Link
              to={`/hotels/${hotel.id}`}
              className="btn-primary btn-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-elevated"
    >
      <Link to={`/hotels/${hotel.id}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        {hotel.starRating && hotel.starRating >= 5 && (
          <span className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider">
            Luxury
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist.mutate(hotel.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
        </button>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/hotels/${hotel.id}`} className="flex-1">
            <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-secondary transition-colors leading-tight line-clamp-1">
              {hotel.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
            <span className="text-sm font-semibold text-gray-900">{hotel.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-3">{hotel.city}, {hotel.country}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <span className="text-[11px] text-gray-400 block">From</span>
            <span className="text-base font-bold text-gray-900">
              ${hotel.startingPrice || 199}
              <span className="text-xs text-gray-400 font-normal ml-0.5">/night</span>
            </span>
          </div>
          <Link
            to={`/hotels/${hotel.id}`}
            className="text-sm font-medium text-secondary hover:underline underline-offset-2"
          >
            View →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
