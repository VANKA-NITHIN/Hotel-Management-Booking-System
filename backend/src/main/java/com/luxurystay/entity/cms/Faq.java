package com.luxurystay.entity.cms;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "faqs")
@Data
public class Faq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String question;
    
    @Column(columnDefinition = "TEXT")
    private String answer;
    
    private String category;
    private boolean active = true;
    private int displayOrder;
}
