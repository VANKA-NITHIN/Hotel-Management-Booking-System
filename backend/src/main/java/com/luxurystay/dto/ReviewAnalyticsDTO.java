package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewAnalyticsDTO {
    private Long hotelId;
    private int totalReviews;
    private BigDecimal averageRating;
    
    // Breakdown
    private BigDecimal averageCleanliness;
    private BigDecimal averageService;
    private BigDecimal averageLocation;
    private BigDecimal averageValue;

    // Distribution (1-star, 2-star, etc.)
    private Map<Integer, Integer> ratingDistribution;
}
