import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';

interface CommentEditorProps {
  initialValue?: string;
  onSubmit: (message: string) => void;
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
  placeholder = 'Write your thoughts...',
  submitLabel = 'Post Comment',
}) => {
  const [message, setMessage] = useState(initialValue);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  if (!user) {
    return (
      <div className="bg-muted p-4 rounded-lg text-center border border-border/50 text-sm">
        Please log in to participate in the discussion.
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex gap-4">
      {!onCancel && (
         <div className="hidden sm:block flex-shrink-0">
           <Avatar className="w-10 h-10 border border-border">
              <AvatarImage src={user.profileImage} alt={user.username || user.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
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
          className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-y text-sm transition-shadow"
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};
