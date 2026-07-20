import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, UserProfile } from '@clerk/clerk-react';
import { Calendar, User, Heart, Settings, LayoutDashboard, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMyBookings } from '../hooks/useApi';
import { usePersistentState } from '../hooks/usePersistentState';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge, statusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { OptimizedImage } from '../components/ui/Image';
import { LoyaltyCard } from '../components/ui/LoyaltyCard';
import { authApi } from '../api';
import { useQuery } from '@tanstack/react-query';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'My Trips', icon: Calendar },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'account', label: 'Account', icon: User },
];

export default function DashboardPage() {
  usePageTitle('My Dashboard');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = usePersistentState('dashboard_active_tab', 'overview');
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { data: profileRes } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getMe,
    enabled: isSignedIn,
  });
  const user: any = profileRes?.data || clerkUser;
  const { data: bookingsData, isLoading } = useMyBookings();
  const bookings = bookingsData?.data?.content || [];

  const upcomingBookings = bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING');

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-[72px] pb-24">
      <div className="container-section mt-8">
        {/* Header Profile Summary */}
        <div className="bg-bg-surface rounded-2xl p-6 md:p-8 mb-8 border border-border-base shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-bg-surface-hover overflow-hidden shrink-0 shadow-inner">
            {user?.imageUrl ? (
              <OptimizedImage src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" priority={true} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-serif font-bold text-text-muted">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-serif font-bold text-text-base mb-1">
              Welcome back, {user?.firstName || 'Guest'}
            </h1>
            <p className="text-text-muted mb-4 font-medium">{user?.primaryEmailAddress?.emailAddress || user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-secondary/10 px-5 py-2.5 rounded-xl border border-secondary/20">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-0.5">Loyalty Points</p>
                <p className="text-2xl font-bold text-secondary-dark">{user?.loyaltyPoints?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-bg-surface-hover px-5 py-2.5 rounded-xl border border-border-base">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Trips</p>
                <p className="text-2xl font-bold text-text-base">{bookings.length}</p>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex gap-3 mt-4 md:mt-0">
             <Button onClick={() => navigate('/hotels')} size="lg">Book a stay</Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-10">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-bg-surface rounded-2xl border border-border-base p-2 shadow-sm sticky top-24">
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-md'
                        : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-base'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-text-muted'}`} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  
                  {/* Loyalty Program Summary */}
                  <div className="mb-10">
                    <LoyaltyCard points={user?.loyaltyPoints || 0} />
                  </div>

                  <h2 className="text-2xl font-serif font-bold text-text-base mb-6">Upcoming Trips</h2>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-bg-surface rounded-2xl p-6 border border-border-base h-40 animate-pulse-soft"></div>
                      ))}
                    </div>
                  ) : upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking: any) => (
                        <div key={booking.id} className="bg-bg-surface rounded-2xl p-6 border border-border-base shadow-sm flex flex-col md:flex-row gap-6 hover:border-border-strong transition-colors group">
                          <div className="w-full md:w-56 h-36 rounded-xl bg-bg-surface-hover overflow-hidden shrink-0 relative">
                             <OptimizedImage src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Badge {...statusBadge(booking.status)} className="mb-2">{booking.status}</Badge>
                                <h3 className="text-xl font-bold text-text-base line-clamp-1">Luxury Resort & Spa</h3>
                                <p className="text-sm font-medium text-text-muted flex items-center gap-1.5 mt-1"><MapPin className="w-3.5 h-3.5" /> Paris, France</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-bold text-text-base">${booking.totalAmount.toLocaleString()}</span>
                                <span className="text-xs font-bold text-text-muted block uppercase tracking-wider">Total</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border-base">
                               <div>
                                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Check-in</p>
                                  <p className="text-sm font-bold text-text-base flex items-center gap-1.5"><Calendar className="w-4 h-4 text-text-muted" /> {booking.checkInDate}</p>
                               </div>
                               <div>
                                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Check-out</p>
                                  <p className="text-sm font-bold text-text-base flex items-center gap-1.5"><Calendar className="w-4 h-4 text-text-muted" /> {booking.checkOutDate}</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-bg-surface rounded-2xl border border-border-base p-12 text-center shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-bg-surface-hover flex items-center justify-center mx-auto mb-5">
                        <Calendar className="w-10 h-10 text-text-muted" />
                      </div>
                      <h3 className="text-xl font-bold text-text-base mb-2">No upcoming trips</h3>
                      <p className="text-text-muted font-medium mb-8 max-w-md mx-auto">You don't have any upcoming reservations. Ready to plan your next getaway?</p>
                      <Button onClick={() => navigate('/hotels')} size="lg">Explore Hotels</Button>
                    </div>
                  )}

                  <h2 className="text-2xl font-serif font-bold text-text-base mb-6 mt-12">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => navigate('/settings')} className="bg-bg-surface p-6 rounded-2xl border border-border-base text-center hover:border-border-strong hover:shadow-md transition-all group">
                      <Settings className="w-7 h-7 text-text-muted mx-auto mb-3 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-bold text-text-base">Preferences</span>
                    </button>
                    <button onClick={() => navigate('/help')} className="bg-bg-surface p-6 rounded-2xl border border-border-base text-center hover:border-border-strong hover:shadow-md transition-all group">
                      <Search className="w-7 h-7 text-text-muted mx-auto mb-3 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-bold text-text-base">Help Center</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-2xl font-serif font-bold text-text-base mb-6">Booking History</h2>
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking: any) => (
                        <div key={booking.id} className="bg-bg-surface rounded-2xl p-6 border border-border-base shadow-sm flex items-center justify-between hover:border-border-strong transition-colors group">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-text-base">Ref: #{booking.bookingReference}</span>
                              <Badge {...statusBadge(booking.status)}>{booking.status}</Badge>
                            </div>
                            <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5" /> {booking.checkInDate} to {booking.checkOutDate} 
                              <span className="text-border-strong">•</span> 
                              <User className="w-3.5 h-3.5" /> {booking.guestCount} guests
                            </p>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-xl text-text-base">${booking.totalAmount.toLocaleString()}</p>
                             <button className="text-sm font-bold text-secondary hover:text-secondary-dark mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View Details</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState title="No booking history found." description="You haven't made any bookings yet." />
                  )}
                </motion.div>
              )}

              {activeTab === 'saved' && (
                <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                   <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold text-text-base">Saved Properties</h2>
                    <Button variant="outline" size="sm" onClick={() => navigate('/wishlist')}>View all</Button>
                   </div>
                   <div className="bg-bg-surface rounded-2xl border border-border-base p-12 text-center shadow-sm">
                      <Heart className="w-16 h-16 text-text-muted mx-auto mb-5 opacity-50" />
                      <h3 className="text-xl font-bold text-text-base mb-2">Your wishlist is ready</h3>
                      <p className="text-text-muted font-medium max-w-sm mx-auto mb-8">Save properties you love by clicking the heart icon while browsing.</p>
                      <Button onClick={() => navigate('/hotels')}>Explore Properties</Button>
                   </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-2xl font-serif font-bold text-text-base mb-6">Account Settings</h2>
                  <div className="bg-bg-surface rounded-2xl border border-border-base overflow-hidden shadow-sm">
                    <div className="flex justify-center p-8">
                       <UserProfile 
                        appearance={{
                          elements: {
                            card: 'shadow-none border-0 bg-transparent',
                            navbar: 'hidden',
                            pageScrollBox: 'p-0',
                            headerTitle: 'text-2xl font-serif font-bold text-text-base',
                            headerSubtitle: 'text-text-muted font-medium',
                            formButtonPrimary: 'bg-primary hover:bg-primary-600 text-white font-bold',
                            formFieldInput: 'bg-bg-surface-hover border-border-base hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-primary',
                            formFieldLabel: 'text-sm font-bold text-text-base',
                            profileSectionTitleText: 'text-lg font-bold text-text-base border-b border-border-base pb-2 mb-4',
                            profileSectionContent: 'mt-4',
                            dividerLine: 'bg-border-base',
                            badge: 'bg-secondary/10 text-secondary border border-secondary/20',
                          }
                        }}
                       />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
