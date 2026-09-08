import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  UserX,
  UserMinus,
  Info,
  CheckCircle2,
  HelpCircle,
  AlertOctagon,
  Loader2,
} from 'lucide-react';

export type DialogVariant = 'destructive' | 'danger' | 'warning' | 'info' | 'success' | 'default';

export type DialogIconType =
  | 'trash'
  | 'alert'
  | 'shield-alert'
  | 'user-x'
  | 'user-minus'
  | 'info'
  | 'check'
  | 'help'
  | 'octagon';

export interface ConfirmOptions {
  title?: React.ReactNode;
  message: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  icon?: DialogIconType | React.ReactNode;
  badgeText?: string;
  highlightContent?: React.ReactNode;
  isAlert?: boolean;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  cancelButtonVariant?: 'outline' | 'ghost' | 'secondary';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: ConfirmOptions | string) => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
    const normalizedOptions: ConfirmOptions =
      typeof opts === 'string'
        ? {
            title: 'Please Confirm',
            message: opts,
            variant: opts.toLowerCase().includes('delete') || opts.toLowerCase().includes('remove')
              ? 'destructive'
              : 'default',
          }
        : opts;

    setOptions(normalizedOptions);
    setIsOpen(true);
    setIsLoading(false);

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const alert = useCallback((opts: ConfirmOptions | string): Promise<void> => {
    const normalizedOptions: ConfirmOptions =
      typeof opts === 'string'
        ? {
            title: 'Notice',
            message: opts,
            isAlert: true,
            confirmText: 'OK',
            variant: 'info',
          }
        : {
            ...opts,
            isAlert: true,
            confirmText: opts.confirmText || 'OK',
          };

    setOptions(normalizedOptions);
    setIsOpen(true);
    setIsLoading(false);

    return new Promise<void>((resolve) => {
      resolveRef.current = () => resolve();
    });
  }, []);

  const handleConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    } else {
      setIsOpen(open);
    }
  };

  const variant = options.variant || 'default';
  const isDestructive = variant === 'destructive' || variant === 'danger';
  const isWarning = variant === 'warning';
  const isSuccess = variant === 'success';
  const isInfo = variant === 'info' || variant === 'default';

  // Determine icon
  const renderIcon = () => {
    if (React.isValidElement(options.icon)) {
      return options.icon;
    }

    if (typeof options.icon === 'string') {
      switch (options.icon) {
        case 'trash':
          return <Trash2 className="w-5 h-5" />;
        case 'alert':
          return <AlertTriangle className="w-5 h-5" />;
        case 'shield-alert':
          return <ShieldAlert className="w-5 h-5" />;
        case 'user-x':
          return <UserX className="w-5 h-5" />;
        case 'user-minus':
          return <UserMinus className="w-5 h-5" />;
        case 'info':
          return <Info className="w-5 h-5" />;
        case 'check':
          return <CheckCircle2 className="w-5 h-5" />;
        case 'octagon':
          return <AlertOctagon className="w-5 h-5" />;
        case 'help':
        default:
          return <HelpCircle className="w-5 h-5" />;
      }
    }

    // Default icon based on variant
    if (isDestructive) return <Trash2 className="w-5 h-5" />;
    if (isWarning) return <AlertTriangle className="w-5 h-5" />;
    if (isSuccess) return <CheckCircle2 className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  // Color theme classes for icon container and header
  const getIconWrapperClasses = () => {
    if (isDestructive) {
      return 'bg-red-500/10 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-500/20 ring-4 ring-red-500/10';
    }
    if (isWarning) {
      return 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-500/20 ring-4 ring-amber-500/10';
    }
    if (isSuccess) {
      return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/20 ring-4 ring-emerald-500/10';
    }
    return 'bg-blue-500/10 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-500/20 ring-4 ring-blue-500/10';
  };

  const getConfirmButtonClasses = () => {
    if (isDestructive) {
      return 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/20 border-0 focus-visible:ring-red-500';
    }
    if (isWarning) {
      return 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-500/20 border-0 focus-visible:ring-amber-500';
    }
    if (isSuccess) {
      return 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 border-0 focus-visible:ring-emerald-500';
    }
    return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-0 focus-visible:ring-blue-500';
  };

  const getDefaultTitle = () => {
    if (options.title) return options.title;
    if (isDestructive) return 'Confirm Deletion';
    if (isWarning) return 'Confirm Action';
    if (isSuccess) return 'Confirm Approval';
    return 'Confirmation Required';
  };

  const getDefaultConfirmText = () => {
    if (options.confirmText) return options.confirmText;
    if (options.isAlert) return 'Acknowledge';
    if (isDestructive) return 'Delete';
    if (isWarning) return 'Proceed';
    return 'Confirm';
  };

  const getDefaultBadge = () => {
    if (options.badgeText) return options.badgeText;
    if (isDestructive) return 'Irreversible Action';
    if (isWarning) return 'Important Notice';
    return null;
  };

  const badge = getDefaultBadge();

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md p-6 overflow-hidden rounded-2xl border bg-background shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-4">
            {/* Ambient Icon Badge */}
            <div className={`p-3 rounded-2xl flex-shrink-0 transition-all ${getIconWrapperClasses()}`}>
              {renderIcon()}
            </div>

            <div className="flex-1 min-w-0 pt-0.5 space-y-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {badge && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isDestructive
                        ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:bg-red-950/40'
                        : isWarning
                        ? 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-950/40'
                        : 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-900/50 dark:text-blue-400 dark:bg-blue-950/40'
                    }`}
                  >
                    {badge}
                  </Badge>
                )}
              </div>

              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {getDefaultTitle()}
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground pt-1 leading-relaxed">
                {options.message}
              </DialogDescription>
            </div>
          </div>

          {/* Optional Highlighting box */}
          {options.highlightContent && (
            <div className="mt-3 p-3.5 rounded-xl bg-muted/60 border border-border/80 text-xs sm:text-sm text-foreground/90 font-medium">
              {options.highlightContent}
            </div>
          )}

          {options.description && (
            <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">
              {options.description}
            </p>
          )}

          <DialogFooter className="mt-6 flex-col-reverse sm:flex-row gap-2 sm:gap-2 sm:justify-end">
            {!options.isAlert && (
              <Button
                type="button"
                variant={options.cancelButtonVariant || 'outline'}
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto font-medium rounded-xl h-10 px-4 transition-all"
              >
                {options.cancelText || 'Cancel'}
              </Button>
            )}

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`w-full sm:w-auto font-semibold rounded-xl h-10 px-5 transition-all ${getConfirmButtonClasses()}`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {getDefaultConfirmText()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
}
