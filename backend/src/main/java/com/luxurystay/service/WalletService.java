package com.luxurystay.service;

import com.luxurystay.dto.WalletDTO;
import com.luxurystay.dto.WalletTransactionDTO;
import com.luxurystay.entity.Coupon;
import com.luxurystay.entity.User;
import com.luxurystay.entity.Wallet;
import com.luxurystay.entity.WalletTransaction;
import com.luxurystay.enums.TransactionStatus;
import com.luxurystay.enums.TransactionType;
import com.luxurystay.repository.CouponRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.repository.WalletRepository;
import com.luxurystay.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public WalletDTO getOrCreateWallet(String email) {
        return walletRepository.findByUserEmail(email)
                .map(this::mapToDTO)
                .orElseGet(() -> createWallet(email));
    }

    @Transactional
    private WalletDTO createWallet(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        Wallet wallet = Wallet.builder().user(user).build();
        return mapToDTO(walletRepository.save(wallet));
    }

    @Transactional(readOnly = true)
    public Page<WalletTransactionDTO> getWalletTransactions(String email, int page, int size) {
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
                
        return walletTransactionRepository
                .findByWalletIdOrderByTimestampDesc(wallet.getId(), PageRequest.of(page, size))
                .map(this::mapTransactionToDTO);
    }

    @Transactional
    public WalletDTO addTransaction(String email, BigDecimal amount, TransactionType type, String referenceId, String description) {
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(TransactionStatus.COMPLETED)
                .referenceId(referenceId)
                .description(description)
                .build();
                
        wallet.setBalance(wallet.getBalance().add(amount));
        
        // Calculate loyalty tier (simplified logic)
        updateLoyaltyTier(wallet);

        walletTransactionRepository.save(tx);
        return mapToDTO(walletRepository.save(wallet));
    }

    /**
     * SECURITY: redeem loyalty points for wallet credit. Validates that the user actually
     * owns the points being redeemed and debits them - previously any positive value was
     * credited without checking the balance (unlimited money minting).
     */
    @Transactional
    public WalletDTO redeemPoints(String email, int pointsToRedeem) {
        if (pointsToRedeem <= 0) {
            throw new IllegalArgumentException("Points to redeem must be positive");
        }
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getRewardPoints() < pointsToRedeem) {
            throw new IllegalArgumentException("Insufficient reward points");
        }

        // 100 points = $1.00
        BigDecimal amount = BigDecimal.valueOf(pointsToRedeem).divide(BigDecimal.valueOf(100));

        wallet.setRewardPoints(wallet.getRewardPoints() - pointsToRedeem);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(TransactionType.REWARD_REDEMPTION)
                .status(TransactionStatus.COMPLETED)
                .referenceId("RED-" + System.currentTimeMillis())
                .description("Redeemed " + pointsToRedeem + " points")
                .build();

        wallet.setBalance(wallet.getBalance().add(amount));
        walletTransactionRepository.save(tx);
        return mapToDTO(walletRepository.save(wallet));
    }

    /**
     * SECURITY: apply a coupon code for wallet credit. Validates the coupon exists / is active /
     * not expired / not over its usage limit, and that this user has not already applied this
     * coupon - previously ANY string returned $50 and could be repeated indefinitely.
     */
    @Transactional
    public WalletDTO applyCoupon(String email, String couponCode) {
        if (couponCode == null || couponCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Coupon code is required");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));
        if (!coupon.isActive()) {
            throw new IllegalArgumentException("Coupon is not active");
        }
        if (coupon.getEndDate() != null && coupon.getEndDate().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon has expired");
        }
        if (coupon.getStartDate() != null && coupon.getStartDate().isAfter(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon is not yet valid");
        }
        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new IllegalArgumentException("Coupon usage limit reached");
        }

        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        String referenceId = "CPN-" + coupon.getCode().toUpperCase();
        if (walletTransactionRepository.existsByWalletIdAndReferenceId(wallet.getId(), referenceId)) {
            throw new IllegalArgumentException("Coupon already applied");
        }

        BigDecimal amount = coupon.getDiscountAmount() != null ? coupon.getDiscountAmount() : BigDecimal.ZERO;
        if (coupon.isPercentageDiscount()) {
            amount = coupon.getMaxDiscount() != null ? coupon.getMaxDiscount() : amount;
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Coupon has no redeemable value");
        }

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(TransactionType.COUPON_CREDIT)
                .status(TransactionStatus.COMPLETED)
                .referenceId(referenceId)
                .description("Applied coupon: " + coupon.getCode())
                .build();

        wallet.setBalance(wallet.getBalance().add(amount));
        walletTransactionRepository.save(tx);
        return mapToDTO(walletRepository.save(wallet));
    }

    private void updateLoyaltyTier(Wallet wallet) {
        // Simple logic for tier progression based on reward points
        if (wallet.getRewardPoints() > 10000) wallet.setLoyaltyTier("Diamond");
        else if (wallet.getRewardPoints() > 5000) wallet.setLoyaltyTier("Platinum");
        else if (wallet.getRewardPoints() > 2000) wallet.setLoyaltyTier("Gold");
        else wallet.setLoyaltyTier("Silver");
    }

    private WalletDTO mapToDTO(Wallet wallet) {
        return WalletDTO.builder()
                .id(wallet.getId())
                .userId(wallet.getUser().getId())
                .balance(wallet.getBalance())
                .rewardPoints(wallet.getRewardPoints())
                .loyaltyTier(wallet.getLoyaltyTier())
                .tierProgress(wallet.getTierProgress())
                .transactions(
                    wallet.getTransactions() != null 
                        ? wallet.getTransactions().stream().map(this::mapTransactionToDTO).collect(Collectors.toList()) 
                        : List.of()
                )
                .build();
    }

    private WalletTransactionDTO mapTransactionToDTO(WalletTransaction tx) {
        return WalletTransactionDTO.builder()
                .id(tx.getId())
                .walletId(tx.getWallet().getId())
                .amount(tx.getAmount())
                .type(tx.getType())
                .status(tx.getStatus())
                .referenceId(tx.getReferenceId())
                .description(tx.getDescription())
                .timestamp(tx.getTimestamp())
                .build();
    }
}
