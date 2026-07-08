package com.luxurystay.dto;

import jakarta.validation.constraints.*;
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
public class HotelDTO {

    private Long id;

    @NotBlank(message = "Hotel name is required")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    private String zipCode;
    private Double latitude;
    private Double longitude;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    private BigDecimal startingPrice;
    private String logoUrl;
    private Integer starRating;
    private String policies;
    private boolean active;

    private BigDecimal rating;
    private Integer totalReviews;

    private List<HotelImageDTO> images;
    private List<AmenityDTO> amenities;

    // Manager information
    private Long managerId;
    private String managerName;
}