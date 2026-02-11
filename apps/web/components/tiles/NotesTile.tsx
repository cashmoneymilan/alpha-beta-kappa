"use client";

import * as React from "react";
import useSWR from "swr";
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  ChevronRight,
  Tag,
  TrendingUp,
  Save,
} from "lucide-react";
import type { Tile } from "@/stores/workspace";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Note {
  id: string;
  title: string | null;
  content: string;
  tickers: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotesTile({ tile }: { tile: Tile }) {
  const [search, setSearch] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Fetch notes from API
  const { data, error, isLoading, mutate } = useSWR<{ notes: Note[] }>(
    "/api/notes",
    fetcher
  );

  const notes = data?.notes || [];

  // Filter notes based on search
  const filteredNotes = React.useMemo(() => {
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (note) =>
        note.content.toLowerCase().includes(q) ||
        note.title?.toLowerCase().includes(q) ||
        note.tickers.some((t) => t.toLowerCase().includes(q)) ||
        note.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, search]);

  // Delete note with custom confirmation
  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    await fetch(`/api/notes/${deleteConfirmId}`, { method: "DELETE" });
    mutate();
    setDeleteConfirmId(null);
    setIsDeleting(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/50">
        <span className="text-xs text-zinc-400">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showAddForm ? "default" : "ghost"}
                size="icon"
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingNote(null);
                }}
                className="h-7 w-7"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showAddForm ? "Close form" : "Add note"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Add/Edit Note Form */}
      {(showAddForm || editingNote) && (
        <NoteForm
          note={editingNote}
          onClose={() => {
            setShowAddForm(false);
            setEditingNote(null);
          }}
          onSaved={() => {
            mutate();
            setShowAddForm(false);
            setEditingNote(null);
          }}
        />
      )}

      {/* Search */}
      <div className="px-3 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-1 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start gap-2">
                    <Skeleton className="h-3 w-3 mt-0.5" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No notes found</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="text-primary mt-2"
              >
                Add your first note
              </Button>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => {
                  setEditingNote(note);
                  setShowAddForm(false);
                }}
                onDelete={() => confirmDelete(note.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              Delete Note
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Note Card Component
function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const previewLength = 100;
  const hasMore = note.content.length > previewLength;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Main row */}
      <div
        className="flex items-start gap-2 px-3 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground mt-0.5">
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          {/* Title if exists */}
          {note.title && (
            <span className="text-sm font-medium block truncate">
              {note.title}
            </span>
          )}

          {/* Content preview */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {expanded || !hasMore
              ? note.content
              : `${note.content.substring(0, previewLength)}...`}
          </p>

          {/* Tickers & Tags */}
          {(note.tickers.length > 0 || note.tags.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {note.tickers.map((ticker) => (
                <span
                  key={ticker}
                  className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary"
                >
                  <TrendingUp className="h-2.5 w-2.5" />
                  {ticker}
                </span>
              ))}
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {formatRelativeTime(note.created_at)}
        </span>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50">
          {/* Full content */}
          <p className="text-xs whitespace-pre-wrap mb-3">{note.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-6 px-2 text-xs text-destructive/70 hover:text-destructive ml-auto"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>

          {/* Metadata */}
          <p className="text-[10px] text-muted-foreground mt-2">
            Created: {new Date(note.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

// Note Form Component
function NoteForm({
  note,
  onClose,
  onSaved,
}: {
  note: Note | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState(note?.title || "");
  const [content, setContent] = React.useState(note?.content || "");
  const [tickerInput, setTickerInput] = React.useState("");
  const [tickers, setTickers] = React.useState<string[]>(note?.tickers || []);
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>(note?.tags || []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const isEditing = !!note;

  const addTicker = () => {
    const ticker = tickerInput.trim().toUpperCase();
    if (ticker && !tickers.includes(ticker)) {
      setTickers([...tickers, ticker]);
      setTickerInput("");
    }
  };

  const removeTicker = (ticker: string) => {
    setTickers(tickers.filter((t) => t !== ticker));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/notes/${note.id}` : "/api/notes";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || null,
          content,
          tickers,
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save note");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 py-3 border-b border-border bg-muted/30 space-y-3"
    >
      {/* Title (optional) */}
      <Input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-9 text-sm"
      />

      {/* Content */}
      <Textarea
        placeholder="Write your note... (supports $CASHTAGS)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="text-sm resize-none"
        required
      />

      {/* Tickers */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span className="text-xs text-muted-foreground">Tickers</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {tickers.map((ticker) => (
            <Badge
              key={ticker}
              variant="default"
              className="flex items-center gap-1 text-xs px-2 py-0.5"
            >
              ${ticker}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTicker(ticker)}
                className="h-3 w-3 p-0 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          ))}
          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder="Add ticker..."
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTicker();
                }
              }}
              className="w-20 h-6 px-2 text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={addTicker}
              className="h-6 w-6"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Tag className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Tags</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 text-xs px-2 py-0.5"
            >
              #{tag}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTag(tag)}
                className="h-3 w-3 p-0 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          ))}
          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="w-20 h-6 px-2 text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={addTag}
              className="h-6 w-6"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="flex-1 border border-zinc-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {isEditing ? "Update" : "Save Note"}
        </Button>
      </div>
    </form>
  );
}

// Helper function for relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}
