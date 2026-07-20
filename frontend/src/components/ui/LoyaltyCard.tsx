import { motion } from 'framer-motion';
import { Award, ChevronRight, Crown, Gem, Star, TrendingUp } from 'lucide-react';

interface LoyaltyCardProps {
  points: number;
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  // Determine Tier
  let tier = 'Silver';
  let nextTier = 'Gold';
  let minPoints = 0;
  let nextPoints = 500;
  let colors = 'from-gray-300 to-gray-500 text-gray-800';
  let icon = <Star className="w-8 h-8 text-gray-600" />;

  if (points >= 5000) {
    tier = 'Diamond';
    nextTier = 'Max Tier';
    minPoints = 5000;
    nextPoints = 5000;
    colors = 'from-blue-400 via-purple-400 to-blue-600 text-white shadow-blue-500/50';
    icon = <Gem className="w-8 h-8 text-white" />;
  } else if (points >= 2000) {
    tier = 'Platinum';
    nextTier = 'Diamond';
    minPoints = 2000;
    nextPoints = 5000;
    colors = 'from-slate-600 to-slate-800 text-white shadow-slate-500/50';
    icon = <Award className="w-8 h-8 text-slate-200" />;
  } else if (points >= 500) {
    tier = 'Gold';
    nextTier = 'Platinum';
    minPoints = 500;
    nextPoints = 2000;
    colors = 'from-yellow-400 to-yellow-600 text-white shadow-yellow-500/50';
    icon = <Crown className="w-8 h-8 text-yellow-100" />;
  }

  const progress = points >= 5000 ? 100 : ((points - minPoints) / (nextPoints - minPoints)) * 100;
  const pointsNeeded = nextPoints - points;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 bg-linear-to-br ${colors} shadow-xl relative overflow-hidden`}
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64">
          <path fill="currentColor" d="M42.7,-73.4C55.9,-67.5,67.6,-56.9,76.5,-44.5C85.4,-32.1,91.5,-17.8,91.1,-3.8C90.7,10.2,83.9,23.8,74.7,35.7C65.5,47.6,54,57.7,40.8,63.9C27.6,70.1,13.8,72.4,-0.2,72.7C-14.2,73,-28.4,71.3,-41.4,65.1C-54.4,58.9,-66.2,48.2,-74.6,35.1C-83,22,-88.1,6.5,-87.3,-8.6C-86.5,-23.7,-79.8,-38.4,-70.2,-50.2C-60.6,-62,-48.1,-70.9,-34.7,-76.3C-21.3,-81.7,-7.1,-83.6,6.3,-79.3C19.7,-75,30,-67.2,42.7,-73.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm font-semibold opacity-80 uppercase tracking-widest mb-1">Loyalty Tier</p>
            <h2 className="text-3xl font-bold">{tier} Member</h2>
          </div>
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
            {icon}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm opacity-80 mb-1">Available Points</p>
              <p className="text-4xl font-bold flex items-center gap-2">
                {points.toLocaleString()}
                <TrendingUp className="w-5 h-5 opacity-70" />
              </p>
            </div>
            {tier !== 'Diamond' && (
              <p className="text-sm opacity-90 text-right">
                <span className="font-bold">{pointsNeeded.toLocaleString()}</span> pts to {nextTier}
              </p>
            )}
          </div>

          {tier !== 'Diamond' && (
            <div className="mt-4">
              <div className="w-full bg-black/20 rounded-full h-2.5 backdrop-blur-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-white h-2.5 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs opacity-70 font-medium">
                <span>{minPoints}</span>
                <span>{nextPoints}</span>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-sm font-semibold">View Benefits & Rewards</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
