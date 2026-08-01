package com.luxurystay.dto.voice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorizedVoiceSearchResult {
    private List<VoiceSearchResultItem> exactMatches;
    private List<VoiceSearchResultItem> suggestions;
    private List<String> recognizedCities;
    private List<String> recognizedAmenities;
    private ExtractedIntent extractedIntent;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractedIntent {
        private String location;
        private String category;
        private String date;
        private String rawQuery;
        private String cleanedQuery;
    }
}
