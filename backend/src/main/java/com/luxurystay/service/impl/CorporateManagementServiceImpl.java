package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.BookingDTO;
import com.luxurystay.dto.CompanyInvitationDTO;
import com.luxurystay.dto.UserDTO;
import com.luxurystay.entity.Company;
import com.luxurystay.entity.CompanyInvitation;
import com.luxurystay.entity.User;
import com.luxurystay.entity.Booking;
import com.luxurystay.enums.CorporateRole;
import com.luxurystay.enums.InvitationStatus;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.CompanyInvitationRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.CorporateManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CorporateManagementServiceImpl implements CorporateManagementService {

    private final CompanyInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public ApiResponse inviteEmployee(CompanyInvitationDTO dto, Authentication authentication) {
        User admin = authService.getCurrentUser(authentication);
        Company company = admin.getCompany();

        if (company == null || !hasManagerAccess(admin.getCompanyRole())) {
            throw new RuntimeException("Unauthorized to invite employees.");
        }

        CompanyInvitation invitation = CompanyInvitation.builder()
                .company(company)
                .email(dto.getEmail())
                .role(CorporateRole.valueOf(dto.getRole()))
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .createdBy(admin)
                .status(InvitationStatus.PENDING)
                .build();

        invitationRepository.save(invitation);

        // In a real app, send email here.

        return ApiResponse.builder()
                .success(true)
                .message("Invitation sent successfully.")
                .build();
    }

    @Override
    public List<CompanyInvitationDTO> getPendingInvitations(Authentication authentication) {
        User admin = authService.getCurrentUser(authentication);
        Company company = admin.getCompany();

        if (company == null || !hasManagerAccess(admin.getCompanyRole())) {
            throw new RuntimeException("Unauthorized.");
        }

        return invitationRepository.findByCompanyId(company.getId()).stream()
                .filter(inv -> inv.getStatus() == InvitationStatus.PENDING)
                .map(inv -> CompanyInvitationDTO.builder()
                        .id(inv.getId())
                        .email(inv.getEmail())
                        .role(inv.getRole().name())
                        .token(inv.getToken())
                        .status(inv.getStatus().name())
                        .expiresAt(inv.getExpiresAt())
                        .createdByUserName(inv.getCreatedBy().getFirstName() + " " + inv.getCreatedBy().getLastName())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiResponse acceptInvitation(String token, Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        
        CompanyInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid invitation token."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Invitation is no longer valid.");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new RuntimeException("Invitation has expired.");
        }

        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new RuntimeException("This invitation is for a different email address.");
        }

        // Accept invitation
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // Link user
        user.setCompany(invitation.getCompany());
        user.setCompanyRole(invitation.getRole());
        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("Successfully joined company.")
                .build();
    }

    @Override
    public List<UserDTO> getCompanyEmployees(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        Company company = user.getCompany();

        if (company == null) {
            throw new RuntimeException("No company associated.");
        }

        return userRepository.findAll().stream()
                .filter(u -> u.getCompany() != null && u.getCompany().getId().equals(company.getId()))
                .map(u -> UserDTO.builder()
                        .id(u.getId())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .companyRole(u.getCompanyRole() != null ? u.getCompanyRole().name() : null)
                        .department(u.getDepartment())
                        .jobTitle(u.getJobTitle())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiResponse updateEmployeeRole(Long employeeId, String role, Authentication authentication) {
        User admin = authService.getCurrentUser(authentication);
        if (admin.getCompany() == null || !isAdmin(admin.getCompanyRole())) {
            throw new RuntimeException("Unauthorized.");
        }

        User employee = userRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (employee.getCompany() == null || !employee.getCompany().getId().equals(admin.getCompany().getId())) {
             throw new RuntimeException("Employee not in your company.");
        }

        employee.setCompanyRole(CorporateRole.valueOf(role));
        userRepository.save(employee);

        return ApiResponse.builder()
                .success(true)
                .message("Employee role updated.")
                .build();
    }

    @Override
    public List<BookingDTO> getCorporateBookings(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        Company company = user.getCompany();

        if (company == null) {
            throw new RuntimeException("No company associated.");
        }

        // Managers and Admins see all corporate bookings. Employees see their own.
        List<Booking> bookings = bookingRepository.findAll();
        
        return bookings.stream()
                .filter(b -> b.getCorporateContext() != null && b.getCorporateContext().getCompanyId().equals(company.getId()))
                .filter(b -> hasManagerAccess(user.getCompanyRole()) || b.getUser().getId().equals(user.getId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .hotelName(booking.getHotel().getName())
                .checkInDate(booking.getCheckInDate() != null ? booking.getCheckInDate().toString() : null)
                .checkOutDate(booking.getCheckOutDate() != null ? booking.getCheckOutDate().toString() : null)
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .totalAmount(booking.getTotalAmount())
                .guestCount(booking.getGuestCount())
                // Include employee name who booked it
                .guestName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
                .build();
    }

    private boolean hasManagerAccess(CorporateRole role) {
        if (role == null) return false;
        return role == CorporateRole.SUPER_ADMIN || 
               role == CorporateRole.CORPORATE_ADMIN || 
               role == CorporateRole.TRAVEL_MANAGER || 
               role == CorporateRole.DEPARTMENT_MANAGER ||
               role == CorporateRole.FINANCE_MANAGER ||
               role == CorporateRole.HR_MANAGER;
    }

    private boolean isAdmin(CorporateRole role) {
        if (role == null) return false;
        return role == CorporateRole.SUPER_ADMIN || role == CorporateRole.CORPORATE_ADMIN;
    }
}
