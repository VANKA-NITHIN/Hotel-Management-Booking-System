package com.luxurystay.service;

import com.luxurystay.dto.voice.CategorizedVoiceSearchResult;

public interface VoiceSearchService {
    CategorizedVoiceSearchResult search(String query, String language);
}
