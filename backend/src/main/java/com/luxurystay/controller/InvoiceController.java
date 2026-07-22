package com.luxurystay.controller;

import com.luxurystay.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final com.luxurystay.service.AuditService auditService;
    private final com.luxurystay.service.AuthService authService;

    @GetMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long bookingId, Authentication authentication, jakarta.servlet.http.HttpServletRequest request) {
        try {
            com.luxurystay.entity.User user = authService.getCurrentUser(authentication);
            byte[] pdfBytes = invoiceService.generateInvoice(bookingId, authentication);
            
            auditService.logAction(auditService.createLogBuilder(user.getId().toString(), user.getEmail(), com.luxurystay.enums.AuditActionType.DOWNLOAD_INVOICE)
                    .resourceType("INVOICE")
                    .resourceId(bookingId.toString())
                    .requestPath(request.getRequestURI())
                    .httpMethod(request.getMethod())
                    .ipAddress(request.getRemoteAddr())
                    .build());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename("LuxuryStay-Invoice-" + bookingId + ".pdf")
                    .build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to generate invoice for booking {}: {}", bookingId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
