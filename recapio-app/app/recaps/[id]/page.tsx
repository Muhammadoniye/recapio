"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  FileAudio,
  User,
  Clock,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, RecapStatus } from "@/components/status-badge";

interface ActionItem {
  id: string;
  task: string;
  owner: string | null;
  deadline: string | null;
  completed: boolean;
}

interface RecapDetails {
  id: string;
  title: string;
  status: RecapStatus;
  audioUrl: string;
  transcript: string | null;
  summary: string | null;
  keyPoints: string | null; // Stored as JSON string
  errorMessage: string | null;
  createdAt: string;
  actionItems: ActionItem[];
}

export default function RecapDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [recap, setRecap] = useState<RecapDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTranscriptCollapsed, setIsTranscriptCollapsed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Memoized fetch function to fetch recap details
  const fetchRecapDetails = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch(`/api/recaps/${id}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch recap details.");
      }
      setRecap(json.data);
    } catch (err) {
      console.error("Fetch recap error:", err);
      if (!silent) {
        setError(err instanceof Error ? err.message : "Failed to load recap.");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRecapDetails();
    }
  }, [id, fetchRecapDetails]);

  // Automatically trigger processing when visiting a queued recap
  useEffect(() => {
    if (recap && recap.status === "queued" && !isRetrying) {
      const triggerProcessing = async () => {
        try {
          await fetch(`/api/recaps/${id}/process`, { method: "POST" });
          fetchRecapDetails(true);
        } catch (err) {
          console.error("Auto trigger process error:", err);
        }
      };
      triggerProcessing();
    }
  }, [recap, id, isRetrying, fetchRecapDetails]);

  // Polling loop: runs every 3s if status is active (non-terminal)
  useEffect(() => {
    if (!recap) return;

    const isProcessing = 
      recap.status === "queued" || 
      recap.status === "transcribing" || 
      recap.status === "transcribed" || 
      recap.status === "summarizing";

    if (!isProcessing) return;

    const interval = setInterval(() => {
      fetchRecapDetails(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [recap, fetchRecapDetails]);

  // Handles retry when processing fails
  const handleRetryProcessing = async () => {
    if (!id) return;
    try {
      setIsRetrying(true);
      setError(null);
      
      // Instantly set status back to queued in UI
      if (recap) {
        setRecap({ ...recap, status: "queued", errorMessage: null });
      }

      const res = await fetch(`/api/recaps/${id}/process`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Retry pipeline trigger failed.");
      }

      // Re-fetch to synchronize state
      fetchRecapDetails();
    } catch (err) {
      console.error("Retry process trigger error:", err);
      setError(err instanceof Error ? err.message : "Failed to restart pipeline.");
      fetchRecapDetails();
    } finally {
      setIsRetrying(false);
    }
  };

  // Handles checkmark checklist changes
  const handleToggleActionItem = async (itemId: string, currentCompletedState: boolean) => {
    // 1. Pessimistic update in database first, then local state sync
    try {
      // Opt-in option: toggle state locally first for instant responsiveness
      setRecap(prev => {
        if (!prev) return null;
        return {
          ...prev,
          actionItems: prev.actionItems.map(item => 
            item.id === itemId ? { ...item, completed: !currentCompletedState } : item
          )
        };
      });

      const response = await fetch(`/api/action-items/${itemId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ completed: !currentCompletedState }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Failed to update item state.");
      }
    } catch (err) {
      console.error("Action item toggle error:", err);
      // Revert state on error
      setRecap(prev => {
        if (!prev) return null;
        return {
          ...prev,
          actionItems: prev.actionItems.map(item => 
            item.id === itemId ? { ...item, completed: currentCompletedState } : item
          )
        };
      });
      alert(err instanceof Error ? err.message : "Failed to toggle action item.");
    }
  };

  // Highlight search matches inline in the transcript text
  const renderHighlightedTranscript = (text: string, query: string) => {
    if (!text) return "";
    if (!query.trim()) return text;

    // Sanitize query to prevent broken RegEx syntax
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-amber-200 text-black px-0.5 rounded font-semibold font-mono">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Parse Key Discussion Points JSON
  const getKeyPoints = (): string[] => {
    if (!recap || !recap.keyPoints) return [];
    try {
      const parsed = JSON.parse(recap.keyPoints);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center flex-col">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)] mb-4" />
        <p className="text-sm text-[var(--text-muted)] font-medium">Loading recap details...</p>
      </div>
    );
  }

  if (error || !recap) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center flex-col p-4 text-center">
        <div className="p-3 rounded-full bg-rose-50 text-[var(--state-error)] border border-rose-100 mb-4 animate-in zoom-in duration-200">
          <AlertCircle className="h-8 w-8 stroke-[1.5]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Failed to Load Recap</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mb-6">{error || "Recap details could not be found."}</p>
        <Link href="/">
          <Button className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-md px-6 shadow-sm gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isPipelineProcessing = 
    recap.status === "queued" || 
    recap.status === "transcribing" || 
    recap.status === "transcribed" || 
    recap.status === "summarizing";

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased flex flex-col">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-default)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-[var(--text-muted)] hover:bg-[var(--bg-base)] hover:text-[var(--text-primary)] gap-2 rounded-md">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hidden sm:block">
              <Sparkles className="h-4 w-4 stroke-[2]" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] truncate max-w-[180px] sm:max-w-xs">
              {recap.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={recap.status} />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this recap? This action cannot be undone.")) {
                  try {
                    const res = await fetch(`/api/recaps/${id}`, { method: "DELETE" });
                    const json = await res.json();
                    if (!res.ok) {
                      throw new Error(json.error || "Failed to delete recap.");
                    }
                    window.location.href = "/";
                  } catch (err) {
                    console.error("Delete recap error:", err);
                    alert(err instanceof Error ? err.message : "Failed to delete recap.");
                  }
                }
              }}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-md gap-1.5 h-9"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
        
        {/* Meta Info Bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] border-b border-[var(--border-default)] pb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(recap.createdAt)}</span>
          </div>
          <div className="h-3 w-[1px] bg-[var(--border-default)] hidden sm:block" />
          <div className="flex items-center gap-1.5 truncate max-w-[300px]">
            <FileAudio className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
            <span className="truncate">{recap.audioUrl.split("/").pop() || "audio.mp3"}</span>
          </div>
        </div>

        {/* Processing State Card */}
        {isPipelineProcessing && (
          <Card className="border-[var(--border-default)] bg-white rounded-xl shadow-sm animate-in fade-in duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[var(--accent-primary)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Recap Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Recapio is working in the background to analyze your audio. Keep this tab open—the page will reload dynamically when summaries, keys, and checklist items are fully populated.
              </p>
              <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden relative">
                <div 
                  className="bg-[var(--accent-primary)] h-full transition-all duration-500 rounded-full animate-pulse" 
                  style={{
                    width: 
                      recap.status === "queued" ? "15%" :
                      recap.status === "transcribing" ? "40%" :
                      recap.status === "transcribed" ? "65%" : "85%"
                  }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] italic">
                Current State: <span className="font-semibold capitalize text-[var(--text-primary)]">{recap.status}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Failed Pipeline Card */}
        {recap.status === "failed" && (
          <Card className="border-rose-100 bg-rose-50/10 rounded-xl shadow-sm animate-in fade-in duration-300 border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[var(--state-error)]">
                <AlertCircle className="h-4 w-4" />
                Pipeline Processing Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed bg-white border border-rose-100 p-3.5 rounded-lg">
                {recap.errorMessage || "An unhandled execution error occurred while processing the transcription/summarization pipeline."}
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleRetryProcessing} 
                  disabled={isRetrying}
                  className="bg-[var(--state-error)] hover:bg-rose-700 text-white rounded-md px-5 gap-2"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      Retry Pipeline
                    </>
                  )}
                </Button>
                <span className="text-xs text-[var(--text-muted)] italic">
                  Press retry to restart processing from the beginning.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dynamic Detail Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          {/* Left Column: Summary, Key Points, Action Items (40% width) */}
          <div className="md:col-span-2 space-y-6 flex flex-col">
            
            {/* Summary Card */}
            <Card className="border-[var(--border-default)] bg-white rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-[var(--border-default)]">
                <CardTitle className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-[var(--text-primary)] leading-relaxed font-normal">
                  {recap.summary || "Summary text is not yet generated. Complete the transcription step to populate."}
                </p>
              </CardContent>
            </Card>

            {/* Key Discussion Points */}
            <Card className="border-[var(--border-default)] bg-white rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-[var(--border-default)]">
                <CardTitle className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Key Points
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {getKeyPoints().length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] italic">No key points extracted yet.</p>
                ) : (
                  <ul className="space-y-2.5 list-disc pl-4 text-sm text-[var(--text-primary)] leading-relaxed">
                    {getKeyPoints().map((point, index) => (
                      <li key={index} className="pl-1">
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Action Items Checklist */}
            <Card className="border-[var(--border-default)] bg-white rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-[var(--border-default)]">
                <CardTitle className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-5">
                {recap.actionItems.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] italic">No action items extracted.</p>
                ) : (
                  <div className="space-y-4">
                    {recap.actionItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 select-none">
                        <Checkbox 
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={() => handleToggleActionItem(item.id, item.completed)}
                          className="mt-0.5 border-[var(--border-default)] focus-visible:ring-[var(--accent-primary)] data-[state=checked]:bg-[var(--state-success)] data-[state=checked]:border-[var(--state-success)]"
                        />
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <label 
                            htmlFor={item.id}
                            className={`text-sm leading-tight block cursor-pointer transition-colors duration-200 ${
                              item.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)] font-medium"
                            }`}
                          >
                            {item.task}
                          </label>
                          
                          {(item.owner || item.deadline) && (
                            <div className="flex flex-wrap gap-2 items-center">
                              {item.owner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200">
                                  <User className="h-3 w-3 shrink-0" />
                                  {item.owner}
                                </span>
                              )}
                              {item.deadline && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold border border-amber-200">
                                  <Clock className="h-3 w-3 shrink-0" />
                                  {item.deadline}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Collapsible and Searchable Transcript Viewer (60% width) */}
          <div className="md:col-span-3">
            <Card className="border-[var(--border-default)] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)] md:sticky md:top-24">
              
              {/* Transcript Titlebar with search and toggle */}
              <CardHeader className="pb-3 border-b border-[var(--border-default)] flex flex-row items-center justify-between space-y-0 gap-4">
                <CardTitle className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Transcript
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsTranscriptCollapsed(!isTranscriptCollapsed)}
                    className="h-8 w-8 text-[var(--text-muted)] hover:bg-[var(--bg-base)] rounded-md"
                  >
                    {isTranscriptCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              {!isTranscriptCollapsed && (
                <>
                  {/* Search Input */}
                  <div className="p-4 border-b border-[var(--border-default)] bg-slate-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
                      <Input
                        type="text"
                        placeholder="Search transcript text..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 border-[var(--border-default)] bg-white focus-visible:ring-[var(--accent-primary)] rounded-md text-sm shadow-inner-sm"
                      />
                    </div>
                  </div>

                  {/* Transcript Content Area */}
                  <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                    {recap.transcript ? (
                      <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap text-slate-800 break-words tracking-tight">
                        {renderHighlightedTranscript(recap.transcript, searchQuery)}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)] italic font-mono">
                        Transcript is currently empty. Make sure audio is uploaded and transcription finishes processing.
                      </p>
                    )}
                  </div>
                </>
              )}

              {isTranscriptCollapsed && (
                <div className="p-8 text-center bg-slate-50/20 flex-1 flex items-center justify-center">
                  <p className="text-xs text-[var(--text-muted)] font-medium">Transcript viewer is collapsed. Press arrow button to expand.</p>
                </div>
              )}

            </Card>
          </div>

        </div>

      </main>
    </div>
  );
}
