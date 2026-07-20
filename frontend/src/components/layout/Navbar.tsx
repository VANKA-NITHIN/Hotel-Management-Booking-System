import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Heart, LayoutDashboard, Search, ChevronDown, Building, MapPin, Star } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/clerk-react';
import { useUnreadNotificationCount, useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/useApi';
import ThemeToggle from '../ui/ThemeToggle';
import { CurrencySelector } from '../ui/CurrencySelector';
import { Drawer } from '../ui/Drawer';
import { NotificationPanel, type NotificationItem } from '../ui/NotificationPanel';

const destinations = [
  { name: 'New York', count: 124 },
  { name: 'Paris', count: 86 },
  { name: 'Dubai', count: 52 },
  { name: 'Tokyo', count: 94 },
];

const hotelTypes = [
  { name: 'Luxury Resorts', icon: Star },
  { name: 'Boutique Hotels', icon: Building },
  { name: 'City Center', icon: MapPin },
];

// Removed mock notifications

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  
  // Only fetch notification count when user is signed in to avoid 403 errors
  const { data: unreadData } = useUnreadNotificationCount(isSignedIn);
  const apiUnreadCount = (unreadData?.data as any)?.count || 0;
  
  const { data: notificationsData } = useNotifications(0, 20, !!isSignedIn);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  const notifications: NotificationItem[] = (notificationsData?.data?.content || []).map((n: any) => ({
    id: n.id.toString(),
    title: n.title,
    message: n.message,
    isRead: n.read,
    time: new Date(n.createdAt).toLocaleDateString(), // Format appropriately based on your needs
    type: n.type?.toLowerCase() || 'info'
  }));

  const isLanding = location.pathname === '/';

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => { 
    setMobileOpen(false); 
    setShowMegaMenu(false);
    setShowNotifications(false);
  }, [location.pathname]);

  const showTransparent = isLanding && !scrolled;
  const navBg = showTransparent ? 'navbar-transparent' : 'navbar-solid';
  const textColor = showTransparent ? 'text-white/90 hover:text-white' : 'text-text-base hover:text-primary';
  const logoColor = showTransparent ? 'text-white' : 'text-primary';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 ${navBg}`}>
        <div className="container-section">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/favicon.svg" alt="LuxuryStay" className="w-8 h-8 rounded-lg" />
              <span className={`text-lg font-serif font-bold tracking-tight ${logoColor} transition-colors`}>
                LuxuryStay
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              <div 
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <Link
                  to="/hotels"
                  className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === '/hotels' ? 'bg-secondary/10 text-secondary font-semibold' : textColor
                  }`}
                >
                  Hotels <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMegaMenu ? 'rotate-180' : ''}`} />
                </Link>

                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-bg-surface border border-border-base rounded-xl shadow-dropdown z-50 overflow-hidden flex"
                    >
                      <div className="flex-1 p-6 border-r border-border-base bg-bg-surface-hover/30">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Top Destinations</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          {destinations.map(dest => (
                            <Link key={dest.name} to={`/hotels?dest=${dest.name.toLowerCase()}`} className="group flex items-center justify-between">
                              <span className="text-sm font-medium text-text-base group-hover:text-primary transition-colors">{dest.name}</span>
                              <span className="text-xs text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">{dest.count}</span>
                            </Link>
                          ))}
                        </div>
                        <Link to="/hotels" className="inline-block mt-5 text-sm font-semibold text-secondary hover:underline underline-offset-2">
                          Explore all destinations →
                        </Link>
                      </div>
                      <div className="w-64 p-6 bg-bg-surface">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Curated Collections</h4>
                        <div className="space-y-4">
                          {hotelTypes.map(type => (
                            <Link key={type.name} to={`/hotels?type=${type.name.toLowerCase()}`} className="flex items-start gap-3 group">
                              <div className="p-2 rounded-lg bg-bg-surface-hover group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                <type.icon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                              </div>
                              <div>
                                <span className="block text-sm font-medium text-text-base group-hover:text-primary transition-colors">{type.name}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/about"
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/about' ? 'bg-secondary/10 text-secondary font-semibold' : textColor
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/contact' ? 'bg-secondary/10 text-secondary font-semibold' : textColor
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button className={`p-2 rounded-lg transition-colors ${textColor}`} aria-label="Search">
                <Search className="w-[18px] h-[18px]" />
              </button>
              
              <div className="w-px h-5 bg-border-base mx-1" />

              <ThemeToggle />
              <CurrencySelector />

              {isSignedIn ? (
                <>
                  <Link
                    to="/wishlist"
                    className={`p-2 rounded-lg transition-colors ${textColor}`}
                    aria-label="Wishlist"
                  >
                    <Heart className="w-[18px] h-[18px]" />
                  </Link>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`p-2 rounded-lg transition-colors relative ${textColor} ${showNotifications ? 'bg-bg-surface-active' : ''}`}
                      aria-label="Notifications"
                    >
                      <Bell className="w-[18px] h-[18px]" />
                      {(notifications.filter(n => !n.isRead).length > 0 || apiUnreadCount > 0) && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {showNotifications && (
                        <NotificationPanel
                          notifications={notifications}
                          onMarkAsRead={(id) => markAsReadMutation.mutate(Number(id))}
                          onMarkAllAsRead={() => markAllAsReadMutation.mutate()}
                          onClearAll={() => {}}
                          onClose={() => setShowNotifications(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/dashboard"
                    className={`p-2 rounded-lg transition-colors ${textColor}`}
                    aria-label="Dashboard"
                  >
                    <LayoutDashboard className="w-[18px] h-[18px]" />
                  </Link>
                  <div className="ml-2 pl-2 border-l border-border-base">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: 'w-8 h-8 rounded-lg',
                          userButtonPopoverCard: 'shadow-dropdown border border-border-base rounded-xl',
                        },
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border-base">
                  <SignInButton mode="redirect">
                    <button className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${textColor}`}>
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="redirect">
                    <button className="btn-primary py-2 px-4 shadow-none">
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(true)}
                className={`p-2 rounded-lg transition-colors ${textColor}`}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        position="right"
        size="sm"
        title="Menu"
        className="lg:hidden"
        footer={
          isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-10 h-10 rounded-lg' } }} />
              <div>
                <p className="text-sm font-bold text-text-base">My Account</p>
                <p className="text-xs text-text-muted">Manage settings</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <SignInButton mode="redirect">
                <button className="btn-outline w-full justify-center">Log in</button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="btn-primary w-full justify-center">Sign up</button>
              </SignUpButton>
            </div>
          )
        }
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Navigation</h4>
            <div className="space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/hotels', label: 'All Hotels' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-text-base hover:bg-bg-surface-hover'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {isSignedIn && (
            <div>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">My LuxuryStay</h4>
              <div className="space-y-1">
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-base hover:bg-bg-surface-hover">
                  <LayoutDashboard className="w-4 h-4 text-text-muted" /> Dashboard
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-base hover:bg-bg-surface-hover">
                  <Heart className="w-4 h-4 text-text-muted" /> Wishlist
                </Link>
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-base hover:bg-bg-surface-hover">
                  <Bell className="w-4 h-4 text-text-muted" /> Notifications
                  {(notifications.filter(n => !n.isRead).length > 0 || apiUnreadCount > 0) && (
                    <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
