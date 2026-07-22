package com.luxurystay.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            if (keyId != null && !keyId.isEmpty() && keySecret != null && !keySecret.isEmpty()) {
                this.razorpayClient = new RazorpayClient(keyId, keySecret);
                log.info("Razorpay client initialized successfully");
            } else {
                log.warn("Razorpay credentials not configured - payment will use mock mode");
            }
        } catch (Exception e) {
            log.error("Failed to initialize Razorpay client: {}", e.getMessage());
        }
    }

    public Map<String, String> createOrder(long amount, String currency, String receiptId) throws RazorpayException {
        if (razorpayClient == null) {
            // Mock mode - return simulated order
            String mockOrderId = "order_mock_" + java.util.UUID.randomUUID().toString().substring(0, 8);
            log.info("Razorpay mock order created: {} for amount: {} {}", mockOrderId, amount, currency);
            return Map.of(
                "orderId", mockOrderId,
                "amount", String.valueOf(amount),
                "currency", currency,
                "keyId", keyId != null ? keyId : ""
            );
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount); // Amount in paise
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receiptId);

        Order order = razorpayClient.orders.create(orderRequest);

        return Map.of(
            "orderId", order.get("id").toString(),
            "amount", order.get("amount").toString(),
            "currency", order.get("currency").toString(),
            "keyId", keyId
        );
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) {
        if (razorpayClient == null) {
            log.info("Razorpay mock payment verification for order: {}", orderId);
            return true; // Mock mode always succeeds
        }

        try {
            JSONObject verificationData = new JSONObject();
            verificationData.put("razorpay_order_id", orderId);
            verificationData.put("razorpay_payment_id", paymentId);
            verificationData.put("razorpay_signature", signature);

            boolean verified = com.razorpay.Utils.verifyPaymentSignature(verificationData, keySecret);
            log.info("Razorpay payment verification for order {}: {}", orderId, verified ? "SUCCESS" : "FAILED");
            return verified;
        } catch (RazorpayException e) {
            log.error("Payment verification failed: {}", e.getMessage());
            return false;
        }
    }
}
