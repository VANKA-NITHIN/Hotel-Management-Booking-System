package com.luxurystay.config;

import com.luxurystay.entity.Amenity;
import com.luxurystay.entity.RoleEntity;
import com.luxurystay.entity.User;
import com.luxurystay.enums.Role;
import com.luxurystay.repository.AmenityRepository;
import com.luxurystay.repository.RoleRepository;
import com.luxurystay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AmenityRepository amenityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initRoles();
        initAdminUser();
        initAmenities();
    }

    private void initRoles() {
        for (Role role : Role.values()) {
            if (roleRepository.findByName(role).isEmpty()) {
                roleRepository.save(RoleEntity.builder()
                        .name(role)
                        .description(role.name() + " role")
                        .build());
            }
        }
        log.info("Roles initialized successfully");
    }

    private void initAdminUser() {
        if (!userRepository.existsByEmail("admin@luxurystay.com")) {
            RoleEntity adminRole = roleRepository.findByName(Role.ROLE_ADMIN)
                    .orElseThrow();

            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@luxurystay.com")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .emailVerified(true)
                    .roles(new HashSet<>(Set.of(adminRole)))
                    .build();

            userRepository.save(admin);
            log.info("Admin user created successfully");
        }
    }

    private void initAmenities() {
        List<String> amenityNames = List.of(
                "Free Wi-Fi", "Swimming Pool", "Spa & Wellness", "Fitness Center",
                "Restaurant", "Bar/Lounge", "Room Service", "Concierge",
                "Parking", "Airport Shuttle", "Business Center", "Conference Room",
                "Laundry Service", "Dry Cleaning", "Iron & Ironing Board",
                "In-Room Safe", "Air Conditioning", "Heating", "Mini Bar",
                "Television", "Telephone", "Wake-up Service", "24-Hour Front Desk",
                "Elevator", "Wheelchair Accessible", "Pet Friendly",
                "Garden", "Terrace", "Balcony", "Sea View",
                "Mountain View", "City View", "Ocean View", "Lake View",
                "Fireplace", "Jacuzzi", "Sauna", "Steam Room",
                "Tennis Court", "Golf Course", "Bicycle Rental", "Kayaking",
                "Childcare Services", "Kids Club", "Playground", "Babysitting"
        );

        for (String name : amenityNames) {
            if (amenityRepository.findByNameIgnoreCase(name).isEmpty()) {
                amenityRepository.save(Amenity.builder()
                        .name(name)
                        .active(true)
                        .build());
            }
        }
        log.info("Amenities initialized successfully");
    }
}
