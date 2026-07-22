package com.luxurystay.service;

import com.luxurystay.dto.CorporateAnalyticsDTO;
import org.springframework.security.core.Authentication;

public interface CorporateAnalyticsService {
    CorporateAnalyticsDTO getAnalytics(Authentication authentication);
}
