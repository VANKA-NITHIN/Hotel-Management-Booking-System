package com.luxurystay.repository;

import com.luxurystay.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Wishlist> findByUserIdAndHotelId(Long userId, Long hotelId);

    boolean existsByUserIdAndHotelId(Long userId, Long hotelId);

    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId AND w.hotel.id = :hotelId")
    Optional<Wishlist> findByUserAndHotel(@Param("userId") Long userId, @Param("hotelId") Long hotelId);
}
