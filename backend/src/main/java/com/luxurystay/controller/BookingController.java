package com.luxurystay.controller;

import com.luxurystay.dto.*;
import com.luxurystay.entity.User;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingDTO bookingDTO,
            Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(bookingDTO, user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<BookingDTO> getBookingByReference(@PathVariable String reference) {
        return ResponseEntity.ok(bookingService.getBookingByReference(reference));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<PagedResponse<BookingDTO>> getMyBookings(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = authService.getCurrentUser(authentication);
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId(), page, size));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam Long hotelId,
            @RequestParam String checkIn,
            @RequestParam String checkOut) {
        return ResponseEntity.ok(bookingService.checkAvailability(hotelId, checkIn, checkOut));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
    }
}
