package com.luxurystay.controller;

import com.luxurystay.dto.WalletDTO;
import com.luxurystay.dto.WalletTransactionDTO;
import com.luxurystay.enums.TransactionType;
import com.luxurystay.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<WalletDTO> getMyWallet(Authentication authentication) {
        String email = authentication.getName(); // Usually email from JWT
        return ResponseEntity.ok(walletService.getOrCreateWallet(email));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<Page<WalletTransactionDTO>> getMyTransactions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getWalletTransactions(email, page, size));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<WalletDTO> redeemPoints(Authentication authentication, @RequestBody Map<String, Integer> payload) {
        String email = authentication.getName();
        int pointsToRedeem = payload.getOrDefault("points", 0);
        
        // Example conversion: 100 points = $1.00
        BigDecimal amount = BigDecimal.valueOf(pointsToRedeem).divide(BigDecimal.valueOf(100));
        
        return ResponseEntity.ok(walletService.addTransaction(
                email, 
                amount, 
                TransactionType.REWARD_REDEMPTION, 
                "RED-" + System.currentTimeMillis(), 
                "Redeemed " + pointsToRedeem + " points"
        ));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<WalletDTO> applyCoupon(Authentication authentication, @RequestBody Map<String, String> payload) {
        String email = authentication.getName();
        String couponCode = payload.get("couponCode");
        
        // Simplified logic: every coupon gives $50 for demo
        BigDecimal amount = new BigDecimal("50.00");
        
        return ResponseEntity.ok(walletService.addTransaction(
                email, 
                amount, 
                TransactionType.COUPON_CREDIT, 
                "CPN-" + couponCode, 
                "Applied coupon: " + couponCode
        ));
    }
}
