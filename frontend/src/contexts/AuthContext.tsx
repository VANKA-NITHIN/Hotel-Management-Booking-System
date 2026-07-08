/**
 * Auth Bridge Context
 * Bridges Clerk authentication with the rest of the application.
 * Provides a simple useAuth() hook compatible with existing component code.
 */
import { createContext, useContext, useEffect, useMemo } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { setAuthTokenGetter } from '@/api/client';
import api from '@/api/client';
import type { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();

  // Connect Clerk's getToken to the API client
  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  // Map Clerk user to our User type (memoized to prevent unnecessary re-renders)
  const user: User | null = useMemo(() => {
    if (!clerkUser) return null;
    return {
      id: Number(clerkUser.id.replace(/[^0-9]/g, '').slice(0, 10)) || 0,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
      profileImage: clerkUser.imageUrl || undefined,
      role: (clerkUser.publicMetadata?.role as string) || 'ROLE_CUSTOMER',
      enabled: true,
      emailVerified: clerkUser.emailAddresses?.some(e => e.verification?.status === 'verified') || false,
      loyaltyPoints: (clerkUser.publicMetadata?.loyaltyPoints as number) || 0,
      createdAt: clerkUser.createdAt?.toISOString(),
    };
  }, [clerkUser]);

  // Sync with backend
  useEffect(() => {
    if (isSignedIn && user) {
      api.post('/auth/sync', user).catch((err) => {
        console.error('Failed to sync user with backend:', err);
      });
    }
  }, [isSignedIn, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !isLoaded,
        isAuthenticated: isSignedIn || false,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
