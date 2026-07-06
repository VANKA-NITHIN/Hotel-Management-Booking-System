package com.luxurystay.service.impl;

import com.luxurystay.dto.PagedResponse;
import com.luxurystay.dto.RoomDTO;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.Room;
import com.luxurystay.enums.RoomStatus;
import com.luxurystay.enums.RoomType;
import com.luxurystay.exception.BadRequestException;
import com.luxurystay.exception.ResourceNotFoundException;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.RoomRepository;
import com.luxurystay.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    @Override
    public RoomDTO createRoom(Long hotelId, RoomDTO roomDTO) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));

        Room room = Room.builder()
                .hotel(hotel)
                .name(roomDTO.getName())
                .description(roomDTO.getDescription())
                .roomType(RoomType.valueOf(roomDTO.getRoomType()))
                .pricePerNight(roomDTO.getPricePerNight())
                .maxGuests(roomDTO.getMaxGuests())
                .maxChildren(roomDTO.getMaxChildren())
                .bedCount(roomDTO.getBedCount())
                .bedType(roomDTO.getBedType())
                .floor(roomDTO.getFloor())
                .size(roomDTO.getSize())
                .view(roomDTO.getView())
                .status(RoomStatus.AVAILABLE)
                .active(true)
                .roomNumber(roomDTO.getRoomNumber())
                .weekendPrice(roomDTO.getWeekendPrice())
                .holidayPrice(roomDTO.getHolidayPrice())
                .build();

        room = roomRepository.save(room);
        return toDTO(room);
    }

    @Override
    public RoomDTO updateRoom(Long hotelId, Long roomId, RoomDTO roomDTO) {
        Room room = roomRepository.findById(roomId)
                .filter(r -> r.getHotel().getId().equals(hotelId))
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));

        room.setName(roomDTO.getName());
        room.setDescription(roomDTO.getDescription());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setMaxGuests(roomDTO.getMaxGuests());
        room.setMaxChildren(roomDTO.getMaxChildren());
        room.setBedCount(roomDTO.getBedCount());
        room.setBedType(roomDTO.getBedType());
        room.setFloor(roomDTO.getFloor());
        room.setSize(roomDTO.getSize());
        room.setView(roomDTO.getView());
        room.setActive(roomDTO.isActive());
        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setWeekendPrice(roomDTO.getWeekendPrice());
        room.setHolidayPrice(roomDTO.getHolidayPrice());

        if (roomDTO.getRoomType() != null) {
            room.setRoomType(RoomType.valueOf(roomDTO.getRoomType()));
        }

        room = roomRepository.save(room);
        return toDTO(room);
    }

    @Override
    public void deleteRoom(Long hotelId, Long roomId) {
        Room room = roomRepository.findById(roomId)
                .filter(r -> r.getHotel().getId().equals(hotelId))
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        room.setActive(false);
        roomRepository.save(room);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Long hotelId, Long roomId) {
        Room room = roomRepository.findById(roomId)
                .filter(r -> r.getHotel().getId().equals(hotelId))
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        return toDTO(room);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RoomDTO> getRoomsByHotel(Long hotelId, String roomType,
                                                   BigDecimal minPrice, BigDecimal maxPrice,
                                                   Integer maxGuests, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("pricePerNight").ascending());

        RoomType type = roomType != null ? RoomType.valueOf(roomType) : null;

        Page<Room> roomPage = roomRepository.searchRooms(
                hotelId, type, minPrice, maxPrice, maxGuests, pageRequest);

        List<RoomDTO> rooms = roomPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PagedResponse.<RoomDTO>builder()
                .content(rooms)
                .page(roomPage.getNumber())
                .size(roomPage.getSize())
                .totalElements(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .last(roomPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        List<Room> rooms = roomRepository.findAvailableRooms(hotelId, checkIn, checkOut);
        return rooms.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRoomsByHotel(Long hotelId) {
        List<Room> rooms = roomRepository.findByHotelIdAndActiveTrue(hotelId);
        return rooms.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDTO getRoomDetails(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        return toDTO(room);
    }

    @Override
    public void updateRoomStatus(Long roomId, String status) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        room.setStatus(RoomStatus.valueOf(status));
        roomRepository.save(room);
    }

    @Override
    public void updateCleaningStatus(Long roomId, String status) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));
        room.setCleaningStatus(com.luxurystay.enums.CleaningStatus.valueOf(status));
        roomRepository.save(room);
    }

    private RoomDTO toDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .hotelId(room.getHotel().getId())
                .name(room.getName())
                .description(room.getDescription())
                .roomType(room.getRoomType().name())
                .pricePerNight(room.getPricePerNight())
                .maxGuests(room.getMaxGuests())
                .maxChildren(room.getMaxChildren())
                .bedCount(room.getBedCount())
                .bedType(room.getBedType())
                .floor(room.getFloor())
                .size(room.getSize())
                .view(room.getView())
                .status(room.getStatus().name())
                .cleaningStatus(room.getCleaningStatus().name())
                .active(room.isActive())
                .roomNumber(room.getRoomNumber())
                .weekendPrice(room.getWeekendPrice())
                .holidayPrice(room.getHolidayPrice())
                .build();
    }
}
