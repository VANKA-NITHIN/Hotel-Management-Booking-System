package com.luxurystay.service;

import com.luxurystay.entity.NewsletterSubscriber;
import com.luxurystay.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;

    public void subscribe(String email) {
        Optional<NewsletterSubscriber> existing = newsletterSubscriberRepository.findByEmail(email);
        if (existing.isEmpty()) {
            NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                    .email(email)
                    .isActive(true)
                    .build();
            newsletterSubscriberRepository.save(subscriber);
        } else if (!existing.get().isActive()) {
            existing.get().setActive(true);
            newsletterSubscriberRepository.save(existing.get());
        }
    }
}
