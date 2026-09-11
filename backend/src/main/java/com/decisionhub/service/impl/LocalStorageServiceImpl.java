package com.decisionhub.service.impl;

import com.decisionhub.dto.response.FileUploadResponse;
import com.decisionhub.entity.Attachment;
import com.decisionhub.entity.Comment;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.User;
import com.decisionhub.exception.BusinessException;
import com.decisionhub.exception.EntityNotFoundException;
import com.decisionhub.exception.ForbiddenException;
import com.decisionhub.repository.AttachmentRepository;
import com.decisionhub.repository.CommentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalStorageServiceImpl implements StorageService {

    private final Path rootLocation = Paths.get("uploads");
    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final DecisionRepository decisionRepository;
    private final CommentRepository commentRepository;

    private static final long MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    private static final long MAX_DOC_SIZE = 25 * 1024 * 1024;   // 25MB

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml",
            "image/avif", "image/heic", "image/heif", "image/bmp", "image/tiff"
    );

    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-matroska",
            "video/avi", "video/x-msvideo", "video/mpeg", "video/3gpp", "video/x-flv"
    );

    private static final Set<String> ALLOWED_DOC_TYPES = Set.of(
            "application/pdf", "text/plain", "text/csv", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/json", "application/rtf"
    );

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("avatars"));
            Files.createDirectories(rootLocation.resolve("decisions"));
            Files.createDirectories(rootLocation.resolve("comments"));
            Files.createDirectories(rootLocation.resolve("docs"));
            Files.createDirectories(rootLocation.resolve("general"));
            log.info("Storage directory initialized successfully at: {}", rootLocation.toAbsolutePath());
        } catch (IOException e) {
            log.error("Could not initialize storage directories: {}", e.getMessage());
            throw new BusinessException("Could not initialize file storage directory");
        }
    }

    @Override
    @Transactional
    public FileUploadResponse storeFile(MultipartFile file, Long userId, String folder) {
        validateFile(file);
        String targetFolder = resolveFolder(folder, file.getContentType());
        String storedFilename = saveAndOptimizeFile(file, targetFolder);
        String fileUrl = "/uploads/" + targetFolder + "/" + storedFilename;

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        Attachment attachment = Attachment.builder()
                .fileName(StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : storedFilename))
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .uploadedBy(user)
                .build();

        Attachment saved = attachmentRepository.save(attachment);

        return FileUploadResponse.builder()
                .attachmentId(saved.getAttachmentId())
                .fileName(saved.getFileName())
                .fileUrl(saved.getFileUrl())
                .fileType(saved.getFileType())
                .fileSize(file.getSize())
                .message("File uploaded successfully")
                .build();
    }

    @Override
    @Transactional
    public List<FileUploadResponse> storeFiles(List<MultipartFile> files, Long userId, String folder) {
        List<FileUploadResponse> responses = new ArrayList<>();
        if (files == null || files.isEmpty()) {
            return responses;
        }
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                responses.add(storeFile(file, userId, folder));
            }
        }
        return responses;
    }

    @Override
    @Transactional
    public FileUploadResponse storeProfileImage(MultipartFile file, Long userId) {
        validateImageFile(file);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        String storedFilename = saveAndOptimizeAvatar(file);
        String fileUrl = "/uploads/avatars/" + storedFilename;

        user.setProfileImage(fileUrl);
        userRepository.save(user);

        return FileUploadResponse.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .message("Profile image updated successfully")
                .build();
    }

    @Override
    @Transactional
    public FileUploadResponse storeDecisionAttachment(MultipartFile file, Long decisionId, Long userId) {
        Decision decision = decisionRepository.findById(decisionId)
                .orElseThrow(() -> new EntityNotFoundException("Decision", "id", decisionId));

        validateFile(file);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        String targetFolder = "decisions";
        String storedFilename = saveAndOptimizeFile(file, targetFolder);
        String fileUrl = "/uploads/" + targetFolder + "/" + storedFilename;

        Attachment attachment = Attachment.builder()
                .decision(decision)
                .fileName(StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : storedFilename))
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .uploadedBy(user)
                .build();

        Attachment saved = attachmentRepository.save(attachment);

        return FileUploadResponse.builder()
                .attachmentId(saved.getAttachmentId())
                .fileName(saved.getFileName())
                .fileUrl(saved.getFileUrl())
                .fileType(saved.getFileType())
                .fileSize(file.getSize())
                .message("Attachment linked to decision successfully")
                .build();
    }

    @Override
    @Transactional
    public FileUploadResponse storeCommentAttachment(MultipartFile file, Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment", "id", commentId));

        validateFile(file);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", userId));

        String targetFolder = "comments";
        String storedFilename = saveAndOptimizeFile(file, targetFolder);
        String fileUrl = "/uploads/" + targetFolder + "/" + storedFilename;

        Attachment attachment = Attachment.builder()
                .comment(comment)
                .fileName(StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : storedFilename))
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .uploadedBy(user)
                .build();

        Attachment saved = attachmentRepository.save(attachment);

        return FileUploadResponse.builder()
                .attachmentId(saved.getAttachmentId())
                .fileName(saved.getFileName())
                .fileUrl(saved.getFileUrl())
                .fileType(saved.getFileType())
                .fileSize(file.getSize())
                .message("Attachment linked to comment successfully")
                .build();
    }

    @Override
    @Transactional
    public void deleteAttachment(Long attachmentId, Long requestingUserId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new EntityNotFoundException("Attachment", "id", attachmentId));

        User requestingUser = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", "id", requestingUserId));

        boolean isAdmin = requestingUser.getRole() != null &&
                requestingUser.getRole().getRoleName() == com.decisionhub.common.enums.RoleType.ROLE_ADMIN;
        boolean isOwner = attachment.getUploadedBy() != null &&
                attachment.getUploadedBy().getUserId().equals(requestingUserId);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("You do not have permission to delete this attachment");
        }

        // Delete from disk if possible
        try {
            String fileUrl = attachment.getFileUrl();
            if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
                String relativePath = fileUrl.substring("/uploads/".length());
                Path filePath = rootLocation.resolve(relativePath);
                Files.deleteIfExists(filePath);
            }
        } catch (Exception e) {
            log.warn("Could not delete physical file for attachment {}: {}", attachmentId, e.getMessage());
        }

        attachmentRepository.delete(attachment);
    }

    @Override
    public Resource loadAsResource(String filename, String folder) {
        try {
            Path file = rootLocation.resolve(folder != null ? folder : "").resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new EntityNotFoundException("File not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new EntityNotFoundException("File not found: " + filename);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Cannot upload an empty file");
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        boolean isImage = (contentType != null && (ALLOWED_IMAGE_TYPES.contains(contentType) || contentType.startsWith("image/")))
                || filename.matches(".*\\.(jpg|jpeg|png|webp|gif|svg|avif|heic|heif|bmp|tiff)$");
        boolean isVideo = (contentType != null && (ALLOWED_VIDEO_TYPES.contains(contentType) || contentType.startsWith("video/")))
                || filename.matches(".*\\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp|flv)$");
        boolean isDoc = (contentType != null && ALLOWED_DOC_TYPES.contains(contentType))
                || filename.matches(".*\\.(pdf|txt|csv|doc|docx|xls|xlsx|json|rtf)$");

        if (isImage) {
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new BusinessException("Image size exceeds limit of 15MB");
            }
        } else if (isVideo) {
            if (file.getSize() > MAX_VIDEO_SIZE) {
                throw new BusinessException("Video size exceeds limit of 50MB");
            }
        } else if (isDoc) {
            if (file.getSize() > MAX_DOC_SIZE) {
                throw new BusinessException("Document size exceeds limit of 25MB");
            }
        } else {
            throw new BusinessException("Unsupported file format" + (contentType != null ? ": " + contentType : "") + ". Allowed: Images (JPG, PNG, WebP, GIF), Videos (MP4, WebM, MOV), and Documents (PDF, DOCX, XLSX).");
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Cannot upload an empty file");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BusinessException("Only image files (JPEG, PNG, WebP, GIF) are allowed for profile pictures");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new BusinessException("Profile image size exceeds 15MB limit");
        }
    }

    private String resolveFolder(String requestedFolder, String contentType) {
        if (requestedFolder != null && !requestedFolder.trim().isEmpty()) {
            return requestedFolder.trim().toLowerCase();
        }
        if (contentType != null) {
            if (ALLOWED_IMAGE_TYPES.contains(contentType)) return "decisions";
            if (ALLOWED_VIDEO_TYPES.contains(contentType)) return "decisions";
            if (ALLOWED_DOC_TYPES.contains(contentType)) return "docs";
        }
        return "general";
    }

    private String getFileExtension(String filename) {
        if (filename == null) return ".jpg";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex != -1) ? filename.substring(dotIndex).toLowerCase() : "";
    }

    private String saveAndOptimizeFile(MultipartFile file, String folder) {
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        Path targetDir = rootLocation.resolve(folder);

        try {
            Files.createDirectories(targetDir);
            Path destinationFile = targetDir.resolve(uniqueFilename).normalize().toAbsolutePath();

            String contentType = file.getContentType();
            // Perform image downscaling if it's a huge raster image
            if (contentType != null && (contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
                try (InputStream inputStream = file.getInputStream()) {
                    BufferedImage originalImage = ImageIO.read(inputStream);
                    if (originalImage != null && (originalImage.getWidth() > 1920 || originalImage.getHeight() > 1920)) {
                        BufferedImage resized = resizeImage(originalImage, 1920, 1920);
                        String formatName = extension.replace(".", "");
                        if (formatName.equalsIgnoreCase("jpg")) formatName = "jpeg";
                        ImageIO.write(resized, formatName, destinationFile.toFile());
                        return uniqueFilename;
                    }
                } catch (Exception e) {
                    log.warn("Image optimization skipped, saving standard file: {}", e.getMessage());
                }
            }

            // Standard stream copy
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return uniqueFilename;
        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new BusinessException("Failed to store file: " + e.getMessage());
        }
    }

    private String saveAndOptimizeAvatar(MultipartFile file) {
        String uniqueFilename = "avatar_" + UUID.randomUUID().toString() + ".jpg";
        Path targetDir = rootLocation.resolve("avatars");

        try {
            Files.createDirectories(targetDir);
            Path destinationFile = targetDir.resolve(uniqueFilename).normalize().toAbsolutePath();

            try (InputStream inputStream = file.getInputStream()) {
                BufferedImage originalImage = ImageIO.read(inputStream);
                if (originalImage != null) {
                    // Create high quality square avatar (512x512)
                    BufferedImage squareAvatar = createSquareAvatar(originalImage, 512);
                    ImageIO.write(squareAvatar, "jpg", destinationFile.toFile());
                    return uniqueFilename;
                }
            } catch (Exception e) {
                log.warn("Avatar optimization failed, falling back to direct write: {}", e.getMessage());
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return uniqueFilename;
        } catch (IOException e) {
            throw new BusinessException("Failed to save avatar image: " + e.getMessage());
        }
    }

    private BufferedImage resizeImage(BufferedImage originalImage, int maxWidth, int maxHeight) {
        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        double ratio = Math.min((double) maxWidth / width, (double) maxHeight / height);
        int newWidth = (int) (width * ratio);
        int newHeight = (int) (height * ratio);

        BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g.dispose();
        return resized;
    }

    private BufferedImage createSquareAvatar(BufferedImage originalImage, int size) {
        int minDimension = Math.min(originalImage.getWidth(), originalImage.getHeight());
        int cropX = (originalImage.getWidth() - minDimension) / 2;
        int cropY = (originalImage.getHeight() - minDimension) / 2;

        BufferedImage cropped = originalImage.getSubimage(cropX, cropY, minDimension, minDimension);

        BufferedImage square = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = square.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.drawImage(cropped, 0, 0, size, size, null);
        g.dispose();
        return square;
    }
}
