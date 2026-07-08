
import { Bell, Shield, Moon, Trash2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api';
import { useUpdatePreferences } from '../hooks/useApi';
import { toast } from '../components/ui/Toast';

export default function SettingsPage() {
  usePageTitle('Settings');
  const { theme, setTheme } = useTheme();

  const { data: userResponse } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe
  });
  
  const user = userResponse?.data;
  const updatePreferences = useUpdatePreferences();

  const handleToggle = (key: 'emailBookings' | 'emailPromotions' | 'pushBookings' | 'pushPromotions') => {
    if (!user) return;
    
    const newPreferences = {
      emailBookings: user.emailBookings ?? true,
      emailPromotions: user.emailPromotions ?? false,
      pushBookings: user.pushBookings ?? true,
      pushPromotions: user.pushPromotions ?? true,
      [key]: !(user[key] ?? false)
    };

    updatePreferences.mutate(newPreferences, {
      onSuccess: () => {
        toast.success('Preferences updated successfully');
      },
      onError: () => {
        toast.error('Failed to update preferences');
      }
    });
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-surface ${checked ? 'bg-primary' : 'bg-bg-surface-active'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-28 pb-16">
      <div className="container-section max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-base">Preferences</h1>
          <p className="text-text-muted mt-2 font-medium">Manage your app appearance and notification settings.</p>
        </motion.div>

        <div className="space-y-8">
          {/* Appearance */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-bg-surface rounded-2xl border border-border-base p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-base">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-text-base">Appearance</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light Mode' },
                { id: 'dark', label: 'Dark Mode' },
                { id: 'system', label: 'System Theme' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    theme === t.id
                      ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm'
                      : 'border-border-base text-text-muted hover:border-border-strong hover:bg-bg-surface-hover'
                  }`}
                >
                  <span className="font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Notifications */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-bg-surface rounded-2xl border border-border-base p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-base">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-text-base">Notifications</h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-6 block">Email Notifications</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-text-base">Booking Updates</p>
                      <p className="text-sm font-medium text-text-muted mt-1">Confirmations, cancellations, and reminders</p>
                    </div>
                    <Toggle checked={user?.emailBookings ?? true} onChange={() => handleToggle('emailBookings')} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-text-base">Promotions & Offers</p>
                      <p className="text-sm font-medium text-text-muted mt-1">Exclusive deals and personalized recommendations</p>
                    </div>
                    <Toggle checked={user?.emailPromotions ?? false} onChange={() => handleToggle('emailPromotions')} />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-bg-surface rounded-2xl border border-danger/20 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-base relative z-10">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-danger" />
              </div>
              <h2 className="text-xl font-bold text-text-base">Danger Zone</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div>
                <p className="font-bold text-text-base">Delete Account</p>
                <p className="text-sm font-medium text-text-muted mt-1 max-w-md">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
                Delete Account
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
