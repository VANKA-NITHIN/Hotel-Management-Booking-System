package com.luxurystay.mapper;

import com.luxurystay.dto.HotelDTO;
import com.luxurystay.entity.Hotel;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface HotelMapper {

    @Mapping(target = "managerId", expression = "java(hotel.getManager() != null ? hotel.getManager().getId() : null)")
    @Mapping(target = "managerName", expression = "java(hotel.getManager() != null ? hotel.getManager().getFirstName() + \" \" + hotel.getManager().getLastName() : null)")
    HotelDTO toDTO(Hotel hotel);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "rooms", ignore = true)
    @Mapping(target = "amenities", ignore = true)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Hotel toEntity(HotelDTO dto);

    List<HotelDTO> toDTOList(List<Hotel> hotels);
}
