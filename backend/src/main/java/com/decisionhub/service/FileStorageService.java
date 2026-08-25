package com.decisionhub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.decisionhub.util.FileValidationUtil;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${app.cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:1234567890}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:secret}")
    private String apiSecret;

    @Value("${app.cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;

    private Cloudinary cloudinary;
    private final Path uploadDir = Paths.get("uploads");

    @PostConstruct
    public void init() {
        if (cloudinaryEnabled) {
            try {
                this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret
                ));
                logger.info("Cloudinary SDK initialized successfully.");
            } catch (Exception e) {
                logger.warn("Failed to initialize Cloudinary SDK: {}", e.getMessage());
            }
        }
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            logger.error("Could not create local upload directory: {}", e.getMessage());
        }
    }

    public String storeFile(MultipartFile file) {
        FileValidationUtil.validateFile(file);
        byte[] fileBytes = FileValidationUtil.compressImageIfPossible(file);

        if (cloudinaryEnabled && cloudinary != null) {
            try {
                Map uploadResult = cloudinary.uploader().upload(fileBytes, ObjectUtils.emptyMap());
                return (String) uploadResult.get("secure_url");
            } catch (Exception e) {
                logger.warn("Cloudinary upload failed, falling back to local storage: {}", e.getMessage());
            }
        }

        // Local Storage Fallback
        try {
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + extension;
            Path targetPath = uploadDir.resolve(uniqueName);

            try (FileOutputStream fos = new FileOutputStream(targetPath.toFile())) {
                fos.write(fileBytes);
            }

            return "/api/files/download/" + uniqueName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file locally", e);
        }
    }

    public Path getLocalFilePath(String filename) {
        return uploadDir.resolve(filename);
    }
}
