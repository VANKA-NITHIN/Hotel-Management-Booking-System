package com.luxurystay.service;

import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.repository.BookingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    @Test
    void generateInvoice_validBooking_shouldReturnPdfBytes() {
        // Arrange
        Booking booking = createTestBooking();
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        // Act
        byte[] pdfBytes = invoiceService.generateInvoice(1L);

        // Assert
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        // PDF files start with %PDF
        String header = new String(pdfBytes, 0, Math.min(5, pdfBytes.length));
        assertTrue(header.startsWith("%PDF"));
        verify(bookingRepository, times(1)).findById(1L);
    }

    @Test
    void generateInvoice_bookingNotFound_shouldThrowException() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> invoiceService.generateInvoice(999L));
    }

    @Test
    void generateInvoice_withDiscount_shouldIncludeDiscountLine() {
        Booking booking = createTestBooking();
        booking.setDiscount(new BigDecimal("50.00"));
        booking.setCouponCode("SAVE50");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        byte[] pdfBytes = invoiceService.generateInvoice(1L);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    void generateInvoice_withChildren_shouldRenderGuestCount() {
        Booking booking = createTestBooking();
        booking.setChildrenCount(2);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        byte[] pdfBytes = invoiceService.generateInvoice(1L);

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
