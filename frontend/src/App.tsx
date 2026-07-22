import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider, useAuth as useClerkAuth, SignIn, SignUp } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { useRealtimeEvents } from './hooks/useRealtimeEvents';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AIChat from './components/ui/AIChat';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { OptimizedImage } from './components/ui/Image';

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const HotelsPage = lazy(() => import('./pages/HotelsPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient animate-pulse flex items-center justify-center">
          <span className="text-2xl font-serif font-bold text-white">L</span>
        </div>
        <p className="text-text-muted font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useClerkAuth();
  if (!isLoaded) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
}

// RBAC Guards
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();
  if (!isLoaded || isLoading) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (user?.role !== 'ROLE_ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();
  if (!isLoaded || isLoading) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (user?.role !== 'ROLE_MANAGER') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isSignedIn, isLoaded } = useClerkAuth();
  if (!isLoaded || isLoading) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (!['ROLE_STAFF', 'ROLE_RECEPTION', 'ROLE_HOUSEKEEPING'].includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <AIChat />
    </>
  );
}

function RealtimeManager() {
  useRealtimeEvents();
  return null;
}

function ClerkLoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <OptimizedImage src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=1600&fit=crop" alt="Luxury Hotel" className="w-full h-full object-cover" priority={true} />
        <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-serif font-bold mb-4">Welcome Back to Luxury</h1>
            <p className="text-neutral-300 text-lg">Sign in to access your exclusive benefits, manage bookings, and discover extraordinary stays.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-bg-surface">
        <div className="w-full max-w-md">
          <a href="/" className="flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="LuxuryStay Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <span className="text-xl font-serif font-bold text-primary">LuxuryStay</span>
          </a>
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" redirectUrl="/dashboard" appearance={{ elements: { formButtonPrimary: 'bg-secondary hover:bg-secondary-light text-primary font-semibold', card: 'shadow-none border border-border-base' } }} />
        </div>
      </div>
    </div>
  );
}

function ClerkRegisterPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <OptimizedImage src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=1600&fit=crop" alt="Luxury Resort" className="w-full h-full object-cover" priority={true} />
        <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-md">
            <h1 className="text-4xl font-serif font-bold mb-4">Join LuxuryStay</h1>
            <p className="text-neutral-300 text-lg">Create your account and unlock exclusive member benefits, earn loyalty points, and access premium deals.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-bg-surface">
        <div className="w-full max-w-md">
          <a href="/" className="flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="LuxuryStay Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <span className="text-xl font-serif font-bold text-primary">LuxuryStay</span>
          </a>
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" redirectUrl="/dashboard" appearance={{ elements: { formButtonPrimary: 'bg-secondary hover:bg-secondary-light text-primary font-semibold', card: 'shadow-none border border-border-base' } }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <LanguageProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <AuthProvider>
              <NotificationProvider>
                <QueryClientProvider client={queryClient}>
                  <WebSocketProvider>
                    <BrowserRouter>
                      <RealtimeManager />
                      <ErrorBoundary>
                        <Suspense fallback={<PageLoader />}>
                        <Routes>
                          {/* ... */}
                          {/* Clerk auth routes */}
                          <Route path="/sign-in/*" element={<ClerkLoginPage />} />
                          <Route path="/sign-up/*" element={<ClerkRegisterPage />} />
                          <Route path="/login" element={<ClerkLoginPage />} />
                          <Route path="/register" element={<ClerkRegisterPage />} />
  
                          {/* Public routes */}
                          <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
                          <Route path="/hotels" element={<AppLayout><HotelsPage /></AppLayout>} />
                          <Route path="/hotels/:id" element={<AppLayout><HotelDetailPage /></AppLayout>} />
                          <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
                          <Route path="/contact" element={<AppLayout><ContactPage /></AppLayout>} />
                          <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />
                          <Route path="/privacy" element={<AppLayout><PrivacyPolicyPage /></AppLayout>} />
                          <Route path="/help" element={<AppLayout><HelpCenterPage /></AppLayout>} />
  
                          {/* Protected routes */}
                          <Route path="/booking" element={<ProtectedRoute><AppLayout><BookingPage /></AppLayout></ProtectedRoute>} />
                          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
                          <Route path="/wishlist" element={<ProtectedRoute><AppLayout><WishlistPage /></AppLayout></ProtectedRoute>} />
                          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
                          <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
  
                          {/* Role-Based Dashboards */}
                          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                          <Route path="/owner" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
                          <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
  
                          {/* 404 */}
                          <Route path="*" element={<AppLayout><NotFoundPage /></AppLayout>} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                    <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '16px', fontSize: '14px' } }} />
                  </BrowserRouter>
                  </WebSocketProvider>
                </QueryClientProvider>
              </NotificationProvider>
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}
