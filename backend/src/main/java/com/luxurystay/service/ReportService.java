package com.luxurystay.service;

import com.luxurystay.entity.Booking;
import com.luxurystay.entity.User;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final CsvGeneratorService csvGeneratorService;
    private final PdfGeneratorService pdfGeneratorService;

    public byte[] exportBookings(String format, String companyId) {
        List<Booking> bookings = bookingRepository.findAll();
        
        if (companyId != null) {
            bookings = bookings.stream()
                .filter(b -> b.getCorporateContext() != null && companyId.equals(String.valueOf(b.getCorporateContext().getCompanyId())))
                .collect(Collectors.toList());
        }

        List<String> headers = Arrays.asList("Booking ID", "Reference", "Hotel", "Guest Name", "Guest Email", "Check-in", "Check-out", "Status", "Amount");
        List<Map<String, Object>> rows = new ArrayList<>();

        for (Booking b : bookings) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("Booking ID", b.getId());
            row.put("Reference", b.getBookingReference());
            row.put("Hotel", b.getHotel().getName());
            row.put("Guest Name", b.getUser() != null ? b.getUser().getFirstName() + " " + b.getUser().getLastName() : "Guest");
            row.put("Guest Email", b.getUser() != null ? b.getUser().getEmail() : "");
            row.put("Check-in", b.getCheckInDate());
            row.put("Check-out", b.getCheckOutDate());
            row.put("Status", b.getStatus());
            row.put("Amount", b.getTotalAmount());
            rows.add(row);
        }

        log.info("Generating bookings report in {} format", format);
        return format.equalsIgnoreCase("csv") 
            ? csvGeneratorService.generateCsv(headers, rows) 
            : pdfGeneratorService.generateTableReport("Bookings Report", headers, rows);
    }

    public byte[] exportEmployees(String format, String companyId) {
        List<User> users = userRepository.findAll();
        
        if (companyId != null) {
            users = users.stream()
                .filter(u -> u.getCompany() != null && companyId.equals(String.valueOf(u.getCompany().getId())))
                .collect(Collectors.toList());
        }

        List<String> headers = Arrays.asList("User ID", "Name", "Email", "Role", "Company", "Company Role", "Status");
        List<Map<String, Object>> rows = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("User ID", u.getId());
            row.put("Name", u.getFirstName() + " " + u.getLastName());
            row.put("Email", u.getEmail());
            row.put("Role", u.getRole());
            row.put("Company", u.getCompany() != null ? u.getCompany().getName() : "");
            row.put("Company Role", u.getCompanyRole() != null ? u.getCompanyRole().name() : "");
            row.put("Status", u.isEnabled() ? "Active" : "Inactive");
            rows.add(row);
        }

        log.info("Generating employees report in {} format", format);
        return format.equalsIgnoreCase("csv") 
            ? csvGeneratorService.generateCsv(headers, rows) 
            : pdfGeneratorService.generateTableReport("Employees Report", headers, rows);
    }
}
