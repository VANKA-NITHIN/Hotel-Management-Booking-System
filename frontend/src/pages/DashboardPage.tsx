import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, UserProfile } from '@clerk/clerk-react';
import { Calendar, User, Heart, Settings, LayoutDashboard, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useWishlist, useMyBookings } from '../hooks/useApi';
import { usePersistentState } from '../hooks/usePersistentState';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge, statusBadge } from '../components/ui/Badge';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'My Trips', icon: Calendar },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'account', label: 'Account', icon: User },
];

export default function DashboardPage() {
  usePageTitle('My Dashboard');
  const [activeTab, setActiveTab] = usePersistentState('dashboard_active_tab', 'overview');
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: bookingsData, isLoading } = useMyBookings();
  const bookings = bookingsData?.data?.content || [];

  const upcomingBookings = bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING');

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="container-section">
        {/* Header Profile Summary */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-serif font-bold text-gray-400 bg-gray-100">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.firstName || 'Guest'}
            </h1>
            <p className="text-gray-500 mb-4">{user?.primaryEmailAddress?.emailAddress}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="bg-secondary/10 px-4 py-2 rounded-lg">
                <p className="text-xs font-medium text-secondary-dark uppercase tracking-wider mb-0.5">Loyalty Points</p>
                <p className="text-xl font-bold text-secondary">2,450</p>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Total Trips</p>
                <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex gap-2">
             <Link to="/hotels" className="btn-primary">Book a stay</Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm sticky top-24">
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Trips</h2>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-40 animate-pulse-soft"></div>
                      ))}
                    </div>
                  ) : upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking: any) => (
                        <div key={booking.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:border-gray-200 transition-colors">
                          <div className="w-full md:w-48 h-32 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                             <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop" alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge {...statusBadge(booking.status)} className="mb-2">{booking.status}</Badge>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">Luxury Resort & Spa</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" /> Paris, France</p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-gray-900">${booking.totalAmount.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 block">Total</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                               <div>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check-in</p>
                                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {booking.checkInDate}</p>
                               </div>
                               <div>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check-out</p>
                                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {booking.checkOutDate}</p>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No upcoming trips</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">You don't have any upcoming reservations. Ready to plan your next getaway?</p>
                      <Link to="/hotels" className="btn-primary">Explore Hotels</Link>
                    </div>
                  )}

                  <h2 className="text-xl font-bold text-gray-900 mb-6 mt-12">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/settings" className="bg-white p-5 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow group">
                      <Settings className="w-6 h-6 text-gray-400 mx-auto mb-3 group-hover:text-secondary transition-colors" />
                      <span className="text-sm font-medium text-gray-900">Preferences</span>
                    </Link>
                    <Link to="/help" className="bg-white p-5 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow group">
                      <Search className="w-6 h-6 text-gray-400 mx-auto mb-3 group-hover:text-secondary transition-colors" />
                      <span className="text-sm font-medium text-gray-900">Help Center</span>
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Booking History</h2>
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking: any) => (
                        <div key={booking.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-gray-900">Booking #{booking.bookingReference}</span>
                              <Badge {...statusBadge(booking.status)}>{booking.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{booking.checkInDate} to {booking.checkOutDate} • {booking.guestCount} guests</p>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-gray-900">${booking.totalAmount.toLocaleString()}</p>
                             <button className="text-sm text-secondary hover:underline mt-1">View Details</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <p className="text-gray-500">No booking history found.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'saved' && (
                <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                   <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Saved Properties</h2>
                    <Link to="/wishlist" className="text-sm font-medium text-secondary hover:underline">View all</Link>
                   </div>
                   <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is ready</h3>
                      <p className="text-gray-500 max-w-sm mx-auto">Save properties you love by clicking the heart icon while browsing.</p>
                   </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="flex justify-center p-6">
                       <UserProfile 
                        appearance={{
                          elements: {
                            card: 'shadow-none border-0',
                            navbar: 'hidden',
                            pageScrollBox: 'p-0',
                            headerTitle: 'text-2xl font-serif font-bold text-gray-900',
                            headerSubtitle: 'text-gray-500',
                            formButtonPrimary: 'bg-secondary hover:bg-secondary-light text-primary font-semibold',
                            formFieldInput: 'border-gray-200 focus:ring-secondary focus:border-secondary',
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
