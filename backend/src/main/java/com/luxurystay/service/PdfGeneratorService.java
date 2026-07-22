package com.luxurystay.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class PdfGeneratorService {

    public byte[] generateTableReport(String title, List<String> headers, List<Map<String, Object>> rows) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            // Use landscape for reports with many columns
            Document document = new Document(pdfDoc, PageSize.A4.rotate());
            document.setMargins(30, 30, 30, 30);

            PdfFont font = PdfFontFactory.createFont();
            PdfFont boldFont = PdfFontFactory.createFont();

            // Title
            document.add(new Paragraph(title)
                    .setFont(boldFont).setFontSize(18)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // Table
            float[] columnWidths = new float[headers.size()];
            for (int i = 0; i < headers.size(); i++) {
                columnWidths[i] = 100f / headers.size();
            }
            Table table = new Table(UnitValue.createPercentArray(columnWidths)).useAllAvailableWidth();

            // Headers
            for (String header : headers) {
                table.addHeaderCell(new Cell()
                        .add(new Paragraph(header).setFont(boldFont).setFontSize(10))
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                        .setPadding(5));
            }

            // Rows
            for (Map<String, Object> row : rows) {
                for (String header : headers) {
                    Object val = row.get(header);
                    String strVal = (val == null) ? "" : val.toString();
                    table.addCell(new Cell()
                            .add(new Paragraph(strVal).setFont(font).setFontSize(9))
                            .setPadding(4));
                }
            }

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}
