package com.luxurystay.security;

import com.luxurystay.entity.RoleEntity;
import com.luxurystay.entity.User;
import com.luxurystay.enums.Role;
import com.luxurystay.repository.RoleRepository;
import com.luxurystay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String emailOrSub) throws UsernameNotFoundException {
        return loadUserByUsernameAndSyncRole(emailOrSub, null);
    }

    @Transactional
    public UserDetails loadUserByUsernameAndSyncRole(String emailOrSub, String roleFromToken) throws UsernameNotFoundException {
        // Try to find by email first, then by Clerk sub ID
        User user = userRepository.findByEmail(emailOrSub).orElse(null);

        if (user == null) {
            // Check if this looks like a Clerk sub (starts with "user_")
            if (emailOrSub != null && emailOrSub.startsWith("user_")) {
                // Try to find by email in a broader way, or create new user
                user = createClerkUser(emailOrSub, roleFromToken);
            } else {
                // Try finding by email
                user = userRepository.findByEmail(emailOrSub)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + emailOrSub));
            }
        } else if (roleFromToken != null) {
            // Check if role needs updating
            syncUserRole(user, roleFromToken);
        }

        var authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                "", // No password since Clerk handles auth
                user.isEnabled(),
                true,
                true,
                !user.isAccountLocked(),
                authorities
        );
    }

    /**
     * Create a new user from Clerk authentication
     */
    private User createClerkUser(String clerkSub, String roleFromToken) {
        log.info("Creating new user from Clerk authentication: {}", clerkSub);

        Role userRole = determineRole(roleFromToken);
        
        RoleEntity roleEntity = roleRepository.findByName(userRole)
                .orElseGet(() -> {
                    RoleEntity role = RoleEntity.builder()
                            .name(userRole)
                            .description(userRole.name() + " role")
                            .build();
                    return roleRepository.save(role);
                });

        // Generate a placeholder email based on clerk sub
        String email = clerkSub + "@clerk.local";

        User user = User.builder()
                .firstName("LuxuryStay")
                .lastName("Guest")
                .email(email)
                .role(userRole)
                .enabled(true)
                .emailVerified(true)
                .loyaltyPoints(0)
                .roles(new HashSet<>(Set.of(roleEntity)))
                .build();

        user = userRepository.save(user);
        log.info("Created new user from Clerk: id={}, email={}", user.getId(), email);
        return user;
    }
    
    /**
     * Synchronizes the user's roles with the role extracted from the Clerk token.
     */
    private void syncUserRole(User user, String roleFromToken) {
        Role newRole = determineRole(roleFromToken);
        
        if (user.getRole() != newRole) {
            log.info("Updating user {} role from {} to {}", user.getEmail(), user.getRole(), newRole);
            
            RoleEntity roleEntity = roleRepository.findByName(newRole)
                    .orElseGet(() -> {
                        RoleEntity role = RoleEntity.builder()
                                .name(newRole)
                                .description(newRole.name() + " role")
                                .build();
                        return roleRepository.save(role);
                    });
            
            user.setRole(newRole);
            user.setRoles(new HashSet<>(Set.of(roleEntity)));
            userRepository.save(user);
        }
    }

    /**
     * Helper to map token string role to enum
     */
    private Role determineRole(String roleStr) {
        if (roleStr != null) {
            if (roleStr.contains("ADMIN")) return Role.ROLE_ADMIN;
            if (roleStr.contains("MANAGER")) return Role.ROLE_MANAGER;
            if (roleStr.contains("HOUSEKEEPING")) return Role.ROLE_HOUSEKEEPING;
        }
        return Role.ROLE_CUSTOMER;
    }
}
