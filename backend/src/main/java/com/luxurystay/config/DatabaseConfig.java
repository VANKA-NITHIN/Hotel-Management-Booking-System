package com.luxurystay.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import javax.sql.DataSource;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        String finalUrl = url;
        if (finalUrl != null && !finalUrl.contains("allowPublicKeyRetrieval=true")) {
            finalUrl += (finalUrl.contains("?") ? "&" : "?") + "allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC";
        }
        
        return DataSourceBuilder.create()
                .driverClassName(driverClassName)
                .url(finalUrl)
                .username(username)
                .password(password)
                .type(HikariDataSource.class)
                .build();
    }
}
