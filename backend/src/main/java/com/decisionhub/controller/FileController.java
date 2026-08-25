package com.decisionhub.controller;

import com.decisionhub.dto.AttachmentResponse;
import com.decisionhub.service.FileService;
import com.decisionhub.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File & Media Uploads", description = "Endpoints for uploading and retrieving attachments for decisions and comments")
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    private final FileService fileService;
    private final FileStorageService fileStorageService;

    public FileController(FileService fileService, FileStorageService fileStorageService) {
        this.fileService = fileService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload a file", description = "Uploads a multipart file attachment")
    public ResponseEntity<AttachmentResponse> uploadFile(@RequestParam("file") MultipartFile file, Authentication authentication) {
        AttachmentResponse response = fileService.uploadFile(file, null, null, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload/decision/{decisionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload decision attachment", description = "Uploads an attachment associated with a decision")
    public ResponseEntity<AttachmentResponse> uploadDecisionFile(@PathVariable Long decisionId,
                                                                 @RequestParam("file") MultipartFile file,
                                                                 Authentication authentication) {
        AttachmentResponse response = fileService.uploadFile(file, decisionId, null, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload/comment/{commentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload comment attachment", description = "Uploads an attachment associated with a comment")
    public ResponseEntity<AttachmentResponse> uploadCommentFile(@PathVariable Long commentId,
                                                                @RequestParam("file") MultipartFile file,
                                                                Authentication authentication) {
        AttachmentResponse response = fileService.uploadFile(file, null, commentId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attachment metadata", description = "Retrieves attachment metadata by ID")
    public ResponseEntity<AttachmentResponse> getAttachmentById(@PathVariable Long id) {
        return ResponseEntity.ok(fileService.getAttachmentById(id));
    }

    @GetMapping("/decision/{decisionId}")
    @Operation(summary = "Get decision attachments", description = "Retrieves all attachments for a decision")
    public ResponseEntity<List<AttachmentResponse>> getDecisionAttachments(@PathVariable Long decisionId) {
        return ResponseEntity.ok(fileService.getAttachmentsByDecisionId(decisionId));
    }

    @GetMapping("/comment/{commentId}")
    @Operation(summary = "Get comment attachments", description = "Retrieves all attachments for a comment")
    public ResponseEntity<List<AttachmentResponse>> getCommentAttachments(@PathVariable Long commentId) {
        return ResponseEntity.ok(fileService.getAttachmentsByCommentId(commentId));
    }

    @GetMapping("/download/{filename:.+}")
    @Operation(summary = "Download file", description = "Downloads a locally stored file attachment")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.getLocalFilePath(filename);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete attachment", description = "Deletes an attachment by ID")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id, Authentication authentication) {
        fileService.deleteAttachment(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
