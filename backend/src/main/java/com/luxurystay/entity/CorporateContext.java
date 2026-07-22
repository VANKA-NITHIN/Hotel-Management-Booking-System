package com.luxurystay.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorporateContext {

    @Column(name = "corporate_company_id")
    private Long companyId;

    @Column(name = "corporate_department", length = 100)
    private String department;

    @Column(name = "corporate_cost_center", length = 100)
    private String costCenter;

    @Column(name = "corporate_project_code", length = 100)
    private String projectCode;

    @Column(name = "corporate_booking_owner_id")
    private Long bookingOwnerId;

    @Column(name = "corporate_approval_status", length = 50)
    private String approvalStatus;

    @Column(name = "corporate_payment_responsibility", length = 50)
    private String paymentResponsibility;
}
