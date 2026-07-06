package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.ReviewDTO;
import com.luxurystay.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<ReviewDTO>> getHotelReviews(@PathVariable Long hotelId) {
        return ResponseEntity.ok(reviewService.getHotelReviews(hotelId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewDTO>> getMyReviews(Authentication authentication) {
        return ResponseEntity.ok(reviewService.getMyReviews(authentication));
    }

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @Valid @RequestBody ReviewDTO reviewDTO,
            Authentication authentication) {
        ReviewDTO created = reviewService.createReview(reviewDTO, authentication);
        if (created == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse> likeReview(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.likeReview(id));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<ApiResponse> reportReview(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reviewService.reportReview(id, body.get("reason")));
    }
}
