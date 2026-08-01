package com.luxurystay.service.impl;

import com.luxurystay.dto.voice.CategorizedVoiceSearchResult;
import com.luxurystay.dto.voice.VoiceSearchResultItem;
import com.luxurystay.entity.Amenity;
import com.luxurystay.entity.Destination;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.HotelImage;
import com.luxurystay.repository.DestinationRepository;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.service.VoiceSearchService;
import jakarta.annotation.PostConstruct;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.language.DoubleMetaphone;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoiceSearchServiceImpl implements VoiceSearchService {

    private final HotelRepository hotelRepository;
    private final DestinationRepository destinationRepository;

    private final DoubleMetaphone doubleMetaphone = new DoubleMetaphone();
    private final LevenshteinDistance levenshtein = new LevenshteinDistance();

    private final AtomicReference<List<SearchableDocument>> searchIndex = new AtomicReference<>(new ArrayList<>());

    private static final Map<String, String> CORRECTION_DICT = Map.of(
            "palazo", "palazzo",
            "maldeevs", "maldives",
            "mariot", "marriott",
            "sheriton", "sheraton",
            "hyat", "hyatt",
            "newyork", "new york",
            "nyc", "new york"
    );

    private static final List<String> FILLER_WORDS = Arrays.asList(
            "show me", "can you show me", "find", "search for", "book", "please",
            "hotels in", "hotel in", "a hotel", "looking for", "i want to", "go to"
    );

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void initCache() {
        // self-invocation doesn't trigger transactional proxy, but because initCache itself is transactional, it works here.
        refreshCache();
    }

    // Refresh every hour or manually triggered
    @Scheduled(fixedRate = 3600000)
    @Transactional(readOnly = true)
    public void refreshCache() {
        log.info("Refreshing Voice Search In-Memory Cache...");
        List<SearchableDocument> docs = new ArrayList<>();

        // Load Hotels
        List<Hotel> hotels = hotelRepository.findAllActive();
        for (Hotel h : hotels) {
            String imageUrl = h.getImages().stream().findFirst().map(HotelImage::getImageUrl).orElse(null);
            List<String> amenities = h.getAmenities().stream().map(Amenity::getName).toList();
            
            docs.add(SearchableDocument.builder()
                    .id(h.getId())
                    .type("HOTEL")
                    .name(h.getName())
                    .city(h.getCity())
                    .country(h.getCountry())
                    .description(h.getDescription())
                    .amenities(amenities)
                    .price(h.getStartingPrice())
                    .rating(h.getRating())
                    .imageUrl(imageUrl)
                    .popularity(h.getTotalReviews())
                    .build());
        }

        // Load Destinations
        List<Destination> destinations = destinationRepository.findAll();
        for (Destination d : destinations) {
            docs.add(SearchableDocument.builder()
                    .id(d.getId())
                    .type("DESTINATION")
                    .name(d.getName())
                    .city(d.getName())
                    .country(d.getCountry())
                    .description(d.getDescription())
                    .amenities(new ArrayList<>())
                    .price(BigDecimal.valueOf(d.getAveragePrice()))
                    .rating(BigDecimal.valueOf(d.getRating()))
                    .imageUrl(d.getImageUrl())
                    .popularity(d.getHotelCount())
                    .build());
        }

        searchIndex.set(docs);
        log.info("Loaded {} items into Voice Search Cache", docs.size());
    }

    @Override
    public CategorizedVoiceSearchResult search(String query, String language) {
        if (!StringUtils.hasText(query)) {
            return new CategorizedVoiceSearchResult();
        }

        CategorizedVoiceSearchResult.ExtractedIntent intent = normalizeAndExtractIntent(query);
        String cleanedQuery = intent.getCleanedQuery();
        String phoneticQuery = doubleMetaphone.doubleMetaphone(cleanedQuery);

        List<VoiceSearchResultItem> allResults = new ArrayList<>();
        List<String> allRecognizedCities = new ArrayList<>();
        List<String> allRecognizedAmenities = new ArrayList<>();

        List<SearchableDocument> cache = searchIndex.get();
        for (SearchableDocument doc : cache) {
            int score = 0;
            List<String> matchReasons = new ArrayList<>();

            String docNameLower = doc.getName() != null ? doc.getName().toLowerCase() : "";
            String docCityLower = doc.getCity() != null ? doc.getCity().toLowerCase() : "";
            String docCountryLower = doc.getCountry() != null ? doc.getCountry().toLowerCase() : "";

            // 1. Exact or Prefix Matches
            if (docNameLower.equals(cleanedQuery)) {
                score += 100;
                matchReasons.add("Exact name match");
            } else if (docNameLower.contains(cleanedQuery)) {
                score += 85;
                matchReasons.add("Full token match");
            } else if (docNameLower.startsWith(cleanedQuery)) {
                score += 90;
                matchReasons.add("Prefix match");
            } else {
                // Levenshtein on Name
                int dist = levenshtein.apply(docNameLower, cleanedQuery);
                if (dist <= 2 && docNameLower.length() > 4) {
                    score += 75;
                    matchReasons.add("Partial name match (Typo)");
                }
            }

            // Phonetic Match
            String phoneticDocName = doubleMetaphone.doubleMetaphone(docNameLower);
            if (phoneticDocName != null && phoneticDocName.equals(phoneticQuery)) {
                score += 80;
                matchReasons.add("Phonetic name match");
            }

            // City / Country Match
            if (docCityLower.equals(cleanedQuery) || docCityLower.contains(cleanedQuery)) {
                score += 60;
                matchReasons.add("City match");
                if (!allRecognizedCities.contains(doc.getCity())) allRecognizedCities.add(doc.getCity());
            }
            if (intent.getLocation() != null && docCityLower.contains(intent.getLocation())) {
                score += 60;
                matchReasons.add("Location intent match");
            }
            if (docCountryLower.equals(cleanedQuery)) {
                score += 50;
                matchReasons.add("Country match");
            }

            // Amenities Match
            for (String amenity : doc.getAmenities()) {
                if (amenity.toLowerCase().contains(cleanedQuery) || cleanedQuery.contains(amenity.toLowerCase())) {
                    score += 60;
                    matchReasons.add("Amenity match: " + amenity);
                    if (!allRecognizedAmenities.contains(amenity)) allRecognizedAmenities.add(amenity);
                }
            }

            // Description Match (low weight)
            if (doc.getDescription() != null && doc.getDescription().toLowerCase().contains(cleanedQuery)) {
                score += 20;
                matchReasons.add("Description match");
            }
            
            // Category intent match (e.g., luxury, resort, spa) — word-boundary check
            if (intent.getCategory() != null) {
                String catPattern = "\\b" + Pattern.quote(intent.getCategory().toLowerCase()) + "\\b";
                if (docNameLower.matches(".*" + catPattern + ".*") || 
                    (doc.getDescription() != null && doc.getDescription().toLowerCase().matches(".*" + catPattern + ".*"))) {
                    score += 30;
                    matchReasons.add("Category intent match");
                }
            }

            // Boosts
            if (score > 0) {
                if (doc.getRating() != null && doc.getRating().doubleValue() >= 4.5) {
                    score += 10;
                }
                if (doc.getPopularity() != null && doc.getPopularity() > 100) {
                    score += 15;
                }

                allResults.add(VoiceSearchResultItem.builder()
                        .id(doc.getId())
                        .type(doc.getType())
                        .name(doc.getName())
                        .city(doc.getCity())
                        .country(doc.getCountry())
                        .imageUrl(doc.getImageUrl())
                        .price(doc.getPrice())
                        .rating(doc.getRating())
                        .score(score)
                        .matchReasons(matchReasons)
                        .build());
            }
        }

        allResults.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        List<VoiceSearchResultItem> exact = new ArrayList<>();
        List<VoiceSearchResultItem> suggestions = new ArrayList<>();

        for (VoiceSearchResultItem item : allResults) {
            if (item.getScore() >= 85) {
                exact.add(item);
            } else if (item.getScore() >= 40) {
                suggestions.add(item);
            }
        }

        return CategorizedVoiceSearchResult.builder()
                .exactMatches(exact.stream().limit(5).collect(Collectors.toList()))
                .suggestions(suggestions.stream().limit(10).collect(Collectors.toList()))
                .recognizedCities(allRecognizedCities)
                .recognizedAmenities(allRecognizedAmenities)
                .extractedIntent(intent)
                .build();
    }

    private CategorizedVoiceSearchResult.ExtractedIntent normalizeAndExtractIntent(String query) {
        String lower = query.toLowerCase().trim();

        // Remove fillers
        for (String filler : FILLER_WORDS) {
            lower = lower.replace(filler, "");
        }
        lower = lower.replaceAll("[^a-z0-9\\s]", "").trim();

        // Replace common typos
        String[] words = lower.split("\\s+");
        for (int i = 0; i < words.length; i++) {
            if (CORRECTION_DICT.containsKey(words[i])) {
                words[i] = CORRECTION_DICT.get(words[i]);
            }
        }
        lower = String.join(" ", words);

        // Extract structured intents (very basic heuristic)
        String location = null;
        String category = null;
        String date = null;

        // "in [location]" — capture multi-word locations (e.g. "in new york")
        Matcher locMatcher = Pattern.compile("in\\s+([a-z]+(?:\\s+[a-z]+)*)").matcher(lower);
        if (locMatcher.find()) {
            location = locMatcher.group(1);
            lower = lower.replace("in " + location, "").trim();
        }

        // category keywords — use word-boundary matching to avoid false positives (e.g. "villa" vs "village")
        List<String> categories = Arrays.asList("luxury", "resort", "spa", "budget", "villa");
        Set<String> queryWords = new HashSet<>(Arrays.asList(lower.split("\\s+")));
        for (String cat : categories) {
            if (queryWords.contains(cat)) {
                category = cat;
                break;
            }
        }

        // date keywords
        List<String> dates = Arrays.asList("tomorrow", "today", "next week", "weekend");
        for (String d : dates) {
            if (lower.contains(d)) {
                date = d;
                lower = lower.replace(d, "").trim();
                break;
            }
        }

        return CategorizedVoiceSearchResult.ExtractedIntent.builder()
                .rawQuery(query)
                .cleanedQuery(lower.trim())
                .location(location)
                .category(category)
                .date(date)
                .build();
    }

    @Data
    @Builder
    private static class SearchableDocument {
        Long id;
        String type;
        String name;
        String city;
        String country;
        String description;
        List<String> amenities;
        BigDecimal price;
        BigDecimal rating;
        String imageUrl;
        Integer popularity;
    }
}
