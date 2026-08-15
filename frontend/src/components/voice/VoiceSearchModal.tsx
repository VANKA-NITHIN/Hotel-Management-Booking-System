import React from 'react';
import { Mic, X, Search, MapPin, Building, Star, Loader2 } from 'lucide-react';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { publicApi } from '../../api';
import { FALLBACK_HOTELS } from '../../data/mockHotels';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Local voice-search fallback used when the backend is unreachable (down, 5xx,
 * 429, network). Searches the bundled hotel catalog so the feature still returns
 * results instead of failing with an error toast.
 */
function localVoiceSearch(query: string): any {
  const words = query.toLowerCase().trim().split(/\s+/).filter(w => w.length > 1);

  const exactMatches = FALLBACK_HOTELS.filter(h => {
    const haystack = [
      h.name,
      h.city,
      h.country,
      h.description,
      ...(h.amenities ?? []).map(a => a.name),
    ].join(' ').toLowerCase();
    return words.some(word => haystack.includes(word));
  }).slice(0, 5).map(h => ({
    id: h.id,
    name: h.name,
    city: h.city,
    country: h.country,
    rating: h.rating,
    imageUrl: h.images?.[0]?.imageUrl,
    matchReasons: ['Cached match'],
  }));

  return {
    exactMatches,
    suggestions: [],
    recognizedCities: exactMatches.map(m => m.city),
    recognizedAmenities: [],
    extractedIntent: {
      location: null,
      category: null,
      rawQuery: query,
      cleanedQuery: query.toLowerCase().trim(),
    },
  };
}

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (city: string, amenities: string[], search: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose, onApplyFilters }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [results, setResults] = React.useState<any>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  
  const handleFinalTranscript = async (transcript: string, confidence: number) => {
    if (!transcript) return;

    // Chrome's Web Speech API always reports confidence 0 (a known browser
    // quirk), so a 0 value means "unknown", not "unintelligible". Only gate on
    // confidence when the browser actually provides a real value (Firefox,
    // Safari, Edge).
    const hasConfidence = confidence > 0;
    if (hasConfidence && confidence < 0.3) {
      toast.error('Could not understand clearly. Please try again.');
      return;
    }
    
    if (hasConfidence && confidence < 0.6) {
      toast('Low confidence. Did you mean: ' + transcript + '?', { icon: '🤔' });
    }

    setIsSearching(true);
    try {
      const res = await publicApi.searchVoice(transcript, i18n.language);
      setResults(res.data.data);
    } catch (err) {
      // Backend unreachable (down / 5xx / 429 / network): fall back to a local
      // search over the bundled catalog instead of failing outright.
      const local = localVoiceSearch(transcript);
      if (local && local.exactMatches.length > 0) {
        setResults(local);
      } else {
        toast.error('Failed to perform voice search');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const { isListening, interimTranscript, transcript, error, startListening, stopListening } = useVoiceSearch(handleFinalTranscript);

  React.useEffect(() => {
    if (isOpen) {
      setResults(null);
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderHotel = (item: any) => (
    <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-bg-surface-hover rounded-xl cursor-pointer transition-colors border border-transparent hover:border-border-base group"
         onClick={() => navigate(`/hotels/${item.id}`)}>
      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-bg-surface-hover">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
        ) : (
          <Building className="w-8 h-8 m-4 text-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-text-base truncate">{item.name}</h4>
        <div className="flex items-center text-sm text-text-muted gap-2 mt-1">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {item.city}, {item.country}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-warning"><Star className="w-3 h-3 fill-current"/> {item.rating}</span>
        </div>
        {item.matchReasons && item.matchReasons.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {item.matchReasons.map((reason: string, idx: number) => (
              <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-medium">
                {reason}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-surface/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border-base flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-base bg-bg-surface-hover/50">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            {isListening ? 'Listening...' : 'Voice Search'}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-surface-hover rounded-full transition-colors text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar / Transcript */}
        <div className="p-6 border-b border-border-base bg-gradient-to-b from-bg-surface-hover/30 to-bg-surface">
          <div className="relative">
            <div className={`text-2xl font-light ${!interimTranscript && !transcript ? 'text-text-muted' : 'text-text-base'}`}>
              {interimTranscript || transcript || 'Speak a hotel name, destination, or amenities...'}
            </div>
            {isSearching && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Searching...</span>
              </div>
            )}
          </div>
          {error && <p className="text-error text-sm mt-2 flex items-center gap-1">⚠ {error}</p>}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-2 bg-bg-surface-hover/20">
          {!isSearching && results && (
            <div className="p-4 space-y-6">
              
              {/* Intent Filters */}
              {(results.extractedIntent?.location || results.extractedIntent?.category || results.recognizedAmenities?.length > 0) && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <p className="text-sm font-medium text-text-base mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" /> Did you want to filter by:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.extractedIntent.location && <span className="text-xs bg-bg-surface px-2 py-1 rounded-md border border-border-base">Location: {results.extractedIntent.location}</span>}
                    {results.extractedIntent.category && <span className="text-xs bg-bg-surface px-2 py-1 rounded-md border border-border-base">Category: {results.extractedIntent.category}</span>}
                    {results.recognizedAmenities?.map((a: string) => <span key={a} className="text-xs bg-bg-surface px-2 py-1 rounded-md border border-border-base">Amenity: {a}</span>)}
                  </div>
                  {onApplyFilters && (
                    <button 
                      onClick={() => {
                        onApplyFilters(results.extractedIntent.location || '', results.recognizedAmenities || [], results.extractedIntent.category || '');
                        onClose();
                      }}
                      className="mt-3 text-sm text-primary font-medium hover:underline"
                    >
                      Apply as global filters
                    </button>
                  )}
                </div>
              )}

              {/* Exact Matches */}
              {results.exactMatches?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3 px-2">Top Matches</h3>
                  <div className="space-y-1">
                    {results.exactMatches.map(renderHotel)}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {results.suggestions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3 px-2">
                    {results.exactMatches?.length === 0 ? 'No exact match found, but try these suggestions' : 'Other Suggestions'}
                  </h3>
                  <div className="space-y-1">
                    {results.suggestions.map(renderHotel)}
                  </div>
                </div>
              )}

              {results.exactMatches?.length === 0 && results.suggestions?.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No results found for your search.</p>
                  <button onClick={startListening} className="mt-4 px-4 py-2 bg-primary-950 text-white rounded-lg font-medium">Try again</button>
                </div>
              )}
            </div>
          )}
          
          {!isSearching && !results && !isListening && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-primary/20 transition-colors" onClick={startListening}>
                <Mic className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-text-base">Tap microphone to speak</h3>
              <p className="text-text-muted mt-1 text-sm max-w-sm">
                Try saying "Luxury hotel near Paris", "The Grand Palazzo", or "Resort with pool in Bali".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
