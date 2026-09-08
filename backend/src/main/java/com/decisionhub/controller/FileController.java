package com.decisionhub.controller;

import com.decisionhub.common.response.ApiResponse;
import com.decisionhub.dto.response.FileUploadResponse;
import com.decisionhub.security.UserPrincipal;
import com.decisionhub.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File & Media Uploads", description = "Endpoints for uploading images, videos, documents, and profile avatars")
public class FileController {

    private final StorageService storageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a single file from device (image, video, document)")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Long userId = (currentUser != null) ? currentUser.getId() : null;
        FileUploadResponse response = storageService.storeFile(file, userId, folder);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple files simultaneously from device")
    public ResponseEntity<ApiResponse<List<FileUploadResponse>>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "folder", required = false) String folder,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Long userId = (currentUser != null) ? currentUser.getId() : null;
        List<FileUploadResponse> responses = storageService.storeFiles(files, userId, folder);
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", responses));
    }

    @PostMapping(value = "/upload/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and update profile avatar image for current authenticated user")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        FileUploadResponse response = storageService.storeProfileImage(file, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile avatar updated successfully", response));
    }

    @PostMapping(value = "/upload/decision/{decisionId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and link an attachment to a decision board")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadDecisionAttachment(
            @PathVariable Long decisionId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        FileUploadResponse response = storageService.storeDecisionAttachment(file, decisionId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Attachment added to decision", response));
    }

    @PostMapping(value = "/upload/comment/{commentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and link an attachment to a comment")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadCommentAttachment(
            @PathVariable Long commentId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        FileUploadResponse response = storageService.storeCommentAttachment(file, commentId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Attachment added to comment", response));
    }

    @DeleteMapping("/{attachmentId}")
    @Operation(summary = "Delete an attachment")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        storageService.deleteAttachment(attachmentId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Attachment deleted successfully", null));
    }
}
