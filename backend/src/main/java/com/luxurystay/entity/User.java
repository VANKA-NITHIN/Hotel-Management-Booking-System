package com.luxurystay.entity;

import com.luxurystay.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String profileImage;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean accountLocked = false;

    @Builder.Default
    private int failedLoginAttempts = 0;

    private LocalDateTime lockedUntil;

    private String oauthProvider;

    private String oauthProviderId;

    @Builder.Default
    private int loyaltyPoints = 0;

    @Column(unique = true, length = 20)
    private String referralCode;

    @Column(length = 20)
    private String referredByCode;

    // Notification Preferences
    @Column(nullable = false)
    @Builder.Default
    private boolean emailBookings = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailPromotions = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushBookings = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean pushPromotions = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<RoleEntity> roles = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private com.luxurystay.enums.CorporateRole companyRole;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String jobTitle;

    @Column(length = 50)
    private String employeeId;

    private java.math.BigDecimal travelBudget;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Wallet wallet;

    @Transient
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
