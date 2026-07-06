package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HousekeepingDTO {

    private Long id;
    private Long roomId;
    private String roomName;
    private Long assignedToId;
    private String assignedToName;
    private String status;
    private String notes;
    private boolean inspectionRequired;
    private boolean inspectionPassed;
    private String inspectionNotes;
}
