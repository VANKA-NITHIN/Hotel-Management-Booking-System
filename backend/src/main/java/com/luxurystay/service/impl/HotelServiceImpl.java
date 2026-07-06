package com.luxurystay.service.impl;

import com.luxurystay.dto.*;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.exception.BadRequestException;
import com.luxurystay.exception.ResourceNotFoundException;
import com.luxurystay.mapper.HotelMapper;
import com.luxurystay.repository.*;
import com.luxurystay.service.HotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final HotelMapper hotelMapper;

    @Override
    public HotelDTO createHotel(HotelDTO hotelDTO) {
        Hotel hotel = hotelMapper.toEntity(hotelDTO);
        hotel.setRating(BigDecimal.ZERO);
        hotel.setTotalReviews(0);
        hotel.setActive(true);
        hotel = hotelRepository.save(hotel);
        return hotelMapper.toDTO(hotel);
    }

    @Override
    public HotelDTO updateHotel(Long id, HotelDTO hotelDTO) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        hotel.setName(hotelDTO.getName());
        hotel.setDescription(hotelDTO.getDescription());
        hotel.setAddress(hotelDTO.getAddress());
        hotel.setCity(hotelDTO.getCity());
        hotel.setState(hotelDTO.getState());
        hotel.setCountry(hotelDTO.getCountry());
        hotel.setZipCode(hotelDTO.getZipCode());
        hotel.setLatitude(hotelDTO.getLatitude());
        hotel.setLongitude(hotelDTO.getLongitude());
        hotel.setPhoneNumber(hotelDTO.getPhoneNumber());
        hotel.setEmail(hotelDTO.getEmail());
        hotel.setStarRating(hotelDTO.getStarRating() != null ? hotelDTO.getStarRating() : hotel.getStarRating());
        hotel.setPolicies(hotelDTO.getPolicies());
        hotel.setActive(hotelDTO.isActive());

        if (hotelDTO.getStartingPrice() != null) {
            hotel.setStartingPrice(hotelDTO.getStartingPrice());
        }
        if (hotelDTO.getLogoUrl() != null) {
            hotel.setLogoUrl(hotelDTO.getLogoUrl());
        }

        hotel = hotelRepository.save(hotel);
        return hotelMapper.toDTO(hotel);
    }

    @Override
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        hotel.setActive(false);
        hotelRepository.save(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelDTO getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        return hotelMapper.toDTO(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<HotelDTO> getAllHotels(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Hotel> hotelPage = hotelRepository.findAll(pageRequest);

        List<HotelDTO> hotels = hotelPage.getContent().stream()
                .map(hotelMapper::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<HotelDTO>builder()
                .content(hotels)
                .page(hotelPage.getNumber())
                .size(hotelPage.getSize())
                .totalElements(hotelPage.getTotalElements())
                .totalPages(hotelPage.getTotalPages())
                .last(hotelPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<HotelDTO> searchHotels(String city, Double minPrice, Double maxPrice,
                                                 Double minRating, String sort, int page, int size) {
        Sort sortObj = Sort.by("createdAt").descending();
        if ("price_low".equals(sort)) {
            sortObj = Sort.by("startingPrice").ascending();
        } else if ("price_high".equals(sort)) {
            sortObj = Sort.by("startingPrice").descending();
        } else if ("rating".equals(sort)) {
            sortObj = Sort.by("rating").descending();
        } else if ("name".equals(sort)) {
            sortObj = Sort.by("name").ascending();
        }

        PageRequest pageRequest = PageRequest.of(page, size, sortObj);

        Page<Hotel> hotelPage = hotelRepository.searchHotels(
                city,
                minPrice != null ? BigDecimal.valueOf(minPrice) : null,
                maxPrice != null ? BigDecimal.valueOf(maxPrice) : null,
                minRating != null ? BigDecimal.valueOf(minRating) : null,
                pageRequest
        );

        List<HotelDTO> hotels = hotelPage.getContent().stream()
                .map(hotelMapper::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<HotelDTO>builder()
                .content(hotels)
                .page(hotelPage.getNumber())
                .size(hotelPage.getSize())
                .totalElements(hotelPage.getTotalElements())
                .totalPages(hotelPage.getTotalPages())
                .last(hotelPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDTO> getFeaturedHotels() {
        List<Hotel> hotels = hotelRepository.findTopRated(PageRequest.of(0, 6));
        return hotels.stream().map(hotelMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getPopularDestinations() {
        return hotelRepository.findDistinctCities();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDTO> getHotelsByManager(Long managerId) {
        List<Hotel> hotels = hotelRepository.findByManagerId(managerId);
        return hotels.stream().map(hotelMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HotelDTO getHotelByManager(Long managerId) {
        List<Hotel> hotels = hotelRepository.findByManagerId(managerId);
        if (hotels.isEmpty()) {
            throw new ResourceNotFoundException("Hotel", "managerId", managerId);
        }
        return hotelMapper.toDTO(hotels.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(Long hotelId) {
        long totalRooms = hotelId != null
                ? roomRepository.countActiveByHotelId(hotelId)
                : roomRepository.countActive();
        long totalBookings = (hotelId != null
                ? bookingRepository.countByStatusAndHotelId(hotelId, BookingStatus.CONFIRMED)
                : bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                + (hotelId != null
                ? bookingRepository.countByStatusAndHotelId(hotelId, BookingStatus.CHECKED_IN)
                : bookingRepository.countByStatus(BookingStatus.CHECKED_IN));
        BigDecimal totalRevenue = hotelId != null
                ? paymentRepository.getTotalPaymentsByHotelId(hotelId)
                : paymentRepository.getTotalPayments();
        BigDecimal monthlyRevenue = paymentRepository.getPaymentsBetween(
                java.time.LocalDateTime.now().minusMonths(1), java.time.LocalDateTime.now());
        long activeBookings = (hotelId != null
                ? bookingRepository.countByStatusAndHotelId(hotelId, BookingStatus.CONFIRMED)
                : bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                + (hotelId != null
                ? bookingRepository.countByStatusAndHotelId(hotelId, BookingStatus.CHECKED_IN)
                : bookingRepository.countByStatus(BookingStatus.CHECKED_IN));

        long totalAvailableRooms = hotelId != null
                ? roomRepository.countByStatusAndHotelId(hotelId, com.luxurystay.enums.RoomStatus.AVAILABLE)
                : roomRepository.countByStatus(com.luxurystay.enums.RoomStatus.AVAILABLE);
        double occupancyRate = totalRooms > 0 ? ((double)(totalRooms - totalAvailableRooms) / totalRooms) * 100 : 0;

        return DashboardStatsDTO.builder()
                .totalHotels(hotelId != null ? 1L : hotelRepository.countActive())
                .totalRooms(totalRooms)
                .totalBookings(totalBookings)
                .totalCustomers(userRepository.countActiveUsers())
                .totalEmployees(0)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
                .activeBookings(activeBookings)
                .occupancyRate(Math.round(occupancyRate * 10.0) / 10.0)
                .averageRating(0.0)
                .build();
    }
}
