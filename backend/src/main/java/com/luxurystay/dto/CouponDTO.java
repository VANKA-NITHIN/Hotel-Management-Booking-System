package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDTO {

    private Long id;
    private String code;
    private String description;
    private java.math.BigDecimal discountAmount;
    private boolean percentageDiscount;
    private java.math.BigDecimal maxDiscount;
    private java.math.BigDecimal minBookingAmount;
    private int usageLimit;
    private int usedCount;
    private String startDate;
    private String endDate;
    private boolean active;
}
