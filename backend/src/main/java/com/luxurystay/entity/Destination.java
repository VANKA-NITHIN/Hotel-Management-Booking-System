package com.luxurystay.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "destinations")
@Data
public class Destination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String country;
    private String imageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private boolean featured = true;
    
    // We can aggregate stats dynamically or store them
    // For now, these can be transient or updated by scheduled jobs
    @Transient
    private int hotelCount;
    
    @Transient
    private double averagePrice;
    
    @Transient
    private double rating;
}
