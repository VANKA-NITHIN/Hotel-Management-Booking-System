package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final NewsletterService newsletterService;

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email != null && !email.isEmpty()) {
            newsletterService.subscribe(email);
        }
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Subscribed to newsletter successfully")
                .build());
    }
}
