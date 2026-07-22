package com.luxurystay.entity.cms;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "currency_exchange_rates")
@Data
public class CurrencyExchangeRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String baseCurrency = "USD";
    private String targetCurrency;
    
    @Column(precision = 10, scale = 4)
    private java.math.BigDecimal rate;
    
    private LocalDateTime lastUpdated;
}
