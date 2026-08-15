package com.luxurystay.service;

import com.luxurystay.dto.UserDTO;
import com.luxurystay.dto.UpdatePreferencesRequest;
import com.luxurystay.dto.UpdateProfileRequest;
import com.luxurystay.entity.RoleEntity;
import com.luxurystay.entity.User;
import com.luxurystay.enums.Role;
import com.luxurystay.exception.ResourceNotFoundException;
import com.luxurystay.mapper.UserMapper;
import com.luxurystay.repository.RoleRepository;
import com.luxurystay.repository.UserRepository;
import com.luxurystay.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthServiceImpl authService;

    private User user;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .role(Role.ROLE_CUSTOMER)
                .enabled(true)
                .build();

        userDTO = UserDTO.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .role("ROLE_CUSTOMER")
                .build();
    }

    @Test
    void testSyncUser_ExistingUser() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("john@example.com");
        org.mockito.Mockito.doReturn(java.util.List.of(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .when(authentication).getAuthorities();
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        
        RoleEntity customerRoleEntity = RoleEntity.builder().name(Role.ROLE_CUSTOMER).build();
        when(roleRepository.findByName(Role.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRoleEntity));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toDTO(user)).thenReturn(userDTO);

        // Attacker-supplied role in the body must be IGNORED - role comes from the token.
        userDTO.setRole("ROLE_ADMIN");
        UserDTO synced = authService.syncUser(userDTO, authentication);

        assertNotNull(synced);
        assertEquals("John", synced.getFirstName());
        assertEquals(Role.ROLE_CUSTOMER, user.getRole());
        verify(userRepository).save(any(User.class));
        verify(roleRepository).findByName(Role.ROLE_CUSTOMER);
    }

    @Test
    void testSyncUser_NewUser() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("john@example.com");
        org.mockito.Mockito.doReturn(java.util.List.of(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .when(authentication).getAuthorities();
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        
        RoleEntity customerRoleEntity = RoleEntity.builder().name(Role.ROLE_CUSTOMER).build();
        when(roleRepository.findByName(Role.ROLE_CUSTOMER)).thenReturn(Optional.of(customerRoleEntity));
        
        User savedUser = User.builder().id(1L).email("john@example.com").role(Role.ROLE_CUSTOMER).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        
        userDTO.setRole("ROLE_ADMIN");
        when(userMapper.toDTO(savedUser)).thenReturn(userDTO);

        // Role from the body must NOT be honored on creation either.
        UserDTO synced = authService.syncUser(userDTO, authentication);

        assertNotNull(synced);
        assertEquals(Role.ROLE_CUSTOMER, savedUser.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testSyncUser_Unauthenticated_ShouldReject() {
        when(authentication.isAuthenticated()).thenReturn(false);

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> authService.syncUser(userDTO, authentication));
    }

    @Test
    void testGetCurrentUser() {
        when(authentication.getName()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        User currentUser = authService.getCurrentUser(authentication);

        assertNotNull(currentUser);
        assertEquals("john@example.com", currentUser.getEmail());
    }

    @Test
    void testGetCurrentUser_NotFound() {
        when(authentication.getName()).thenReturn("notfound@example.com");
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getCurrentUser(authentication));
    }

    @Test
    void testUpdateProfile() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        UserDTO updatedDTO = UserDTO.builder().firstName("Jane").build();
        when(userMapper.toDTO(user)).thenReturn(updatedDTO);

        UserDTO result = authService.updateProfile(1L, request);

        assertNotNull(result);
        assertEquals("Jane", result.getFirstName());
        assertEquals("Jane", user.getFirstName()); // Verify the entity was mutated before save
        verify(userRepository).save(user);
    }

    @Test
    void testLockUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        authService.lockUser(1L);

        assertTrue(user.isAccountLocked());
        assertNotNull(user.getLockedUntil());
        verify(userRepository).save(user);
    }

    @Test
    void testUnlockUser() {
        user.setAccountLocked(true);
        user.setLockedUntil(LocalDateTime.now().plusDays(1));
        user.setFailedLoginAttempts(3);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        authService.unlockUser(1L);

        assertFalse(user.isAccountLocked());
        assertNull(user.getLockedUntil());
        assertEquals(0, user.getFailedLoginAttempts());
        verify(userRepository).save(user);
    }
    
    @Test
    void testUpdatePreferences() {
        UpdatePreferencesRequest request = new UpdatePreferencesRequest();
        request.setEmailBookings(true);
        request.setPushPromotions(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        
        UserDTO updatedDTO = UserDTO.builder().emailBookings(true).build();
        when(userMapper.toDTO(user)).thenReturn(updatedDTO);

        UserDTO result = authService.updatePreferences(1L, request);

        assertNotNull(result);
        assertTrue(user.isEmailBookings());
        assertFalse(user.isPushPromotions());
        verify(userRepository).save(user);
    }
}
