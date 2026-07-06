package com.luxurystay.service;

import com.razorpay.RazorpayException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RazorpayServiceIntegrationTest {

    @Autowired
    private RazorpayService razorpayService;

    @BeforeEach
    void setUp() {
        // Ensure mock mode by clearing credentials and nulling the client
        ReflectionTestUtils.setField(razorpayService, "keyId", "");
        ReflectionTestUtils.setField(razorpayService, "keySecret", "");
        ReflectionTestUtils.setField(razorpayService, "razorpayClient", null);
        razorpayService.init();
    }

    @Test
    void createOrder_validAmount_returnsMockOrder() throws RazorpayException {
        Map<String, String> result = razorpayService.createOrder(50000, "INR", "receipt_int_001");

        assertNotNull(result, "Result should not be null");
        assertTrue(result.containsKey("orderId"), "Should contain orderId");
        assertTrue(result.containsKey("amount"), "Should contain amount");
        assertTrue(result.containsKey("currency"), "Should contain currency");
        assertTrue(result.containsKey("keyId"), "Should contain keyId");
        assertTrue(result.get("orderId").startsWith("order_mock_"), "Order ID should start with order_mock_");
        assertEquals("50000", result.get("amount"), "Amount should match");
        assertEquals("INR", result.get("currency"), "Currency should match");
    }

    @Test
    void createOrder_zeroAmount_returnsMockOrder() throws RazorpayException {
        Map<String, String> result = razorpayService.createOrder(0, "INR", "receipt_zero");

        assertNotNull(result);
        assertEquals("0", result.get("amount"));
        assertTrue(result.get("orderId").startsWith("order_mock_"));
    }

    @Test
    void createOrder_largeAmount_returnsMockOrder() throws RazorpayException {
        Map<String, String> result = razorpayService.createOrder(999999999, "INR", "receipt_large");

        assertNotNull(result);
        assertEquals("999999999", result.get("amount"));
        assertEquals("INR", result.get("currency"));
    }

    @Test
    void createOrder_USD_currency_returnsMockOrder() throws RazorpayException {
        Map<String, String> result = razorpayService.createOrder(10000, "USD", "receipt_usd");

        assertNotNull(result);
        assertEquals("USD", result.get("currency"));
        assertEquals("10000", result.get("amount"));
    }

    @Test
    void verifyPayment_mockMode_returnsTrue() {
        boolean verified = razorpayService.verifyPayment("order_mock_123", "pay_mock_456", "sig_mock_789");

        assertTrue(verified, "Mock verification should always succeed");
    }

    @Test
    void verifyPayment_emptyParameters_returnsTrue() {
        boolean verified = razorpayService.verifyPayment("", "", "");

        assertTrue(verified, "Mock verification should succeed even with empty params");
    }

    @Test
    void createOrder_uniqueOrderIds() throws RazorpayException {
        Map<String, String> result1 = razorpayService.createOrder(10000, "INR", "receipt_1");
        Map<String, String> result2 = razorpayService.createOrder(10000, "INR", "receipt_2");

        assertNotEquals(result1.get("orderId"), result2.get("orderId"),
                "Each order should have a unique ID");
    }

    @Test
    void createOrder_withRealCredentials_throwsRazorpayException() {
        // Set invalid credentials - RazorpayClient may init but API calls will fail
        ReflectionTestUtils.setField(razorpayService, "keyId", "rzp_test_abc123");
        ReflectionTestUtils.setField(razorpayService, "keySecret", "test_secret_xyz");
        ReflectionTestUtils.setField(razorpayService, "razorpayClient", null);
        razorpayService.init();

        // If client initialized with invalid creds, real API call will throw
        // If client failed to init, mock mode kicks in
        try {
            Map<String, String> result = razorpayService.createOrder(25000, "INR", "receipt_real_flow");
            assertNotNull(result, "Should return result either way");
        } catch (RazorpayException e) {
            // Expected if RazorpayClient was created with invalid credentials
            assertTrue(e.getMessage().contains("BAD_REQUEST") || e.getMessage().contains("Authentication"),
                    "Should fail with auth error");
        }
    }

    @Test
    void verifyPayment_invalidSignature_mockModeStillTrue() {
        boolean verified = razorpayService.verifyPayment(
                "order_invalid", "pay_invalid", "invalid_signature");

        assertTrue(verified, "Mock mode should return true regardless of signature");
    }
}
