package com.luxurystay.service.impl.storage;

import com.luxurystay.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
@ConditionalOnProperty(name = "storage.provider", havingValue = "s3")
public class S3StorageService implements StorageService {

    @Override
    public Map<String, Object> uploadImage(MultipartFile file, String folder) {
        throw new UnsupportedOperationException("S3StorageService not fully implemented yet");
    }

    @Override
    public List<Map<String, Object>> uploadImages(List<MultipartFile> files, String folder) {
        throw new UnsupportedOperationException("S3StorageService not fully implemented yet");
    }

    @Override
    public boolean deleteImage(String publicId) {
        throw new UnsupportedOperationException("S3StorageService not fully implemented yet");
    }

    @Override
    public String getTransformedUrl(String publicId, int width, int height) {
        throw new UnsupportedOperationException("S3StorageService not fully implemented yet");
    }
}
