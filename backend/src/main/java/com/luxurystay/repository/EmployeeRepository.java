package com.luxurystay.repository;

import com.luxurystay.entity.Employee;
import com.luxurystay.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByHotelIdAndActiveTrue(Long hotelId);

    Optional<Employee> findByUserId(Long userId);

    @Query("SELECT e FROM Employee e WHERE e.hotel.id = :hotelId AND e.position = :position")
    List<Employee> findByHotelIdAndPosition(@Param("hotelId") Long hotelId, @Param("position") Role position);

    @Query("SELECT e FROM Employee e WHERE e.active = true")
    Page<Employee> findAllActive(Pageable pageable);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.active = true")
    long countActive();

    boolean existsByUserId(Long userId);
}
