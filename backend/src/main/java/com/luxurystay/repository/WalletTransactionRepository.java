package com.luxurystay.repository;

import com.luxurystay.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWalletIdOrderByTimestampDesc(Long walletId);
    Page<WalletTransaction> findByWalletIdOrderByTimestampDesc(Long walletId, Pageable pageable);
}
