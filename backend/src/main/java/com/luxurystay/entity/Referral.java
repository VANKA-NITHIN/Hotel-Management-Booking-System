package com.luxurystay.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "referrals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id", nullable = false)
    private User referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_user_id", nullable = false)
    private User referredUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private com.luxurystay.enums.ReferralStatus status;

    @Column(nullable = false)
    private int rewardPoints;

    @Column(length = 50)
    private String rewardType;

    private LocalDateTime rewardIssuedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    private LocalDateTime updatedAt;
}
