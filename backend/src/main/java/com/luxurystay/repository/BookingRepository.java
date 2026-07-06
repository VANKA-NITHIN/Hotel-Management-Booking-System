package com.luxurystay.repository;

import com.luxurystay.entity.Booking;
import com.luxurystay.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String reference);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.status = :status")
    List<Booking> findByStatus(@Param("status") BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status")
    List<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.hotel.id = :hotelId ORDER BY b.createdAt DESC")
    Page<Booking> findByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.hotel.id = :hotelId AND b.status = :status")
    long countByStatusAndHotelId(@Param("hotelId") Long hotelId, @Param("status") BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = 'CONFIRMED' OR b.status = 'CHECKED_OUT'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status IN ('CONFIRMED','CHECKED_OUT') AND b.createdAt BETWEEN :start AND :end")
    BigDecimal getRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :start AND :end")
    long countBookingsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.checkInDate = :date")
    List<Booking> findCheckInsForDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.checkOutDate = :date")
    List<Booking> findCheckOutsForDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.status IN ('PENDING','CONFIRMED') AND b.checkInDate <= :date")
    List<Booking> findOverdueBookings(@Param("date") LocalDate date);

    @Query(value = "SELECT DATE(b.created_at) as booking_date, COUNT(*) as count, SUM(b.total_amount) as revenue " +
           "FROM bookings b WHERE b.created_at >= :since GROUP BY DATE(b.created_at) ORDER BY booking_date",
           nativeQuery = true)
    List<Object[]> getDailyBookingStats(@Param("since") LocalDateTime since);

    long countByHotelId(Long hotelId);

    @Query("SELECT b FROM Booking b WHERE b.hotel.id = :hotelId AND b.status IN ('CONFIRMED','CHECKED_IN') ORDER BY b.checkInDate ASC")
    List<Booking> findActiveBookingsByHotel(@Param("hotelId") Long hotelId);
}
