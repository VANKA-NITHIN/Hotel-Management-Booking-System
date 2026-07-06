package com.luxurystay.service;

import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendBookingConfirmation_shouldSendEmail() throws Exception {
        MimeMessage mimeMessage = mock(MimeMessage.class, withSettings().defaultAnswer(RETURNS_DEEP_STUBS));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        Booking booking = createTestBooking();

        emailService.sendBookingConfirmation(booking);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(captor.capture());
        assertNotNull(captor.getValue());
    }

    @Test
    void sendBookingConfirmation_nullUser_shouldNotSendEmail() {
        Booking booking = Booking.builder().user(null).build();

        emailService.sendBookingConfirmation(booking);

        verify(mailSender, never()).createMimeMessage();
    }

    @Test
    void sendBookingConfirmation_nullEmail_shouldNotSendEmail() {
        User user = User.builder().email(null).build();
        Booking booking = Booking.builder().user(user).build();

        emailService.sendBookingConfirmation(booking);

        verify(mailSender, never()).createMimeMessage();
    }

    @Test
    void sendBookingCancellation_shouldSendEmail() throws Exception {
        MimeMessage mimeMessage = mock(MimeMessage.class, withSettings().defaultAnswer(RETURNS_DEEP_STUBS));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        Booking booking = createTestBooking();
        booking.setStatus(BookingStatus.CANCELLED);

        emailService.sendBookingCancellation(booking);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendBookingCancellation_nullUser_shouldNotSendEmail() {
        Booking booking = Booking.builder().user(null).build();

        emailService.sendBookingCancellation(booking);

        verify(mailSender, never()).createMimeMessage();
    }

    @Test
    void sendPasswordResetEmail_shouldSendEmail() throws Exception {
        MimeMessage mimeMessage = mock(MimeMessage.class, withSettings().defaultAnswer(RETURNS_DEEP_STUBS));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendPasswordResetEmail("test@example.com", "reset-token-123");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendPasswordResetEmail_mailFailure_shouldNotThrow() throws Exception {
        when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("SMTP error"));

        assertDoesNotThrow(() -> emailService.sendPasswordResetEmail("test@example.com", "reset-token-123"));
    }

    private Booking createTestBooking() {
        User user = User.builder()
                .id(1L).firstName("John").lastName("Doe")
                .email("john@example.com").phone("+1234567890")
                .build();

        Hotel hotel = Hotel.builder()
                .id(1L).name("LuxuryStay Grand")
                .address("123 Grand Avenue").city("New York").country("USA")
                .build();

        return Booking.builder()
                .id(1L).bookingReference("LS-TEST001")
                .user(user).hotel(hotel)
                .checkInDate(LocalDate.now().plusDays(7))
                .checkOutDate(LocalDate.now().plusDays(10))
                .guestCount(2).childrenCount(0)
                .status(BookingStatus.CONFIRMED)
                .totalAmount(new BigDecimal("1485.00"))
                .tax(new BigDecimal("135.00"))
                .serviceCharge(new BigDecimal("67.50"))
                .discount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
