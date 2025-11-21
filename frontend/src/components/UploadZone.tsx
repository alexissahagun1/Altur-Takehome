"use client";
import { useState, useCallback } from "react";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function UploadZone() {
  // --- STATE MANAGEMENT ---
  // 1. isDragging: visual cue when user hovers a file over the drop zone
  // 2. isUploading: shows the spinner while waiting for the backend
  // 3. error: shows red alert if something fails
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Used to refresh the page after upload

  // --- LOGIC: DRAG & DROP HANDLERS ---
  
  // When the user drags a file over the box
  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault(); // prevents opening file in the browser
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragging(true);
    } else if (event.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  // --- LOGIC: FILE PROCESSING ---
  // This is the core function that actually does the work
  const processFile = async (file: File) => {
    // 1. Client-side Validation
    // We check the extension before even sending it to the server to save time.
    // If file doesnt includes audio or is not a WAV or MP3, set error and return
    if (!file.type.includes("audio") && !file.name.match(/\.(mp3|wav)$/i)) {
      setError("Please upload a WAV or MP3 file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 2. API Call
      // We use the helper we created in api.ts
      await api.uploadCall(file);
      
      // 3. Success Handling
      // Refresh the page so the new call appears in the list immediately
      router.refresh(); 
      window.location.reload(); // Force reload to be safe for this demo
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // When the user drops the file
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault(); // prevents opening file in the browser
    event.stopPropagation();
    setIsDragging(false); // reset dragging state
    // Check if a file exists
    // We check if (files && files[0]) to ensure the user actually
    // dropped a file and not just some text or an empty selection, preventing a crash.
    // For this mvp only one file at the time is allowed, later a for loop can be used to process multiple files.
    // Therefore, only the first file will be processed :D
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      processFile(event.dataTransfer.files[0]);
    }
  }, []);

  // When the user clicks the box and selects a file manually
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) { // same logic as handleDrop
      processFile(event.target.files[0]);
    }
  };

  // --- UI RENDER ---
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out
          ${isDragging 
            ? "border-blue-500 bg-blue-50/50 scale-[1.01]" 
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
          }
        `}
      >
        {/* Hidden Input Overlay */}
        {/* This trick makes the whole div clickable to open the file dialog */}
        <input
          type="file"
          accept=".wav,.mp3,audio/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          {/* Icon: Changes based on state */}
          <div className={`p-3 rounded-full ${isUploading ? 'bg-blue-100 animate-pulse' : 'bg-slate-100'}`}>
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6 text-slate-600" />
            )}
          </div>
          
          {/* Text Feedback */}
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">
              {isUploading ? "Processing Call..." : "Upload Sales Call"}
            </h3>
            <p className="text-sm text-slate-500">
              {isUploading 
                ? "Transcribing and analyzing... this may take a minute."
                : "Drag & drop or click to browse (WAV, MP3)"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Error Message Box */}
      {error && (
        <div className="flex items-center gap-2 p-4 mt-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

