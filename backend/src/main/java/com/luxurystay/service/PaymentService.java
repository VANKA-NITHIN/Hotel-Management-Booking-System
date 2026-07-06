package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;

import java.util.Map;

public interface PaymentService {

    Map<String, String> createPaymentIntent(Long bookingId, Double amount, String currency);

    ApiResponse confirmPayment(String paymentIntentId);

    String handleWebhook(String payload, String signature);
}
