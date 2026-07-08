import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useApi';
import HotelCard from '../components/ui/HotelCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  usePageTitle('My Wishlist');
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { data: wishlistData, isLoading } = useWishlist();

  const hotels = wishlistData?.data || [];

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-28 pb-20">
      <div className="container-section">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-base mb-2">My Wishlist</h1>
            <p className="text-text-muted font-medium">
              {isLoading ? 'Loading your saved properties...' : `You have ${hotels.length} saved properties`}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/hotels')} className="hidden sm:flex">
            Browse more hotels
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : hotels.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {hotels.map((hotel: any, i: number) => (
              <HotelCard key={hotel.id} hotel={hotel} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <EmptyState
              title="Your wishlist is empty"
              description="Explore our properties and save your favorites to view them later."
              action={{ label: 'Explore Hotels', to: '/hotels' }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
