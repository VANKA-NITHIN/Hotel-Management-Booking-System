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
    public UserDTO syncUser(UserDTO userDTO) {
        Optional<User> existingUser = userRepository.findById(userDTO.getId());
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            user.setPhone(userDTO.getPhone());
            user.setProfileImage(userDTO.getProfileImage());
            
            // Sync Role from Clerk
            if (userDTO.getRole() != null) {
                try {
                    Role roleEnum = Role.valueOf(userDTO.getRole());
                    user.setRole(roleEnum);
                    RoleEntity roleEntity = roleRepository.findByName(roleEnum)
                            .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                                    .name(roleEnum)
                                    .description(roleEnum.name() + " role")
                                    .build()));
                    user.setRoles(new HashSet<>(Set.of(roleEntity)));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role passed from Clerk: {}", userDTO.getRole());
                }
            }
            
            return userMapper.toDTO(userRepository.save(user));
        } else {
            // Create a new user synced from Clerk
            User user = User.builder()
                    .id(userDTO.getId())
                    .firstName(userDTO.getFirstName())
                    .lastName(userDTO.getLastName())
                    .email(userDTO.getEmail())
                    .phone(userDTO.getPhone())
                    .profileImage(userDTO.getProfileImage())
                    .role(Role.ROLE_CUSTOMER) // default role
                    .enabled(true)
                    .emailVerified(true) // assume verified if coming from Clerk
                    .accountLocked(false)
                    .loyaltyPoints(0)
                    .build();

            // Set role from DTO or default to CUSTOMER
            Role roleEnum = Role.ROLE_CUSTOMER;
            if (userDTO.getRole() != null) {
                try {
                    roleEnum = Role.valueOf(userDTO.getRole());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role passed from Clerk: {}", userDTO.getRole());
                }
            }
            user.setRole(roleEnum);

            final Role finalRoleEnum = roleEnum;
            RoleEntity roleEntity = roleRepository.findByName(finalRoleEnum)
                    .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                            .name(finalRoleEnum)
                            .description(finalRoleEnum.name() + " role")
                            .build()));
            user.setRoles(new HashSet<>(Set.of(roleEntity)));
            
            return userMapper.toDTO(userRepository.save(user));
        }
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

        user.setEmailBookings(request.getEmailBookings());
        user.setEmailPromotions(request.getEmailPromotions());
        user.setPushBookings(request.getPushBookings());
        user.setPushPromotions(request.getPushPromotions());

        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }
}
