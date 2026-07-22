package com.luxurystay.entity.cms;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "site_configuration")
@Data
public class SiteConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String configKey;
    private String configValue;
}
