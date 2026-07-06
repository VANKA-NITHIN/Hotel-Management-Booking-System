package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.HousekeepingDTO;
import com.luxurystay.service.HousekeepingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/housekeeping")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HOUSEKEEPING')")
public class HousekeepingController {

    private final HousekeepingService housekeepingService;

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<?> getHotelHousekeeping(
            @PathVariable Long hotelId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(housekeepingService.getHotelHousekeeping(hotelId, status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(housekeepingService.updateStatus(id, body.get("status")));
    }
}
