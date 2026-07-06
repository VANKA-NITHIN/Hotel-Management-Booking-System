package com.luxurystay.repository;

import com.luxurystay.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate start, LocalDate end);

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employee.hotel.id = :hotelId AND a.date = :date")
    List<Attendance> findByHotelIdAndDate(@Param("hotelId") Long hotelId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.hotel.id = :hotelId AND a.date = :date AND a.status = 'PRESENT'")
    long countPresentByHotelAndDate(@Param("hotelId") Long hotelId, @Param("date") LocalDate date);
}
