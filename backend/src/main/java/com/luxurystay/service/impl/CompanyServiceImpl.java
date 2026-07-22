package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.CompanyDTO;
import com.luxurystay.entity.Company;
import com.luxurystay.entity.User;
import com.luxurystay.enums.CompanyStatus;
import com.luxurystay.enums.CorporateRole;
import com.luxurystay.repository.CompanyRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Override
    @Transactional
    public ApiResponse registerCompany(CompanyDTO dto, Authentication authentication) {
        User user = authService.getCurrentUser(authentication);

        if (user.getCompany() != null) {
            throw new RuntimeException("You are already associated with a company.");
        }

        Company company = Company.builder()
                .name(dto.getName())
                .companyCode(dto.getCompanyCode())
                .taxId(dto.getTaxId())
                .contactEmail(dto.getContactEmail())
                .industry(dto.getIndustry())
                .website(dto.getWebsite())
                .employeeLimit(dto.getEmployeeLimit() != null ? dto.getEmployeeLimit() : 10)
                .companySize(dto.getCompanySize())
                .country(dto.getCountry())
                .timeZone(dto.getTimeZone())
                .preferredCurrency(dto.getPreferredCurrency())
                .billingAddress(dto.getBillingAddress())
                .status(CompanyStatus.PENDING) // Start as pending per enterprise workflow
                .build();

        company = companyRepository.save(company);

        // Assign user to this company as SUPER_ADMIN
        user.setCompany(company);
        user.setCompanyRole(CorporateRole.SUPER_ADMIN);
        userRepository.save(user);

        return ApiResponse.builder()
                .success(true)
                .message("Company registered successfully and is pending approval.")
                .build();
    }

    @Override
    public CompanyDTO getMyCompany(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        Company company = user.getCompany();

        if (company == null) {
            throw new RuntimeException("You are not associated with any company.");
        }

        return CompanyDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .companyCode(company.getCompanyCode())
                .taxId(company.getTaxId())
                .contactEmail(company.getContactEmail())
                .status(company.getStatus().name())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .employeeLimit(company.getEmployeeLimit())
                .companySize(company.getCompanySize())
                .country(company.getCountry())
                .timeZone(company.getTimeZone())
                .preferredCurrency(company.getPreferredCurrency())
                .createdAt(company.getCreatedAt())
                .build();
    }
}
