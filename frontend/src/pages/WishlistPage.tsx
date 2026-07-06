import { useAuth } from '@clerk/clerk-react';

import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useApi';
import HotelCard from '../components/ui/HotelCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';

export default function WishlistPage() {
  usePageTitle('My Wishlist');
  const { isSignedIn, isLoaded } = useAuth();
  const { data: wishlistData, isLoading } = useWishlist();

  const hotels = wishlistData?.data || [];

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container-section">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-500">
              {isLoading ? 'Loading your saved properties...' : `You have ${hotels.length} saved properties`}
            </p>
          </div>
          <Link to="/hotels" className="btn-outline hidden sm:flex">
            Browse more hotels
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel: any, i: number) => (
              <HotelCard key={hotel.id} hotel={hotel} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className="w-8 h-8 text-gray-400" />}
            title="Your wishlist is empty"
            description="Explore our properties and save your favorites to view them later."
            action={{ label: 'Explore Hotels', to: '/hotels' }}
          />
        )}
      </div>
    </div>
  );
}
