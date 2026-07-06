package com.luxurystay.service.impl;

import com.luxurystay.dto.ChartDataPointDTO;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.PaymentRepository;
import com.luxurystay.repository.RoomRepository;
import com.luxurystay.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final RoomRepository roomRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM");

    @Override
    public List<ChartDataPointDTO> getMonthlyStats(Long hotelId) {
        List<ChartDataPointDTO> data = new ArrayList<>();
        YearMonth current = YearMonth.now();

        for (int i = 11; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);

            BigDecimal revenue = paymentRepository.getPaymentsBetween(start, end);
            long bookings = bookingRepository.countBookingsBetween(start, end);
            long totalRooms = hotelId != null
                    ? roomRepository.countActiveByHotelId(hotelId)
                    : roomRepository.countActive();
            long availableRooms = hotelId != null
                    ? roomRepository.countByStatusAndHotelId(hotelId, com.luxurystay.enums.RoomStatus.AVAILABLE)
                    : roomRepository.countByStatus(com.luxurystay.enums.RoomStatus.AVAILABLE);
            double occupancy = totalRooms > 0
                    ? Math.round(((double) (totalRooms - availableRooms) / totalRooms) * 100 * 10.0) / 10.0
                    : 0;

            data.add(ChartDataPointDTO.builder()
                    .month(ym.format(MONTH_FMT))
                    .revenue(revenue != null ? revenue.doubleValue() : 0)
                    .bookings(bookings)
                    .occupancy(occupancy)
                    .totalRooms(totalRooms)
                    .build());
        }
        return data;
    }
}
