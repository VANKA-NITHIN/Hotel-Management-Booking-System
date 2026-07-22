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
    @PreAuthorize("hasRole('GUEST') or hasRole('ADMIN')")
    public ResponseEntity<CheckInDTO> getCheckInStatus(@PathVariable Long bookingId) {
        try {
            return ResponseEntity.ok(checkInService.getCheckInByBookingId(bookingId));
        } catch (Exception e) {
            // Return empty 204 or new DTO if not found, simplifying for now
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/{bookingId}/submit")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<CheckInDTO> submitCheckIn(@PathVariable Long bookingId, @RequestBody CheckInDTO dto) {
        return ResponseEntity.ok(checkInService.submitCheckIn(bookingId, dto));
    }

    @PostMapping("/{bookingId}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<CheckInDTO> verifyCheckIn(@PathVariable Long bookingId) {
        return ResponseEntity.ok(checkInService.verifyCheckIn(bookingId));
    }

    @GetMapping("/{bookingId}/pass")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<String> getDigitalPass(@PathVariable Long bookingId) {
        return ResponseEntity.ok(checkInService.getDigitalPass(bookingId));
    }
}
