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
public class RoomDTO {

    private Long id;
    private Long hotelId;

    @NotBlank(message = "Room name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Room type is required")
    private String roomType;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerNight;

    @Min(value = 1, message = "Max guests must be at least 1")
    private int maxGuests;

    private int maxChildren;
    private int bedCount;
    private String bedType;
    private int floor;
    private double size;
    private String view;
    private String status;
    private String cleaningStatus;
    private boolean active;
    private int roomNumber;
    private BigDecimal weekendPrice;
    private BigDecimal holidayPrice;

    private List<String> amenities;
    private List<String> images;
}
