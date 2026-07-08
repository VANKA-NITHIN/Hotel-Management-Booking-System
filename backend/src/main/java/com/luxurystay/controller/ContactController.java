package com.luxurystay.controller;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.entity.ContactMessage;
import com.luxurystay.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse> submitContactForm(@RequestBody ContactMessage message) {
        contactService.saveMessage(message);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Contact message received successfully")
                .build());
    }
}
