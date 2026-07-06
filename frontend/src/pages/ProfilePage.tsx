import { UserProfile } from '@clerk/clerk-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function ProfilePage() {
  usePageTitle('My Profile');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container-section max-w-4xl">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Account Settings</h1>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex justify-center py-6">
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
                badge: 'text-secondary bg-secondary/10',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
