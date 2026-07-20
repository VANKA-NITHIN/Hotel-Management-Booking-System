import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, Star, X, ChevronDown, Map as MapIcon, Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchHotels } from '../hooks/useApi';
import HotelCard from '../components/ui/HotelCard';
import { HotelMap } from '../components/ui/HotelMap';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Hotel } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const starOptions = [5, 4, 3, 2, 1];
const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

const AMENITIES_LIST = ['Swimming Pool', 'Spa', 'Gym', 'Free WiFi', 'Parking', 'Restaurant'];

export default function HotelsPage() {
  usePageTitle('Hotels');

  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useSearchHotels({
    city: city || undefined,
    minPrice, maxPrice, minRating,
    sort, page, size: 12,
  });

  const fetchedHotels = data?.data?.content || [];
  
  // Smart local filtering for amenities
  const hotels = fetchedHotels.filter((hotel: Hotel) => {
    if (selectedAmenities.length === 0) return true;
    return selectedAmenities.every(amenity => hotel.amenities?.some(a => a.name === amenity));
  });

  const [isListening, setIsListening] = useState(false);

  const totalPages = data?.data?.totalPages || 0;
  const totalElements = hotels.length;

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening...', { icon: '🎙️', duration: 2000 });
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearch(speechResult);
      // Trigger search automatically after a short delay so state updates
      setTimeout(() => {
        setPage(0);
      }, 100);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast.error('Could not hear you properly. Please try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(search);
    setPage(0);
  };

  const clearFilters = () => {
    setSearch(''); setCity(''); setMinPrice(undefined);
    setMaxPrice(undefined); setMinRating(undefined);
    setSelectedAmenities([]);
    setSort('rating'); setPage(0);
  };

  const hasActiveFilters = !!(city || minPrice || maxPrice || minRating || selectedAmenities.length > 0);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-bg-surface-hover pt-[72px]">
      {/* Header & Controls */}
      <div className="bg-bg-surface border-b border-border-base sticky top-[72px] z-30 shadow-sm">
        <div className="container-section py-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-text-base">Explore Properties</h1>
              <p className="text-sm text-text-muted mt-1">
                {isLoading ? 'Searching...' : `${totalElements} premium properties available`}
              </p>
            </div>
            
            <div className="hidden sm:flex items-center bg-bg-surface-hover p-1 rounded-lg border border-border-base">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-base'}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-base'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('map')}
                className={`p-2 rounded-md transition-all ${view === 'map' ? 'bg-bg-surface text-primary shadow-sm' : 'text-text-muted hover:text-text-base'}`}
                aria-label="Map view"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
              <Input
                fullWidth
                icon={<Search className="w-4 h-4" />}
                placeholder="Search by city, hotel name... Try voice search!"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-bg-surface-hover border-transparent hover:border-border-base pr-12"
              />
              <button 
                type="button"
                onClick={startVoiceSearch}
                className={`absolute right-3 p-1.5 rounded-full transition-colors ${isListening ? 'bg-error/10 text-error animate-pulse' : 'text-text-muted hover:text-primary hover:bg-primary/10'}`}
                aria-label="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-2">
              <Button
                variant={hasActiveFilters ? 'primary' : 'outline'}
                onClick={() => setFiltersOpen(!filtersOpen)}
                icon={<SlidersHorizontal className="w-4 h-4" />}
                className={hasActiveFilters ? 'bg-secondary hover:bg-secondary-light border-secondary text-primary font-semibold' : ''}
              >
                Filters
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary ml-1" />
                )}
              </Button>

              <div className="relative w-44">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(0); }}
                  className="appearance-none w-full bg-bg-surface-hover border border-transparent hover:border-border-base rounded-lg px-4 py-2.5 text-sm text-text-base font-medium focus:outline-none focus:ring-2 focus:ring-border-focus transition-all pr-10"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-bg-surface border-b border-border-base overflow-hidden relative z-20"
          >
            <div className="container-section py-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Refine Search</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">Price Range (USD)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice ?? ''}
                      onChange={(e) => { setMinPrice(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
                    />
                    <span className="text-text-muted">—</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice ?? ''}
                      onChange={(e) => { setMaxPrice(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
                    />
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">Minimum Rating</label>
                  <div className="flex items-center gap-2">
                    {starOptions.map((star) => (
                      <button
                        key={star}
                        onClick={() => { setMinRating(minRating === star ? undefined : star); setPage(0); }}
                        className={`flex items-center justify-center gap-1 w-12 h-[42px] rounded-lg text-xs font-bold transition-colors ${
                          minRating === star
                            ? 'bg-secondary text-primary border-2 border-secondary'
                            : 'bg-bg-surface-hover text-text-muted border border-border-base hover:border-border-strong'
                        }`}
                      >
                        {star} <Star className={`w-3 h-3 ${minRating === star ? 'fill-primary' : 'fill-current'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Amenities */}
                <div className="sm:col-span-2 lg:col-span-4 border-t border-border-base pt-6">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 block">Smart Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_LIST.map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-bg-surface-hover text-text-muted border-border-base hover:border-primary/50'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="container-section py-4">
          <div className="flex flex-wrap items-center gap-2">
            {city && (
              <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold flex items-center gap-1.5">
                City: {city}
                <button onClick={() => { setCity(''); setSearch(''); }} className="hover:text-primary"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {minPrice && (
              <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold flex items-center gap-1.5">
                Min: ${minPrice}
                <button onClick={() => setMinPrice(undefined)} className="hover:text-primary"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {maxPrice && (
              <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold flex items-center gap-1.5">
                Max: ${maxPrice}
                <button onClick={() => setMaxPrice(undefined)} className="hover:text-primary"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {minRating && (
              <span className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold flex items-center gap-1.5">
                {minRating}+ Stars
                <button onClick={() => setMinRating(undefined)} className="hover:text-primary"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {selectedAmenities.map(amenity => (
              <span key={amenity} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5">
                {amenity}
                <button onClick={() => toggleAmenity(amenity)} className="hover:text-secondary"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="container-section py-8 pb-20">
        {isLoading ? (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-6'
          }>
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : hotels.length > 0 ? (
          <>
            {view === 'map' ? (
              <HotelMap hotels={hotels} />
            ) : (
              <div className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-6'
              }>
                {hotels.map((hotel: Hotel, i: number) => (
                  <HotelCard key={hotel.id} hotel={hotel} index={i} variant={view} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = page < 3 ? i : page - 2 + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                          page === pageNum
                            ? 'bg-primary text-white shadow-md'
                            : 'text-text-muted hover:bg-bg-surface hover:text-text-base'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No properties found"
            description="Try adjusting your filters or search for a different destination."
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        )}
      </div>
    </div>
  );
}
