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
public class PaymentDTO {

    private Long id;
    private String paymentId;
    private Long bookingId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String status;
    private String createdAt;
}
