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
        // Try to find by email first, then by Clerk sub ID
        User user = userRepository.findByEmail(emailOrSub).orElse(null);

        if (user == null) {
            // Check if this looks like a Clerk sub (starts with "user_")
            if (emailOrSub != null && emailOrSub.startsWith("user_")) {
                // Try to find by email in a broader way, or create new user
                user = createClerkUser(emailOrSub);
            } else {
                // Try finding by email
                user = userRepository.findByEmail(emailOrSub)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + emailOrSub));
            }
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
    private User createClerkUser(String clerkSub) {
        log.info("Creating new user from Clerk authentication: {}", clerkSub);

        RoleEntity customerRole = roleRepository.findByName(Role.ROLE_CUSTOMER)
                .orElseGet(() -> {
                    RoleEntity role = RoleEntity.builder()
                            .name(Role.ROLE_CUSTOMER)
                            .description("Customer role")
                            .build();
                    return roleRepository.save(role);
                });

        // Generate a placeholder email based on clerk sub
        String email = clerkSub + "@clerk.local";

        User user = User.builder()
                .firstName("LuxuryStay")
                .lastName("Guest")
                .email(email)
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .emailVerified(true)
                .loyaltyPoints(0)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();

        user = userRepository.save(user);
        log.info("Created new user from Clerk: id={}, email={}", user.getId(), email);
        return user;
    }
}
