"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { StatusBadge, RecapStatus } from "./status-badge";
import { cn } from "@/lib/utils";

interface RecapCardProps {
  id: string;
  title: string;
  date: string;
  status: RecapStatus;
  summaryPreview?: string;
  errorMessage?: string;
  className?: string;
}

export function RecapCard({
  id,
  title,
  date,
  status,
  summaryPreview,
  errorMessage,
  className,
}: RecapCardProps) {
  const router = useRouter();

  // Description block shown depending on state
  const getDescription = () => {
    switch (status) {
      case "complete":
        return summaryPreview || "Summary is ready. Click to view the full recap and action items list.";
      case "failed":
        return errorMessage || "An error occurred during audio processing. Click to inspect error details.";
      case "transcribing":
        return "Whisper is converting your audio files to text. Grab a coffee, this will take about 1-2 minutes.";
      case "summarizing":
        return "Audio successfully transcribed! Sending text to Claude to extract summary and action items...";
      case "transcribed":
        return "Audio transcription finished. Summarizing process will begin shortly.";
      case "queued":
      default:
        return "Recap audio is successfully queued in file storage and waiting to start transcription.";
    }
  };

  const handleNavigate = () => {
    router.push(`/recaps/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group relative flex items-start justify-between border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2",
        status === "failed" && "hover:border-rose-100 focus-visible:ring-rose-500",
        className
      )}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
    >
      {/* Visual Accent Bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[4px] bg-transparent transition-all duration-300",
          status === "complete" && "group-hover:bg-emerald-500",
          status === "failed" && "group-hover:bg-rose-500",
          (status !== "complete" && status !== "failed") && "group-hover:bg-amber-500"
        )}
      />

      <div className="flex-1 min-w-0 pr-4 pl-1">
        <div className="flex flex-wrap items-center gap-3 mb-2.5">
          <h3 className="text-base font-semibold text-[var(--text-primary)] tracking-tight truncate max-w-[280px] sm:max-w-md">
            {title}
          </h3>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>{date}</span>
        </div>

        <div className="relative">
          {status === "failed" ? (
            <p className="text-sm font-medium text-rose-600/90 flex items-center gap-1.5 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span className="truncate">{getDescription()}</span>
            </p>
          ) : (
            <p className={cn(
              "text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2",
              status !== "complete" && "italic text-[var(--text-muted)]/75"
            )}>
              {getDescription()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center self-stretch pl-2">
        <div className="p-1.5 rounded-full border border-transparent bg-[var(--bg-base)]/50 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:border-[var(--border-default)] group-hover:bg-white transition-all duration-300 shadow-sm-hover">
          <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
}
