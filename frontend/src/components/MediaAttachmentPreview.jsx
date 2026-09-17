/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: MediaAttachmentPreview.jsx
 * Architecture Tier: Reusable UI Component (UI Layer)
 * Path: frontend/src/components/MediaAttachmentPreview.jsx
 *
 * Purpose:
 *   Renders direct, interactive media previews (images, documents, videos)
 *   with a full-size Lightbox modal, responsive multi-file gallery grid,
 *   download triggers, and document metadata tags.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function isImageFile(att) {
  if (!att) return false;
  if (att.type && att.type.startsWith('image/')) return true;
  if (att.fileType && att.fileType.startsWith('image/')) return true;
  const name = att.name || att.filename || '';
  return /\.(jpe?g|png|gif|webp|svg)$/i.test(name);
}

function isVideoFile(att) {
  if (!att) return false;
  if (att.type && att.type.startsWith('video/')) return true;
  if (att.fileType && att.fileType.startsWith('video/')) return true;
  const name = att.name || att.filename || '';
  return /\.(mp4|webm|ogg|mov)$/i.test(name);
}

function isPdfFile(att) {
  if (!att) return false;
  const name = att.name || att.filename || '';
  return /\.pdf$/i.test(name) || att.fileType === 'application/pdf';
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveFileUrl(att) {
  if (!att) return '';
  if (att.previewUrl) return att.previewUrl; // For local preview before upload
  if (att instanceof File) return URL.createObjectURL(att);
  if (att.fileUrl) return att.fileUrl;
  const filename = att.filename || att.name;
  if (filename) return `/api/files/download/${encodeURIComponent(filename)}`;
  return '';
}

export default function MediaAttachmentPreview({
  attachments = [],
  canDelete = false,
  onDelete,
  compact = false,
  className = '',
}) {
  const [lightboxItem, setLightboxItem] = useState(null);

  const items = Array.isArray(attachments) ? attachments : attachments ? [attachments] : [];

  if (items.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Media Grid */}
      <div
        className={
          compact
            ? 'flex flex-wrap gap-2'
            : items.length === 1
            ? 'max-w-md'
            : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {items.map((att, idx) => {
          const isImg = isImageFile(att);
          const isVid = isVideoFile(att);
          const isPdf = isPdfFile(att);
          const fileUrl = resolveFileUrl(att);
          const fileName = att.filename || att.name || `Attachment ${idx + 1}`;
          const fileSize = formatFileSize(att.fileSize || att.size);

          if (isImg) {
            return (
              <div
                key={att.id || idx}
                className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface shadow-xs transition-all hover:shadow-md hover:border-primary/50"
              >
                {/* Image Preview Container */}
                <div
                  className="relative aspect-video w-full overflow-hidden bg-surface-alt cursor-pointer flex items-center justify-center"
                  onClick={() => setLightboxItem({ url: fileUrl, title: fileName, size: fileSize })}
                >
                  <img
                    src={fileUrl}
                    alt={fileName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 rounded-xl bg-surface/90 px-3 py-1.5 text-xs font-bold text-text-primary shadow-lg">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                      Preview
                    </span>
                  </div>
                  <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                    Image
                  </span>
                </div>

                {/* Footer bar */}
                <div className="flex items-center justify-between p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-text-primary" title={fileName}>
                      {fileName}
                    </p>
                    {fileSize && <p className="text-[10px] text-muted">{fileSize}</p>}
                  </div>

                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <a
                      href={fileUrl}
                      download={fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg p-1.5 text-muted hover:text-text-primary hover:bg-surface-alt transition"
                      title="Download image"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    {canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(att);
                        }}
                        className="rounded-lg p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition"
                        title="Remove attachment"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (isVid) {
            return (
              <div
                key={att.id || idx}
                className="overflow-hidden rounded-2xl border border-border-default bg-surface shadow-xs"
              >
                <video
                  src={fileUrl}
                  controls
                  className="aspect-video w-full object-cover bg-black"
                />
                <div className="flex items-center justify-between p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-text-primary" title={fileName}>
                      {fileName}
                    </p>
                    {fileSize && <p className="text-[10px] text-muted">{fileSize}</p>}
                  </div>
                  {canDelete && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(att)}
                      className="rounded-lg p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition shrink-0 ml-2"
                      title="Remove attachment"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          // Document / PDF / File Card
          return (
            <div
              key={att.id || idx}
              className="flex items-center justify-between rounded-2xl border border-border-default bg-surface p-3 shadow-xs hover:border-primary/40 transition"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  isPdf ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' : 'bg-primary-soft text-primary'
                }`}>
                  {isPdf ? 'PDF' : 'DOC'}
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs font-bold text-text-primary hover:text-primary hover:underline block"
                    title={fileName}
                  >
                    {fileName}
                  </a>
                  <span className="text-[10px] text-muted">{fileSize || 'Document'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <a
                  href={fileUrl}
                  download={fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-1.5 text-muted hover:text-text-primary hover:bg-surface-alt transition"
                  title="Download file"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(att)}
                    className="rounded-lg p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition"
                    title="Remove file"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox Header */}
              <div className="flex w-full items-center justify-between border-b border-border-default px-4 py-3 bg-surface">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="truncate text-sm font-bold text-text-primary">{lightboxItem.title}</p>
                  {lightboxItem.size && <p className="text-[10px] text-muted">{lightboxItem.size}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={lightboxItem.url}
                    download={lightboxItem.title}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-xl border border-border-default bg-surface px-3 py-1.5 text-xs font-bold text-text-primary hover:bg-surface-alt transition"
                  >
                    <span>Download</span>
                    <span>↓</span>
                  </a>
                  <button
                    onClick={() => setLightboxItem(null)}
                    className="rounded-xl p-1.5 text-muted hover:text-text-primary hover:bg-surface-alt transition"
                    aria-label="Close lightbox"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Lightbox Image View */}
              <div className="flex items-center justify-center p-2 bg-black/10 max-h-[calc(90vh-60px)] overflow-auto">
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.title}
                  className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
