package com.luxurystay.mapper;

import com.luxurystay.dto.BookingDTO;
import com.luxurystay.entity.Booking;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {UserMapper.class, HotelMapper.class})
public interface BookingMapper {

    @Mapping(source = "user", target = "user", qualifiedByName = "mapBookingUser")
    @Mapping(source = "hotel", target = "hotel", qualifiedByName = "mapBookingHotel")
    BookingDTO toDTO(Booking booking);

    @Named("mapBookingUser")
    @Mapping(source = "id", target = "id")
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "phone", target = "phone")
    com.luxurystay.dto.UserDTO mapBookingUser(com.luxurystay.entity.User user);

    @Named("mapBookingHotel")
    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "city", target = "city")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "logoUrl", target = "logoUrl")
    com.luxurystay.dto.HotelDTO mapBookingHotel(com.luxurystay.entity.Hotel hotel);

    List<BookingDTO> toDTOList(List<Booking> bookings);
}
