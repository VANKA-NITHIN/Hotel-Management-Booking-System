import { UserProfile } from '@clerk/clerk-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { User, Shield, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  usePageTitle('My Profile');

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-28 pb-32 lg:pb-16">
      <div className="container-section max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-text-base">Account Settings</h1>
          <p className="text-text-muted mt-2 font-medium">Manage your personal information and security preferences.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Links Sidebar */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 space-y-4">
            <div className="bg-bg-surface rounded-2xl border border-border-base p-6 shadow-sm">
              <h3 className="font-bold text-text-base mb-4 uppercase tracking-wider text-xs">Quick Links</h3>
              <nav className="space-y-2">
                <a href="#profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20 transition-all">
                  <User className="w-4 h-4" /> Personal Info
                </a>
                <a href="#security" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-bg-surface-hover hover:text-text-base font-bold transition-all">
                  <Shield className="w-4 h-4" /> Security
                </a>
                <a href="#passwords" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-bg-surface-hover hover:text-text-base font-bold transition-all">
                  <Key className="w-4 h-4" /> Passwords
                </a>
              </nav>
            </div>
            
            <div className="bg-secondary/10 rounded-2xl border border-secondary/20 p-6 shadow-sm">
              <h3 className="font-bold text-secondary-dark mb-2">LuxuryStay Premium</h3>
              <p className="text-sm font-medium text-secondary-dark/80 mb-4">You are currently enjoying Gold Tier benefits.</p>
              <div className="w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full w-[70%] rounded-full"></div>
              </div>
              <p className="text-xs font-bold text-secondary-dark mt-2 text-end">7,500 / 10,000 pts</p>
            </div>
          </motion.div>

          {/* Main Clerk Profile Area */}
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 bg-bg-surface rounded-3xl border border-border-base shadow-sm overflow-hidden flex justify-center p-8">
            <UserProfile 
              appearance={{
                elements: {
                  card: 'shadow-none border-0 bg-transparent w-full',
                  navbar: 'hidden',
                  pageScrollBox: 'p-0 w-full',
                  headerTitle: 'text-2xl font-serif font-bold text-text-base',
                  headerSubtitle: 'text-text-muted font-medium',
                  formButtonPrimary: 'bg-primary hover:bg-primary-600 text-white font-bold px-6 py-2 rounded-xl transition-all',
                  formFieldInput: 'bg-bg-surface-hover border-border-base hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-base font-medium transition-all',
                  formFieldLabel: 'text-sm font-bold text-text-base mb-1.5',
                  profileSectionTitleText: 'text-lg font-bold text-text-base border-b border-border-base pb-3 mb-5 mt-2',
                  profileSectionContent: 'mt-6',
                  dividerLine: 'bg-border-base',
                  badge: 'bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-md border border-secondary/20',
                  userButtonPopoverCard: 'bg-bg-surface border border-border-base shadow-xl rounded-2xl',
                  userButtonPopoverActionButton: 'text-text-base hover:bg-bg-surface-hover font-medium rounded-lg',
                  userButtonPopoverActionButtonText: 'text-text-base font-medium',
                  userButtonPopoverFooter: 'hidden',
                  avatarBox: 'w-24 h-24 rounded-2xl shadow-inner border-4 border-bg-surface-hover',
                  profileSectionPrimaryButton: 'text-primary hover:text-primary-600 hover:bg-primary/5 font-bold rounded-lg transition-all',
                }
              }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
