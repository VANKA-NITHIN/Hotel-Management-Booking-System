package com.luxurystay.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    private static final String TEST_SECRET = "test-256-bit-secret-key-for-jwt-token-generation-must-be-long-enough";
    private static final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpiration", 604800000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "issuer", "LuxuryStay");
        ReflectionTestUtils.setField(jwtTokenProvider, "clerkJwksUrl", "https://engaging-fish-44.clerk.accounts.dev/.well-known/jwks.json");
        jwtTokenProvider.init();
    }

    @Test
    void generateToken_shouldReturnValidToken() {
        String token = jwtTokenProvider.generateToken(TEST_EMAIL);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        // Legacy token has 3 parts (header.payload.signature)
        assertEquals(3, token.split("\\.").length);
    }

    @Test
    void generateToken_shouldExtractEmailCorrectly() {
        String token = jwtTokenProvider.generateToken(TEST_EMAIL);
        String extractedEmail = jwtTokenProvider.getEmailFromToken(token);

        assertEquals(TEST_EMAIL, extractedEmail);
    }

    @Test
    void validateToken_validLegacyToken_shouldReturnTrue() {
        String token = jwtTokenProvider.generateToken(TEST_EMAIL);

        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void validateToken_invalidToken_shouldReturnFalse() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }

    @Test
    void validateToken_emptyToken_shouldReturnFalse() {
        assertFalse(jwtTokenProvider.validateToken(""));
    }

    @Test
    void validateToken_expiredToken_shouldReturnFalse() {
        // Generate a token that's already expired
        byte[] secretBytes = TEST_SECRET.getBytes(StandardCharsets.UTF_8);
        byte[] padded = new byte[32];
        java.util.Arrays.fill(padded, (byte) 0);
        System.arraycopy(secretBytes, 0, padded, 0, Math.min(secretBytes.length, 32));
        SecretKey key = Keys.hmacShaKeyFor(padded);

        String expiredToken = Jwts.builder()
                .subject(TEST_EMAIL)
                .issuedAt(new Date(System.currentTimeMillis() - 200000))
                .expiration(new Date(System.currentTimeMillis() - 100000))
                .signWith(key)
                .compact();

        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    void generateRefreshToken_shouldReturnValidToken() {
        String refreshToken = jwtTokenProvider.generateRefreshToken(TEST_EMAIL);

        assertNotNull(refreshToken);
        assertFalse(refreshToken.isEmpty());
        // Should be a different token than access token
        String accessToken = jwtTokenProvider.generateToken(TEST_EMAIL);
        assertNotEquals(accessToken, refreshToken);
    }

    @Test
    void getEmailFromToken_refreshToken_shouldExtractEmail() {
        String refreshToken = jwtTokenProvider.generateRefreshToken(TEST_EMAIL);
        String extractedEmail = jwtTokenProvider.getEmailFromToken(refreshToken);

        assertEquals(TEST_EMAIL, extractedEmail);
    }

    @Test
    void validateToken_tamperedToken_shouldReturnFalse() {
        String token = jwtTokenProvider.generateToken(TEST_EMAIL);
        // Tamper with the token
        String[] parts = token.split("\\.");
        parts[2] = "tamperedSignature";
        String tamperedToken = String.join(".", parts);

        assertFalse(jwtTokenProvider.validateToken(tamperedToken));
    }

    @Test
    void getJwtExpiration_shouldReturnConfiguredValue() {
        assertEquals(86400000L, jwtTokenProvider.getJwtExpiration());
    }
}
