import React, { useState, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Paperclip, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { fileApi, FileUploadResult } from '@/api/fileApi';
import { toast } from 'sonner';

interface CommentEditorProps {
  initialValue?: string;
  onSubmit: (message: string, attachments?: FileUploadResult[]) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
  submitLabel?: string;
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
  initialValue = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = 'Write your thoughts and share evidence...',
  submitLabel = 'Post Comment',
}) => {
  const [message, setMessage] = useState(initialValue);
  const [attachedFiles, setAttachedFiles] = useState<FileUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await fileApi.uploadFile(file, 'comments');
        setAttachedFiles(prev => [...prev, result]);
        toast.success(`Attached ${file.name}`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || `Failed to attach ${file.name}`);
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachedFiles.length > 0) {
      // Append attachment URLs or formatting to comment if desired
      let finalMessage = message.trim();
      if (attachedFiles.length > 0) {
        const links = attachedFiles.map(f => `\n![${f.fileName}](${f.fileUrl})`).join('');
        finalMessage += links;
      }
      onSubmit(finalMessage, attachedFiles);
      setMessage('');
      setAttachedFiles([]);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/40 p-4 rounded-xl text-center border border-border text-sm text-muted-foreground">
        Please log in to participate in the discussion.
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex gap-3 sm:gap-4">
      {!onCancel && (
         <div className="hidden sm:block shrink-0">
           <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={user.profileImage} alt={user.username || user.fullName} />
              <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
                 {getInitials(user.fullName || user.username)}
              </AvatarFallback>
           </Avatar>
         </div>
      )}
      <form onSubmit={handleSubmit} className="flex-1 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[90px] p-3.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y text-sm transition-shadow text-foreground placeholder:text-muted-foreground"
          disabled={isSubmitting}
        />

        {/* Attached previews */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {attachedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-xs text-foreground">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate max-w-[140px] font-medium">{file.fileName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="text-muted-foreground hover:text-red-500 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSubmitting}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold h-8 gap-1.5"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span>Attach File</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
                className="text-xs text-muted-foreground hover:text-foreground h-8"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-8 shadow-xs"
              disabled={(!message.trim() && attachedFiles.length === 0) || isSubmitting || isUploading}
            >
              {isSubmitting ? 'Posting...' : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
