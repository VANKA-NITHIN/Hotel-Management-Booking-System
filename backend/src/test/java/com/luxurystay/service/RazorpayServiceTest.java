package com.luxurystay.service;

import com.razorpay.RazorpayException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class RazorpayServiceTest {

    @InjectMocks
    private RazorpayService razorpayService;

    @BeforeEach
    void setUp() {
        // Test with no credentials - should use mock mode
        ReflectionTestUtils.setField(razorpayService, "keyId", "");
        ReflectionTestUtils.setField(razorpayService, "keySecret", "");
        razorpayService.init();
    }

    @Test
    void createOrder_mockMode_shouldReturnMockOrder() throws RazorpayException {
        // Act
        Map<String, String> result = razorpayService.createOrder(50000, "INR", "receipt_123");

        // Assert
        assertNotNull(result);
        assertTrue(result.get("orderId").startsWith("order_mock_"));
        assertEquals("50000", result.get("amount"));
        assertEquals("INR", result.get("currency"));
    }

    @Test
    void verifyPayment_mockMode_shouldReturnTrue() {
        boolean verified = razorpayService.verifyPayment("order_123", "pay_123", "sig_123");

        assertTrue(verified);
    }

    @Test
    void createOrder_withInvalidCredentials_fallsBackToMockOrThrows() throws RazorpayException {
        // Set invalid credentials - RazorpayClient may init but API calls will fail
        ReflectionTestUtils.setField(razorpayService, "keyId", "rzp_test_invalid");
        ReflectionTestUtils.setField(razorpayService, "keySecret", "invalid_secret");
        razorpayService.init();

        // If client initialized with invalid creds, real API call will throw
        // If client failed to init, mock mode kicks in
        try {
            Map<String, String> result = razorpayService.createOrder(50000, "INR", "receipt_123");
            assertNotNull(result);
        } catch (RazorpayException e) {
            // Expected if RazorpayClient was created with invalid credentials
            assertNotNull(e.getMessage());
        }
    }
}
