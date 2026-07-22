package com.luxurystay.service.impl.storage;

import com.luxurystay.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final String uploadDir = "uploads/";

    public LocalStorageService() {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (created) {
                log.info("Created local uploads directory: {}", uploadDir);
            }
        }
    }

    @Override
    public Map<String, Object> uploadImage(MultipartFile file, String folder) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String publicId = folder + "_" + UUID.randomUUID().toString();
            String fileName = publicId + extension;
            
            Path targetLocation = Paths.get(uploadDir).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            String url = "/api/images/" + fileName; // Served by ImageController

            log.info("Image uploaded to local storage: {}", publicId);

            return Map.of(
                    "url", url,
                    "publicId", publicId,
                    "width", 1200, // Dummy sizes for local
                    "height", 800,
                    "format", extension.replace(".", ""),
                    "bytes", file.getSize()
            );
        } catch (IOException e) {
            log.error("Failed to upload image to local storage: {}", e.getMessage());
            throw new RuntimeException("Local image upload failed", e);
        }
    }

    @Override
    public List<Map<String, Object>> uploadImages(List<MultipartFile> files, String folder) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                results.add(uploadImage(file, folder));
            }
        }
        return results;
    }

    @Override
    public boolean deleteImage(String publicId) {
        try {
            // Find file that starts with publicId
            File dir = new File(uploadDir);
            File[] matches = dir.listFiles((dir1, name) -> name.startsWith(publicId));
            if (matches != null && matches.length > 0) {
                boolean deleted = matches[0].delete();
                log.info("Local image deleted: {}", publicId);
                return deleted;
            }
            return false;
        } catch (Exception e) {
            log.error("Failed to delete local image: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String getTransformedUrl(String publicId, int width, int height) {
        // Local storage doesn't support on-the-fly transformations easily, just return original
        // Find extension
        File dir = new File(uploadDir);
        File[] matches = dir.listFiles((dir1, name) -> name.startsWith(publicId));
        if (matches != null && matches.length > 0) {
            return "/api/images/" + matches[0].getName();
        }
        return "/api/images/" + publicId + ".jpg"; // fallback
    }
}
