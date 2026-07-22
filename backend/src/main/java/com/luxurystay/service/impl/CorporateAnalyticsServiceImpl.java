package com.luxurystay.service.impl;

import com.luxurystay.dto.CorporateAnalyticsDTO;
import com.luxurystay.dto.DestinationStatsDTO;
import com.luxurystay.dto.SpendByDepartmentDTO;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Company;
import com.luxurystay.entity.User;
import com.luxurystay.enums.CorporateRole;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.CorporateAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CorporateAnalyticsServiceImpl implements CorporateAnalyticsService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Override
    @SuppressWarnings("null")
    @Cacheable(value = "corporateAnalytics", key = "#authentication.name")
    public CorporateAnalyticsDTO getAnalytics(Authentication authentication) {
        User admin = authService.getCurrentUser(authentication);
        Company company = admin.getCompany();

        if (company == null || (!hasManagerAccess(admin.getCompanyRole()))) {
            throw new RuntimeException("Unauthorized access to corporate analytics.");
        }

        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getCompany() != null && u.getCompany().getId().equals(company.getId()))
                .collect(Collectors.toList());

        List<Booking> corporateBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getCorporateContext() != null && b.getCorporateContext().getCompanyId().equals(company.getId()))
                .filter(b -> !b.getStatus().equals("CANCELLED"))
                .collect(Collectors.toList());

        long totalEmployees = employees.size();
        long activeEmployees = employees.stream().filter(User::isEnabled).count();
        long totalBookings = corporateBookings.size();

        BigDecimal totalSpend = corporateBookings.stream()
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgBookingValue = totalBookings > 0 
                ? totalSpend.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        // Group spend by department
        Map<String, BigDecimal> spendByDeptMap = corporateBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getCorporateContext().getDepartment() != null ? b.getCorporateContext().getDepartment() : "Unassigned",
                        Collectors.reducing(BigDecimal.ZERO, Booking::getTotalAmount, BigDecimal::add)
                ));
        
        List<SpendByDepartmentDTO> spendByDept = spendByDeptMap.entrySet().stream()
                .map(e -> new SpendByDepartmentDTO(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Group by destination (city)
        Map<String, Long> destinationMap = corporateBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getHotel().getCity(),
                        Collectors.counting()
                ));

        List<DestinationStatsDTO> topDestinations = destinationMap.entrySet().stream()
                .map(e -> new DestinationStatsDTO(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getBookingCount(), a.getBookingCount()))
                .limit(5)
                .collect(Collectors.toList());

        return CorporateAnalyticsDTO.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .totalBookings(totalBookings)
                .monthlySpend(totalSpend) // Assuming total for MVP, ideally filter by current month
                .averageBookingValue(avgBookingValue)
                .spendByDepartment(spendByDept)
                .topDestinations(topDestinations)
                .build();
    }

    private boolean hasManagerAccess(CorporateRole role) {
        if (role == null) return false;
        return role == CorporateRole.SUPER_ADMIN || 
               role == CorporateRole.CORPORATE_ADMIN || 
               role == CorporateRole.TRAVEL_MANAGER || 
               role == CorporateRole.FINANCE_MANAGER;
    }
}
