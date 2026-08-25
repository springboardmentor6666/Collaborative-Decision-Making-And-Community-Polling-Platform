package com.decisionhub.util;

import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;

public class FileValidationUtil {

    public static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    public static void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size exceeds maximum allowed limit of 10MB");
        }
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("File type '" + contentType + "' is not supported");
        }
    }

    public static byte[] compressImageIfPossible(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && contentType.startsWith("image/")) {
            try {
                BufferedImage originalImage = ImageIO.read(file.getInputStream());
                if (originalImage != null && (originalImage.getWidth() > 1920 || originalImage.getHeight() > 1080)) {
                    int targetWidth = Math.min(originalImage.getWidth(), 1920);
                    int targetHeight = (int) (originalImage.getHeight() * ((double) targetWidth / originalImage.getWidth()));

                    BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
                    Graphics2D g2d = resizedImage.createGraphics();
                    g2d.drawImage(originalImage, 0, 0, targetWidth, targetHeight, null);
                    g2d.dispose();

                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    String format = contentType.contains("png") ? "png" : "jpg";
                    ImageIO.write(resizedImage, format, baos);
                    return baos.toByteArray();
                }
            } catch (IOException ignored) {
            }
        }
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content", e);
        }
    }
}
