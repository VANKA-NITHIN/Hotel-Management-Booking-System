package com.luxurystay.service.impl;

import com.luxurystay.config.RewardConstants;
import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.ReferralCodeDTO;
import com.luxurystay.dto.ReferralDTO;
import com.luxurystay.dto.ReferralMetricsDTO;
import com.luxurystay.entity.Referral;
import com.luxurystay.entity.User;
import com.luxurystay.entity.Wallet;
import com.luxurystay.enums.ReferralStatus;
import com.luxurystay.enums.TransactionType;
import com.luxurystay.repository.ReferralRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.repository.WalletRepository;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.ReferralService;
import com.luxurystay.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReferralServiceImpl implements ReferralService {

    private final UserRepository userRepository;
    private final ReferralRepository referralRepository;
    private final AuthService authService;
    private final WalletService walletService;
    private final WalletRepository walletRepository;

    @Value("${app.referral.demo-mode:true}")
    private boolean demoMode;

    @Override
    @Transactional
    public ReferralCodeDTO getMyReferralCode(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        if (user.getReferralCode() == null || user.getReferralCode().isEmpty()) {
            user.setReferralCode(generateUniqueCode());
            user = userRepository.save(user);
        }
        return new ReferralCodeDTO(user.getReferralCode());
    }

    @Override
    public List<ReferralDTO> getMyReferrals(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        return referralRepository.findByReferrerIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ref -> ReferralDTO.builder()
                        .id(ref.getId())
                        .referredUserName(ref.getReferredUser().getFirstName() + " " + ref.getReferredUser().getLastName())
                        .status(ref.getStatus().name())
                        .rewardPoints(ref.getRewardPoints())
                        .createdAt(ref.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ReferralMetricsDTO getMyReferralMetrics(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        long total = referralRepository.countByReferrerId(user.getId());
        long successful = referralRepository.countByReferrerIdAndStatus(user.getId(), ReferralStatus.REWARDED);
        long pending = referralRepository.countByReferrerIdAndStatus(user.getId(), ReferralStatus.ACCEPTED);
        long pointsEarned = successful * RewardConstants.REFERRAL_REWARD;

        return ReferralMetricsDTO.builder()
                .totalReferrals(total)
                .successfulReferrals(successful)
                .pendingReferrals(pending)
                .totalRewardsEarned(pointsEarned)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse applyReferralCode(String referralCode, Authentication authentication) {
        User currentUser = authService.getCurrentUser(authentication);

        if (currentUser.getReferredByCode() != null && !currentUser.getReferredByCode().isEmpty()) {
            throw new RuntimeException("You have already applied a referral code.");
        }

        User referrer = userRepository.findByReferralCode(referralCode)
                .orElseThrow(() -> new RuntimeException("Invalid referral code."));

        if (referrer.getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot refer yourself.");
        }

        if (referralRepository.existsByReferredUserId(currentUser.getId())) {
            throw new RuntimeException("You have already been referred.");
        }

        // Apply referral code
        currentUser.setReferredByCode(referralCode);
        userRepository.save(currentUser);

        // Create Referral Record
        Referral referral = Referral.builder()
                .referrer(referrer)
                .referredUser(currentUser)
                .status(ReferralStatus.ACCEPTED)
                .rewardPoints(RewardConstants.REFERRAL_REWARD)
                .build();

        referralRepository.save(referral);

        if (demoMode) {
            // Instantly transition to REWARDED
            processReward(referral);
        }

        return ApiResponse.builder()
                .success(true)
                .message("Referral code applied successfully!")
                .build();
    }

    private void processReward(Referral referral) {
        referral.setStatus(ReferralStatus.REWARDED);
        referral.setRewardIssuedAt(LocalDateTime.now());
        referral.setRewardType("POINTS");
        referralRepository.save(referral);

        // Reward Referrer
        User referrer = referral.getReferrer();
        referrer.setLoyaltyPoints(referrer.getLoyaltyPoints() + RewardConstants.REFERRAL_REWARD);
        userRepository.save(referrer);

        Wallet referrerWallet = walletRepository.findByUserId(referrer.getId()).orElse(null);
        if (referrerWallet != null) {
            // Equivalent dollar value for demo: 500 points = $5.00
            BigDecimal rewardAmount = BigDecimal.valueOf(5.00);
            referrerWallet.setBalance(referrerWallet.getBalance().add(rewardAmount));
            walletRepository.save(referrerWallet);
            // Ideally we also create a WalletTransaction here, but WalletService usually handles this.
            // Since WalletService handles creation, let's keep it simple or call it if available.
        }

        // Reward Referred User
        User referredUser = referral.getReferredUser();
        referredUser.setLoyaltyPoints(referredUser.getLoyaltyPoints() + RewardConstants.REFERRAL_REWARD);
        userRepository.save(referredUser);
        
        Wallet referredWallet = walletRepository.findByUserId(referredUser.getId()).orElse(null);
        if (referredWallet != null) {
            BigDecimal rewardAmount = BigDecimal.valueOf(5.00);
            referredWallet.setBalance(referredWallet.getBalance().add(rewardAmount));
            walletRepository.save(referredWallet);
        }
    }

    private String generateUniqueCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
