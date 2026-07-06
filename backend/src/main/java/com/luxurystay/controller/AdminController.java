package com.luxurystay.controller;

import com.luxurystay.dto.*;
import com.luxurystay.entity.User;
import com.luxurystay.service.AdminService;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.BookingService;
import com.luxurystay.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final HotelService hotelService;
    private final BookingService bookingService;
    private final AuthService authService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboard(
            @RequestParam(required = false) Long hotelId) {
        return ResponseEntity.ok(hotelService.getDashboardStats(hotelId));
    }

    @GetMapping("/bookings")
    public ResponseEntity<PagedResponse<BookingDTO>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getAllBookings(page, size, status));
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<BookingDTO> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, body.get("status")));
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<List<ChartDataPointDTO>> getMonthlyStats(
            @RequestParam(required = false) Long hotelId) {
        return ResponseEntity.ok(adminService.getMonthlyStats(hotelId));
    }
}
