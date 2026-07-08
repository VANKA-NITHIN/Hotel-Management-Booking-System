package com.luxurystay.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtTokenProvider, "clerkJwksUrl", "https://engaging-fish-44.clerk.accounts.dev/.well-known/jwks.json");
        jwtTokenProvider.init();
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
    void getEmailFromToken_invalidToken_shouldReturnNull() {
        assertNull(jwtTokenProvider.getEmailFromToken("invalid"));
    }
}
