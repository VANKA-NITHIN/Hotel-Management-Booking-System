package com.luxurystay.service.impl;

import com.luxurystay.dto.*;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.Room;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.exception.BadRequestException;
import com.luxurystay.exception.ResourceNotFoundException;
import com.luxurystay.mapper.BookingMapper;
import com.luxurystay.repository.*;
import com.luxurystay.service.BookingService;
import com.luxurystay.service.EmailService;
import com.luxurystay.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final BookingMapper bookingMapper;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    public BookingDTO createBooking(BookingDTO bookingDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Hotel hotel = hotelRepository.findById(bookingDTO.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", bookingDTO.getHotelId()));

        LocalDate checkIn = LocalDate.parse(bookingDTO.getCheckInDate());
        LocalDate checkOut = LocalDate.parse(bookingDTO.getCheckOutDate());

        if (checkIn.isBefore(LocalDate.now())) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }
        if (checkOut.isBefore(checkIn) || checkOut.equals(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }

        long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal basePrice = hotel.getStartingPrice() != null ? hotel.getStartingPrice() : BigDecimal.ZERO;
        
        for (int i = 0; i < nights; i++) {
            java.time.LocalDate currentDate = checkIn.plusDays(i);
            java.time.DayOfWeek day = currentDate.getDayOfWeek();
            BigDecimal dailyPrice = basePrice;
            
            // Dynamic Pricing: Weekend Surcharge (+20% for Friday and Saturday)
            if (day == java.time.DayOfWeek.FRIDAY || day == java.time.DayOfWeek.SATURDAY) {
                dailyPrice = dailyPrice.multiply(BigDecimal.valueOf(1.2));
            }
            
            totalAmount = totalAmount.add(dailyPrice);
        }

        BigDecimal tax = totalAmount.multiply(BigDecimal.valueOf(0.10));
        BigDecimal serviceCharge = totalAmount.multiply(BigDecimal.valueOf(0.05));
        BigDecimal discount = BigDecimal.ZERO;

        if (bookingDTO.getCouponCode() != null && !bookingDTO.getCouponCode().isEmpty()) {
            var coupon = couponRepository.findByCodeIgnoreCase(bookingDTO.getCouponCode());
            if (coupon.isPresent() && coupon.get().isActive()) {
                var c = coupon.get();
                if (c.isPercentageDiscount()) {
                    discount = totalAmount.multiply(c.getDiscountAmount()).divide(BigDecimal.valueOf(100));
                    if (c.getMaxDiscount() != null && discount.compareTo(c.getMaxDiscount()) > 0) {
                        discount = c.getMaxDiscount();
                    }
                } else {
                    discount = c.getDiscountAmount();
                }
                c.setUsedCount(c.getUsedCount() + 1);
                couponRepository.save(c);
            }
        }

        BigDecimal finalTotal = totalAmount.add(tax).add(serviceCharge).subtract(discount);

        String bookingRef = "LS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .bookingReference(bookingRef)
                .user(user)
                .hotel(hotel)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestCount(bookingDTO.getGuestCount())
                .childrenCount(bookingDTO.getChildrenCount())
                .status(BookingStatus.CONFIRMED)
                .totalAmount(finalTotal)
                .tax(tax)
                .discount(discount)
                .serviceCharge(serviceCharge)
                .couponCode(bookingDTO.getCouponCode())
                .specialRequests(bookingDTO.getSpecialRequests())
                .build();

        booking = bookingRepository.save(booking);

        // Update loyalty points (1 point per $10 spent)
        int pointsEarned = finalTotal.intValue() / 10;
        user.setLoyaltyPoints(user.getLoyaltyPoints() + pointsEarned);
        userRepository.save(user);

        log.info("Booking created: {} for user: {} at hotel: {}", bookingRef, userId, hotel.getName());

        // Send confirmation email asynchronously
        try {
            emailService.sendBookingConfirmation(booking);
            notificationService.createNotification(
                userId,
                "Booking Confirmed",
                "Your booking " + bookingRef + " at " + hotel.getName() + " is confirmed.",
                "BOOKING_CONFIRMATION",
                "/dashboard"
            );
        } catch (Exception e) {
            log.error("Failed to send booking confirmation or notification: {}", e.getMessage());
        }

        return toDTO(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return toDTO(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDTO getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", reference));
        return toDTO(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingDTO> getUserBookings(Long userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookingPage = bookingRepository.findByUserId(userId, pageRequest);

        List<BookingDTO> bookings = bookingPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<BookingDTO>builder()
                .content(bookings)
                .page(bookingPage.getNumber())
                .size(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .last(bookingPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingDTO> getHotelBookings(Long hotelId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookingPage = bookingRepository.findByHotelId(hotelId, pageRequest);

        List<BookingDTO> bookings = bookingPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<BookingDTO>builder()
                .content(bookings)
                .page(bookingPage.getNumber())
                .size(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .last(bookingPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingDTO> getAllBookings(int page, int size, String status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookingPage;

        if (status != null && !status.isEmpty()) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status);
            List<Booking> filtered = bookingRepository.findByStatus(bookingStatus);
            int start = Math.min(page * size, filtered.size());
            int end = Math.min(start + size, filtered.size());
            List<BookingDTO> bookings = filtered.subList(start, end).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());

            return PagedResponse.<BookingDTO>builder()
                    .content(bookings)
                    .page(page)
                    .size(size)
                    .totalElements(filtered.size())
                    .totalPages((int) Math.ceil((double) filtered.size() / size))
                    .last(end >= filtered.size())
                    .build();
        }

        bookingPage = bookingRepository.findAll(pageRequest);
        List<BookingDTO> bookings = bookingPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<BookingDTO>builder()
                .content(bookings)
                .page(bookingPage.getNumber())
                .size(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .last(bookingPage.isLast())
                .build();
    }

    @Override
    public BookingDTO updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        booking.setStatus(BookingStatus.valueOf(status));
        booking = bookingRepository.save(booking);

        try {
            notificationService.createNotification(
                booking.getUser().getId(),
                "Booking Status Updated",
                "Your booking " + booking.getBookingReference() + " status is now " + status + ".",
                "SYSTEM_ALERT",
                "/dashboard"
            );
        } catch (Exception e) {
            log.error("Failed to create notification: {}", e.getMessage());
        }

        return toDTO(booking);
    }

    @Override
    public BookingDTO cancelBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REFUNDED) {
            throw new BadRequestException("Booking is already cancelled or refunded");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        // Send cancellation email asynchronously
        try {
            emailService.sendBookingCancellation(booking);
            notificationService.createNotification(
                booking.getUser().getId(),
                "Booking Cancelled",
                "Your booking " + booking.getBookingReference() + " has been cancelled.",
                "SYSTEM_ALERT",
                "/dashboard"
            );
        } catch (Exception e) {
            log.error("Failed to send booking cancellation or notification: {}", e.getMessage());
        }

        return toDTO(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long hotelId, String checkIn, String checkOut) {
        LocalDate in = LocalDate.parse(checkIn);
        LocalDate out = LocalDate.parse(checkOut);
        List<Room> available = roomRepository.findAvailableRooms(hotelId, in, out);
        return !available.isEmpty();
    }

    @Override
    public void confirmBooking(String paymentIntentId) {
        // Find booking by payment intent and confirm
        log.info("Confirming booking with payment intent: {}", paymentIntentId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getBookingCount() {
        return bookingRepository.count();
    }

    private BookingDTO toDTO(Booking booking) {
        com.luxurystay.dto.UserDTO userDTO = null;
        if (booking.getUser() != null) {
            userDTO = com.luxurystay.dto.UserDTO.builder()
                    .id(booking.getUser().getId())
                    .firstName(booking.getUser().getFirstName())
                    .lastName(booking.getUser().getLastName())
                    .email(booking.getUser().getEmail())
                    .phone(booking.getUser().getPhone())
                    .build();
        }

        com.luxurystay.dto.HotelDTO hotelDTO = null;
        if (booking.getHotel() != null) {
            hotelDTO = com.luxurystay.dto.HotelDTO.builder()
                    .id(booking.getHotel().getId())
                    .name(booking.getHotel().getName())
                    .city(booking.getHotel().getCity())
                    .address(booking.getHotel().getAddress())
                    .logoUrl(booking.getHotel().getLogoUrl())
                    .rating(booking.getHotel().getRating())
                    .startingPrice(booking.getHotel().getStartingPrice())
                    .build();
        }

        return BookingDTO.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .hotelId(booking.getHotel().getId())
                .checkInDate(booking.getCheckInDate().format(DateTimeFormatter.ISO_DATE))
                .checkOutDate(booking.getCheckOutDate().format(DateTimeFormatter.ISO_DATE))
                .guestCount(booking.getGuestCount())
                .childrenCount(booking.getChildrenCount())
                .status(booking.getStatus().name())
                .totalAmount(booking.getTotalAmount())
                .tax(booking.getTax())
                .discount(booking.getDiscount())
                .serviceCharge(booking.getServiceCharge())
                .couponCode(booking.getCouponCode())
                .specialRequests(booking.getSpecialRequests())
                .user(userDTO)
                .hotel(hotelDTO)
                .build();
    }
}
