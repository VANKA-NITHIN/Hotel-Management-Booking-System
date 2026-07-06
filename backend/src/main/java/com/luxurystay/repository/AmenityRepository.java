package com.luxurystay.repository;

import com.luxurystay.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    Optional<Amenity> findByNameIgnoreCase(String name);

    List<Amenity> findByActiveTrue();

    @Query("SELECT a FROM Amenity a WHERE a.active = true ORDER BY a.name ASC")
    List<Amenity> findAllActive();
}
