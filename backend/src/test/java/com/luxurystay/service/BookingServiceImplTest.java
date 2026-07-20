package com.luxurystay.service;

import com.luxurystay.dto.BookingDTO;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.Room;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.enums.RoomType;
import com.luxurystay.exception.BadRequestException;
import com.luxurystay.mapper.BookingMapper;
import com.luxurystay.repository.*;
import com.luxurystay.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private HotelRepository hotelRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookingMapper bookingMapper;
    @Mock
    private EmailService emailService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User user;
    private Hotel hotel;
    private Room room;
    private BookingDTO request;
    private Booking booking;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@example.com").build();
        hotel = Hotel.builder().id(1L).name("Luxury Hotel").build();
        room = Room.builder()
                .id(1L)
                .hotel(hotel)
                .roomType(RoomType.DELUXE)
                .pricePerNight(BigDecimal.valueOf(200))
                .maxGuests(2)
                .build();
        
        request = BookingDTO.builder()
                .hotelId(1L)
                .userId(1L)
                .checkInDate(LocalDate.now().plusDays(1))
                .checkOutDate(LocalDate.now().plusDays(3))
                .guestCount(2)
                .roomIds(List.of(1L))
                .build();
                
        booking = Booking.builder()
                .id(1L)
                .user(user)
                .hotel(hotel)
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(400))
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .build();
    }

    @Test
    void testCreateBooking_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        // Assume room is available
        when(bookingRepository.findOverlappingBookings(any(), any(), any())).thenReturn(List.of());
        
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toDTO(any(Booking.class))).thenReturn(request);

        BookingDTO result = bookingService.createBooking(request);

        assertNotNull(result);
        verify(bookingRepository).save(any(Booking.class));
        verify(emailService).sendBookingConfirmationEmail(any(), any());
        verify(notificationService).createNotification(any(), any(), any());
    }

    @Test
    void testCreateBooking_RoomNotAvailable() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        
        // Return a conflicting booking
        when(bookingRepository.findOverlappingBookings(any(), any(), any()))
                .thenReturn(List.of(new Booking()));

        assertThrows(BadRequestException.class, () -> bookingService.createBooking(request));
        verify(bookingRepository, never()).save(any());
    }
    
    @Test
    void testCancelBooking_Success() {
        booking.setStatus(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toDTO(booking)).thenReturn(request);

        BookingDTO result = bookingService.cancelBooking(1L, "User requested cancellation");

        assertNotNull(result);
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        verify(bookingRepository).save(booking);
    }

    @Test
    void testCancelBooking_AlreadyCancelled() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class, () -> bookingService.cancelBooking(1L, "Cancel again"));
        verify(bookingRepository, never()).save(any());
    }
}
