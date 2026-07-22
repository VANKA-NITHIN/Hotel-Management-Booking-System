package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.CompanyDTO;
import org.springframework.security.core.Authentication;

public interface CompanyService {
    ApiResponse registerCompany(CompanyDTO dto, Authentication authentication);
    CompanyDTO getMyCompany(Authentication authentication);
}
