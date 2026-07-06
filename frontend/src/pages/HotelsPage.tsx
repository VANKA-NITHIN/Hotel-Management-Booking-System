import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, Star, X, ChevronDown } from 'lucide-react';
import { useSearchHotels } from '../hooks/useApi';
import HotelCard from '../components/ui/HotelCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageTitle } from '../hooks/usePageTitle';
import type { Hotel } from '../types';

const starOptions = [5, 4, 3, 2, 1];
const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function HotelsPage() {
  usePageTitle('Hotels');

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useSearchHotels({
    city: city || undefined,
    minPrice, maxPrice, minRating,
    sort, page, size: 12,
  });

  const hotels = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(search);
    setPage(0);
  };

  const clearFilters = () => {
    setSearch(''); setCity(''); setMinPrice(undefined);
    setMaxPrice(undefined); setMinRating(undefined);
    setSort('rating'); setPage(0);
  };

  const hasActiveFilters = city || minPrice || maxPrice || minRating;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-section py-6">
          <h1 className="page-header mb-1">Find Your Perfect Stay</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? 'Searching...' : `${totalElements} hotels available`}
          </p>

          {/* Search + Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city, hotel name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 pr-4"
              />
            </form>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`btn-outline gap-1.5 ${hasActiveFilters ? 'border-secondary text-secondary' : ''}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                )}
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(0); }}
                  className="appearance-none input-field pr-8 pl-3 py-2 text-sm w-44"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>

              <div className="hidden sm:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 transition-colors ${view === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white border-b border-gray-100 overflow-hidden"
        >
          <div className="container-section py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-secondary hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice ?? ''}
                    onChange={(e) => { setMinPrice(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
                    className="input-field text-sm py-2"
                  />
                  <span className="text-gray-300">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice ?? ''}
                    onChange={(e) => { setMaxPrice(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
                    className="input-field text-sm py-2"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Minimum Rating</label>
                <div className="flex items-center gap-1.5">
                  {starOptions.map((star) => (
                    <button
                      key={star}
                      onClick={() => { setMinRating(minRating === star ? undefined : star); setPage(0); }}
                      className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        minRating === star
                          ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {star} <Star className="w-3 h-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="container-section py-3">
          <div className="flex flex-wrap items-center gap-2">
            {city && (
              <span className="badge-secondary flex items-center gap-1">
                City: {city}
                <button onClick={() => { setCity(''); setSearch(''); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {minPrice && (
              <span className="badge-secondary flex items-center gap-1">
                Min: ${minPrice}
                <button onClick={() => setMinPrice(undefined)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {maxPrice && (
              <span className="badge-secondary flex items-center gap-1">
                Max: ${maxPrice}
                <button onClick={() => setMaxPrice(undefined)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {minRating && (
              <span className="badge-secondary flex items-center gap-1">
                {minRating}+ stars
                <button onClick={() => setMinRating(undefined)}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="container-section py-6">
        {isLoading ? (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'space-y-4'
          }>
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : hotels.length > 0 ? (
          <>
            <div className={view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'space-y-4'
            }>
              {hotels.map((hotel: Hotel, i: number) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} variant={view} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-outline btn-sm disabled:opacity-30"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNum = page < 3 ? i : page - 2 + i;
                  if (pageNum >= totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-outline btn-sm disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No hotels found"
            description="Try adjusting your filters or search for a different destination."
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        )}
      </div>
    </div>
  );
}
