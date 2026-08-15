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
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id, Authentication authentication) {
        BookingDTO booking = bookingService.getBookingById(id);
        assertCanAccessBooking(authentication, booking);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<BookingDTO> getBookingByReference(@PathVariable String reference, Authentication authentication) {
        BookingDTO booking = bookingService.getBookingByReference(reference);
        assertCanAccessBooking(authentication, booking);
        return ResponseEntity.ok(booking);
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
            @RequestBody(required = false) java.util.Map<String, String> body,
            Authentication authentication) {
        BookingDTO booking = bookingService.getBookingById(id);
        assertCanAccessBooking(authentication, booking);
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
    }

    /**
     * SECURITY: a booking may only be viewed/cancelled by its owner, or by staff
     * (ADMIN / MANAGER / STAFF / RECEPTION). Prevents IDOR - previously any authenticated
     * user could read or cancel any other user's booking by guessing the id.
     */
    private void assertCanAccessBooking(Authentication authentication, BookingDTO booking) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        boolean isStaff = authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .anyMatch(authority -> java.util.Set.of("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF", "ROLE_RECEPTION").contains(authority));
        if (isStaff) {
            return;
        }
        User user = authService.getCurrentUser(authentication);
        boolean isOwner = booking.getUser() != null
                && booking.getUser().getId() != null
                && booking.getUser().getId().equals(user.getId());
        if (!isOwner) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have access to this booking");
        }
    }
}
