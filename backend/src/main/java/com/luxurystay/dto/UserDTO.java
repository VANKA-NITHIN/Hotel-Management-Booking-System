package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profileImage;
    private String role;
    private boolean enabled;
    private boolean emailVerified;
    private int loyaltyPoints;
    
    // Notification Preferences
    private boolean emailBookings;
    private boolean emailPromotions;
    private boolean pushBookings;
    private boolean pushPromotions;

    private LocalDateTime createdAt;
}
