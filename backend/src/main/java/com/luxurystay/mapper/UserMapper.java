package com.luxurystay.mapper;

import com.luxurystay.dto.*;
import com.luxurystay.entity.*;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(source = "roles", target = "role", qualifiedByName = "mapRole")
    UserDTO toDTO(User user);

    @Named("mapRole")
    default String mapRole(java.util.Set<RoleEntity> roles) {
        if (roles == null || roles.isEmpty()) return "ROLE_CUSTOMER";
        return roles.iterator().next().getName().name();
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "emailVerified", constant = "false")
    @Mapping(target = "accountLocked", constant = "false")
    User toEntity(RegisterRequest request);
}
