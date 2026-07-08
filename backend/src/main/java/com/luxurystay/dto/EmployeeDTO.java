package com.luxurystay.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDTO {

    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Long hotelId;
    private String position;
    private BigDecimal salary;
    private String joinDate;
    private String shift;
    private boolean active;
    private String address;
    private String emergencyContact;
    private String emergencyContactName;
}
