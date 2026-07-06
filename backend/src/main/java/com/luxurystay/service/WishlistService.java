package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.HotelDTO;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

public interface WishlistService {

    List<HotelDTO> getWishlist(Authentication authentication);

    ApiResponse toggleWishlist(Long hotelId, Authentication authentication);

    Map<String, Boolean> checkWishlist(Long hotelId, Authentication authentication);
}
