package com.luxurystay.dto;

import lombok.Data;

@Data
public class DestinationDTO {
    private Long id;
    private String name;
    private String country;
    private String imageUrl;
    private String description;
    private boolean featured;
    private int hotelCount;
    private double averagePrice;
    private double rating;
}
