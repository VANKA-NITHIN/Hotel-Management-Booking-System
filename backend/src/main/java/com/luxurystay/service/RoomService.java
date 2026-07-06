package com.luxurystay.service;

import com.luxurystay.dto.PagedResponse;
import com.luxurystay.dto.RoomDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface RoomService {

    RoomDTO createRoom(Long hotelId, RoomDTO roomDTO);

    RoomDTO updateRoom(Long hotelId, Long roomId, RoomDTO roomDTO);

    void deleteRoom(Long hotelId, Long roomId);

    RoomDTO getRoomById(Long hotelId, Long roomId);

    PagedResponse<RoomDTO> getRoomsByHotel(Long hotelId, String roomType,
                                            BigDecimal minPrice, BigDecimal maxPrice,
                                            Integer maxGuests, int page, int size);

    List<RoomDTO> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut);

    List<RoomDTO> getAllRoomsByHotel(Long hotelId);

    RoomDTO getRoomDetails(Long roomId);

    void updateRoomStatus(Long roomId, String status);

    void updateCleaningStatus(Long roomId, String status);
}
