package com.luxurystay.service;

import com.luxurystay.dto.WalletDTO;
import com.luxurystay.dto.WalletTransactionDTO;
import com.luxurystay.entity.User;
import com.luxurystay.entity.Wallet;
import com.luxurystay.entity.WalletTransaction;
import com.luxurystay.enums.TransactionStatus;
import com.luxurystay.enums.TransactionType;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.repository.WalletRepository;
import com.luxurystay.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public WalletDTO getOrCreateWallet(String email) {
        return walletRepository.findByUserEmail(email)
                .map(this::mapToDTO)
                .orElseGet(() -> createWallet(email));
    }

    @Transactional
    private WalletDTO createWallet(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        Wallet wallet = Wallet.builder().user(user).build();
        return mapToDTO(walletRepository.save(wallet));
    }

    @Transactional(readOnly = true)
    public Page<WalletTransactionDTO> getWalletTransactions(String email, int page, int size) {
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
                
        return walletTransactionRepository
                .findByWalletIdOrderByTimestampDesc(wallet.getId(), PageRequest.of(page, size))
                .map(this::mapTransactionToDTO);
    }

    @Transactional
    public WalletDTO addTransaction(String email, BigDecimal amount, TransactionType type, String referenceId, String description) {
        Wallet wallet = walletRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(TransactionStatus.COMPLETED)
                .referenceId(referenceId)
                .description(description)
                .build();
                
        wallet.setBalance(wallet.getBalance().add(amount));
        
        // Calculate loyalty tier (simplified logic)
        updateLoyaltyTier(wallet);

        walletTransactionRepository.save(tx);
        return mapToDTO(walletRepository.save(wallet));
    }

    private void updateLoyaltyTier(Wallet wallet) {
        // Simple logic for tier progression based on reward points
        if (wallet.getRewardPoints() > 10000) wallet.setLoyaltyTier("Diamond");
        else if (wallet.getRewardPoints() > 5000) wallet.setLoyaltyTier("Platinum");
        else if (wallet.getRewardPoints() > 2000) wallet.setLoyaltyTier("Gold");
        else wallet.setLoyaltyTier("Silver");
    }

    private WalletDTO mapToDTO(Wallet wallet) {
        return WalletDTO.builder()
                .id(wallet.getId())
                .userId(wallet.getUser().getId())
                .balance(wallet.getBalance())
                .rewardPoints(wallet.getRewardPoints())
                .loyaltyTier(wallet.getLoyaltyTier())
                .tierProgress(wallet.getTierProgress())
                .transactions(
                    wallet.getTransactions() != null 
                        ? wallet.getTransactions().stream().map(this::mapTransactionToDTO).collect(Collectors.toList()) 
                        : List.of()
                )
                .build();
    }

    private WalletTransactionDTO mapTransactionToDTO(WalletTransaction tx) {
        return WalletTransactionDTO.builder()
                .id(tx.getId())
                .walletId(tx.getWallet().getId())
                .amount(tx.getAmount())
                .type(tx.getType())
                .status(tx.getStatus())
                .referenceId(tx.getReferenceId())
                .description(tx.getDescription())
                .timestamp(tx.getTimestamp())
                .build();
    }
}
