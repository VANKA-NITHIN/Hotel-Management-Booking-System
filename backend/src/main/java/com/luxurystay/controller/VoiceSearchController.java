package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.voice.CategorizedVoiceSearchResult;
import com.luxurystay.service.VoiceSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/search")
@RequiredArgsConstructor
public class VoiceSearchController {

    private final VoiceSearchService voiceSearchService;

    @GetMapping("/voice")
    public ResponseEntity<ApiResponse<CategorizedVoiceSearchResult>> searchVoice(
            @RequestParam("query") String query,
            @RequestParam(value = "language", defaultValue = "en-US") String language) {
        
        CategorizedVoiceSearchResult result = voiceSearchService.search(query, language);
        return ResponseEntity.ok(new ApiResponse<>(true, "Voice search results retrieved", result));
    }
}
