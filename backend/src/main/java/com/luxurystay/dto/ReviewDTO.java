package com.luxurystay.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {

    private Long id;

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    private Long roomId;
    private Long bookingId;

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "1.0", message = "Minimum rating is 1.0")
    @DecimalMax(value = "5.0", message = "Maximum rating is 5.0")
    private BigDecimal rating;
    
    private BigDecimal cleanlinessRating;
    private BigDecimal serviceRating;
    private BigDecimal locationRating;
    private BigDecimal valueRating;

    @NotBlank(message = "Comment is required")
    @Size(min = 10, max = 2000, message = "Comment must be between 10 and 2000 characters")
    private String comment;

    private List<String> photos;

    // Fields for UI rendering
    private String userName;
    private String userImage;
    private String roomName;
    private LocalDateTime createdAt;
    private boolean verified;
    private int likes;
    private String reply;
    private String repliedByName;
}
