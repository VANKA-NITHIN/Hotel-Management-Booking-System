package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDTO {
    private Long id;
    private String name;
    private String companyCode;
    private String taxId;
    private String contactEmail;
    private String status;
    private String industry;
    private String website;
    private Integer employeeLimit;
    private String companySize;
    private String country;
    private String timeZone;
    private String preferredCurrency;
    private String billingAddress;
    private LocalDateTime createdAt;
}
