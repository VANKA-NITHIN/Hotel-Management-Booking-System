package com.luxurystay.controller;

import com.luxurystay.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {

    private final ImageService imageService;

    /**
     * Upload a single image
     * POST /api/images/upload?folder=hotels
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general") String folder) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 10MB"));
        }

        Map<String, Object> result = imageService.uploadImage(file, folder);
        return ResponseEntity.ok(result);
    }

    /**
     * Upload multiple images
     * POST /api/images/upload-multiple?folder=hotels
     */
    @PostMapping("/upload-multiple")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Map<String, Object>>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(defaultValue = "general") String folder) {

        if (files.size() > 10) {
            return ResponseEntity.badRequest().body(List.of(Map.of("error", "Maximum 10 files allowed")));
        }

        List<Map<String, Object>> results = imageService.uploadImages(files, folder);
        return ResponseEntity.ok(results);
    }

    /**
     * Delete an image by public ID
     * DELETE /api/images/{publicId}
     */
    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteImage(@PathVariable String publicId) {
        boolean deleted = imageService.deleteImage(publicId);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        }
        return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete image"));
    }

    /**
     * Get transformed image URL
     * GET /api/images/transform/{publicId}?width=400&height=300
     */
    @GetMapping("/transform/{publicId}")
    public ResponseEntity<Map<String, String>> getTransformedUrl(
            @PathVariable String publicId,
            @RequestParam(defaultValue = "400") int width,
            @RequestParam(defaultValue = "300") int height) {

        String url = imageService.getTransformedUrl(publicId, width, height);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
