"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadProductImage, ImageUploadError } from "@/app/lib/uploadImage";

interface ProductImageUploaderProps {
  /** Current image URL, or null when none is set. */
  value: string | null;
  /** Called with the new public URL after a successful upload, or null when cleared. */
  onChange: (url: string | null) => void;
  /** Tailwind classes for the surrounding container. */
  className?: string;
  /** Height class for the preview/placeholder box. */
  heightClass?: string;
}

/**
 * Uploads a single product image to Supabase Storage and reports back its
 * public URL. Owns its own uploading/error state so callers only deal with
 * the resulting URL string.
 */
export default function ProductImageUploader({
  value,
  onChange,
  className = "",
  heightClass = "h-44",
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      onChange(url);
    } catch (err) {
      setError(
        err instanceof ImageUploadError
          ? err.message
          : "Could not upload image. Please try again."
      );
    } finally {
      setUploading(false);
      // Allow re-selecting the same file after an error
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openPicker = () => {
    if (!uploading) inputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_INPUT_TYPES}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className={`relative ${heightClass} rounded-xl overflow-hidden border border-gray-200`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Product preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          disabled={uploading}
          className={`w-full ${heightClass} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
            dragActive
              ? "border-amber-500 bg-amber-50"
              : "border-gray-300 hover:border-amber-400 hover:bg-amber-50/50"
          } disabled:opacity-60`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
              <span className="text-sm text-gray-600">Uploading…</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-7 h-7 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">
                Click to upload or drag an image
              </span>
              <span className="text-xs text-gray-500">JPG, PNG, WEBP or GIF · max 5 MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

const ALLOWED_INPUT_TYPES = "image/jpeg,image/png,image/webp,image/gif";
