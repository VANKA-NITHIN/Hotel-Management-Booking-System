package com.luxurystay.repository;

import com.luxurystay.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    Optional<CheckIn> findByBookingId(Long bookingId);
}
