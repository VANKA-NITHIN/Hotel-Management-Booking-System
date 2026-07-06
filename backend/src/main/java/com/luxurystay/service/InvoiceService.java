package com.luxurystay.service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.luxurystay.entity.Booking;
import com.luxurystay.entity.Hotel;
import com.luxurystay.entity.User;
import com.luxurystay.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final BookingRepository bookingRepository;

    public byte[] generateInvoice(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            PdfFont font = PdfFontFactory.createFont();
            PdfFont boldFont = PdfFontFactory.createFont();

            // Header
            document.add(new Paragraph("LUXURYSTAY")
                    .setFont(boldFont).setFontSize(24)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("INVOICE")
                    .setFont(boldFont).setFontSize(16)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new LineSeparator(new SolidLine()).setMarginTop(10).setMarginBottom(10));

            // Invoice details
            Table invoiceTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();

            invoiceTable.addCell(new Cell().add(new Paragraph("Invoice #: ").setFont(font))
                    .add(new Paragraph(booking.getBookingReference()).setFont(boldFont))
                    .setBorder(null).setPaddingBottom(5));

            invoiceTable.addCell(new Cell().add(new Paragraph("Date: ").setFont(font))
                    .add(new Paragraph(booking.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))).setFont(font))
                    .setTextAlignment(TextAlignment.RIGHT).setBorder(null).setPaddingBottom(5));

            document.add(invoiceTable);

            document.add(new Div().setHeight(15));

            // Guest & Hotel info
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();

            // Guest info
            Cell guestCell = new Cell()
                    .add(new Paragraph("BILL TO").setFont(boldFont).setFontSize(10).setMarginBottom(5))
                    .setBorder(null);

            if (booking.getUser() != null) {
                User user = booking.getUser();
                guestCell.add(new Paragraph(user.getFirstName() + " " + user.getLastName()).setFont(font));
                guestCell.add(new Paragraph(user.getEmail()).setFont(font));
                if (user.getPhone() != null) {
                    guestCell.add(new Paragraph(user.getPhone()).setFont(font));
                }
            }
            invoiceTable.addCell(guestCell);

            // Hotel info
            Cell hotelCell = new Cell()
                    .add(new Paragraph("HOTEL").setFont(boldFont).setFontSize(10).setMarginBottom(5))
                    .setTextAlignment(TextAlignment.RIGHT).setBorder(null);

            Hotel hotel = booking.getHotel();
            hotelCell.add(new Paragraph(hotel.getName()).setFont(font));
            hotelCell.add(new Paragraph(hotel.getAddress()).setFont(font));
            hotelCell.add(new Paragraph(hotel.getCity() + ", " + hotel.getCountry()).setFont(font));
            invoiceTable.addCell(hotelCell);

            document.add(invoiceTable);

            document.add(new Div().setHeight(15));

            // Booking details table
            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{40, 30, 30}))
                    .useAllAvailableWidth()
                    .setBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));

            // Header row
            String[] headers = {"Description", "Details", "Amount"};
            for (String header : headers) {
                detailsTable.addHeaderCell(new Cell()
                        .add(new Paragraph(header).setFont(boldFont).setFontSize(9))
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                        .setPadding(8));
            }

            // Booking rows
            detailsTable.addCell(new Cell().add(new Paragraph("Check-in Date").setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph(booking.getCheckInDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))).setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("")).setPadding(8));

            detailsTable.addCell(new Cell().add(new Paragraph("Check-out Date").setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph(booking.getCheckOutDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))).setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("")).setPadding(8));

            long nights = java.time.temporal.ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
            double pricePerNight = booking.getTotalAmount().doubleValue() / Math.max(1, nights);

            detailsTable.addCell(new Cell().add(new Paragraph("Room Charges").setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph(nights + " night(s) × $" + String.format("%.2f", pricePerNight)).setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", booking.getTotalAmount().subtract(booking.getTax()).subtract(booking.getServiceCharge()).add(booking.getDiscount()))).setFont(font)).setPadding(8));

            detailsTable.addCell(new Cell().add(new Paragraph("Guests").setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph(booking.getGuestCount() + " adults" + (booking.getChildrenCount() > 0 ? ", " + booking.getChildrenCount() + " children" : "")).setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("")).setPadding(8));

            if (booking.getDiscount().doubleValue() > 0) {
                detailsTable.addCell(new Cell().add(new Paragraph("Discount" + (booking.getCouponCode() != null ? " (" + booking.getCouponCode() + ")" : "")).setFont(font)).setPadding(8));
                detailsTable.addCell(new Cell().add(new Paragraph("")).setPadding(8));
                detailsTable.addCell(new Cell().add(new Paragraph("-$" + String.format("%.2f", booking.getDiscount())).setFont(font)).setPadding(8));
            }

            detailsTable.addCell(new Cell().add(new Paragraph("Tax (10%)").setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("")).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", booking.getTax())).setFont(font)).setPadding(8));

            detailsTable.addCell(new Cell().add(new Paragraph("Service Charge").setFont(font)).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("")).setPadding(8));
            detailsTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", booking.getServiceCharge())).setFont(font)).setPadding(8));

            document.add(detailsTable);

            document.add(new Div().setHeight(10));

            // Total
            Table totalTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                    .useAllAvailableWidth();

            totalTable.addCell(new Cell().add(new Paragraph("")).setBorder(null));
            totalTable.addCell(new Cell()
                    .add(new Paragraph("TOTAL").setFont(boldFont).setFontSize(12))
                    .add(new Paragraph("$" + String.format("%.2f", booking.getTotalAmount())).setFont(boldFont).setFontSize(14).setFontColor(ColorConstants.DARK_GRAY))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(null));

            document.add(totalTable);

            document.add(new Div().setHeight(30));

            // Footer
            document.add(new LineSeparator(new SolidLine()).setMarginBottom(10));
            document.add(new Paragraph("Thank you for choosing LuxuryStay!")
                    .setFont(font).setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY));

            document.add(new Paragraph("For questions, contact support@luxurystay.com")
                    .setFont(font).setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(8).setFontColor(ColorConstants.GRAY));

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate invoice for booking {}: {}", bookingId, e.getMessage());
            throw new RuntimeException("Failed to generate invoice", e);
        }
    }
}
