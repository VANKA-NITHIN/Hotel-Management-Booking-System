package com.luxurystay.service;

import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.enums.BookingStatus;
import com.luxurystay.repository.BookingRepository;
import com.luxurystay.repository.HotelRepository;
import com.luxurystay.repository.UserRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.mockito.ArgumentCaptor;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EmailServiceIntegrationTest {

    @Autowired
    private EmailService emailService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @MockBean
    private JavaMailSender mailSender;

    private Booking testBooking;
    private User testUser;
    private Hotel testHotel;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("jane.smith@test.com")
                .phone("+1987654321")
                .password("testpassword")
                .enabled(true)
                .build());

        testHotel = hotelRepository.save(Hotel.builder()
                .name("Ocean View Paradise")
                .description("Beachfront luxury hotel")
                .address("456 Beach Rd")
                .city("Miami")
                .state("Florida")
                .country("USA")
                .zipCode("33139")
                .phoneNumber("+1555987654")
                .email("info@oceanview.com")
                .startingPrice(new BigDecimal("399.00"))
                .rating(new BigDecimal("4.9"))
                .starRating(5)
                .active(true)
                .build());

        testBooking = bookingRepository.save(Booking.builder()
                .bookingReference("LS-EMAIL-001")
                .user(testUser)
                .hotel(testHotel)
                .checkInDate(LocalDate.now().plusDays(14))
                .checkOutDate(LocalDate.now().plusDays(17))
                .guestCount(2)
                .childrenCount(0)
                .status(BookingStatus.CONFIRMED)
                .totalAmount(new BigDecimal("1890.00"))
                .tax(new BigDecimal("171.82"))
                .serviceCharge(new BigDecimal("94.50"))
                .discount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build());

        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void sendBookingConfirmation_validBooking_sendsEmail() {
        emailService.sendBookingConfirmation(testBooking);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, timeout(5000).times(1)).send(captor.capture());
        assertNotNull(captor.getValue());
    }

    @Test
    void sendBookingConfirmation_nullUser_doesNotThrow() {
        // Use transient object (not saved) since Booking.user has nullable=false in DB
        Booking bookingNoUser = Booking.builder()
                .bookingReference("LS-NOUSER-001")
                .user(null)
                .hotel(testHotel)
                .checkInDate(LocalDate.now().plusDays(1))
                .checkOutDate(LocalDate.now().plusDays(2))
                .guestCount(1)
                .childrenCount(0)
                .status(BookingStatus.CONFIRMED)
                .totalAmount(new BigDecimal("500.00"))
                .tax(new BigDecimal("45.45"))
                .serviceCharge(new BigDecimal("25.00"))
                .discount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();

        assertDoesNotThrow(() -> emailService.sendBookingConfirmation(bookingNoUser),
                "Should not throw when user is null");
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendBookingCancellation_validBooking_sendsEmail() {
        emailService.sendBookingCancellation(testBooking);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, timeout(5000).times(1)).send(captor.capture());
        assertNotNull(captor.getValue());
    }

    @Test
    void sendBookingCancellation_nullEmail_doesNotThrow() {
        // User with null email can't be persisted (DB constraint), use transient object
        User userNoEmail = User.builder()
                .firstName("No")
                .lastName("Email")
                .email(null)
                .enabled(true)
                .build();

        Booking bookingNoEmail = Booking.builder()
                .bookingReference("LS-NOEMAIL-001")
                .user(userNoEmail)
                .hotel(testHotel)
                .checkInDate(LocalDate.now().plusDays(1))
                .checkOutDate(LocalDate.now().plusDays(2))
                .guestCount(1)
                .childrenCount(0)
                .status(BookingStatus.CANCELLED)
                .totalAmount(new BigDecimal("500.00"))
                .tax(new BigDecimal("45.45"))
                .serviceCharge(new BigDecimal("25.00"))
                .discount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();

        assertDoesNotThrow(() -> emailService.sendBookingCancellation(bookingNoEmail),
                "Should not throw when user email is null");
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendPasswordResetEmail_validEmail_sendsEmail() {
        emailService.sendPasswordResetEmail("jane.smith@test.com", "reset-token-123");

        verify(mailSender, timeout(5000).times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendBookingConfirmation_verifiesEmailContent() throws Exception {
        emailService.sendBookingConfirmation(testBooking);

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, timeout(5000).times(1)).send(captor.capture());
        MimeMessage capturedMessage = captor.getValue();
        assertNotNull(capturedMessage, "MimeMessage should not be null");
        assertNotNull(capturedMessage.getSubject(), "Email subject should be set");
        assertTrue(capturedMessage.getSubject().contains("Booking Confirmed"),
                "Subject should contain 'Booking Confirmed'");
        assertNotNull(capturedMessage.getAllRecipients(), "Email should have recipients");
    }
}
