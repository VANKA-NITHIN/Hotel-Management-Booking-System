package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletDTO {
    private Long id;
    private Long userId;
    private BigDecimal balance;
    private int rewardPoints;
    private String loyaltyTier;
    private int tierProgress;
    private List<WalletTransactionDTO> transactions;
}
