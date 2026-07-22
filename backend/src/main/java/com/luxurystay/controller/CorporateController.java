package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.BookingDTO;
import com.luxurystay.dto.CompanyDTO;
import com.luxurystay.dto.CompanyInvitationDTO;
import com.luxurystay.dto.CorporateAnalyticsDTO;
import com.luxurystay.dto.UserDTO;
import com.luxurystay.service.CompanyService;
import com.luxurystay.service.CorporateAnalyticsService;
import com.luxurystay.service.CorporateManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/corporate")
@RequiredArgsConstructor
public class CorporateController {

    private final CompanyService companyService;
    private final CorporateManagementService managementService;
    private final CorporateAnalyticsService analyticsService;

    // --- Company Profile ---
    @PostMapping("/company")
    public ResponseEntity<ApiResponse> registerCompany(@RequestBody CompanyDTO dto, Authentication authentication) {
        return ResponseEntity.ok(companyService.registerCompany(dto, authentication));
    }

    @GetMapping("/company/my-company")
    public ResponseEntity<CompanyDTO> getMyCompany(Authentication authentication) {
        return ResponseEntity.ok(companyService.getMyCompany(authentication));
    }

    // --- Employees ---
    @GetMapping("/employees")
    public ResponseEntity<List<UserDTO>> getEmployees(Authentication authentication) {
        return ResponseEntity.ok(managementService.getCompanyEmployees(authentication));
    }

    @PutMapping("/employees/{id}/role")
    public ResponseEntity<ApiResponse> updateRole(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        return ResponseEntity.ok(managementService.updateEmployeeRole(id, payload.get("role"), authentication));
    }

    // --- Invitations ---
    @PostMapping("/invitations")
    public ResponseEntity<ApiResponse> inviteEmployee(@RequestBody CompanyInvitationDTO dto, Authentication authentication) {
        return ResponseEntity.ok(managementService.inviteEmployee(dto, authentication));
    }

    @GetMapping("/invitations/pending")
    public ResponseEntity<List<CompanyInvitationDTO>> getPendingInvitations(Authentication authentication) {
        return ResponseEntity.ok(managementService.getPendingInvitations(authentication));
    }

    @PostMapping("/invitations/accept")
    public ResponseEntity<ApiResponse> acceptInvitation(@RequestBody Map<String, String> payload, Authentication authentication) {
        return ResponseEntity.ok(managementService.acceptInvitation(payload.get("token"), authentication));
    }

    // --- Bookings ---
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDTO>> getCorporateBookings(Authentication authentication) {
        return ResponseEntity.ok(managementService.getCorporateBookings(authentication));
    }

    // --- Analytics ---
    @GetMapping("/analytics")
    public ResponseEntity<CorporateAnalyticsDTO> getAnalytics(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getAnalytics(authentication));
    }
}
