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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['nav', 'common']);
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
      <header className={`fixed top-0 start-0 end-0 z-40 ${navBg}`}>
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
                  {t('hotels', { ns: 'nav' })} <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMegaMenu ? 'rotate-180' : ''}`} />
                </Link>

                <AnimatePresence>
                  {showMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full start-1/2 -translate-x-1/2 mt-2 w-[600px] bg-bg-surface border border-border-base rounded-xl shadow-dropdown z-50 overflow-hidden flex"
                    >
                      <div className="flex-1 p-6 border-e border-border-base bg-bg-surface-hover/30">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">{t('topDestinations', { ns: 'nav' })}</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          {destinations.map(dest => (
                            <Link key={dest.name} to={`/hotels?dest=${dest.name.toLowerCase()}`} className="group flex items-center justify-between">
                              <span className="text-sm font-medium text-text-base group-hover:text-primary transition-colors">{dest.name}</span>
                              <span className="text-xs text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">{dest.count}</span>
                            </Link>
                          ))}
                        </div>
                        <Link to="/hotels" className="inline-block mt-5 text-sm font-semibold text-secondary hover:underline underline-offset-2">
                          {t('exploreAllDestinations', { ns: 'nav' })} →
                        </Link>
                      </div>
                      <div className="w-64 p-6 bg-bg-surface">
                        <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">{t('curatedCollections', { ns: 'nav' })}</h4>
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
                {t('about', { ns: 'nav' })}
              </Link>
              <Link
                to="/contact"
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/contact' ? 'bg-secondary/10 text-secondary font-semibold' : textColor
                }`}
              >
                {t('contact', { ns: 'nav' })}
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors ${textColor}`} aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              
              <div className="w-px h-5 bg-border-base mx-1" />

              <ThemeToggle />
              <CurrencySelector />

              {isSignedIn ? (
                <>
                  <Link
                    to="/wishlist"
                    className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors ${textColor}`}
                    aria-label="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors relative ${textColor} ${showNotifications ? 'bg-bg-surface-active' : ''}`}
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {(notifications.filter(n => !n.isRead).length > 0 || apiUnreadCount > 0) && (
                        <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-danger rounded-full" />
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
                    className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors ${textColor}`}
                    aria-label="Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  <div className="ms-2 ps-2 border-s border-border-base">
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
                <div className="flex items-center gap-2 ms-2 ps-2 border-s border-border-base">
                  <SignInButton mode="redirect">
                    <button className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${textColor}`}>
                      {t('logIn', { ns: 'nav' })}
                    </button>
                  </SignInButton>
                  <SignUpButton mode="redirect">
                    <button className="btn-primary py-2 px-4 shadow-none">
                      {t('signUp', { ns: 'nav' })}
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
                className={`flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors ${textColor}`}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
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
        title={t('menu', { ns: 'nav' })}
        className="lg:hidden"
        footer={
          isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-10 h-10 rounded-lg' } }} />
              <div>
                <p className="text-sm font-bold text-text-base">{t('myAccount', { ns: 'nav' })}</p>
                <p className="text-xs text-text-muted">{t('manageSettings', { ns: 'nav' })}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <SignInButton mode="redirect">
                <button className="btn-outline w-full justify-center">{t('logIn', { ns: 'nav' })}</button>
              </SignInButton>
              <SignUpButton mode="redirect">
                <button className="btn-primary w-full justify-center">{t('signUp', { ns: 'nav' })}</button>
              </SignUpButton>
            </div>
          )
        }
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{t('navigation', { ns: 'nav' })}</h4>
            <div className="space-y-1">
              {[
                { to: '/', label: t('home', { ns: 'common' }) },
                { to: '/hotels', label: t('hotels', { ns: 'nav' }) },
                { to: '/about', label: t('about', { ns: 'nav' }) },
                { to: '/contact', label: t('contact', { ns: 'nav' }) },
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
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{t('myLuxuryStay', { ns: 'nav' })}</h4>
              <div className="space-y-1">
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-base hover:bg-bg-surface-hover">
                  <LayoutDashboard className="w-4 h-4 text-text-muted" /> {t('dashboard', { ns: 'nav' })}
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-base hover:bg-bg-surface-hover">
                  <Heart className="w-4 h-4 text-text-muted" /> {t('wishlist', { ns: 'nav' })}
                </Link>
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-base hover:bg-bg-surface-hover">
                  <Bell className="w-4 h-4 text-text-muted" /> {t('notifications', { ns: 'nav' })}
                  {(notifications.filter(n => !n.isRead).length > 0 || apiUnreadCount > 0) && (
                    <span className="ms-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{t('new', { ns: 'nav' })}</span>
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
