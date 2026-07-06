package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.NotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;

import java.util.Map;

public interface NotificationService {

    Page<NotificationDTO> getNotifications(Authentication authentication, int page, int size);

    Map<String, Long> getUnreadCount(Authentication authentication);

    ApiResponse markAllAsRead(Authentication authentication);

    ApiResponse markAsRead(Long id, Authentication authentication);

    void createNotification(Long userId, String title, String message, String type, String link);
}
