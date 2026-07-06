package com.luxurystay.repository;

import com.luxurystay.entity.Maintenance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByRoomHotelIdAndStatus(Long hotelId, String status);

    Page<Maintenance> findByStatus(String status, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Maintenance m WHERE m.room.hotel.id = :hotelId AND m.status = :status")
    long countByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") String status);

    List<Maintenance> findByAssignedToIdAndStatus(Long employeeId, String status);
}
