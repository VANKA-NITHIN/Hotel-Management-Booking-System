package com.luxurystay.service;

import com.luxurystay.dto.CouponDTO;

import java.util.List;
import java.util.Map;

public interface CouponService {

    List<CouponDTO> getAllCoupons();

    Map<String, Object> validateCoupon(String code);

    CouponDTO createCoupon(CouponDTO dto);
}
