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
public class ReferralDTO {
    private Long id;
    private String referredUserName;
    private String status;
    private int rewardPoints;
    private LocalDateTime createdAt;
}
