package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Payment;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.enums.PaymentStatus;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.PaymentRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "whsec_test_secret");
    }

    @Test
    void testCreatePaymentIntent_BookingNotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> 
            paymentService.createPaymentIntent(1L, 100.0, "USD")
        );
    }

    @Test
    void testHandleWebhook_NoSecret() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "");

        String result = paymentService.handleWebhook("payload", "sig");
        assertEquals("OK", result);
    }

    @Test
    void testHandleWebhook_InvalidSignature() {
        String result = paymentService.handleWebhook("payload", "invalid_sig");
        assertEquals("Invalid signature", result);
    }
}
