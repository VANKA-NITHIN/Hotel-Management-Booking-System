package com.luxurystay.entity;

import com.luxurystay.enums.CompanyStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String companyCode;

    @Column(length = 50)
    private String taxId;

    @Column(nullable = false, length = 150)
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CompanyStatus status = CompanyStatus.PENDING;

    @Column(length = 100)
    private String industry;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 150)
    private String website;

    private Integer employeeLimit;

    @Column(length = 50)
    private String corporatePlan;

    @Column(length = 50)
    private String companySize;

    @Column(length = 100)
    private String country;

    @Column(length = 50)
    private String timeZone;

    @Column(length = 10)
    private String preferredCurrency;

    @Column(columnDefinition = "TEXT")
    private String billingAddress;

    @Column(length = 50)
    private String subscriptionStatus;

    private LocalDateTime lastActivity;

    private LocalDateTime approvalDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
