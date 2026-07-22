package com.luxurystay.entity.cms;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "contact_information")
@Data
public class ContactInformation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g., "phone", "email", "address"
    @Column(name = "contact_value")
    private String value;
    private String label;
    private boolean active = true;
}
