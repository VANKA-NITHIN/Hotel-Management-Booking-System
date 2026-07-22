package com.luxurystay.service;

import com.luxurystay.dto.HotelDTO;
import com.luxurystay.dto.PagedResponse;
import com.luxurystay.entity.Hotel;
import com.luxurystay.exception.ResourceNotFoundException;
import com.luxurystay.mapper.HotelMapper;
import com.luxurystay.repository.*;
import com.luxurystay.service.impl.HotelServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class HotelServiceImplTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private HotelMapper hotelMapper;

    @InjectMocks
    private HotelServiceImpl hotelService;

    private Hotel hotel;
    private HotelDTO hotelDTO;

    @BeforeEach
    void setUp() {
        hotel = Hotel.builder()
                .id(1L)
                .name("Grand Plaza")
                .city("New York")
                .country("USA")
                .rating(BigDecimal.valueOf(4.5))
                .build();
                
        hotelDTO = HotelDTO.builder()
                .id(1L)
                .name("Grand Plaza")
                .city("New York")
                .country("USA")
                .rating(BigDecimal.valueOf(4.5))
                .build();
    }

    @Test
    void testCreateHotel() {
        when(hotelMapper.toEntity(any(HotelDTO.class))).thenReturn(hotel);
        when(hotelRepository.save(any(Hotel.class))).thenReturn(hotel);
        when(hotelMapper.toDTO(any(Hotel.class))).thenReturn(hotelDTO);

        HotelDTO result = hotelService.createHotel(hotelDTO);

        assertNotNull(result);
        assertEquals("Grand Plaza", result.getName());
        verify(hotelRepository).save(any(Hotel.class));
    }

    @Test
    void testGetHotelById_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(hotelMapper.toDTO(hotel)).thenReturn(hotelDTO);

        HotelDTO result = hotelService.getHotelById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetHotelById_NotFound() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> hotelService.getHotelById(1L));
    }

    @Test
    void testGetAllHotels() {
        Page<Hotel> hotelPage = new PageImpl<>(List.of(hotel));
        when(hotelRepository.findAll(any(PageRequest.class))).thenReturn(hotelPage);
        when(hotelMapper.toDTO(any(Hotel.class))).thenReturn(hotelDTO);

        PagedResponse<HotelDTO> response = hotelService.getAllHotels(0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(1, response.getTotalElements());
    }
}
