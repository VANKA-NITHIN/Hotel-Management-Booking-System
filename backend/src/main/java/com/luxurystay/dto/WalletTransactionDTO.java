package com.luxurystay.dto;

import com.luxurystay.enums.TransactionStatus;
import com.luxurystay.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransactionDTO {
    private Long id;
    private Long walletId;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionStatus status;
    private String referenceId;
    private String description;
    private LocalDateTime timestamp;
}
