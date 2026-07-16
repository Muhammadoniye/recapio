"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  recapTitle?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  recapTitle = "this recap",
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-[var(--border-default)] bg-[var(--bg-surface)] p-6 gap-6">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mx-auto sm:mx-0">
            <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="text-center sm:text-left space-y-1">
            <DialogTitle className="text-lg font-bold text-[var(--text-primary)]">
              Delete Recap
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-muted)] leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">&quot;{recapTitle}&quot;</span>? This will permanently remove the transcription, summaries, and action items.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-[var(--text-muted)] hover:bg-[var(--bg-base)] border border-transparent rounded-md w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-md gap-2 w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Recap
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
