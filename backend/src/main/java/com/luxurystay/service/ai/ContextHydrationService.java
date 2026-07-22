package com.luxurystay.service.ai;

import com.luxurystay.entity.User;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.WalletRepository;
import com.luxurystay.entity.Wallet;
import com.luxurystay.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContextHydrationService {

    private final AuthService authService;
    private final BookingRepository bookingRepository;
    private final WalletRepository walletRepository;

    public Map<String, Object> hydrateUserContext(Authentication authentication, String locale) {
        Map<String, Object> context = new HashMap<>();
        
        context.put("locale", locale != null ? locale : "en");
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            context.put("isAuthenticated", false);
            return context;
        }

        try {
            User user = authService.getCurrentUser(authentication);
            
            context.put("isAuthenticated", true);
            context.put("firstName", user.getFirstName());
            context.put("lastName", user.getLastName());
            context.put("loyaltyPoints", user.getLoyaltyPoints());
            
            Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
            context.put("walletBalance", wallet != null ? wallet.getBalance() : BigDecimal.ZERO);
            
            if (user.getCompany() != null) {
                context.put("isCorporate", true);
                context.put("companyName", user.getCompany().getName());
                context.put("companyRole", user.getCompanyRole() != null ? user.getCompanyRole().name() : "EMPLOYEE");
            } else {
                context.put("isCorporate", false);
            }

            // Fetch summary of upcoming bookings
            long upcomingBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                    .filter(b -> "CONFIRMED".equals(b.getStatus().name()))
                    .count();
            context.put("upcomingBookingsCount", upcomingBookings);
            
        } catch (Exception e) {
            context.put("isAuthenticated", false);
        }
        
        return context;
    }
}
