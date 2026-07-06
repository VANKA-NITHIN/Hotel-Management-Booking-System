package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.ReviewDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ReviewService {

    List<ReviewDTO> getHotelReviews(Long hotelId);

    List<ReviewDTO> getMyReviews(Authentication authentication);

    ReviewDTO createReview(ReviewDTO reviewDTO, Authentication authentication);

    ApiResponse likeReview(Long id);

    ApiResponse reportReview(Long id, String reason);
}
