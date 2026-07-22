package com.luxurystay.entity.cms;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "banners")
@Data
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private String buttonText;
    
    @Column(name = "is_active")
    private boolean active = true;
    
    private int displayOrder;
}
