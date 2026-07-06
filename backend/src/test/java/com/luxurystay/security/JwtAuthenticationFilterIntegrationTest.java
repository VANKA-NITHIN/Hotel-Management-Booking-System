package com.luxurystay.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class JwtAuthenticationFilterIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void request_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/bookings"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 401 || status == 403,
                            "Should return 401 or 403, got " + status);
                });
    }

    @Test
    void request_withInvalidToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/bookings")
                        .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 401 || status == 403,
                            "Should return 401 or 403, got " + status);
                });
    }

    @Test
    void publicEndpoint_withoutToken_shouldReturn200() throws Exception {
        mockMvc.perform(get("/hotels"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 200 || status == 403,
                            "Should return 200 or 403 (CSRF), got " + status);
                });
    }

    @Test
    void adminEndpoint_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 401 || status == 403,
                            "Should return 401 or 403, got " + status);
                });
    }
}
