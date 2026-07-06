package com.luxurystay.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {

    private Long id;
    private String bookingReference;

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    @NotNull(message = "Check-in date is required")
    private String checkInDate;

    @NotNull(message = "Check-out date is required")
    private String checkOutDate;

    @Min(value = 1, message = "At least 1 guest required")
    private int guestCount;

    private int childrenCount;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal serviceCharge;
    private String couponCode;
    private String specialRequests;

    private UserDTO user;
    private HotelDTO hotel;
}
