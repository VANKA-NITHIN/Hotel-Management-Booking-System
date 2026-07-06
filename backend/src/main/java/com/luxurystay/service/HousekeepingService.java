package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.HousekeepingDTO;

import java.util.List;

public interface HousekeepingService {

    List<HousekeepingDTO> getHotelHousekeeping(Long hotelId, String status);

    ApiResponse updateStatus(Long id, String status);
}
