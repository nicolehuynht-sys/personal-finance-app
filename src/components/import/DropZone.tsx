"use client";

import { useCallback, useState } from "react";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export function DropZone({ onFileSelect, isUploading }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = "";
    },
    [onFileSelect]
  );

  return (
    <div className="relative group cursor-pointer">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed px-6 py-16 transition-all active:scale-[0.99] ${
          isDragging
            ? "border-deep-green bg-deep-green/5"
            : "border-deep-green/40 bg-gradient-to-br from-white to-silver-light/30 hover:border-deep-green/60"
        } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex flex-col items-center gap-5">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-border-silver shadow-sm">
            <span className="material-symbols-outlined text-deep-green text-[28px]">
              {isUploading ? "progress_activity" : "upload_file"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-deep-green text-[15px] font-semibold tracking-wide uppercase">
              {isUploading ? "Uploading..." : "Select Document"}
            </p>
            <p className="text-silver-metallic text-[12px] tracking-wide italic">
              CSV, XLSX &bull; Maximum 10MB
            </p>
          </div>
        </div>
      </div>
      {!isUploading && (
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      )}
    </div>
  );
}
