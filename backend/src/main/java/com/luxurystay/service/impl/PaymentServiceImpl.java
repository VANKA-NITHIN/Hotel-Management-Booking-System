package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Payment;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.enums.PaymentMethod;
import com.luxurystay.enums.PaymentStatus;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.PaymentRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Override
    @Transactional
    public Map<String, String> createPaymentIntent(Long bookingId, Double amount, String currency) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        Map<String, Object> params = Map.of(
                "amount", Math.round(amount * 100),
                "currency", currency != null ? currency : "usd",
                "metadata", Map.of("booking_id", bookingId.toString())
        );

        try {
            PaymentIntent intent = PaymentIntent.create(params);

            Payment payment = Payment.builder()
                    .paymentId("pay_" + UUID.randomUUID().toString().substring(0, 24))
                    .booking(booking)
                    .user(booking.getUser())
                    .amount(BigDecimal.valueOf(amount))
                    .currency(currency != null ? currency : "USD")
                    .paymentMethod(PaymentMethod.STRIPE)
                    .status(PaymentStatus.PENDING)
                    .stripePaymentIntentId(intent.getId())
                    .build();
            paymentRepository.save(payment);

            log.info("Created Stripe PaymentIntent {} for booking {}", intent.getId(), bookingId);

            return Map.of(
                    "paymentIntentId", intent.getId(),
                    "clientSecret", intent.getClientSecret()
            );
        } catch (StripeException e) {
            log.error("Failed to create Stripe PaymentIntent: {}", e.getMessage());
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse confirmPayment(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);

            if ("succeeded".equals(intent.getStatus())) {
                Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId).orElse(null);
                if (payment != null) {
                    payment.setStatus(PaymentStatus.COMPLETED);
                    payment.setTransactionId(intent.getLatestCharge());
                    paymentRepository.save(payment);

                    Booking booking = payment.getBooking();
                    if (booking != null && booking.getStatus() == BookingStatus.PENDING) {
                        booking.setStatus(BookingStatus.CONFIRMED);
                        bookingRepository.save(booking);
                    }
                }
                return ApiResponse.builder()
                        .success(true)
                        .message("Payment confirmed successfully")
                        .build();
            }

            return ApiResponse.builder()
                    .success(false)
                    .message("Payment status: " + intent.getStatus())
                    .build();
        } catch (StripeException e) {
            log.error("Failed to confirm payment: {}", e.getMessage());
            return ApiResponse.builder()
                    .success(false)
                    .message("Payment confirmation failed: " + e.getMessage())
                    .build();
        }
    }

    @Override
    @Transactional
    public String handleWebhook(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Webhook secret not configured, skipping verification");
            return "OK";
        }

        try {
            Event event = Webhook.constructEvent(payload, signature, webhookSecret);

            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject()
                        .orElse(null);
                if (intent != null) {
                    String bookingId = intent.getMetadata().get("booking_id");
                    log.info("Payment succeeded for booking: {}", bookingId);
                    confirmPayment(intent.getId());
                }
            } else if ("payment_intent.payment_failed".equals(event.getType())) {
                PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject()
                        .orElse(null);
                if (intent != null) {
                    Payment payment = paymentRepository.findByStripePaymentIntentId(intent.getId()).orElse(null);
                    if (payment != null) {
                        payment.setStatus(PaymentStatus.FAILED);
                        paymentRepository.save(payment);
                    }
                }
            }
        } catch (SignatureVerificationException e) {
            log.error("Invalid webhook signature: {}", e.getMessage());
            return "Invalid signature";
        } catch (Exception e) {
            log.error("Webhook processing error: {}", e.getMessage());
        }

        return "OK";
    }
}
