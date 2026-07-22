export interface ParsedSearch {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities: string[];
}

const AMENITY_SYNONYMS: Record<string, string[]> = {
  'Free Breakfast': ['breakfast', 'free breakfast', 'complimentary breakfast'],
  'Swimming Pool': ['pool', 'swimming pool', 'swimming'],
  'Spa': ['spa', 'massage', 'wellness'],
  'Parking': ['parking', 'car park', 'garage'],
  'Pet Friendly': ['pet friendly', 'pets allowed', 'dog friendly', 'cat friendly', 'pet'],
  'Couples Friendly': ['couples', 'romantic', 'couples friendly'],
  'Family Rooms': ['family', 'kids', 'family rooms'],
  'Business Hotel': ['business', 'corporate'],
  'Conference Hall': ['conference', 'meeting room', 'banquet', 'hall'],
  'Beach View': ['beach view', 'ocean view', 'sea view', 'beachfront'],
  'Mountain View': ['mountain view', 'mountains', 'hills'],
  'Lake View': ['lake view', 'lakefront'],
  'Wheelchair Accessible': ['wheelchair', 'accessible', 'handicap'],
  'EV Charging': ['ev charging', 'electric vehicle', 'tesla charger'],
  'Fast Wi-Fi': ['wifi', 'wi-fi', 'internet', 'fast wifi', 'fast wi-fi'],
  'Kitchen': ['kitchen', 'kitchenette', 'cooking'],
  'Balcony': ['balcony', 'terrace'],
  'Jacuzzi': ['jacuzzi', 'hot tub', 'whirlpool']
};

const COMMON_CITIES = [
  'New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Singapore', 'Mumbai', 'Delhi', 'Hyderabad', 
  'Bangalore', 'Chennai', 'Pune', 'Goa', 'Kochi', 'Jaipur', 'Agra', 'Bali', 'Maldives', 'Sydney', 
  'Melbourne', 'Los Angeles', 'San Francisco', 'Chicago', 'Miami', 'Las Vegas', 'Toronto', 'Vancouver'
];

export function parseNaturalLanguageSearch(query: string): ParsedSearch {
  const lowerQuery = query.toLowerCase();
  const result: ParsedSearch = { amenities: [] };

  // 1. Extract Price
  // Matches "under 3000", "below 500", "< 200", "max 1000", "cheaper than 400"
  const maxPriceMatch = lowerQuery.match(/(?:under|below|<|max|cheaper than|less than)[\s$₹€£]*(\d+)/);
  if (maxPriceMatch) {
    result.maxPrice = parseInt(maxPriceMatch[1], 10);
  }

  // Matches "above 100", "more than 50", "> 200", "min 100"
  const minPriceMatch = lowerQuery.match(/(?:above|over|>|min|more than)[\s$₹€£]*(\d+)/);
  if (minPriceMatch) {
    result.minPrice = parseInt(minPriceMatch[1], 10);
  }

  // 2. Extract City
  // Look for "in [City]", "near [City]", "around [City]"
  const cityMatch = lowerQuery.match(/(?:in|near|around|at)\s+([a-z\s]+)(?:\b|$)/);
  if (cityMatch) {
    const potentialCity = cityMatch[1].trim();
    // Verify if it's a known city (rudimentary check to avoid false positives like "near airport")
    const foundCity = COMMON_CITIES.find(c => potentialCity.includes(c.toLowerCase()));
    if (foundCity) {
      result.city = foundCity;
    } else {
      // If no match in list but pattern matched, we can still use it (e.g. "near airport" -> we might just search "airport")
      result.city = potentialCity.split(/\s+/)[0]; // take just the first word to be safe, or just the whole thing
      // Better: just take the whole thing and let the backend search
      result.city = potentialCity.split(/(?:with|under|above|below)/)[0].trim();
    }
  } else {
    // If no preposition, just check if any common city is mentioned
    const foundCity = COMMON_CITIES.find(c => lowerQuery.includes(c.toLowerCase()));
    if (foundCity) {
      result.city = foundCity;
    }
  }

  // 3. Extract Amenities
  for (const [canonicalName, synonyms] of Object.entries(AMENITY_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (lowerQuery.includes(synonym)) {
        if (!result.amenities.includes(canonicalName)) {
          result.amenities.push(canonicalName);
        }
        break; // Found this amenity, move to next
      }
    }
  }

  // If no city found, and search query isn't just amenities/price, use the raw query as city search fallback
  if (!result.city && !maxPriceMatch && !minPriceMatch && result.amenities.length === 0) {
    result.city = query.trim();
  } else if (!result.city) {
    // Attempt to extract leftover words as city
    let leftover = lowerQuery;
    if (maxPriceMatch) leftover = leftover.replace(maxPriceMatch[0], '');
    if (minPriceMatch) leftover = leftover.replace(minPriceMatch[0], '');
    for (const [, synonyms] of Object.entries(AMENITY_SYNONYMS)) {
      for (const syn of synonyms) {
        leftover = leftover.replace(syn, '');
      }
    }
    const cleanLeftover = leftover.replace(/(?:hotels|resorts|villas|rooms|with|and|a|an|the|for|under|above)/g, '').trim();
    if (cleanLeftover.length > 2) {
      result.city = cleanLeftover.replace(/\s+/g, ' ').trim();
    }
  }

  return result;
}
