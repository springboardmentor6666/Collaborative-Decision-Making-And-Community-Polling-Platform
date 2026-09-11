import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  RefreshCw, 
  Check, 
  X, 
  Loader2, 
  Crop, 
  Circle, 
  Square, 
  RectangleHorizontal,
  Move
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type CropShape = "circle" | "square" | "banner";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, croppedDataUrl: string) => Promise<void> | void;
  shape?: CropShape;
  allowShapeSwitch?: boolean;
  title?: string;
  description?: string;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  shape = "circle",
  allowShapeSwitch = true,
  title = "Crop Profile Picture",
  description = "Drag to reposition, use the zoom slider to scale, and fit the profile frame."
}: ImageCropperModalProps) {
  const [currentShape, setCurrentShape] = useState<CropShape>(shape);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Sync shape prop if it changes
  useEffect(() => {
    setCurrentShape(shape);
  }, [shape]);

  // Reset state when a new image is loaded or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setOffset({ x: 0, y: 0 });

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        drawCropper();
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Main drawing function
  const drawCropper = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, cw, ch);

    // 1. Draw Image with Transformations
    ctx.save();
    ctx.translate(cw / 2 + offset.x, ch / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -zoom : zoom, zoom);

    // Calculate dimensions to fit viewport naturally at zoom 1
    const imgRatio = img.width / img.height;
    let drawWidth = cw;
    let drawHeight = cw / imgRatio;

    if (drawHeight < ch) {
      drawHeight = ch;
      drawWidth = ch * imgRatio;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // 2. Draw Darkened Overlay with Crop Mask Cutout
    ctx.save();
    ctx.fillStyle = "rgba(7, 10, 18, 0.72)";
    ctx.fillRect(0, 0, cw, ch);

    // Cut out crop shape
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();

    const maskSize = Math.min(cw, ch) * 0.76;
    const maskX = (cw - maskSize) / 2;
    const maskY = (ch - maskSize) / 2;

    if (currentShape === "circle") {
      ctx.arc(cw / 2, ch / 2, maskSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentShape === "square") {
      const radius = 20;
      ctx.roundRect(maskX, maskY, maskSize, maskSize, radius);
      ctx.fill();
    } else {
      // Banner: 16:9 or 2.5:1
      const bannerW = cw * 0.88;
      const bannerH = bannerW / 2.2;
      const bX = (cw - bannerW) / 2;
      const bY = (ch - bannerH) / 2;
      ctx.roundRect(bX, bY, bannerW, bannerH, 16);
      ctx.fill();
    }
    ctx.restore();

    // 3. Draw Crop Outline & Grid Guidelines
    ctx.save();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
    ctx.lineWidth = 2.5;

    if (currentShape === "circle") {
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, maskSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle crosshair guides
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cw / 2, maskY);
      ctx.lineTo(cw / 2, maskY + maskSize);
      ctx.moveTo(maskX, ch / 2);
      ctx.lineTo(maskX + maskSize, ch / 2);
      ctx.stroke();
    } else if (currentShape === "square") {
      ctx.beginPath();
      ctx.roundRect(maskX, maskY, maskSize, maskSize, 20);
      ctx.stroke();
    } else {
      const bannerW = cw * 0.88;
      const bannerH = bannerW / 2.2;
      const bX = (cw - bannerW) / 2;
      const bY = (ch - bannerH) / 2;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bannerW, bannerH, 16);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Update Mini Preview Canvas
    updateLivePreview();
  }, [offset, zoom, rotation, flipH, currentShape]);

  // Re-draw on state updates
  useEffect(() => {
    drawCropper();
  }, [drawCropper]);

  // Live Preview generator
  const updateLivePreview = () => {
    const previewCanvas = previewCanvasRef.current;
    const img = imageRef.current;
    const mainCanvas = canvasRef.current;
    if (!previewCanvas || !img || !mainCanvas) return;

    const pctx = previewCanvas.getContext("2d");
    if (!pctx) return;

    const pw = previewCanvas.width;
    const ph = previewCanvas.height;
    pctx.clearRect(0, 0, pw, ph);

    pctx.save();
    if (currentShape === "circle") {
      pctx.beginPath();
      pctx.arc(pw / 2, ph / 2, pw / 2, 0, Math.PI * 2);
      pctx.clip();
    } else {
      pctx.beginPath();
      pctx.roundRect(0, 0, pw, ph, 8);
      pctx.clip();
    }

    const scaleFactor = pw / (Math.min(mainCanvas.width, mainCanvas.height) * 0.76);
    pctx.translate(pw / 2 + offset.x * scaleFactor, ph / 2 + offset.y * scaleFactor);
    pctx.rotate((rotation * Math.PI) / 180);
    pctx.scale(flipH ? -zoom * scaleFactor : zoom * scaleFactor, zoom * scaleFactor);

    const imgRatio = img.width / img.height;
    let drawWidth = mainCanvas.width;
    let drawHeight = mainCanvas.width / imgRatio;
    if (drawHeight < mainCanvas.height) {
      drawHeight = mainCanvas.height;
      drawWidth = mainCanvas.height * imgRatio;
    }

    pctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    pctx.restore();
  };

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(0.6, prev + zoomDelta), 3.5));
  };

  // Output High-Res Cropped Blob
  const handleApplyCrop = async () => {
    const img = imageRef.current;
    const mainCanvas = canvasRef.current;
    if (!img || !mainCanvas) return;

    setIsProcessing(true);

    try {
      const outputCanvas = document.createElement("canvas");
      const targetSize = currentShape === "banner" ? 1200 : 512;
      const targetHeight = currentShape === "banner" ? 545 : 512;

      outputCanvas.width = targetSize;
      outputCanvas.height = targetHeight;

      const octx = outputCanvas.getContext("2d");
      if (!octx) throw new Error("Could not create canvas context");

      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";

      // Match the transformation of the crop window
      const maskSize = Math.min(mainCanvas.width, mainCanvas.height) * 0.76;
      const scaleToOutput = targetSize / (currentShape === "banner" ? mainCanvas.width * 0.88 : maskSize);

      octx.save();
      octx.translate(targetSize / 2 + offset.x * scaleToOutput, targetHeight / 2 + offset.y * scaleToOutput);
      octx.rotate((rotation * Math.PI) / 180);
      octx.scale(flipH ? -zoom * scaleToOutput : zoom * scaleToOutput, zoom * scaleToOutput);

      const imgRatio = img.width / img.height;
      let drawWidth = mainCanvas.width;
      let drawHeight = mainCanvas.width / imgRatio;
      if (drawHeight < mainCanvas.height) {
        drawHeight = mainCanvas.height;
        drawWidth = mainCanvas.height * imgRatio;
      }

      octx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      octx.restore();

      const dataUrl = outputCanvas.toDataURL("image/jpeg", 0.95);

      outputCanvas.toBlob(async (blob) => {
        if (blob) {
          await onCropComplete(blob, dataUrl);
          onClose();
        }
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#0B0F19] text-slate-100 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">{description}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Shape Switcher Toolbar (if enabled) */}
        {allowShapeSwitch && (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 pl-2">Crop Shape:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentShape("circle")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentShape === "circle"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Circle</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentShape("square")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentShape === "square"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Square</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentShape("banner")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentShape === "banner"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <RectangleHorizontal className="w-3.5 h-3.5" />
                <span>Banner</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Cropper Canvas */}
        <div className="relative flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden select-none">
          <canvas
            ref={canvasRef}
            width={380}
            height={320}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className="cursor-move w-full h-[320px] max-h-[320px] touch-none"
          />

          {/* Floating Instructions & Mini Preview Badge */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 pointer-events-none">
            <Move className="w-3.5 h-3.5 text-blue-400" />
            <span>Drag to reposition</span>
          </div>

          <div className="absolute top-3 right-3 flex flex-col items-center gap-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 p-1.5 rounded-xl pointer-events-none">
            <canvas
              ref={previewCanvasRef}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border border-blue-500/50 bg-slate-950"
            />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Preview</span>
          </div>
        </div>

        {/* Zoom Slider Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <ZoomIn className="w-3.5 h-3.5 text-blue-400" /> Zoom Scale
            </span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="h-8 w-8 rounded-lg border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <input
              type="range"
              min="0.6"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setZoom((z) => Math.min(3.5, z + 0.1))}
              className="h-8 w-8 rounded-lg border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 shrink-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Rotate & Flip Tools Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotation((r) => (r - 90) % 360)}
              className="h-8 px-2.5 text-xs rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>-90°</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="h-8 px-2.5 text-xs rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>+90°</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFlipH(!flipH)}
              className={`h-8 px-2.5 text-xs rounded-xl border-slate-800 bg-slate-900 transition-colors gap-1.5 ${
                flipH ? "text-blue-400 border-blue-500/50 bg-blue-950/40" : "text-slate-300 hover:text-white"
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip</span>
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setZoom(1);
              setRotation(0);
              setFlipH(false);
              setOffset({ x: 0, y: 0 });
            }}
            className="h-8 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 gap-1.5 px-5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply & Crop</span>
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
