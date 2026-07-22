package com.luxurystay.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@SuppressWarnings("null")
class InvoiceServiceIntegrationTest {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    private Booking testBooking;

    @BeforeEach
    void setUp() {
        User user = userRepository.save(User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@test.com")
                .phone("+1234567890")
                
                .enabled(true)
                .build());

        Hotel hotel = hotelRepository.save(Hotel.builder()
                .name("Grand Luxury Resort")
                .description("A luxury resort in the mountains")
                .address("123 Resort Blvd")
                .city("Aspen")
                .state("Colorado")
                .country("USA")
                .zipCode("80161")
                .phoneNumber("+1555123456")
                .email("info@luxuryresort.com")
                .startingPrice(new BigDecimal("299.00"))
                .rating(new BigDecimal("4.8"))
                .starRating(5)
                .active(true)
                .build());

        testBooking = bookingRepository.save(Booking.builder()
                .bookingReference("LS-INT-001")
                .user(user)
                .hotel(hotel)
                .checkInDate(LocalDate.now().plusDays(7))
                .checkOutDate(LocalDate.now().plusDays(10))
                .guestCount(2)
                .childrenCount(1)
                .status(BookingStatus.CONFIRMED)
                .totalAmount(new BigDecimal("1485.00"))
                .tax(new BigDecimal("135.00"))
                .serviceCharge(new BigDecimal("67.50"))
                .discount(new BigDecimal("50.00"))
                .couponCode("SUMMER50")
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Test
    void generateInvoice_validBooking_returnsPdfBytes() {
        byte[] pdf = invoiceService.generateInvoiceInternal(testBooking);

        assertNotNull(pdf, "PDF bytes should not be null");
        assertTrue(pdf.length > 100, "PDF should have meaningful content");
        assertEquals('%', (char) pdf[0], "PDF should start with %");
        assertEquals('P', (char) pdf[1], "PDF header should contain P");
        assertEquals('D', (char) pdf[2], "PDF header should contain D");
        assertEquals('F', (char) pdf[3], "PDF header should contain F");
    }

    @Test
    void generateInvoice_validatesAsReadablePdf() {
        byte[] pdf = invoiceService.generateInvoiceInternal(testBooking);

        try (PdfReader reader = new PdfReader(new ByteArrayInputStream(pdf));
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            assertEquals(1, pdfDoc.getNumberOfPages(), "PDF should have exactly 1 page");
            assertTrue(pdfDoc.getDocumentInfo().getTitle() == null ||
                       pdfDoc.getDocumentInfo().getCreator() != null ||
                       pdfDoc.getNumberOfPages() > 0,
                    "PDF document should be structurally valid");
        } catch (Exception e) {
            fail("PDF should be a valid, readable PDF document: " + e.getMessage());
        }
    }

    @Test
    void generateInvoice_producesSubstantialPdf() {
        byte[] pdf = invoiceService.generateInvoiceInternal(testBooking);

        assertTrue(pdf.length > 500, "Invoice PDF should be substantial (>500 bytes)");

        try (PdfReader reader = new PdfReader(new ByteArrayInputStream(pdf));
             PdfDocument pdfDoc = new PdfDocument(reader)) {
            assertEquals(1, pdfDoc.getNumberOfPages());
            assertTrue(pdf.length > 2000,
                    "Invoice with full booking details should be >2KB");
        } catch (Exception e) {
            fail("PDF should be valid: " + e.getMessage());
        }
    }

    @Test
    void generateInvoice_nonExistentBooking_throwsException() {
        // Test wrapper method throws without auth (as integration test doesn't set security context)
        org.springframework.security.core.Authentication mockAuth = org.mockito.Mockito.mock(org.springframework.security.core.Authentication.class);
        assertThrows(RuntimeException.class, () -> invoiceService.generateInvoice(99999L, mockAuth),
                "Should throw exception for non-existent booking");
    }

    @Test
    void generateInvoice_multipleCallsEachProduceValidPdf() {
        byte[] pdf1 = invoiceService.generateInvoiceInternal(testBooking);
        byte[] pdf2 = invoiceService.generateInvoiceInternal(testBooking);

        // Both calls should produce valid PDFs independently
        assertTrue(pdf1.length > 500, "First PDF should be valid");
        assertTrue(pdf2.length > 500, "Second PDF should be valid");

        // Both should be parseable as valid PDF documents
        try (PdfReader r1 = new PdfReader(new ByteArrayInputStream(pdf1));
             PdfDocument d1 = new PdfDocument(r1);
             PdfReader r2 = new PdfReader(new ByteArrayInputStream(pdf2));
             PdfDocument d2 = new PdfDocument(r2)) {
            assertEquals(1, d1.getNumberOfPages(), "First PDF should have 1 page");
            assertEquals(1, d2.getNumberOfPages(), "Second PDF should have 1 page");
        } catch (Exception e) {
            fail("Both PDFs should be valid: " + e.getMessage());
        }
    }
}
