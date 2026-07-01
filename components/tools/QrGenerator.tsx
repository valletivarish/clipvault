"use client";

import { useState, useRef } from "react";

export default function QrGenerator() {
  const [input, setInput] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);

    try {
      // Dynamically import qrcode library
      const QRCode = (await import("qrcode")).default;

      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, input, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 200,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        // Convert canvas to data URL for download
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setQrCode(dataUrl);
      }
    } catch (error) {
      console.error("QR generation error:", error);
      // Fallback: show placeholder
      setQrCode("placeholder");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (qrCode && qrCode !== "placeholder") {
      navigator.clipboard.writeText(input);
    }
  };

  const handleDownload = () => {
    if (qrCode && qrCode !== "placeholder") {
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = `qr-code-${Date.now()}.png`;
      link.click();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      generateQR();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-t2 mb-2">
          Enter URL or Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter URL or text..."
          className="w-full px-[14px] py-[14px] bg-s1 border border-white/[0.06] rounded-xl text-t2 text-sm placeholder-t3 resize-none focus:outline-none focus:border-white/10 focus:ring-1 focus:ring-white/5 transition-all"
          rows={4}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generateQR}
        disabled={!input.trim() || isGenerating}
        className="bg-ac text-white rounded-[7px] px-[14px] py-[9px] text-[13px] font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? "Generating..." : "Generate QR Code"}
      </button>

      {/* Output Section */}
      {qrCode && (
        <div className="mt-8">
          <div className="bg-s1 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-3">
            {qrCode === "placeholder" ? (
              // Placeholder while library loads
              <div className="w-[200px] h-[200px] bg-white rounded-lg flex items-center justify-center text-[10px] text-black text-center p-2 font-mono">
                <span>QR Code<br />(integration pending)</span>
              </div>
            ) : (
              // Actual QR code
              <div className="flex flex-col items-center gap-4">
                <canvas
                  ref={canvasRef}
                  className="border-2 border-white/10 rounded-lg"
                  style={{ width: "200px", height: "200px" }}
                />
                <div className="text-xs text-t3 text-center max-w-[200px] break-words">
                  {input}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopy}
              disabled={qrCode === "placeholder"}
              className="flex-1 bg-s2 border border-white/[0.06] text-t1 rounded-[7px] px-[14px] py-[9px] text-[13px] font-semibold hover:bg-s3 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Copy Text
            </button>
            <button
              onClick={handleDownload}
              disabled={qrCode === "placeholder"}
              className="flex-1 bg-ac text-white rounded-[7px] px-[14px] py-[9px] text-[13px] font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Download QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
