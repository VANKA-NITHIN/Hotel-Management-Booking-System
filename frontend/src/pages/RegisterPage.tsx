import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignUp } from '@clerk/clerk-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-bg-surface">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=1600&fit=crop"
          alt="Luxury Resort"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary/90 to-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-lg"
          >
            <h1 className="text-5xl font-serif font-bold mb-6 leading-tight">Join LuxuryStay</h1>
            <p className="text-white/80 text-xl font-medium leading-relaxed">Create your account and unlock exclusive member benefits, earn loyalty points, and access premium deals worldwide.</p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Clerk SignUp */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-bg-surface relative overflow-y-auto min-h-screen">
         <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

         <div className="w-full max-w-md mx-auto relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
              <span className="text-secondary font-serif font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-serif font-bold text-text-base">LuxuryStay</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-serif font-bold text-text-base mb-3">Create Account</h2>
            <p className="text-text-muted font-medium mb-8">Start your luxury journey with us</p>

            {/* Clerk SignUp component */}
            <div className="flex justify-center w-full">
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                redirectUrl="/"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none border border-border-base bg-bg-surface-hover rounded-3xl w-full p-2',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    formButtonPrimary: 'bg-primary hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-all shadow-md',
                    socialButtonsBlockButton: 'border border-border-base bg-bg-surface hover:bg-bg-surface-hover text-text-base font-bold rounded-xl py-3 transition-colors',
                    socialButtonsBlockButtonText: 'font-bold',
                    formFieldInput: 'bg-bg-surface border-border-base hover:border-border-strong focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-text-base font-medium py-3 transition-all',
                    formFieldLabel: 'text-sm font-bold text-text-base mb-1.5',
                    footerActionLink: 'text-primary hover:text-primary-600 font-bold',
                    dividerLine: 'bg-border-strong',
                    dividerText: 'text-text-muted font-bold',
                    identityPreviewText: 'text-text-base font-medium',
                    identityPreviewEditButton: 'text-primary hover:text-primary-600 font-bold',
                  },
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
