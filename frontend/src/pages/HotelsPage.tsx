import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, Star, X, ChevronDown, Map as MapIcon, Mic, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseNaturalLanguageSearch } from '../utils/searchParser';
import { VoiceSearchModal } from '../components/voice/VoiceSearchModal';
import { useSearchHotels, useAmenities, useDestinations } from '../hooks/useApi';
import HotelCard from '../components/ui/HotelCard';
import { HotelMap } from '../components/ui/HotelMap';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Hotel } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useTranslation } from 'react-i18next';

const starOptions = [5, 4, 3, 2, 1];
const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

// Groups are built dynamically from API data

export default function HotelsPage() {
  const { t } = useTranslation(['hotels', 'common']);
  usePageTitle(t('hotels:pageTitle', 'Explore Hotels'));

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

  const { data: amenitiesData } = useAmenities();
  const { data: destinationsData } = useDestinations();
  const dynamicCities = destinationsData?.data || [];
  
  // Group amenities by their category if possible, or provide a default group
  const groupedAmenities = amenitiesData?.reduce((acc: any, amenity: any) => {
    // Assuming amenities might not have a category in the API, we default to 'All Amenities'
    // If they do have a category, use it. For now, fallback to a single group if no category exists.
    const groupName = amenity.category || 'All Amenities';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(amenity.name);
    return acc;
  }, {}) || {};

  const dynamicAmenityGroups = Object.keys(groupedAmenities).map(key => ({
    title: key,
    amenities: groupedAmenities[key]
  }));

  const AMENITY_GROUPS = dynamicAmenityGroups.length > 0 ? dynamicAmenityGroups : [
    { title: 'All Amenities', amenities: [] }
  ];

  const fetchedHotels = data?.data?.content || [];
  
  // Smart local filtering for amenities
  const hotels = fetchedHotels.filter((hotel: Hotel) => {
    if (selectedAmenities.length === 0) return true;
    return selectedAmenities.every(amenity => hotel.amenities?.some(a => a.name === amenity));
  });

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const totalPages = data?.data?.totalPages || 0;
  const totalElements = hotels.length;

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search is not supported in this browser.');
      return;
    }
    setIsVoiceModalOpen(true);
  };

  const processSearchQuery = (query: string) => {
    const parsed = parseNaturalLanguageSearch(query, dynamicCities);
    if (parsed.city) setCity(parsed.city);
    if (parsed.minPrice) setMinPrice(parsed.minPrice);
    if (parsed.maxPrice) setMaxPrice(parsed.maxPrice);
    if (parsed.amenities.length > 0) {
      setSelectedAmenities(prev => {
        const combined = new Set([...prev, ...parsed.amenities]);
        return Array.from(combined);
      });
    }
    setPage(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    processSearchQuery(search);
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
      <div className="bg-bg-surface border-b border-border-base sticky top-[72px] z-30 shadow-sm transition-all duration-300">
        <div className="container-safe py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-text-base tracking-tight">{t('hotels:pageTitle', 'Explore Properties')}</h1>
              <p className="text-sm font-medium text-text-muted mt-2">
                {isLoading ? t('common:loading', 'Searching properties...') : t('hotels:resultsFound', { count: totalElements })}
              </p>
            </div>
            
            <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-border-base shadow-inner">
              <button
                onClick={() => setView('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'grid' ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm scale-100' : 'text-text-muted hover:text-text-base scale-95 hover:scale-100'}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'list' ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm scale-100' : 'text-text-muted hover:text-text-base scale-95 hover:scale-100'}`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('map')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${view === 'map' ? 'bg-white dark:bg-neutral-800 text-primary shadow-sm scale-100' : 'text-text-muted hover:text-text-base scale-95 hover:scale-100'}`}
                aria-label="Map view"
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative flex items-center group">
              <Input
                fullWidth
                icon={<Search className="w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />}
                placeholder={t('hotels:searchPlaceholder', 'Search by city, hotel name...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-neutral-50 dark:bg-neutral-900 border-border-base hover:border-border-strong focus:border-secondary h-14 text-base pe-14 rounded-xl transition-all shadow-sm"
              />
              <button 
                type="button"
                onClick={startVoiceSearch}
                className="absolute end-3 p-2 rounded-full transition-all duration-200 text-neutral-400 hover:text-primary hover:bg-primary/10 active:scale-95"
                aria-label="Voice Search"
              >
                <Mic className="w-5 h-5" />
              </button>
            </form>

            <div className="flex items-center gap-3">
              <Button
                variant={hasActiveFilters ? 'primary' : 'outline'}
                onClick={() => setFiltersOpen(!filtersOpen)}
                icon={<SlidersHorizontal className="w-5 h-5" />}
                className={`h-14 px-6 rounded-xl font-semibold shadow-sm transition-all ${
                  hasActiveFilters ? 'bg-secondary hover:bg-secondary-light border-secondary text-primary' : 'bg-white dark:bg-neutral-900 border-border-base hover:border-border-strong text-text-base'
                }`}
              >
                {t('common:filters', 'Filters')}
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-primary ms-2 animate-pulse" />
                )}
              </Button>

              <div className="relative w-48 hidden sm:block">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(0); }}
                  className="appearance-none w-full bg-white dark:bg-neutral-900 border border-border-base hover:border-border-strong rounded-xl px-4 h-14 text-sm font-semibold text-text-base focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all pe-10 shadow-sm cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{t(`hotels:sortOptions.${opt.value.replace('_asc', 'Low').replace('_desc', 'High')}`, opt.label)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
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
            <div className="container-safe py-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">{t('common:refineSearch', 'Refine Search')}</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> {t('hotels:clearFilters', 'Clear all')}
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
                <div className="sm:col-span-2 lg:col-span-4 border-t border-border-base pt-6 mt-2">
                  <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4 block">Smart Amenities & Features</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    {AMENITY_GROUPS.map((group) => (
                      <div key={group.title}>
                        <h4 className="text-[13px] font-bold text-text-base mb-3 border-b border-border-base pb-2">{group.title}</h4>
                        <div className="flex flex-col gap-2.5">
                          {group.amenities.map((amenity: string) => (
                            <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedAmenities.includes(amenity) ? 'bg-primary border-primary text-white' : 'bg-bg-surface border-border-strong group-hover:border-primary text-transparent'}`}>
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </div>
                              <span className={`text-sm select-none transition-colors ${selectedAmenities.includes(amenity) ? 'font-bold text-text-base' : 'text-text-muted group-hover:text-text-base'}`}>{amenity}</span>
                              <input type="checkbox" className="hidden" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
                            </label>
                          ))}
                        </div>
                      </div>
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
        <div className="container-safe py-4">
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
      <div className="container-safe py-8 pb-20">
        {isLoading ? (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8'
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
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8'
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
            title={t('hotels:noHotelsFound', 'No properties found')}
            description={t('hotels:noHotelsDescription', 'Try adjusting your filters or search for a different destination.')}
            action={{ label: t('hotels:clearFilters', 'Clear Filters'), onClick: clearFilters }}
          />
        )}
      </div>

      <VoiceSearchModal 
        isOpen={isVoiceModalOpen} 
        onClose={() => setIsVoiceModalOpen(false)} 
        onApplyFilters={(voiceCity, voiceAmenities, voiceSearch) => {
          if (voiceCity) setCity(voiceCity);
          if (voiceSearch) setSearch(voiceSearch);
          if (voiceAmenities.length > 0) {
            setSelectedAmenities(prev => Array.from(new Set([...prev, ...voiceAmenities])));
          }
          setPage(0);
        }}
      />
    </div>
  );
};
