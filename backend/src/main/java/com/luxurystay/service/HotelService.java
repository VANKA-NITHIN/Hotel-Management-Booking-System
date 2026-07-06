package com.luxurystay.service;

import com.luxurystay.dto.*;
import com.luxurystay.entity.Hotel;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HotelService {

    HotelDTO createHotel(HotelDTO hotelDTO);

    HotelDTO updateHotel(Long id, HotelDTO hotelDTO);

    void deleteHotel(Long id);

    HotelDTO getHotelById(Long id);

    PagedResponse<HotelDTO> getAllHotels(int page, int size);

    PagedResponse<HotelDTO> searchHotels(String city, Double minPrice, Double maxPrice,
                                         Double minRating, String sort, int page, int size);

    List<HotelDTO> getFeaturedHotels();

    List<String> getPopularDestinations();

    List<HotelDTO> getHotelsByManager(Long managerId);

    HotelDTO getHotelByManager(Long managerId);

    DashboardStatsDTO getDashboardStats(Long hotelId);
}
