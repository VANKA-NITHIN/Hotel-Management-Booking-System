package com.luxurystay.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

public interface StorageService {
    /**
     * Upload a single image
     * @param file MultipartFile to upload
     * @param folder Target folder
     * @return Map with url, publicId, width, height, format
     */
    Map<String, Object> uploadImage(MultipartFile file, String folder);

    /**
     * Upload multiple images
     */
    List<Map<String, Object>> uploadImages(List<MultipartFile> files, String folder);

    /**
     * Delete an image by public ID
     */
    boolean deleteImage(String publicId);

    /**
     * Generate a transformed URL for an image
     */
    String getTransformedUrl(String publicId, int width, int height);
}
