"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Music, X, FileAudio, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewRecapDialogProps {
  onRecapCreated?: (title: string, fileName: string, recapId?: string) => void;
  children?: React.ReactNode;
}

export function NewRecapDialog({ onRecapCreated, children }: NewRecapDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setFile(null);
    setIsDragActive(false);
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);

    const validExtensions = [".mp3", ".wav", ".m4a"];
    const fileName = selectedFile.name.toLowerCase();
    const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      setError("Invalid file format. Please upload .mp3, .wav, or .m4a audio files.");
      return;
    }

    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    if (selectedFile.size > MAX_SIZE) {
      setError("File size exceeds the 25MB limit. Please upload a smaller file.");
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Auto-populate title with filename minus extension
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      const response = await fetch("/api/recaps", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create recap.");
      }

      setIsSuccess(true);
      setIsSubmitting(false);

      if (onRecapCreated) {
        onRecapCreated(title, file.name, result.data?.id);
      }

      // Close the modal shortly after showing success state
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 1200);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file. Please try again.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {children || <Button className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white">New Recap</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-2xl border-[var(--border-default)] bg-[var(--bg-surface)] p-6 gap-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Create New Recap
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--text-muted)]">
            Upload your lecture or meeting recording. We will transcribe, summarize, and extract action items automatically.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CheckCircle className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-[var(--text-primary)]">Recap Queued Successfully!</p>
              <p className="text-xs text-[var(--text-muted)]">Starting transcript processing...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-[var(--state-error)] bg-[var(--state-error)]/10 border border-[var(--state-error)]/20 rounded-lg animate-in fade-in duration-200">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="recap-title" className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Recap Title
              </label>
              <Input
                id="recap-title"
                type="text"
                placeholder="E.g., Product Planning Kickoff"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
                className="border-[var(--border-default)] rounded-md focus-visible:ring-[var(--accent-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Audio File
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />

              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200",
                    isDragActive 
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 scale-[0.99]" 
                      : "border-[var(--border-default)] bg-[var(--bg-base)]/50 hover:bg-[var(--bg-base)]"
                  )}
                >
                  <div className="p-3 rounded-full bg-white shadow-sm border border-[var(--border-default)] mb-3 text-[var(--text-muted)] transition-transform duration-200 hover:scale-115">
                    <UploadCloud className="h-6 w-6 stroke-[1.5] text-[var(--accent-primary)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] text-center">
                    Drag and drop your audio file here
                  </p>
                  <p className="text-xs text-[var(--text-muted)] text-center mt-1">
                    or click to browse from device (MP3, WAV, M4A)
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] text-center mt-3">
                    Max size: 25MB (approx. 30 mins)
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between border border-[var(--border-default)] bg-[var(--bg-base)]/40 p-4 rounded-xl shadow-inner-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-white border border-[var(--border-default)] text-[var(--accent-primary)]">
                      <Music className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    disabled={isSubmitting}
                    className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--state-error)] hover:bg-rose-50 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="text-[var(--text-muted)] hover:bg-[var(--bg-base)] border border-transparent rounded-md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title || !file}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white gap-2 rounded-md shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileAudio className="h-4 w-4" />
                    Create Recap
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
