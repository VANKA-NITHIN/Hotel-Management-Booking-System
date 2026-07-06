import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, Heart, LayoutDashboard } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/clerk-react';
import { useUnreadNotificationCount } from '../../hooks/useApi';
import ThemeToggle from '../ui/ThemeToggle';

const navLinks = [
  { to: '/hotels', label: 'Hotels' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = (unreadData?.data as any)?.count || 0;

  const isLanding = location.pathname === '/';

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const showTransparent = isLanding && !scrolled;
  const navBg = showTransparent ? 'navbar-transparent' : 'navbar-solid';
  const textColor = showTransparent ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const logoColor = showTransparent ? 'text-white' : 'text-primary';
  const accentColor = showTransparent ? 'text-secondary-light' : 'text-secondary';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 ${navBg}`}>
        <div className="container-section">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img src="/logo.png" alt="LuxuryStay Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
              <span className={`text-lg font-serif font-bold tracking-tight ${logoColor} transition-colors`}>
                LuxuryStay
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? accentColor + ' font-semibold'
                      : textColor
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />

              {isSignedIn ? (
                <>
                  <Link
                    to="/wishlist"
                    className={`p-2 rounded-lg transition-colors relative ${textColor}`}
                    aria-label="Wishlist"
                  >
                    <Heart className="w-[18px] h-[18px]" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`p-2 rounded-lg transition-colors relative ${textColor}`}
                    aria-label="Notifications"
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`p-2 rounded-lg transition-colors ${textColor}`}
                    aria-label="Dashboard"
                  >
                    <LayoutDashboard className="w-[18px] h-[18px]" />
                  </Link>
                  <div className="ml-1">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: 'w-8 h-8',
                          userButtonPopoverCard: 'shadow-dropdown border border-gray-100 rounded-xl',
                        },
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <SignInButton mode="redirect">
                    <button className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${textColor}`}>
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="redirect">
                    <button className="btn-primary btn-sm">
                      Get started
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${textColor}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden shadow-modal flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <img src="/logo.png" alt="LuxuryStay Logo" className="w-7 h-7 rounded-md object-cover shadow-sm" />
                  <span className="font-serif font-bold text-primary">LuxuryStay</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === link.to
                          ? 'bg-secondary/10 text-secondary'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {isSignedIn && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-1">
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                  </div>
                )}
              </nav>

              <div className="p-4 border-t border-gray-100">
                {isSignedIn ? (
                  <div className="flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
                    <span className="text-sm text-gray-500">My Account</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <SignInButton mode="redirect">
                      <button className="btn-outline flex-1">Sign in</button>
                    </SignInButton>
                    <SignUpButton mode="redirect">
                      <button className="btn-primary flex-1">Get started</button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
