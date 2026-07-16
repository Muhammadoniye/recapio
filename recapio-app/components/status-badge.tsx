"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Loader2, PlayCircle, Eye, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type RecapStatus = "queued" | "transcribing" | "transcribed" | "summarizing" | "complete" | "failed";

interface StatusBadgeProps {
  status: RecapStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let config: {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass?: string;
  };

  switch (status) {
    case "complete":
      config = {
        label: "Complete",
        bgColor: "bg-[var(--state-success)]/10",
        textColor: "text-[var(--state-success)]",
        borderColor: "border-[var(--state-success)]/20",
        icon: CheckCircle2,
      };
      break;
    case "failed":
      config = {
        label: "Failed",
        bgColor: "bg-[var(--state-error)]/10",
        textColor: "text-[var(--state-error)]",
        borderColor: "border-[var(--state-error)]/20",
        icon: AlertCircle,
      };
      break;
    case "transcribing":
      config = {
        label: "Transcribing",
        bgColor: "bg-[var(--state-warning)]/10",
        textColor: "text-[var(--state-warning)]",
        borderColor: "border-[var(--state-warning)]/20",
        icon: Loader2,
        iconClass: "animate-spin",
      };
      break;
    case "summarizing":
      config = {
        label: "Summarizing",
        bgColor: "bg-[var(--state-warning)]/10",
        textColor: "text-[var(--state-warning)]",
        borderColor: "border-[var(--state-warning)]/20",
        icon: RefreshCw,
        iconClass: "animate-spin",
      };
      break;
    case "transcribed":
      config = {
        label: "Transcribed",
        bgColor: "bg-[var(--state-warning)]/10",
        textColor: "text-[var(--state-warning)]",
        borderColor: "border-[var(--state-warning)]/20",
        icon: Eye,
      };
      break;
    case "queued":
    default:
      config = {
        label: "Processing",
        bgColor: "bg-[var(--state-warning)]/10",
        textColor: "text-[var(--state-warning)]",
        borderColor: "border-[var(--state-warning)]/20",
        icon: PlayCircle,
      };
      break;
  }

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium backdrop-blur-sm transition-colors duration-200",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 stroke-[2]", config.iconClass)} />
      <span>{config.label}</span>
    </div>
  );
}
