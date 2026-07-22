package com.luxurystay.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Configuration
public class I18nConfig {

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        localeResolver.setDefaultLocale(Locale.ENGLISH);
        
        List<Locale> supportedLocales = Arrays.asList(
            new Locale("en"),
            new Locale("te"),
            new Locale("hi"),
            new Locale("ta"),
            new Locale("kn"),
            new Locale("ml"),
            new Locale("mr"),
            new Locale("bn"),
            new Locale("gu"),
            new Locale("pa"),
            new Locale("ur"),
            new Locale("ar"),
            new Locale("fr"),
            new Locale("de"),
            new Locale("es"),
            new Locale("pt"),
            new Locale("it"),
            new Locale("ja"),
            new Locale("ko"),
            new Locale("zh")
        );
        localeResolver.setSupportedLocales(supportedLocales);
        
        return localeResolver;
    }

    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasename("messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setUseCodeAsDefaultMessage(true);
        messageSource.setFallbackToSystemLocale(false);
        return messageSource;
    }
}
