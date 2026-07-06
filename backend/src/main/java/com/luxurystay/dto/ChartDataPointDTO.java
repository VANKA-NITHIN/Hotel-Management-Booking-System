package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartDataPointDTO {
    private String month;
    private double revenue;
    private long bookings;
    private double occupancy;
    private long totalRooms;
}
