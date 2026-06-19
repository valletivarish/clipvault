'use client';

import { useState, useRef } from 'react';

interface FileInfo {
  size: number;
  type: string;
  name: string;
}

interface CompressedResult {
  blob: Blob;
  size: number;
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressedResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setFileInfo({
      size: selectedFile.size,
      type: selectedFile.type,
      name: selectedFile.name,
    });
    setCompressedResult(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-[#F97316]/30', 'bg-[#F97316]/[0.02]');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-[#F97316]/30', 'bg-[#F97316]/[0.02]');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[#F97316]/30', 'bg-[#F97316]/[0.02]');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setLoading(false);
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedResult({
                blob,
                size: blob.size,
              });
            }
            URL.revokeObjectURL(url);
            setLoading(false);
          },
          'image/jpeg',
          quality / 100
        );
      };

      img.onerror = () => {
        setLoading(false);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error('Compression error:', error);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressedResult || !file) return;

    const url = URL.createObjectURL(compressedResult.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const savingsPercent =
    fileInfo && compressedResult
      ? Math.round(((fileInfo.size - compressedResult.size) / fileInfo.size) * 100)
      : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Drag and Drop Zone */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center cursor-pointer hover:border-[#F97316]/30 hover:bg-[#F97316]/[0.02] transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-10 h-10 rounded-lg bg-s3 border border-white/10 flex items-center justify-center mx-auto mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
              <circle cx="5.5" cy="6.5" r="1" fill="currentColor"/>
              <path d="M1 11l3.5-3.5 3 3 2-2 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm text-t1 mb-1">Drop image here or click to upload</p>
          <p className="text-[10px] text-[#52525B]">JPEG, PNG, WEBP · Max 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* File Info Card */}
          <div className="bg-[#111115] border border-white/10 rounded-lg p-4 space-y-2">
            <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Original File</p>
            <p className="text-sm text-[#FAFAFA] font-mono">{fileInfo?.name}</p>
            <p className="text-xs text-[#52525B]">
              {formatFileSize(fileInfo?.size || 0)} · {fileInfo?.type}
            </p>
          </div>

          {/* Quality Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#FAFAFA]">
                Quality: {quality}%
              </label>
              <button
                onClick={() => {
                  setFile(null);
                  setFileInfo(null);
                  setCompressedResult(null);
                  setQuality(80);
                }}
                className="text-xs px-2 py-1 bg-[#18181C] border border-white/10 rounded hover:border-white/20 text-[#A1A1AA] transition-colors"
              >
                Clear
              </button>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              onChange={(e) => {
                setQuality(parseInt(e.target.value));
                setCompressedResult(null);
              }}
              className="w-full h-2 bg-[#18181C] border border-white/10 rounded-lg appearance-none cursor-pointer accent-[#F97316]"
            />
          </div>

          {/* Compress Button */}
          <button
            onClick={handleCompress}
            disabled={loading}
            className="w-full px-4 py-3 bg-[#F97316] text-[#09090B] text-sm font-semibold rounded-lg hover:bg-[#F97316]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Compressing...' : 'Compress Image'}
          </button>

          {/* Compressed Result */}
          {compressedResult && (
            <div className="space-y-4">
              {/* Preview and Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#111115] border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-xs text-[#A1A1AA] mb-2 uppercase tracking-wide">Original</p>
                  <p className="text-sm font-mono text-[#FAFAFA]">
                    {formatFileSize(fileInfo?.size || 0)}
                  </p>
                </div>
                <div className="bg-[#111115] border border-white/10 rounded-lg p-4 text-center">
                  <p className="text-xs text-[#A1A1AA] mb-2 uppercase tracking-wide">Compressed</p>
                  <p className="text-sm font-mono text-[#FAFAFA]">
                    {formatFileSize(compressedResult.size)}
                  </p>
                </div>
              </div>

              {/* Savings */}
              <div className="bg-[#222228] border border-white/10 rounded-lg p-4 text-center">
                <p className="text-xs text-[#A1A1AA] mb-1 uppercase tracking-wide">Space Saved</p>
                <p className="text-lg font-semibold text-[#22C55E]">{savingsPercent}%</p>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full px-4 py-3 bg-[#222228] border border-white/10 text-[#FAFAFA] text-sm font-semibold rounded-lg hover:border-white/20 transition-colors"
              >
                Download Compressed Image
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
