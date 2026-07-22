package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorporateAnalyticsDTO {
    private long totalEmployees;
    private long activeEmployees;
    private long totalBookings;
    private BigDecimal monthlySpend;
    private BigDecimal averageBookingValue;
    
    private List<SpendByDepartmentDTO> spendByDepartment;
    private List<DestinationStatsDTO> topDestinations;
}
