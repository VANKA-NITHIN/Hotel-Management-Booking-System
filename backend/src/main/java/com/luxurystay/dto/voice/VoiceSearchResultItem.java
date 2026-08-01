package com.luxurystay.dto.voice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceSearchResultItem {
    private Long id;
    private String type; // "HOTEL", "DESTINATION", or "CITY"
    private String name;
    private String city;
    private String country;
    private String imageUrl;
    private BigDecimal price;
    private BigDecimal rating;
    private List<String> matchReasons;
    private int score;
}
