package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {

    private long totalHotels;
    private long totalRooms;
    private long totalBookings;
    private long totalCustomers;
    private long totalEmployees;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private long activeBookings;
    private double occupancyRate;
    private double averageRating;
    private DailyRevenueDTO todayRevenue;
}
