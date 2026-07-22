package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralMetricsDTO {
    private long totalReferrals;
    private long successfulReferrals;
    private long pendingReferrals;
    private long totalRewardsEarned;
}
