package com.luxurystay.controller;

import com.luxurystay.entity.User;
import com.luxurystay.service.AuthService;
import com.luxurystay.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final AuthService authService;
    private final com.luxurystay.service.AuditService auditService;

    @GetMapping("/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAdminBookings(@RequestParam(defaultValue = "pdf") String format, Authentication authentication, jakarta.servlet.http.HttpServletRequest request) {
        log.info("Admin exporting bookings in {} format", format);
        User user = authService.getCurrentUser(authentication);
        byte[] data = reportService.exportBookings(format, null);
        
        auditService.logAction(auditService.createLogBuilder(user.getId().toString(), user.getEmail(), com.luxurystay.enums.AuditActionType.EXPORT_REPORT)
                .resourceType("BOOKING_REPORT")
                .requestPath(request.getRequestURI())
                .httpMethod(request.getMethod())
                .ipAddress(request.getRemoteAddr())
                .build());
                
        return buildResponse(data, format, "admin_bookings");
    }

    @GetMapping("/admin/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAdminEmployees(@RequestParam(defaultValue = "csv") String format, Authentication authentication, jakarta.servlet.http.HttpServletRequest request) {
        log.info("Admin exporting employees in {} format", format);
        User user = authService.getCurrentUser(authentication);
        byte[] data = reportService.exportEmployees(format, null);
        
        auditService.logAction(auditService.createLogBuilder(user.getId().toString(), user.getEmail(), com.luxurystay.enums.AuditActionType.EXPORT_REPORT)
                .resourceType("EMPLOYEE_REPORT")
                .requestPath(request.getRequestURI())
                .httpMethod(request.getMethod())
                .ipAddress(request.getRemoteAddr())
                .build());
                
        return buildResponse(data, format, "admin_employees");
    }

    @GetMapping("/corporate/bookings")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CORPORATE')")
    public ResponseEntity<byte[]> exportCorporateBookings(@RequestParam(defaultValue = "pdf") String format, Authentication authentication, jakarta.servlet.http.HttpServletRequest request) {
        User user = authService.getCurrentUser(authentication);
        if (user.getCompany() == null) {
            return ResponseEntity.badRequest().build();
        }
        log.info("Corporate manager exporting bookings in {} format for company {}", format, user.getCompany().getId());
        byte[] data = reportService.exportBookings(format, String.valueOf(user.getCompany().getId()));
        
        auditService.logAction(auditService.createLogBuilder(user.getId().toString(), user.getEmail(), com.luxurystay.enums.AuditActionType.EXPORT_REPORT)
                .resourceType("CORPORATE_BOOKING_REPORT")
                .resourceId(String.valueOf(user.getCompany().getId()))
                .requestPath(request.getRequestURI())
                .httpMethod(request.getMethod())
                .ipAddress(request.getRemoteAddr())
                .build());
                
        return buildResponse(data, format, "corporate_bookings_" + user.getCompany().getName().replace(" ", "_"));
    }

    private ResponseEntity<byte[]> buildResponse(byte[] data, String format, String filenamePrefix) {
        HttpHeaders headers = new HttpHeaders();
        String extension = format.equalsIgnoreCase("csv") ? ".csv" : ".pdf";
        MediaType mediaType = format.equalsIgnoreCase("csv") 
                ? MediaType.parseMediaType("text/csv") 
                : MediaType.APPLICATION_PDF;

        headers.setContentType(mediaType);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(filenamePrefix + "_" + System.currentTimeMillis() + extension)
                .build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }
}
