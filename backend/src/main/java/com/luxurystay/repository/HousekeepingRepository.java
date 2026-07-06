package com.luxurystay.repository;

import com.luxurystay.entity.Housekeeping;
import com.luxurystay.enums.CleaningStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HousekeepingRepository extends JpaRepository<Housekeeping, Long> {

    List<Housekeeping> findByRoomHotelIdAndStatus(Long hotelId, CleaningStatus status);

    List<Housekeeping> findByAssignedToIdAndStatus(Long employeeId, CleaningStatus status);

    @Query("SELECT h FROM Housekeeping h WHERE h.room.hotel.id = :hotelId AND h.inspectionRequired = true AND h.inspectionPassed = false")
    List<Housekeeping> findPendingInspection(@Param("hotelId") Long hotelId);

    @Query("SELECT COUNT(h) FROM Housekeeping h WHERE h.room.hotel.id = :hotelId AND h.status = :status")
    long countByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") CleaningStatus status);
}
