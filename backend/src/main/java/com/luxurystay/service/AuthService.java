package com.luxurystay.service;

import com.luxurystay.dto.*;
import com.luxurystay.entity.User;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserDTO syncUser(UserDTO userDTO);

    AuthResponse refreshToken(String refreshToken);

    void logout(String token);

    User getCurrentUser(Authentication authentication);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    UserDTO updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    void verifyEmail(String token);

    PagedResponse<UserDTO> getAllUsers(int page, int size, String search);

    UserDTO getUserById(Long id);

    void deleteUser(Long id);

    void lockUser(Long id);

    void unlockUser(Long id);
}
