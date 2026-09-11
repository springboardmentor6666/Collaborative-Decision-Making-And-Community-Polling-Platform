import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(url?: string | null): string {
  if (!url) return "";
  if (
    url.startsWith("http://") || 
    url.startsWith("https://") || 
    url.startsWith("data:") || 
    url.startsWith("blob:")
  ) {
    return url;
  }
  // If backend base URL is specified (e.g. http://localhost:8080/api), strip trailing /api for static uploads
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  const backendBase = apiUrl.replace(/\/api\/?$/, "");
  return url.startsWith("/") ? `${backendBase}${url}` : `${backendBase}/${url}`;
}

