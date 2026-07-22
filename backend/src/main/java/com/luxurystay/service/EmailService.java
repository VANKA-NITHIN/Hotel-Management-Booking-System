package com.luxurystay.service;

import com.luxurystay.entity.Booking;
import com.luxurystay.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final InvoiceService invoiceService;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender, 
                       @Autowired(required = false) InvoiceService invoiceService) {
        this.mailSender = mailSender;
        this.invoiceService = invoiceService;
    }

    @Async
    public void sendBookingConfirmation(Booking booking) {
        User user = booking.getUser();
        if (user == null || user.getEmail() == null) {
            log.warn("Cannot send booking confirmation - no email for booking {}", booking.getBookingReference());
            return;
        }

        String subject = "Booking Confirmed - " + booking.getBookingReference();
        String htmlBody = buildBookingConfirmationHtml(booking);

        byte[] invoicePdf = null;
        if (invoiceService != null) {
            try {
                invoicePdf = invoiceService.generateInvoiceInternal(booking);
            } catch (Exception e) {
                log.error("Could not generate invoice attachment for email: {}", e.getMessage());
            }
        }

        sendHtmlEmailWithAttachment(user.getEmail(), subject, htmlBody, invoicePdf, 
            "LuxuryStay-Invoice-" + booking.getBookingReference() + ".pdf", "application/pdf");
    }

    @Async
    public void sendBookingCancellation(Booking booking) {
        User user = booking.getUser();
        if (user == null || user.getEmail() == null) return;

        String subject = "Booking Cancelled - " + booking.getBookingReference();
        String htmlBody = buildBookingCancellationHtml(booking);

        sendHtmlEmail(user.getEmail(), subject, htmlBody);
    }

    @Async
    public void sendPasswordResetEmail(String email, String resetToken) {
        String subject = "Password Reset - LuxuryStay";
        String htmlBody = buildPasswordResetHtml(resetToken);
        sendHtmlEmail(email, subject, htmlBody);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        sendHtmlEmailWithAttachment(to, subject, htmlBody, null, null, null);
    }

    private void sendHtmlEmailWithAttachment(String to, String subject, String htmlBody, byte[] attachment, String attachmentName, String contentType) {
        if (mailSender == null) {
            log.warn("MailSender not configured. Skipping email to {}: {}", to, subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("noreply@luxurystay.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            if (attachment != null && attachmentName != null) {
                helper.addAttachment(attachmentName, new ByteArrayDataSource(attachment, contentType));
            }

            mailSender.send(message);
            log.info("Email sent to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildBookingConfirmationHtml(Booking booking) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
                <div style="background: #1a1a2e; padding: 30px; border-radius: 12px; text-align: center;">
                    <h1 style="color: #c9a84c; margin: 0;">LUXURYSTAY</h1>
                    <p style="color: #9ca3af; margin-top: 5px;">Booking Confirmation</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                    <h2 style="color: #1a1a2e;">Your Booking is Confirmed! ✅</h2>
                    <p>Dear %s,</p>
                    <p>Thank you for booking with LuxuryStay. Your reservation has been confirmed.</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Booking Reference:</strong> %s</p>
                        <p><strong>Hotel:</strong> %s</p>
                        <p><strong>Check-in:</strong> %s</p>
                        <p><strong>Check-out:</strong> %s</p>
                        <p><strong>Guests:</strong> %d adults</p>
                        <p><strong>Total:</strong> $%.2f</p>
                    </div>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This is an automated email from LuxuryStay.</p>
                </div>
            </body>
            </html>
            """.formatted(
                booking.getUser().getFirstName() + " " + booking.getUser().getLastName(),
                booking.getBookingReference(),
                booking.getHotel().getName(),
                booking.getCheckInDate().format(fmt),
                booking.getCheckOutDate().format(fmt),
                booking.getGuestCount(),
                booking.getTotalAmount().doubleValue()
        );
    }

    private String buildBookingCancellationHtml(Booking booking) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
                <div style="background: #1a1a2e; padding: 30px; border-radius: 12px; text-align: center;">
                    <h1 style="color: #c9a84c; margin: 0;">LUXURYSTAY</h1>
                    <p style="color: #9ca3af; margin-top: 5px;">Booking Cancelled</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                    <h2 style="color: #1a1a2e;">Booking Cancelled</h2>
                    <p>Your booking <strong>%s</strong> has been cancelled.</p>
                    <p>If this was a mistake, please contact us.</p>
                </div>
            </body>
            </html>
            """.formatted(booking.getBookingReference());
    }

    private String buildPasswordResetHtml(String resetToken) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
                <div style="background: #1a1a2e; padding: 30px; border-radius: 12px; text-align: center;">
                    <h1 style="color: #c9a84c; margin: 0;">LUXURYSTAY</h1>
                </div>
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                    <h2 style="color: #1a1a2e;">Password Reset</h2>
                    <p>You requested a password reset. Click the link below to reset your password:</p>
                    <a href="http://localhost:5173/reset-password?token=%s" style="display:inline-block; background:#c9a84c; color:#1a1a2e; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; margin: 20px 0;">Reset Password</a>
                    <p style="color: #6b7280; font-size: 12px;">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
                </div>
            </body>
            </html>
            """.formatted(resetToken);
    }


}
