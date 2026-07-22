package com.luxurystay.entity.cms;

import com.luxurystay.entity.Hotel;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "featured_collections")
@Data
public class FeaturedCollection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subtitle;
    private String slug; // url friendly
    
    @Column(name = "is_active")
    private boolean active = true;

    @ManyToMany
    @JoinTable(
        name = "collection_hotels",
        joinColumns = @JoinColumn(name = "collection_id"),
        inverseJoinColumns = @JoinColumn(name = "hotel_id")
    )
    private List<Hotel> hotels;
}
