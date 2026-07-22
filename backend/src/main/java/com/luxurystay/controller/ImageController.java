package com.luxurystay.controller;

import com.luxurystay.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {

    private final StorageService storageService;

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

        Map<String, Object> result = storageService.uploadImage(file, folder);
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

        List<Map<String, Object>> results = storageService.uploadImages(files, folder);
        return ResponseEntity.ok(results);
    }

    /**
     * Delete an image by public ID
     * DELETE /api/images/{publicId}
     */
    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteImage(@PathVariable String publicId) {
        boolean deleted = storageService.deleteImage(publicId);
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

        String url = storageService.getTransformedUrl(publicId, width, height);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * Serve local images
     * GET /api/images/{filename:.+}
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveLocalImage(@PathVariable String filename) {
        try {
            Path file = Paths.get("uploads/").resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                String contentType = "image/jpeg";
                if (filename.toLowerCase().endsWith(".png")) contentType = "image/png";
                if (filename.toLowerCase().endsWith(".webp")) contentType = "image/webp";
                if (filename.toLowerCase().endsWith(".gif")) contentType = "image/gif";
                
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, contentType)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
