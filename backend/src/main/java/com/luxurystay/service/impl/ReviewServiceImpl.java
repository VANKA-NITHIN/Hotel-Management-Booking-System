package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.ReviewAnalyticsDTO;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    public ReviewAnalyticsDTO getHotelReviewAnalytics(Long hotelId) {
        List<Review> reviews = reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
        
        int totalReviews = reviews.size();
        if (totalReviews == 0) {
            return ReviewAnalyticsDTO.builder()
                    .hotelId(hotelId)
                    .totalReviews(0)
                    .averageRating(BigDecimal.ZERO)
                    .averageCleanliness(BigDecimal.ZERO)
                    .averageService(BigDecimal.ZERO)
                    .averageLocation(BigDecimal.ZERO)
                    .averageValue(BigDecimal.ZERO)
                    .ratingDistribution(new HashMap<>())
                    .build();
        }
        
        BigDecimal sumRating = BigDecimal.ZERO;
        BigDecimal sumCleanliness = BigDecimal.ZERO;
        BigDecimal sumService = BigDecimal.ZERO;
        BigDecimal sumLocation = BigDecimal.ZERO;
        BigDecimal sumValue = BigDecimal.ZERO;
        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) distribution.put(i, 0);
        
        for (Review r : reviews) {
            sumRating = sumRating.add(r.getRating());
            sumCleanliness = sumCleanliness.add(r.getCleanlinessRating() != null ? r.getCleanlinessRating() : r.getRating());
            sumService = sumService.add(r.getServiceRating() != null ? r.getServiceRating() : r.getRating());
            sumLocation = sumLocation.add(r.getLocationRating() != null ? r.getLocationRating() : r.getRating());
            sumValue = sumValue.add(r.getValueRating() != null ? r.getValueRating() : r.getRating());
            
            int stars = Math.round(r.getRating().floatValue());
            if (stars < 1) stars = 1;
            if (stars > 5) stars = 5;
            distribution.put(stars, distribution.get(stars) + 1);
        }
        
        BigDecimal total = BigDecimal.valueOf(totalReviews);
        return ReviewAnalyticsDTO.builder()
                .hotelId(hotelId)
                .totalReviews(totalReviews)
                .averageRating(sumRating.divide(total, 1, RoundingMode.HALF_UP))
                .averageCleanliness(sumCleanliness.divide(total, 1, RoundingMode.HALF_UP))
                .averageService(sumService.divide(total, 1, RoundingMode.HALF_UP))
                .averageLocation(sumLocation.divide(total, 1, RoundingMode.HALF_UP))
                .averageValue(sumValue.divide(total, 1, RoundingMode.HALF_UP))
                .ratingDistribution(distribution)
                .build();
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
                .cleanlinessRating(reviewDTO.getCleanlinessRating() != null ? reviewDTO.getCleanlinessRating() : reviewDTO.getRating())
                .serviceRating(reviewDTO.getServiceRating() != null ? reviewDTO.getServiceRating() : reviewDTO.getRating())
                .locationRating(reviewDTO.getLocationRating() != null ? reviewDTO.getLocationRating() : reviewDTO.getRating())
                .valueRating(reviewDTO.getValueRating() != null ? reviewDTO.getValueRating() : reviewDTO.getRating())
                .comment(reviewDTO.getComment())
                .photos(reviewDTO.getPhotos())
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
                .cleanlinessRating(review.getCleanlinessRating())
                .serviceRating(review.getServiceRating())
                .locationRating(review.getLocationRating())
                .valueRating(review.getValueRating())
                .comment(review.getComment())
                .photos(review.getPhotos())
                .userName(review.getUser() != null ? review.getUser().getFirstName() + " " + review.getUser().getLastName() : "Guest")
                .userImage(review.getUser() != null ? review.getUser().getProfileImage() : null)
                .createdAt(review.getCreatedAt())
                .verified(review.isVerified())
                .likes(review.getLikes())
                .reply(review.getReply())
                .repliedByName(review.getRepliedBy() != null ? review.getRepliedBy().getFirstName() : null)
                .build();
    }
}
