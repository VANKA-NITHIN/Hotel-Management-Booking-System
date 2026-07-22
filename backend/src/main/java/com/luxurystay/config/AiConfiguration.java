package com.luxurystay.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConfigurationProperties(prefix = "gemini")
@Data
public class AiConfiguration {
    private String apiKey;
    private String model;

    @Bean
    public RestTemplate aiRestTemplate() {
        return new RestTemplate();
    }
}
