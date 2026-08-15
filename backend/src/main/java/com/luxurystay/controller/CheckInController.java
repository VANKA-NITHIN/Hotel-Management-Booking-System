package com.luxurystay.controller;

import com.luxurystay.dto.CheckInDTO;
import com.luxurystay.service.CheckInService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkin")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    @GetMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CheckInDTO> getCheckInStatus(@PathVariable Long bookingId, org.springframework.security.core.Authentication authentication) {
        try {
            return ResponseEntity.ok(checkInService.getCheckInByBookingId(bookingId, authentication));
        } catch (Exception e) {
            // Return empty 204 or new DTO if not found, simplifying for now
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/{bookingId}/submit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CheckInDTO> submitCheckIn(@PathVariable Long bookingId, @RequestBody CheckInDTO dto, org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(checkInService.submitCheckIn(bookingId, dto, authentication));
    }

    @PostMapping("/{bookingId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<CheckInDTO> verifyCheckIn(@PathVariable Long bookingId) {
        return ResponseEntity.ok(checkInService.verifyCheckIn(bookingId));
    }

    @GetMapping("/{bookingId}/pass")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> getDigitalPass(@PathVariable Long bookingId, org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(checkInService.getDigitalPass(bookingId, authentication));
    }
}
