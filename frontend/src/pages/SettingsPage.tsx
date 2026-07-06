import { useState } from 'react';

import { Bell, Shield, Moon, Trash2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  usePageTitle('Settings');
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailPromotions: false,
    pushBookings: true,
    pushPromotions: true,
  });

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 ${checked ? 'bg-secondary' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container-section max-w-4xl">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Preferences</h1>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <Moon className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light' },
                { id: 'dark', label: 'Dark' },
                { id: 'system', label: 'System' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    theme === t.id
                      ? 'border-secondary bg-secondary/5 text-secondary ring-1 ring-secondary'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <Bell className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Booking Updates</p>
                      <p className="text-sm text-gray-500">Confirmations, cancellations, and reminders</p>
                    </div>
                    <Toggle checked={notifications.emailBookings} onChange={() => setNotifications(p => ({ ...p, emailBookings: !p.emailBookings }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Promotions & Offers</p>
                      <p className="text-sm text-gray-500">Exclusive deals and personalized recommendations</p>
                    </div>
                    <Toggle checked={notifications.emailPromotions} onChange={() => setNotifications(p => ({ ...p, emailPromotions: !p.emailPromotions }))} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-white rounded-2xl border border-danger/20 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <Shield className="w-5 h-5 text-danger" />
              <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-500 max-w-md">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <button className="btn-danger whitespace-nowrap">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
