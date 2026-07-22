package com.luxurystay.controller;

import com.luxurystay.dto.*;
import com.luxurystay.entity.User;
import com.luxurystay.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sync")
    public ResponseEntity<UserDTO> syncUser(@RequestBody UserDTO userDTO) {
        UserDTO syncedUser = authService.syncUser(userDTO);
        return ResponseEntity.ok(syncedUser);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = authService.getCurrentUser(authentication);
        UserDTO dto = UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .loyaltyPoints(user.getLoyaltyPoints())
                .emailBookings(user.isEmailBookings())
                .emailPromotions(user.isEmailPromotions())
                .pushBookings(user.isPushBookings())
                .pushPromotions(user.isPushPromotions())
                .build();
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(Authentication authentication,
                                                  @Valid @RequestBody UpdateProfileRequest request) {
        User user = authService.getCurrentUser(authentication);
        UserDTO dto = authService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserDTO> updatePreferences(Authentication authentication,
                                                     @Valid @RequestBody UpdatePreferencesRequest request) {
        User user = authService.getCurrentUser(authentication);
        UserDTO dto = authService.updatePreferences(user.getId(), request);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/language")
    public ResponseEntity<ApiResponse> updateLanguage(Authentication authentication,
                                                     @RequestBody Map<String, String> request) {
        User user = authService.getCurrentUser(authentication);
        String lang = request.get("language");
        if (lang != null) {
            authService.updateLanguagePreference(user.getId(), lang);
        }
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Language updated successfully")
                .build());
    }

    // Admin endpoints
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(authService.getAllUsers(page, size, search));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("User deleted successfully")
                .build());
    }

    @PostMapping("/admin/users/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> lockUser(@PathVariable Long id) {
        authService.lockUser(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("User locked successfully")
                .build());
    }

    @PostMapping("/admin/users/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> unlockUser(@PathVariable Long id) {
        authService.unlockUser(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("User unlocked successfully")
                .build());
    }
}
