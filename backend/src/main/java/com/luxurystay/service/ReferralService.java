package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.ReferralCodeDTO;
import com.luxurystay.dto.ReferralDTO;
import com.luxurystay.dto.ReferralMetricsDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ReferralService {

    ReferralCodeDTO getMyReferralCode(Authentication authentication);

    List<ReferralDTO> getMyReferrals(Authentication authentication);

    ReferralMetricsDTO getMyReferralMetrics(Authentication authentication);

    ApiResponse applyReferralCode(String referralCode, Authentication authentication);
}
