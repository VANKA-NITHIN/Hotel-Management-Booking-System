package com.luxurystay.service.impl.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.luxurystay.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "storage.provider", havingValue = "cloudinary")
public class CloudinaryStorageService implements StorageService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, Object> uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "luxurystay/" + folder,
                            "resource_type", "image",
                            "format", "webp",
                            "quality", "auto",
                            "width", 1200,
                            "height", 800,
                            "crop", "limit"
                    )
            );

            log.info("Image uploaded to Cloudinary: {} ({}x{})",
                    result.get("public_id"), result.get("width"), result.get("height"));

            return Map.of(
                    "url", result.get("secure_url"),
                    "publicId", result.get("public_id"),
                    "width", result.get("width"),
                    "height", result.get("height"),
                    "format", result.get("format"),
                    "bytes", result.get("bytes")
            );
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Image upload failed", e);
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
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted from Cloudinary: {}", publicId);
            return true;
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String getTransformedUrl(String publicId, int width, int height) {
        return cloudinary.url()
                .transformation(new com.cloudinary.Transformation()
                        .width(width)
                        .height(height)
                        .crop("fill")
                        .quality("auto"))
                .generate(publicId);
    }
}
