package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.ReferralCodeDTO;
import com.luxurystay.dto.ReferralDTO;
import com.luxurystay.dto.ReferralMetricsDTO;
import com.luxurystay.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @GetMapping("/my-code")
    public ResponseEntity<ReferralCodeDTO> getMyReferralCode(Authentication authentication) {
        return ResponseEntity.ok(referralService.getMyReferralCode(authentication));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ReferralDTO>> getMyReferrals(Authentication authentication) {
        return ResponseEntity.ok(referralService.getMyReferrals(authentication));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ReferralMetricsDTO> getMyReferralMetrics(Authentication authentication) {
        return ResponseEntity.ok(referralService.getMyReferralMetrics(authentication));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse> applyReferralCode(@RequestBody Map<String, String> payload, Authentication authentication) {
        String code = payload.get("referralCode");
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.builder().success(false).message("Referral code is required.").build());
        }
        return ResponseEntity.ok(referralService.applyReferralCode(code, authentication));
    }
}
