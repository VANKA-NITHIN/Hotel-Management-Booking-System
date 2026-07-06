package com.luxurystay.repository;

import com.luxurystay.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    boolean existsByCouponIdAndUserId(Long couponId, Long userId);

    @Query("SELECT COUNT(c) FROM CouponUsage c WHERE c.coupon.id = :couponId")
    long countByCouponId(@Param("couponId") Long couponId);
}
