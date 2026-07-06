package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.HotelDTO;
import com.luxurystay.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<HotelDTO>> getWishlist(Authentication authentication) {
        return ResponseEntity.ok(wishlistService.getWishlist(authentication));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> toggleWishlist(
            @RequestBody Map<String, Long> body,
            Authentication authentication) {
        return ResponseEntity.ok(wishlistService.toggleWishlist(body.get("hotelId"), authentication));
    }

    @GetMapping("/check/{hotelId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(
            @PathVariable Long hotelId,
            Authentication authentication) {
        return ResponseEntity.ok(wishlistService.checkWishlist(hotelId, authentication));
    }
}
