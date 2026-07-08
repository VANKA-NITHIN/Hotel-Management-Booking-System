package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments/razorpay")
@RequiredArgsConstructor
@Slf4j
public class RazorpayController {

    private final RazorpayService razorpayService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, String>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            long amount = Long.parseLong(request.get("amount").toString());
            String currency = (String) request.getOrDefault("currency", "INR");
            String receiptId = "rcpt_" + System.currentTimeMillis();

            Map<String, String> order = razorpayService.createOrder(amount, currency, receiptId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyPayment(@RequestBody Map<String, String> request) {
        String orderId = request.get("orderId");
        String paymentId = request.get("paymentId");
        String signature = request.get("signature");

        boolean verified = razorpayService.verifyPayment(orderId, paymentId, signature);

        if (verified) {
            log.info("Razorpay payment verified successfully for order: {}", orderId);
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Payment verified successfully")
                    .data(Map.of("orderId", orderId, "paymentId", paymentId))
                    .build());
        } else {
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(false)
                    .message("Payment verification failed")
                    .build());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                 @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        log.info("Received Razorpay webhook with signature: {}", signature != null ? "present" : "missing");
        // In production, verify webhook signature and process events
        return ResponseEntity.ok("OK");
    }
}
