import axiosInstance from "./axios";

export interface FileUploadResult {
  attachmentId?: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  message?: string;
}

export const fileApi = {
  /**
   * Upload a single file from device (image, video, document)
   */
  uploadFile: async (file: File, folder?: string): Promise<FileUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }

    const response = await axiosInstance.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  /**
   * Upload multiple files simultaneously
   */
  uploadMultipleFiles: async (files: File[], folder?: string): Promise<FileUploadResult[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (folder) {
      formData.append("folder", folder);
    }

    const response = await axiosInstance.post("/files/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  /**
   * Upload profile avatar image from device
   */
  uploadProfileImage: async (file: File): Promise<FileUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post("/files/upload/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  /**
   * Upload and link an attachment to a decision board
   */
  uploadDecisionAttachment: async (decisionId: number, file: File): Promise<FileUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`/files/upload/decision/${decisionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  /**
   * Upload and link an attachment to a comment
   */
  uploadCommentAttachment: async (commentId: number, file: File): Promise<FileUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`/files/upload/comment/${commentId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  /**
   * Delete an attachment
   */
  deleteAttachment: async (attachmentId: number): Promise<void> => {
    await axiosInstance.delete(`/files/${attachmentId}`);
  },
};
