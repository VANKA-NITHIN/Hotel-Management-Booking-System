package com.luxurystay.service.impl;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.HousekeepingDTO;
import com.luxurystay.entity.Housekeeping;
import com.luxurystay.enums.CleaningStatus;
import com.luxurystay.repository.HousekeepingRepository;
import com.luxurystay.service.HousekeepingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HousekeepingServiceImpl implements HousekeepingService {

    private final HousekeepingRepository housekeepingRepository;

    @Override
    public List<HousekeepingDTO> getHotelHousekeeping(Long hotelId, String status) {
        if (status != null) {
            return housekeepingRepository
                    .findByRoomHotelIdAndStatus(hotelId, CleaningStatus.valueOf(status))
                    .stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }
        return housekeepingRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApiResponse updateStatus(Long id, String status) {
        Housekeeping hk = housekeepingRepository.findById(id).orElse(null);
        if (hk == null) {
            return ApiResponse.builder()
                    .success(false)
                    .message("Housekeeping record not found")
                    .build();
        }
        hk.setStatus(CleaningStatus.valueOf(status));
        housekeepingRepository.save(hk);
        return ApiResponse.builder()
                .success(true)
                .message("Status updated")
                .build();
    }

    private HousekeepingDTO toDTO(Housekeeping h) {
        return HousekeepingDTO.builder()
                .id(h.getId())
                .roomId(h.getRoom().getId())
                .roomName(h.getRoom().getName())
                .assignedToId(h.getAssignedTo() != null ? h.getAssignedTo().getId() : null)
                .assignedToName(h.getAssignedTo() != null
                        ? h.getAssignedTo().getUser().getFirstName() + " " + h.getAssignedTo().getUser().getLastName()
                        : null)
                .status(h.getStatus().name())
                .notes(h.getNotes())
                .inspectionRequired(h.isInspectionRequired())
                .inspectionPassed(h.isInspectionPassed())
                .inspectionNotes(h.getInspectionNotes())
                .build();
    }
}
