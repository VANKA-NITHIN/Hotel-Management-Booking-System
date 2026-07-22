package com.luxurystay.entity.cms;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "announcements")
@Data
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private String linkUrl;
    private String linkText;
    private boolean active = false; // usually only 1 is active
}
