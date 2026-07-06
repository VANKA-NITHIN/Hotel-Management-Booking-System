package com.luxurystay.controller;

import com.luxurystay.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/amenities")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAmenities() {
        return ResponseEntity.ok(amenityService.getAmenities());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createAmenity(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(amenityService.createAmenity(body));
    }
}
