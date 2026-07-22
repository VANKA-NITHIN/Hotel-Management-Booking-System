package com.luxurystay.repository;

import com.luxurystay.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {
    List<Referral> findByReferrerIdOrderByCreatedAtDesc(Long referrerId);
    boolean existsByReferredUserId(Long referredUserId);
    long countByReferrerId(Long referrerId);
    long countByReferrerIdAndStatus(Long referrerId, com.luxurystay.enums.ReferralStatus status);
}
