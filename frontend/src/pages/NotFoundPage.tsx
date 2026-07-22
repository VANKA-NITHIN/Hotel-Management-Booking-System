import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchX, Home, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-surface-hover flex flex-col items-center justify-center p-4 relative overflow-hidden pt-[72px]">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-xl w-full text-center relative z-10 bg-bg-surface p-12 sm:p-16 rounded-3xl border border-border-base shadow-2xl"
      >
        <div className="w-28 h-28 bg-bg-surface-active rounded-3xl flex items-center justify-center mx-auto mb-10 rotate-12 shadow-sm border border-border-base">
          <SearchX className="w-12 h-12 text-text-muted -rotate-12" />
        </div>
        
        <h1 className="text-8xl font-serif font-bold text-transparent bg-clip-text gold-gradient mb-6 tracking-tight">404</h1>
        <h2 className="text-3xl font-serif font-bold text-text-base mb-4">Destination Not Found</h2>
        <p className="text-text-muted text-lg font-medium mb-10 max-w-md mx-auto leading-relaxed">
          The property or page you are looking for seems to have drifted off the map. Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/')} icon={<Home className="w-5 h-5" />}>
            Back to Home
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/hotels')} icon={<Building2 className="w-5 h-5" />}>
            Browse Hotels
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
