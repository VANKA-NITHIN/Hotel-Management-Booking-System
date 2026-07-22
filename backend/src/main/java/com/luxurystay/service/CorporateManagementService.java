package com.luxurystay.service;

import com.luxurystay.dto.ApiResponse;
import com.luxurystay.dto.BookingDTO;
import com.luxurystay.dto.CompanyInvitationDTO;
import com.luxurystay.dto.UserDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface CorporateManagementService {
    ApiResponse inviteEmployee(CompanyInvitationDTO dto, Authentication authentication);
    List<CompanyInvitationDTO> getPendingInvitations(Authentication authentication);
    ApiResponse acceptInvitation(String token, Authentication authentication);
    
    List<UserDTO> getCompanyEmployees(Authentication authentication);
    ApiResponse updateEmployeeRole(Long employeeId, String role, Authentication authentication);
    
    List<BookingDTO> getCorporateBookings(Authentication authentication);
}
