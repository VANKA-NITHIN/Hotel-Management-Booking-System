package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.NotificationDTO;
import com.luxurystay.entity.Notification;
import com.luxurystay.entity.User;
import com.luxurystay.repository.NotificationRepository;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.NotificationService;
import com.luxurystay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Override
    public Page<NotificationDTO> getNotifications(Authentication authentication, int page, int size) {
        User user = authService.getCurrentUser(authentication);
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Override
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        return Map.of("count", notificationRepository.countUnread(user.getId()));
    }

    @Override
    @Transactional
    public ApiResponse markAllAsRead(Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        notificationRepository.markAllAsRead(user.getId());
        return ApiResponse.builder()
                .success(true)
                .message("All notifications marked as read")
                .build();
    }

    @Override
    @Transactional
    public ApiResponse markAsRead(Long id, Authentication authentication) {
        User user = authService.getCurrentUser(authentication);
        notificationRepository.markAsRead(id, user.getId());
        return ApiResponse.builder()
                .success(true)
                .message("Notification marked as read")
                .build();
    }

    @Override
    @Transactional
    public void createNotification(Long userId, String title, String message, String type, String link) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(com.luxurystay.enums.NotificationType.valueOf(type))
            .link(link)
            .read(false)
            .build();
        
        notificationRepository.save(notification);
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name())
                .read(n.isRead())
                .link(n.getLink())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                .build();
    }
}
