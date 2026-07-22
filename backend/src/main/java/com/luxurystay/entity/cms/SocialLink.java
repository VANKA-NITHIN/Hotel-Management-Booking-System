package com.luxurystay.entity.cms;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "social_links")
@Data
public class SocialLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String platform;
    private String url;
    private String iconClass;
    private boolean active = true;
    private int displayOrder;
}
