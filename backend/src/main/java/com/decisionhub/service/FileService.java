package com.decisionhub.service;

import com.decisionhub.dto.AttachmentResponse;
import com.decisionhub.entity.Attachment;
import com.decisionhub.entity.User;
import com.decisionhub.repository.AttachmentRepository;
import com.decisionhub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FileService {

    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final UserService userService;

    public FileService(AttachmentRepository attachmentRepository,
                       FileStorageService fileStorageService,
                       UserRepository userRepository,
                       UserService userService) {
        this.attachmentRepository = attachmentRepository;
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional
    public AttachmentResponse uploadFile(MultipartFile file, Long decisionId, Long commentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        String fileUrl = fileStorageService.storeFile(file);

        Attachment attachment = new Attachment();
        attachment.setFilename(file.getOriginalFilename());
        attachment.setFileUrl(fileUrl);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setDecisionId(decisionId);
        attachment.setCommentId(commentId);
        attachment.setUploadedBy(user);

        Attachment saved = attachmentRepository.save(attachment);
        return mapToAttachmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByDecisionId(Long decisionId) {
        return attachmentRepository.findByDecisionId(decisionId).stream()
                .map(this::mapToAttachmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByCommentId(Long commentId) {
        return attachmentRepository.findByCommentId(commentId).stream()
                .map(this::mapToAttachmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttachmentResponse getAttachmentById(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found with id: " + id));
        return mapToAttachmentResponse(attachment);
    }

    @Transactional
    public void deleteAttachment(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found with id: " + id));

        boolean isUploader = attachment.getUploadedBy().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isUploader && !isAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to delete this attachment");
        }

        attachmentRepository.delete(attachment);
    }

    public AttachmentResponse mapToAttachmentResponse(Attachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getFilename(),
                attachment.getFileUrl(),
                attachment.getFileType(),
                attachment.getFileSize(),
                attachment.getDecisionId(),
                attachment.getCommentId(),
                userService.mapToUserResponse(attachment.getUploadedBy()),
                attachment.getCreatedAt()
        );
    }
}
