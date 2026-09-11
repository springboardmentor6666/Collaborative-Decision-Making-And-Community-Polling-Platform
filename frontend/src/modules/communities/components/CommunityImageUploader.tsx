import React, { useState, useRef } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Link2, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Trash2,
  Crop,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fileApi } from "@/api/fileApi";
import { getImageUrl } from "@/utils";
import { toast } from "sonner";
import { ImageCropperModal, CropShape } from "@/components/common/ImageCropperModal";

interface CommunityImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  className?: string;
  type?: "avatar" | "cover";
}

const PRESET_BANNERS = [
  {
    name: "Cyber Indigo",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Deep Space Neon",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Minimal Tech Slate",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Emerald Horizon",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Sunset Gradient",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Modern Architecture",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  }
];

const PRESET_AVATARS = [
  {
    name: "Core Tech",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "Open Guild",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "AI & Data",
    url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "Decentralized DAO",
    url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "Design Studio",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    name: "Cyber Node",
    url: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=400&h=400&q=80",
  }
];

export function CommunityImageUploader({
  value,
  onChange,
  label = "Community Cover Banner",
  description = "Upload a high-quality picture to represent your community on headers and cards.",
  className = "",
  type = "cover"
}: CommunityImageUploaderProps) {
  const isAvatar = type === "avatar";
  const [mode, setMode] = useState<"upload" | "presets" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [customUrl, setCustomUrl] = useState(value || "");
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presets = isAvatar ? PRESET_AVATARS : PRESET_BANNERS;

  const handleFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP, GIF, SVG).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file size exceeds the 15MB limit.");
      return;
    }

    // Read file and open Cropper Modal
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      const folder = isAvatar ? "avatars" : "communities";
      const file = new File([croppedBlob], `${isAvatar ? "avatar" : "cover"}_${Date.now()}.jpg`, { type: "image/jpeg" });
      const result = await fileApi.uploadFile(file, folder);
      onChange(result.fileUrl);
      setCustomUrl(result.fileUrl);
      toast.success(`${isAvatar ? "Community logo" : "Community cover"} updated successfully!`);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to upload cropped image. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsUploading(false);
      setIsCropModalOpen(false);
      setCropImageSrc(null);
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange("");
    setCustomUrl("");
    toast.info(`${isAvatar ? "Profile logo" : "Cover banner"} removed`);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      toast.success("Picture URL applied");
    }
  };

  const handleReCropActiveImage = () => {
    if (!value) return;
    setCropImageSrc(displayUrl);
    setIsCropModalOpen(true);
  };

  const displayUrl = getImageUrl(value);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {isAvatar ? <Camera className="w-4 h-4 text-blue-500" /> : <ImageIcon className="w-4 h-4 text-blue-500" />}
            <span>{label}</span>
          </label>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto border border-slate-200 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              mode === "upload"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("presets")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              mode === "presets"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              mode === "url"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Live Preview Container */}
      {value && (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm">
          {isAvatar ? (
            /* Avatar (1:1 Square/Circular) Preview */
            <div className="p-4 flex items-center gap-4 bg-muted/20">
              <div className="w-20 h-20 rounded-2xl border-2 border-blue-500/40 overflow-hidden shrink-0 bg-slate-950 shadow-md">
                <img
                  src={displayUrl}
                  alt="Community Profile Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-emerald-500/90 text-white font-semibold text-[10px] px-2 py-0.5 border-none">
                    <Check className="w-3 h-3 mr-1" /> Active Profile Logo
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {value.startsWith("/uploads/") ? "Custom Uploaded Avatar" : value}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleReCropActiveImage}
                    className="h-7 px-2.5 text-xs border-border bg-card hover:bg-muted text-foreground"
                  >
                    <Crop className="w-3 h-3 mr-1" />
                    Crop
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 px-2.5 text-xs border-border bg-card hover:bg-muted text-foreground"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemove}
                    className="h-7 px-2.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Cover Banner (Wide Landscape) Preview */
            <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-slate-950">
              <img
                src={displayUrl}
                alt="Community Cover Banner"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_BANNERS[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Badge className="bg-emerald-500/90 text-white font-semibold text-[11px] px-2.5 py-0.5 border-none shadow-sm">
                  <Check className="w-3 h-3 mr-1" /> Active Cover Banner
                </Badge>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <p className="text-xs text-slate-200 font-medium truncate max-w-[50%] drop-shadow">
                  {value.startsWith("/uploads/") ? "Custom Uploaded Banner" : value}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleReCropActiveImage}
                    className="h-8 px-2.5 text-xs bg-white/90 hover:bg-white text-slate-900 shadow-md font-semibold backdrop-blur-sm"
                  >
                    <Crop className="w-3.5 h-3.5 mr-1" />
                    Crop
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-2.5 text-xs bg-white/90 hover:bg-white text-slate-900 shadow-md font-semibold backdrop-blur-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    className="h-8 px-2.5 text-xs bg-red-600/90 hover:bg-red-600 text-white shadow-md font-semibold backdrop-blur-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input for Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Mode 1: Upload from Device Dropzone */}
      {mode === "upload" && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl ${isAvatar ? "p-4" : "p-6"} text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700/80 hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/70"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className={`rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center ${isAvatar ? "w-10 h-10" : "w-12 h-12"}`}>
              {isUploading ? (
                <Loader2 className={`${isAvatar ? "w-5 h-5" : "w-6 h-6"} animate-spin`} />
              ) : (
                <Upload className={isAvatar ? "w-5 h-5" : "w-6 h-6"} />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isUploading 
                  ? "Uploading & optimizing image..." 
                  : isAvatar 
                  ? "Click or drag to crop & upload community logo" 
                  : "Click or drag to crop & upload cover banner"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Supports JPG, PNG, WebP, GIF, SVG up to 15MB • Crop window opens automatically
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Preset Gallery */}
      {mode === "presets" && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isAvatar ? "Select a Curated Logo Preset" : "Select a Curated Cover Banner"}
          </p>
          <div className={isAvatar ? "grid grid-cols-3 sm:grid-cols-6 gap-2.5" : "grid grid-cols-2 sm:grid-cols-3 gap-3"}>
            {presets.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setCustomUrl(preset.url);
                    toast.success(`Applied "${preset.name}" preset`);
                  }}
                  className={`relative rounded-xl overflow-hidden ${isAvatar ? "aspect-square" : "aspect-video"} text-left border-2 transition-all group cursor-pointer ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-[1.02]"
                      : "border-transparent hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[10px] font-bold text-white leading-tight truncate">
                      {preset.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white shadow">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Direct URL Input */}
      {mode === "url" && (
        <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
          <Input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={!customUrl.trim() || customUrl.trim() === value}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0"
          >
            Apply URL
          </Button>
        </form>
      )}

      {/* Image Cropping Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setIsCropModalOpen(false);
          setCropImageSrc(null);
        }}
        onCropComplete={handleCropComplete}
        shape={isAvatar ? "circle" : "banner"}
        allowShapeSwitch={true}
        title={isAvatar ? "Crop Community Logo / Avatar" : "Crop Community Cover Banner"}
        description={isAvatar 
          ? "Position and scale your community avatar to fit the circular profile logo."
          : "Position and scale your community image to fit the landscape banner."
        }
      />
    </div>
  );
}
