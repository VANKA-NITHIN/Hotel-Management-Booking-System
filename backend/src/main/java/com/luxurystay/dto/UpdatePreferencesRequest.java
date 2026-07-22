package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePreferencesRequest {

    @NotNull
    private Boolean emailBookings;

    @NotNull
    private Boolean emailPromotions;

    @NotNull
    private Boolean pushBookings;

    @NotNull
    private Boolean pushPromotions;
    
    private String languagePreference;
}
