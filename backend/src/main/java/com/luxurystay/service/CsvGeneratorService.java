package com.luxurystay.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class CsvGeneratorService {

    public byte[] generateCsv(List<String> headers, List<Map<String, Object>> rows) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PrintWriter writer = new PrintWriter(baos)) {
             
            // Write headers
            writer.println(String.join(",", headers));
            
            // Write rows
            for (Map<String, Object> row : rows) {
                StringBuilder rowString = new StringBuilder();
                for (int i = 0; i < headers.size(); i++) {
                    String header = headers.get(i);
                    Object value = row.get(header);
                    
                    String strValue = (value == null) ? "" : value.toString().replace("\"", "\"\"");
                    // Quote if contains comma
                    if (strValue.contains(",")) {
                        strValue = "\"" + strValue + "\"";
                    }
                    
                    rowString.append(strValue);
                    if (i < headers.size() - 1) {
                        rowString.append(",");
                    }
                }
                writer.println(rowString.toString());
            }
            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate CSV: {}", e.getMessage());
            throw new RuntimeException("Failed to generate CSV", e);
        }
    }
}
