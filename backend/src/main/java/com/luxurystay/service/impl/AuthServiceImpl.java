package com.luxurystay.service.impl;

import com.luxurystay.dto.*;
import com.luxurystay.entity.RoleEntity;
import com.luxurystay.entity.User;
import com.luxurystay.enums.Role;
import com.luxurystay.exception.ResourceNotFoundException;
import com.luxurystay.mapper.UserMapper;
import com.luxurystay.repository.RoleRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    public UserDTO syncUser(UserDTO userDTO, Authentication authentication) {
        // SECURITY: /auth/sync must only run for an authenticated caller syncing their OWN
        // profile. The identity (email) and role are taken from the verified Clerk JWT in the
        // SecurityContext - NEVER from the request body, which previously allowed any caller
        // to escalate any known email to ROLE_ADMIN (privilege escalation).
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication required to sync profile");
        }

        // Identity comes from the verified token, never from the body.
        String email = authentication.getName();
        if (email == null || email.isBlank()) {
            throw new org.springframework.security.access.AccessDeniedException("Could not determine authenticated identity");
        }

        // Role comes from the token-derived authorities (set by JwtAuthenticationFilter).
        Role roleEnum = extractRoleFromAuthentication(authentication);

        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setFirstName(getValidName(userDTO.getFirstName(), "Guest"));
            user.setLastName(getValidName(userDTO.getLastName(), "User"));
            user.setPhone(userDTO.getPhone());
            user.setProfileImage(userDTO.getProfileImage());

            user.setRole(roleEnum);
            RoleEntity roleEntity = roleRepository.findByName(roleEnum)
                    .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                            .name(roleEnum)
                            .description(roleEnum.name() + " role")
                            .build()));
            user.setRoles(new HashSet<>(Set.of(roleEntity)));
            
            return userMapper.toDTO(userRepository.save(user));
        } else {
            // Create a new user synced from Clerk
            // We ignore userDTO.getId() because the DB uses auto-increment
            User user = User.builder()
                    .firstName(getValidName(userDTO.getFirstName(), "Guest"))
                    .lastName(getValidName(userDTO.getLastName(), "User"))
                    .email(email)
                    .phone(userDTO.getPhone())
                    .profileImage(userDTO.getProfileImage())
                    .role(roleEnum)
                    .enabled(true)
                    .emailVerified(true) // assume verified if coming from Clerk
                    .accountLocked(false)
                    .loyaltyPoints(0)
                    .build();

            RoleEntity roleEntity = roleRepository.findByName(roleEnum)
                    .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                            .name(roleEnum)
                            .description(roleEnum.name() + " role")
                            .build()));
            user.setRoles(new HashSet<>(Set.of(roleEntity)));
            
            return userMapper.toDTO(userRepository.save(user));
        }
    }

    /**
     * Derive the user's role from the verified authentication authorities (sourced from the
     * Clerk JWT public_metadata by JwtAuthenticationFilter). Never trusts client-supplied roles.
     */
    private Role extractRoleFromAuthentication(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .findFirst()
                .map(authority -> {
                    try {
                        return Role.valueOf(authority);
                    } catch (IllegalArgumentException e) {
                        return Role.ROLE_CUSTOMER;
                    }
                })
                .orElse(Role.ROLE_CUSTOMER);
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserDTO> getAllUsers(int page, int size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<User> userPage;
        if (search != null && !search.isEmpty()) {
            userPage = userRepository.searchUsers(search, pageRequest);
        } else {
            userPage = userRepository.findAll(pageRequest);
        }

        List<UserDTO> users = userPage.getContent().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<UserDTO>builder()
                .content(users)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDTO(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public void lockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setAccountLocked(true);
        user.setLockedUntil(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
    }

    @Override
    public void unlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    @Override
    public UserDTO updatePreferences(Long userId, UpdatePreferencesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getEmailBookings() != null) {
            user.setEmailBookings(request.getEmailBookings());
        }
        if (request.getEmailPromotions() != null) {
            user.setEmailPromotions(request.getEmailPromotions());
        }
        if (request.getPushBookings() != null) {
            user.setPushBookings(request.getPushBookings());
        }
        if (request.getPushPromotions() != null) {
            user.setPushPromotions(request.getPushPromotions());
        }
        if (request.getLanguagePreference() != null) {
            user.setLanguagePreference(request.getLanguagePreference());
        }

        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }

    @Override
    public void updateLanguagePreference(Long userId, String language) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setLanguagePreference(language);
        userRepository.save(user);
    }

    private String getValidName(String name, String fallback) {
        return (name == null || name.trim().isEmpty()) ? fallback : name;
    }
}
