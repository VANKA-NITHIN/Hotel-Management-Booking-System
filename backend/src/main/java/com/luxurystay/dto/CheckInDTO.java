package com.luxurystay.dto;

import com.luxurystay.enums.CheckInStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckInDTO {
    private Long id;
    private Long bookingId;
    private CheckInStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
    private boolean termsAccepted;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String specialRequests;
    private String qrToken;
}
