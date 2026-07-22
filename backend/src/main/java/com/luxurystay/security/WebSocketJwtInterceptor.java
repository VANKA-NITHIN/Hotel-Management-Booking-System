package com.luxurystay.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketJwtInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor);

            if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
                String email = tokenProvider.getEmailFromToken(token);
                if (email != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    accessor.setUser(authentication);
                    log.info("WebSocket connection established for user: {}", email);
                } else {
                    log.warn("WebSocket authentication failed: Email extraction returned null");
                }
            } else {
                log.warn("WebSocket authentication failed: Invalid or missing token");
                // Note: throwing an exception here will reject the connection
                throw new IllegalArgumentException("Invalid or missing JWT token for WebSocket connection");
            }
        } else if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            // Log or validate subscription based on topic logic here
            String destination = accessor.getDestination();
            java.security.Principal principal = accessor.getUser();
            if (principal != null) {
                log.info("User {} subscribing to {}", principal.getName(), destination);
            }
        } else if (accessor != null && StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            java.security.Principal principal = accessor.getUser();
            if (principal != null) {
                log.info("WebSocket connection closed for user: {}", principal.getName());
            }
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // Typically passed as "Authorization: Bearer <token>"
        String bearerToken = accessor.getFirstNativeHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
