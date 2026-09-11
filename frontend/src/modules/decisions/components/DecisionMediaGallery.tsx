import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Download, 
  FileText, 
  Play, 
  ImageIcon,
  Eye,
  Film
} from "lucide-react";
import { AttachmentResponse } from "../types/decision";
import { Button } from "@/components/ui/button";

interface DecisionMediaGalleryProps {
  attachments?: AttachmentResponse[];
  title?: string;
  className?: string;
}

export function DecisionMediaGallery({ attachments = [], title = "Media", className = "" }: DecisionMediaGalleryProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Filter media types
  const images = attachments.filter((a) => a.fileType?.startsWith("image/"));
  const videos = attachments.filter((a) => a.fileType?.startsWith("video/"));
  const visualMedia = [...images, ...videos];
  const docAttachments = attachments.filter(
    (a) => !a.fileType?.startsWith("image/") && !a.fileType?.startsWith("video/")
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? visualMedia.length - 1 : prev - 1));
  }, [visualMedia.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === visualMedia.length - 1 ? 0 : prev + 1));
  }, [visualMedia.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev - 1 < 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") setLightboxOpen(false);
        if (e.key === "ArrowLeft") prevLightbox();
        if (e.key === "ArrowRight") nextLightbox();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, prevLightbox, nextLightbox]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const openLightbox = (mediaItem: AttachmentResponse) => {
    const imgIndex = images.findIndex((img) => img.attachmentId === mediaItem.attachmentId);
    if (imgIndex !== -1) {
      setLightboxIndex(imgIndex);
      setLightboxOpen(true);
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Twitter/X Style Visual Media Frame */}
      {visualMedia.length > 0 && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-border/80 bg-black shadow-md group">
          {/* Main Display Area */}
          <div
            className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] flex items-center justify-center bg-black/95 select-none overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {visualMedia.map((media, idx) => {
              const isImage = media.fileType?.startsWith("image/");
              const isCurrent = idx === currentIndex;

              return (
                <div
                  key={media.attachmentId || idx}
                  className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out ${
                    isCurrent ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 pointer-events-none z-0"
                  }`}
                >
                  {isImage ? (
                    <div 
                      onClick={() => openLightbox(media)}
                      className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      {/* Blurred background image for full aspect aesthetic */}
                      <img
                        src={media.fileUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
                      />
                      {/* Crisp Foreground Image */}
                      <img
                        src={media.fileUrl}
                        alt={media.fileName || title}
                        className="relative max-h-full max-w-full w-auto h-auto object-contain mx-auto z-10 transition-transform duration-300 hover:scale-[1.01]"
                      />

                      {/* Expand Overlay on Hover */}
                      <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-medium border border-white/10 shadow-lg">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>View Full</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black z-10">
                      <video
                        controls
                        preload="metadata"
                        className="w-full max-h-full object-contain rounded-xl"
                      >
                        <source src={media.fileUrl} type={media.fileType} />
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Top Right Counter Badge (Twitter style: "1 / 4") */}
            {visualMedia.length > 1 && (
              <div className="absolute top-4 right-4 z-20">
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/15 shadow-md flex items-center gap-1">
                  {currentIndex + 1} / {visualMedia.length}
                </span>
              </div>
            )}

            {/* Slider Navigation Chevrons (Visible if more than 1 image/video) */}
            {visualMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/10 shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-md border border-white/10 shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Slider Dots Indicator */}
            {visualMedia.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                {visualMedia.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Non-image Document / PDF Attachments */}
      {docAttachments.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>Attached Documents ({docAttachments.length})</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {docAttachments.map((doc) => (
              <div
                key={doc.attachmentId}
                className="flex items-center justify-between p-3.5 bg-card border border-border rounded-xl hover:border-border/80 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate max-w-[200px]">
                      {doc.fileName}
                    </p>
                    <p className="text-[11px] text-muted-foreground uppercase">
                      {doc.fileType?.split("/")[1] || "Document"}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="shrink-0 text-xs font-semibold h-8 border-border hover:bg-muted text-foreground gap-1.5"
                >
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>Download</span>
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Interactive Lightbox Modal */}
      {lightboxOpen && images.length > 0 && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Top Bar with Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 text-white">
            <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
              {lightboxIndex + 1} of {images.length}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-9 px-3 gap-1.5"
              >
                <a
                  href={images[lightboxIndex]?.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Download</span>
                </a>
              </Button>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Navigation Chevrons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Full-res Lightbox Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]?.fileUrl}
              alt={images[lightboxIndex]?.fileName || "Enlarged view"}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-all duration-300 select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
