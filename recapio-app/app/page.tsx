"use client";

import React, { useState, useEffect } from "react";
import { FileAudio, Search, SlidersHorizontal, Sparkles, FolderClosed, Loader2, AlertCircle } from "lucide-react";
import { RecapCard } from "@/components/recap-card";
import { NewRecapDialog } from "@/components/new-recap-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { RecapStatus } from "@/components/status-badge";

interface DBRecap {
  id: string;
  title: string;
  status: RecapStatus;
  audioUrl: string;
  transcript?: string | null;
  summary?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [recaps, setRecaps] = useState<DBRecap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "processing" | "failed">("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const fetchRecaps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/recaps");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch recaps");
      }
      setRecaps(json.data || []);
    } catch (err) {
      console.error("Error fetching recaps:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch recaps. Please reload.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecaps();
  }, []);

  // Polling loop that triggers if any recap is actively in a non-terminal state
  useEffect(() => {
    const hasActiveProcessing = recaps.some(
      (recap) =>
        recap.status === "queued" ||
        recap.status === "transcribing" ||
        recap.status === "transcribed" ||
        recap.status === "summarizing"
    );

    if (!hasActiveProcessing) return;

    const interval = setInterval(() => {
      fetch("/api/recaps")
        .then((res) => res.json())
        .then((json) => {
          if (json.data) {
            setRecaps(json.data);
          }
        })
        .catch((err) => console.error("Polling error:", err));
    }, 3000);

    return () => clearInterval(interval);
  }, [recaps]);

  const handleRecapCreated = (title: string, fileName: string, recapId?: string) => {
    // Instantly refresh list so the user sees the 'queued' card
    fetchRecaps();

    // Trigger the backend pipeline asynchronously in the background
    if (recapId) {
      fetch(`/api/recaps/${recapId}/process`, { method: "POST" })
        .then((res) => {
          if (!res.ok) {
            console.error("Pipeline trigger returned error status:", res.status);
          }
          // Fetch final completed/failed state when request finishes
          fetchRecaps();
        })
        .catch((err) => console.error("Pipeline trigger network error:", err));
    }
  };

  const filteredRecaps = recaps
    .filter((recap) => {
      // 1. Search Query Filter
      const matchesSearch = recap.title.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status Filter
      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "processing") {
        return matchesSearch && (
          recap.status === "queued" ||
          recap.status === "transcribing" ||
          recap.status === "transcribed" ||
          recap.status === "summarizing"
        );
      }
      return matchesSearch && recap.status === statusFilter;
    })
    .sort((a, b) => {
      // 3. Sort Order
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased flex flex-col">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-default)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
              <Sparkles className="h-5 w-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                Recapio
              </h1>
              <p className="text-[10px] font-medium text-[var(--text-muted)] leading-none mt-0.5">
                Meeting notes, automated
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NewRecapDialog onRecapCreated={handleRecapCreated} />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-8 px-4 sm:px-6 flex flex-col">
        {isLoading ? (
          /* Loading State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-primary)] mb-4" />
            <p className="text-sm text-[var(--text-muted)]">Loading your recaps...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
            <div className="p-3 rounded-full bg-rose-50 text-[var(--state-error)] mb-4 border border-rose-100">
              <AlertCircle className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h2 className="text-base font-bold tracking-tight mb-1 text-[var(--text-primary)]">
              Error Loading Recaps
            </h2>
            <p className="text-xs text-[var(--text-muted)] max-w-md mb-6">
              {error}
            </p>
            <Button onClick={fetchRecaps} className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-md px-6 shadow-sm gap-2">
              Retry Connection
            </Button>
          </div>
        ) : recaps.length === 0 ? (
          /* Empty State Dashboard */
          <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--border-default)] shadow-sm flex items-center justify-center text-[var(--text-muted)] mb-5 hover:scale-105 transition-transform duration-200">
              <FolderClosed className="h-8 w-8 stroke-[1.5] text-[var(--accent-primary)]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">
              Create your first recap
            </h2>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-md mb-8 leading-relaxed">
              Upload audio recordings of your lectures, meetings, or interviews. We&apos;ll generate full transcripts, summaries, and action item lists automatically.
            </p>
            <NewRecapDialog onRecapCreated={handleRecapCreated}>
              <Button size="lg" className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-md px-6 shadow-sm gap-2">
                <FileAudio className="h-4 w-4" />
                Upload Audio File
              </Button>
            </NewRecapDialog>
          </div>
        ) : (
          /* Populated State Dashboard */
          <div className="space-y-6 flex-1 flex flex-col justify-start">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  Your Recaps
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Manage and search summaries of your recent discussions
                </p>
              </div>

              {/* Search, Filter and Sort Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:min-w-[180px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
                  <Input
                    type="text"
                    placeholder="Search recaps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 border-[var(--border-default)] bg-[var(--bg-surface)] focus-visible:ring-[var(--accent-primary)] rounded-md text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as "all" | "complete" | "processing" | "failed")}
                    className="h-9 px-3 border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="complete">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="h-9 border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] rounded-md text-[var(--text-muted)] flex items-center gap-1.5 px-3"
                  >
                    <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {filteredRecaps.length === 0 ? (
              /* Search Empty State */
              <div className="flex-1 flex flex-col items-center justify-center py-16 border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] rounded-xl animate-in fade-in duration-200">
                <p className="text-sm font-semibold text-[var(--text-primary)]">No matching recaps found</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Try refining your search keyword or active filters</p>
                <Button 
                  variant="ghost" 
                  className="mt-4 text-xs text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 animate-pulse" 
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSortOrder("desc");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              /* Recap Cards List */
              <div className="space-y-4 animate-in fade-in duration-300">
                {filteredRecaps.map((recap) => (
                  <RecapCard
                    key={recap.id}
                    id={recap.id}
                    title={recap.title}
                    date={formatDate(recap.createdAt)}
                    status={recap.status}
                    summaryPreview={recap.summary || undefined}
                    errorMessage={recap.errorMessage || undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer / Meta Info */}
      <footer className="w-full border-t border-[var(--border-default)] bg-[var(--bg-surface)] py-4 text-center mt-12">
        <p className="text-[10px] text-[var(--text-muted)]">
          Recapio internal MVP dashboard connected to live database.
        </p>
      </footer>
    </div>
  );
}
