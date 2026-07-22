package com.luxurystay.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal cleanlinessRating;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal serviceRating;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal locationRating;

    @Column(nullable = false, precision = 3, scale = 1)
    private BigDecimal valueRating;

    @ElementCollection
    @CollectionTable(name = "review_photos", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "photo_url")
    private java.util.List<String> photos;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(nullable = false)
    @Builder.Default
    private int likes = 0;

    @Column(length = 1000)
    private String reply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replied_by")
    private User repliedBy;

    @Column(nullable = false)
    @Builder.Default
    private boolean reported = false;

    @Column(length = 500)
    private String reportReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
