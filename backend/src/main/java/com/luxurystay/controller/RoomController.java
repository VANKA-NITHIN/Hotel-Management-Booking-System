package com.luxurystay.controller;

import com.luxurystay.dto.*;
import com.luxurystay.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/hotels/{hotelId}/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<PagedResponse<RoomDTO>> getRoomsByHotel(
            @PathVariable Long hotelId,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer maxGuests,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(roomService.getRoomsByHotel(hotelId, roomType, minPrice, maxPrice, maxGuests, page, size));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long hotelId, @PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomById(hotelId, roomId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<RoomDTO>> getAllRooms(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getAllRoomsByHotel(hotelId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<RoomDTO>> getAvailableRooms(
            @PathVariable Long hotelId,
            @RequestParam String checkIn,
            @RequestParam String checkOut) {
        return ResponseEntity.ok(roomService.getAvailableRooms(hotelId,
                LocalDate.parse(checkIn), LocalDate.parse(checkOut)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RoomDTO> createRoom(@PathVariable Long hotelId,
                                               @Valid @RequestBody RoomDTO roomDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(hotelId, roomDTO));
    }

    @PutMapping("/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Long hotelId,
                                               @PathVariable Long roomId,
                                               @Valid @RequestBody RoomDTO roomDTO) {
        return ResponseEntity.ok(roomService.updateRoom(hotelId, roomId, roomDTO));
    }

    @DeleteMapping("/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long hotelId, @PathVariable Long roomId) {
        roomService.deleteRoom(hotelId, roomId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{roomId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> updateRoomStatus(@PathVariable Long roomId,
                                                  @RequestBody java.util.Map<String, String> body) {
        roomService.updateRoomStatus(roomId, body.get("status"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{roomId}/cleaning-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'HOUSEKEEPING')")
    public ResponseEntity<Void> updateCleaningStatus(@PathVariable Long roomId,
                                                      @RequestBody java.util.Map<String, String> body) {
        roomService.updateCleaningStatus(roomId, body.get("status"));
        return ResponseEntity.ok().build();
    }
}
