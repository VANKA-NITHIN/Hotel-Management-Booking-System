package com.luxurystay.service.impl;

import com.luxurystay.dto.*;
import com.luxurystay.entity.RoleEntity;
import com.luxurystay.entity.User;
import com.luxurystay.enums.Role;
import com.luxurystay.exception.BadRequestException;
import com.luxurystay.exception.ResourceNotFoundException;
import com.luxurystay.exception.UnauthorizedException;
import com.luxurystay.mapper.UserMapper;
import com.luxurystay.repository.RoleRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.security.JwtTokenProvider;
import com.luxurystay.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .emailVerified(false)
                .accountLocked(false)
                .loyaltyPoints(0)
                .build();

        RoleEntity customerRole = roleRepository.findByName(Role.ROLE_CUSTOMER)
                .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                        .name(Role.ROLE_CUSTOMER)
                        .description("Customer role")
                        .build()));

        user.setRoles(new HashSet<>(Set.of(customerRole)));
        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getJwtExpiration())
                .user(userMapper.toDTO(user))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (user.isAccountLocked()) {
            if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
                throw new UnauthorizedException("Account is locked. Try again after " + user.getLockedUntil());
            }
            user.setAccountLocked(false);
            user.setFailedLoginAttempts(0);
            userRepository.save(user);
        }

        String token = tokenProvider.generateToken(user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getJwtExpiration())
                .user(userMapper.toDTO(user))
                .build();
    }

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
            
            // Do not override roles blindly, but we can set them if needed
            return userMapper.toDTO(userRepository.save(user));
        } else {
            // Create a new user synced from Clerk
            User user = User.builder()
                    .id(userDTO.getId()) // use the ID provided by Clerk mapping
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
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // dummy password
                    .build();

            RoleEntity customerRole = roleRepository.findByName(Role.ROLE_CUSTOMER)
                    .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                            .name(Role.ROLE_CUSTOMER)
                            .description("Customer role")
                            .build()));
            user.setRoles(new HashSet<>(Set.of(customerRole)));
            
            return userMapper.toDTO(userRepository.save(user));
        }
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String newToken = tokenProvider.generateToken(user.getEmail());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(newToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getJwtExpiration())
                .user(userMapper.toDTO(user))
                .build();
    }

    @Override
    public void logout(String token) {
        // In a production system, you would blacklist the token
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        // In production, send email with reset link
        log.info("Password reset token for {}: {}", request.getEmail(), resetToken);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
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
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
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
}
