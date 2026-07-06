package com.luxurystay.repository;

import com.luxurystay.entity.Room;
import com.luxurystay.enums.RoomStatus;
import com.luxurystay.enums.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelIdAndActiveTrue(Long hotelId);

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.active = true AND " +
           "r.status = 'AVAILABLE' AND " +
           "r NOT IN (SELECT br.room FROM BookingRoom br JOIN br.booking b " +
           "WHERE b.hotel.id = :hotelId AND b.status != 'CANCELLED' AND " +
           "b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn)")
    List<Room> findAvailableRooms(
            @Param("hotelId") Long hotelId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.active = true AND " +
           "(:roomType IS NULL OR r.roomType = :roomType) AND " +
           "(:minPrice IS NULL OR r.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR r.pricePerNight <= :maxPrice) AND " +
           "(:maxGuests IS NULL OR r.maxGuests >= :maxGuests)")
    Page<Room> searchRooms(
            @Param("hotelId") Long hotelId,
            @Param("roomType") RoomType roomType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("maxGuests") Integer maxGuests,
            Pageable pageable);

    @Query("SELECT r FROM Room r WHERE r.active = true AND r.status = 'AVAILABLE'")
    List<Room> findAllAvailable();

    @Query("SELECT COUNT(r) FROM Room r WHERE r.active = true")
    long countActive();

    @Query("SELECT COUNT(r) FROM Room r WHERE r.hotel.id = :hotelId AND r.active = true")
    long countActiveByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT COUNT(r) FROM Room r WHERE r.status = :status")
    long countByStatus(@Param("status") RoomStatus status);

    @Query("SELECT COUNT(r) FROM Room r WHERE r.hotel.id = :hotelId AND r.status = :status")
    long countByStatusAndHotelId(@Param("hotelId") Long hotelId, @Param("status") RoomStatus status);

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.roomType = :roomType AND r.active = true")
    List<Room> findByHotelIdAndRoomType(@Param("hotelId") Long hotelId, @Param("roomType") RoomType roomType);
}
