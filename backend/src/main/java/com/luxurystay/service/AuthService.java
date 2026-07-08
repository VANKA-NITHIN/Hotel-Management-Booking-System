package com.luxurystay.service;

import com.luxurystay.dto.*;
import com.luxurystay.entity.User;
import org.springframework.security.core.Authentication;

public interface AuthService {

    UserDTO syncUser(UserDTO userDTO);

    User getCurrentUser(Authentication authentication);

    UserDTO updateProfile(Long userId, UpdateProfileRequest request);

    PagedResponse<UserDTO> getAllUsers(int page, int size, String search);

    UserDTO getUserById(Long id);

    void deleteUser(Long id);

    void lockUser(Long id);

    void unlockUser(Long id);

    UserDTO updatePreferences(Long userId, UpdatePreferencesRequest request);
}
