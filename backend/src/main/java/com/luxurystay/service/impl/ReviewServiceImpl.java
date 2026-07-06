package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.ReviewDTO;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.Review;
import com.luxurystay.entity.User;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.ReviewRepository;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;

    @Override
    public List<ReviewDTO> getHotelReviews(Long hotelId) {
        return reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewDTO> getMyReviews(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewDTO createReview(ReviewDTO reviewDTO, Authentication authentication) {
        User user = authService.getCurrentUser(authentication);

        if (reviewRepository.existsByUserIdAndBookingId(user.getId(), reviewDTO.getBookingId())) {
            return null;
        }

        Hotel hotel = hotelRepository.findById(reviewDTO.getHotelId()).orElse(null);
        Booking booking = reviewDTO.getBookingId() != null
                ? bookingRepository.findById(reviewDTO.getBookingId()).orElse(null)
                : null;

        Review review = Review.builder()
                .user(user)
                .hotel(hotel)
                .booking(booking)
                .rating(reviewDTO.getRating())
                .comment(reviewDTO.getComment())
                .verified(true)
                .build();

        review = reviewRepository.save(review);
        return toDTO(review);
    }

    @Override
    @Transactional
    public ApiResponse likeReview(Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review != null) {
            review.setLikes(review.getLikes() + 1);
            reviewRepository.save(review);
        }
        return ApiResponse.builder()
                .success(true)
                .message("Review liked")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse reportReview(Long id, String reason) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review != null) {
            review.setReported(true);
            review.setReportReason(reason);
            reviewRepository.save(review);
        }
        return ApiResponse.builder()
                .success(true)
                .message("Review reported")
                .build();
    }

    private ReviewDTO toDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .hotelId(review.getHotel() != null ? review.getHotel().getId() : null)
                .roomId(review.getRoom() != null ? review.getRoom().getId() : null)
                .bookingId(review.getBooking() != null ? review.getBooking().getId() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .build();
    }
}
