package com.luxurystay.service;

import com.luxurystay.entity.ContactMessage;
import com.luxurystay.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public void saveMessage(ContactMessage message) {
        contactMessageRepository.save(message);
    }
}
