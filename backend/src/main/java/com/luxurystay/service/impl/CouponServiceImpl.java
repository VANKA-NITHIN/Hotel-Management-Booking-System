package com.luxurystay.service.impl;

import com.luxurystay.dto.CouponDTO;
import com.luxurystay.entity.Coupon;
import com.luxurystay.repository.CouponRepository;
import com.luxurystay.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code).orElse(null);
        if (coupon == null || !coupon.isActive()) {
            return Map.of("valid", false, "message", "Invalid coupon code");
        }
        if (coupon.getEndDate().isBefore(LocalDateTime.now())) {
            return Map.of("valid", false, "message", "Coupon has expired");
        }
        if (coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return Map.of("valid", false, "message", "Coupon usage limit reached");
        }
        return Map.of(
                "valid", true,
                "discountAmount", coupon.getDiscountAmount(),
                "percentageDiscount", coupon.isPercentageDiscount(),
                "maxDiscount", coupon.getMaxDiscount() != null ? coupon.getMaxDiscount() : BigDecimal.ZERO
        );
    }

    @Override
    @Transactional
    public CouponDTO createCoupon(CouponDTO dto) {
        Coupon coupon = Coupon.builder()
                .code(dto.getCode())
                .description(dto.getDescription())
                .discountAmount(dto.getDiscountAmount())
                .percentageDiscount(dto.isPercentageDiscount())
                .maxDiscount(dto.getMaxDiscount())
                .minBookingAmount(dto.getMinBookingAmount())
                .usageLimit(dto.getUsageLimit())
                .startDate(LocalDateTime.parse(dto.getStartDate(), DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .endDate(LocalDateTime.parse(dto.getEndDate(), DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .active(true)
                .build();
        coupon = couponRepository.save(coupon);
        return toDTO(coupon);
    }

    private CouponDTO toDTO(Coupon c) {
        return CouponDTO.builder()
                .id(c.getId())
                .code(c.getCode())
                .description(c.getDescription())
                .discountAmount(c.getDiscountAmount())
                .percentageDiscount(c.isPercentageDiscount())
                .maxDiscount(c.getMaxDiscount())
                .minBookingAmount(c.getMinBookingAmount())
                .usageLimit(c.getUsageLimit())
                .usedCount(c.getUsedCount())
                .startDate(c.getStartDate().toString())
                .endDate(c.getEndDate().toString())
                .active(c.isActive())
                .build();
    }
}
