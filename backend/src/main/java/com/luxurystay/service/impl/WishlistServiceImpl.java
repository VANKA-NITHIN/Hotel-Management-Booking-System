package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.HotelDTO;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.entity.Wishlist;
import com.luxurystay.mapper.HotelMapper;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.WishlistRepository;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final AuthService authService;
    private final HotelMapper hotelMapper;
    private final HotelRepository hotelRepository;

    @Override
    public List<HotelDTO> getWishlist(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        List<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return wishlists.stream()
                .map(w -> hotelMapper.toDTO(w.getHotel()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiResponse toggleWishlist(Long hotelId, Authentication authentication) {
        User user = authService.getCurrentUser(authentication);

        Wishlist existing = wishlistRepository.findByUserAndHotel(user.getId(), hotelId).orElse(null);
        if (existing != null) {
            wishlistRepository.delete(existing);
            return ApiResponse.builder()
                    .success(true)
                    .message("Removed from wishlist")
                    .build();
        }

        Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
        if (hotel == null) {
            return ApiResponse.builder()
                    .success(false)
                    .message("Hotel not found")
                    .build();
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .hotel(hotel)
                .build();
        wishlistRepository.save(wishlist);
        return ApiResponse.builder()
                .success(true)
                .message("Added to wishlist")
                .build();
    }

    @Override
    public Map<String, Boolean> checkWishlist(Long hotelId, Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        boolean isWishlisted = wishlistRepository.existsByUserIdAndHotelId(user.getId(), hotelId);
        return Map.of("wishlisted", isWishlisted);
    }
}
