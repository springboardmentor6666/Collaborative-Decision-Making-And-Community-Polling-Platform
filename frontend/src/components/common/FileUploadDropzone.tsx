import React, { useState, useRef } from "react";
import { 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fileApi, FileUploadResult } from "@/api/fileApi";
import { toast } from "sonner";

interface FileUploadDropzoneProps {
  onFilesUploaded: (files: FileUploadResult[]) => void;
  existingFiles?: FileUploadResult[];
  maxFiles?: number;
  acceptedTypes?: string; // e.g. "image/*,video/*,application/pdf"
  folder?: string;
  className?: string;
}

export function FileUploadDropzone({
  onFilesUploaded,
  existingFiles = [],
  maxFiles = 5,
  acceptedTypes = "image/*,video/mp4,video/webm,application/pdf,text/plain",
  folder = "decisions",
  className = ""
}: FileUploadDropzoneProps) {
  const [uploadedList, setUploadedList] = useState<FileUploadResult[]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (uploadedList.length + files.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} attachments.`);
      return;
    }

    setIsUploading(true);
    const newUploads: FileUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size limit (50MB for video, 15MB for other)
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error(`"${file.name}" exceeds the ${isVideo ? "50MB" : "15MB"} size limit.`);
        continue;
      }

      try {
        const result = await fileApi.uploadFile(file, folder);
        newUploads.push(result);
        toast.success(`Uploaded: ${file.name}`);
      } catch (err: any) {
        const errMsg = err.response?.data?.message || `Failed to upload ${file.name}`;
        toast.error(errMsg);
      }
    }

    if (newUploads.length > 0) {
      const updated = [...uploadedList, ...newUploads];
      setUploadedList(updated);
      onFilesUploaded(updated);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = async (index: number) => {
    const target = uploadedList[index];
    if (target.attachmentId) {
      try {
        await fileApi.deleteAttachment(target.attachmentId);
      } catch (e) {
        // Continue removing from UI even if backend delete fails
      }
    }
    const updated = uploadedList.filter((_, i) => i !== index);
    setUploadedList(updated);
    onFilesUploaded(updated);
    toast.info("Attachment removed");
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="w-5 h-5 text-blue-500" />;
    if (fileType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    if (fileType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-500" />;
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes("sheet") || fileType.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
            : "border-border hover:border-blue-500/50 bg-muted/20 hover:bg-muted/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              {isUploading ? "Uploading files..." : "Click or drag files to upload from your device"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Supports Images (JPG, PNG, WebP, GIF), Videos (MP4, WebM up to 50MB), and PDFs
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Badge variant="outline" className="text-[10px] font-semibold bg-background text-muted-foreground border-border">
              Max {maxFiles} attachments
            </Badge>
            <Badge variant="outline" className="text-[10px] font-semibold bg-background text-muted-foreground border-border">
              Up to 50MB
            </Badge>
          </div>
        </div>
      </div>

      {/* Uploaded Files Previews List */}
      {uploadedList.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Attached Media ({uploadedList.length}/{maxFiles})
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {uploadedList.map((file, idx) => {
              const isImage = file.fileType?.startsWith("image/");
              const isVideo = file.fileType?.startsWith("video/");

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-border/80 shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Media Thumbnail or Icon */}
                    {isImage ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                        <img
                          src={file.fileUrl}
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : isVideo ? (
                      <div className="w-10 h-10 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[180px]">
                        {file.fileName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
