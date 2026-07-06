package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(request.get("bookingId").toString());
        Double amount = Double.parseDouble(request.get("amount").toString());
        String currency = (String) request.getOrDefault("currency", "usd");
        return ResponseEntity.ok(paymentService.createPaymentIntent(bookingId, amount, currency));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse> confirmPayment(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(paymentService.confirmPayment(request.get("paymentIntentId")));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                 @RequestHeader("Stripe-Signature") String signature) {
        return ResponseEntity.ok(paymentService.handleWebhook(payload, signature));
    }
}
