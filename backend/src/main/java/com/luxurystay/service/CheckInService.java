package com.luxurystay.service;

import com.luxurystay.dto.CheckInDTO;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.CheckIn;
import com.luxurystay.enums.CheckInStatus;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.CheckInRepository;
import com.luxurystay.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final CheckInRepository checkInRepository;
    private final BookingRepository bookingRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public CheckInDTO getCheckInByBookingId(Long bookingId, org.springframework.security.core.Authentication authentication) {
        assertCanAccessBooking(bookingId, authentication);
        CheckIn checkIn = checkInRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Check-In not found for booking: " + bookingId));
        return mapToDTO(checkIn);
    }

    @Transactional
    public CheckInDTO submitCheckIn(Long bookingId, CheckInDTO dto, org.springframework.security.core.Authentication authentication) {
        assertCanAccessBooking(bookingId, authentication);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        CheckIn checkIn = checkInRepository.findByBookingId(bookingId)
                .orElse(CheckIn.builder().booking(booking).status(CheckInStatus.PENDING).build());

        if (checkIn.getStatus() == CheckInStatus.VERIFIED || checkIn.getStatus() == CheckInStatus.CHECKED_IN) {
            throw new RuntimeException("Check-In is already processed");
        }

        checkIn.setEmergencyContactName(dto.getEmergencyContactName());
        checkIn.setEmergencyContactPhone(dto.getEmergencyContactPhone());
        checkIn.setSpecialRequests(dto.getSpecialRequests());
        checkIn.setTermsAccepted(dto.isTermsAccepted());
        checkIn.setStatus(CheckInStatus.SUBMITTED);
        checkIn.setSubmittedAt(LocalDateTime.now());

        return mapToDTO(checkInRepository.save(checkIn));
    }

    @Transactional
    public CheckInDTO verifyCheckIn(Long bookingId) {
        CheckIn checkIn = checkInRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Check-In not found for booking: " + bookingId));

        if (checkIn.getStatus() != CheckInStatus.SUBMITTED) {
            throw new RuntimeException("Check-In must be SUBMITTED before verification");
        }

        checkIn.setStatus(CheckInStatus.VERIFIED);
        checkIn.setVerifiedAt(LocalDateTime.now());
        
        // Generate QR Token valid for 7 days
        String qrToken = jwtTokenProvider.generateQrToken(
                checkIn.getBooking().getId(),
                checkIn.getBooking().getUser().getId(),
                checkIn.getBooking().getHotel().getId(),
                7L * 24 * 60 * 60 * 1000 // 7 days in ms
        );
        checkIn.setQrToken(qrToken);

        return mapToDTO(checkInRepository.save(checkIn));
    }

    @Transactional(readOnly = true)
    public String getDigitalPass(Long bookingId, org.springframework.security.core.Authentication authentication) {
        assertCanAccessBooking(bookingId, authentication);
        CheckIn checkIn = checkInRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Check-In not found"));

        if (checkIn.getStatus() != CheckInStatus.VERIFIED && checkIn.getStatus() != CheckInStatus.CHECKED_IN) {
            throw new RuntimeException("Digital pass is not available yet");
        }

        return checkIn.getQrToken();
    }

    /**
     * SECURITY: check-in data may only be accessed by the booking owner, or by staff.
     * Prevents IDOR - previously any GUEST could submit / read / retrieve the digital pass
     * for any booking by guessing the booking id.
     */
    private void assertCanAccessBooking(Long bookingId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required");
        }
        boolean isStaff = authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .anyMatch(authority -> java.util.Set.of("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF", "ROLE_RECEPTION").contains(authority));
        if (isStaff) {
            return;
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        boolean isOwner = booking.getUser() != null
                && booking.getUser().getEmail() != null
                && booking.getUser().getEmail().equals(authentication.getName());
        if (!isOwner) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have access to this booking");
        }
    }

    private CheckInDTO mapToDTO(CheckIn checkIn) {
        return CheckInDTO.builder()
                .id(checkIn.getId())
                .bookingId(checkIn.getBooking().getId())
                .status(checkIn.getStatus())
                .submittedAt(checkIn.getSubmittedAt())
                .verifiedAt(checkIn.getVerifiedAt())
                .termsAccepted(checkIn.isTermsAccepted())
                .emergencyContactName(checkIn.getEmergencyContactName())
                .emergencyContactPhone(checkIn.getEmergencyContactPhone())
                .specialRequests(checkIn.getSpecialRequests())
                .qrToken(checkIn.getQrToken())
                .build();
    }
}
