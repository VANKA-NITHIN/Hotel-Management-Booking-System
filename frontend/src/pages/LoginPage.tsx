import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=1600&fit=crop"
          alt="Luxury Hotel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-md"
          >
            <h1 className="text-4xl font-serif font-bold mb-4">Welcome Back to Luxury</h1>
            <p className="text-gray-300 text-lg">Sign in to access your exclusive benefits, manage bookings, and discover extraordinary stays.</p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Clerk SignIn */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-serif font-bold text-primary">LuxuryStay</span>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to access your account</p>

          {/* Clerk SignIn component */}
          <div className="flex justify-center">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl="/"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-secondary hover:bg-secondary-light text-primary font-semibold',
                  card: 'shadow-none border border-gray-100',
                  headerTitle: 'text-gray-900',
                  headerSubtitle: 'text-gray-500',
                  socialButtonsBlockButton: 'border border-gray-200 text-gray-700',
                  formFieldInput: 'border-gray-200 focus:ring-secondary focus:border-secondary',
                  footerActionLink: 'text-secondary hover:text-secondary-dark',
                },
              }}
            />
          </div>

          <div className="mt-6 text-center hidden">
            {/* The sign up link is handled by Clerk's footerActionLink now */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
