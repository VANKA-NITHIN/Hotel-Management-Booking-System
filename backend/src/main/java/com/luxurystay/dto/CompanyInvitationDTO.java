package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyInvitationDTO {
    private Long id;
    private Long companyId;
    private String email;
    private String role;
    private String token;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime acceptedAt;
    private String createdByUserName;
    private LocalDateTime createdAt;
}
