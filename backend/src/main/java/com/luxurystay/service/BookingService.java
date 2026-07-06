package com.luxurystay.service;

import com.luxurystay.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookingService {

    BookingDTO createBooking(BookingDTO bookingDTO, Long userId);

    BookingDTO getBookingById(Long id);

    BookingDTO getBookingByReference(String reference);

    PagedResponse<BookingDTO> getUserBookings(Long userId, int page, int size);

    PagedResponse<BookingDTO> getHotelBookings(Long hotelId, int page, int size);

    PagedResponse<BookingDTO> getAllBookings(int page, int size, String status);

    BookingDTO updateBookingStatus(Long id, String status);

    BookingDTO cancelBooking(Long id, String reason);

    boolean checkAvailability(Long hotelId, String checkIn, String checkOut);

    void confirmBooking(String paymentIntentId);

    long getBookingCount();
}
