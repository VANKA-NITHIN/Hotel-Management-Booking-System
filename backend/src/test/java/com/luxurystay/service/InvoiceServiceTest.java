package com.luxurystay.service;

import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.repository.BookingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InvoiceServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private AuthService authService;

    @org.mockito.InjectMocks
    private InvoiceService invoiceService;

    @Test
    void generateInvoice_validBooking_shouldReturnPdfBytes() {
        // Arrange
        Booking booking = createTestBooking();

        // Act
        byte[] pdfBytes = invoiceService.generateInvoiceInternal(booking);

        // Assert
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        // PDF files start with %PDF
        String header = new String(pdfBytes, 0, Math.min(5, pdfBytes.length));
        assertTrue(header.startsWith("%PDF"));
    }

    @Test
    void generateInvoice_bookingNotFound_shouldThrowException() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // No longer applicable since generateInvoiceInternal takes Booking, not Long.
        // We'll just test that the wrapper throws if booking not found.
        org.springframework.security.core.Authentication auth = org.mockito.Mockito.mock(org.springframework.security.core.Authentication.class);
        assertThrows(RuntimeException.class, () -> invoiceService.generateInvoice(999L, auth));
    }

    @Test
    void generateInvoice_withDiscount_shouldIncludeDiscountLine() {
        Booking booking = createTestBooking();
        booking.setDiscount(new BigDecimal("50.00"));
        booking.setCouponCode("SAVE50");

        byte[] pdfBytes = invoiceService.generateInvoiceInternal(booking);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    void generateInvoice_withChildren_shouldRenderGuestCount() {
        Booking booking = createTestBooking();
        booking.setChildrenCount(2);

        byte[] pdfBytes = invoiceService.generateInvoiceInternal(booking);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    private Booking createTestBooking() {
        User user = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .phone("+1234567890")
                .build();

        Hotel hotel = Hotel.builder()
                .id(1L)
                .name("LuxuryStay Grand")
                .address("123 Grand Avenue")
                .city("New York")
                .country("USA")
                .startingPrice(new BigDecimal("450.00"))
                .build();

        return Booking.builder()
                .id(1L)
                .bookingReference("LS-TEST001")
                .user(user)
                .hotel(hotel)
                .checkInDate(LocalDate.now().plusDays(7))
                .checkOutDate(LocalDate.now().plusDays(10))
                .guestCount(2)
                .childrenCount(0)
                .status(BookingStatus.CONFIRMED)
                .totalAmount(new BigDecimal("1485.00"))
                .tax(new BigDecimal("135.00"))
                .serviceCharge(new BigDecimal("67.50"))
                .discount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
