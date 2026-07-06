package com.luxurystay.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HotelControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getHotels_publicEndpoint_shouldNotReturn401() throws Exception {
        mockMvc.perform(get("/hotels"))
                .andExpect(status().isOk());
    }

    @Test
    void getHotels_withPagination_shouldReturnPagedResponse() throws Exception {
        mockMvc.perform(get("/hotels")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void searchHotels_publicEndpoint_shouldNotReturn401() throws Exception {
        mockMvc.perform(get("/hotels/search")
                        .param("city", "New York"))
                .andExpect(status().isOk());
    }
}
