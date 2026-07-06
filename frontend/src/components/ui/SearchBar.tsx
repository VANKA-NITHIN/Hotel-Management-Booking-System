import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchBar({ variant = 'hero' }: { variant?: 'hero' | 'compact' }) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set('city', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', guests.toString());
    navigate(`/hotels?${params.toString()}`);
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-0">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-transparent outline-none text-xs sm:text-sm flex-1 min-w-0"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-transparent outline-none text-xs sm:text-sm min-w-0 w-full"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl min-w-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="bg-transparent outline-none text-xs sm:text-sm min-w-0 w-full"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
          <span className="text-xs sm:text-sm whitespace-nowrap">{guests} Guests</span>
        </div>
        <button onClick={handleSearch} className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm px-4 sm:px-6 py-2 shrink-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" /> Search
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Destination */}
        <div className="sm:col-span-2 md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Destination</label>
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-gray-200 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
            <input
              type="text"
              placeholder="City or Hotel Name"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-400 text-sm sm:text-base min-w-0"
            />
          </div>
        </div>

        {/* Check-in */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Check-in</label>
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-gray-200 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="bg-transparent outline-none text-gray-800 text-sm sm:text-base min-w-0 w-full"
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Check-out</label>
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-gray-200 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              className="bg-transparent outline-none text-gray-800 text-sm sm:text-base min-w-0 w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mt-4">
        {/* Guests */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Guests</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Decrease guests"
            >
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(10, guests + 1))}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Increase guests"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        <button onClick={handleSearch} className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" /> Search
        </button>
      </div>
    </motion.div>
  );
}
