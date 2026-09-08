package com.decisionhub.service;

import com.decisionhub.dto.response.FileUploadResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StorageService {

    /**
     * Upload a single generic file (image, video, document).
     */
    FileUploadResponse storeFile(MultipartFile file, Long userId, String folder);

    /**
     * Upload multiple files.
     */
    List<FileUploadResponse> storeFiles(List<MultipartFile> files, Long userId, String folder);

    /**
     * Upload and optimize a user profile avatar, automatically updating the user record.
     */
    FileUploadResponse storeProfileImage(MultipartFile file, Long userId);

    /**
     * Upload and link an attachment to a specific decision board.
     */
    FileUploadResponse storeDecisionAttachment(MultipartFile file, Long decisionId, Long userId);

    /**
     * Upload and link an attachment to a comment.
     */
    FileUploadResponse storeCommentAttachment(MultipartFile file, Long commentId, Long userId);

    /**
     * Delete an attachment by ID.
     */
    void deleteAttachment(Long attachmentId, Long requestingUserId);

    /**
     * Load a file as a Spring Resource for downloading/streaming.
     */
    Resource loadAsResource(String filename, String folder);
}
