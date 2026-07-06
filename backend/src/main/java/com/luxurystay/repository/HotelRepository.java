package com.luxurystay.repository;

import com.luxurystay.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT h FROM Hotel h WHERE h.active = true")
    List<Hotel> findAllActive();

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND h.city = :city")
    List<Hotel> findByCity(@Param("city") String city);

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND " +
           "(:city IS NULL OR h.city = :city) AND " +
           "(:minPrice IS NULL OR h.startingPrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR h.startingPrice <= :maxPrice) AND " +
           "(:minRating IS NULL OR h.rating >= :minRating)")
    Page<Hotel> searchHotels(
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            Pageable pageable);

    @Query("SELECT h FROM Hotel h WHERE h.active = true ORDER BY h.rating DESC")
    List<Hotel> findTopRated(Pageable pageable);

    @Query("SELECT DISTINCT h.city FROM Hotel h WHERE h.active = true ORDER BY h.city")
    List<String> findDistinctCities();

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND h.name LIKE %:search% OR h.city LIKE %:search%")
    Page<Hotel> searchByNameOrCity(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(h) FROM Hotel h WHERE h.active = true")
    long countActive();

    List<Hotel> findByManagerId(Long managerId);

    @Query("SELECT h FROM Hotel h WHERE h.manager.id = :managerId")
    List<Hotel> findByManager(@Param("managerId") Long managerId);
}
