// Version 1.0 Final Push
'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { summarizeNotes } from '@/ai/flows/summarize-notes-flow';
import { Skeleton } from '../ui/skeleton';
import { BrainCircuit } from 'lucide-react';

export default function NoteSummaryDialog({
  open,
  onOpenChange,
  noteContent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteContent: string;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = async (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && !summary) {
      setLoading(true);
      try {
        const result = await summarizeNotes({ noteText: noteContent });
        setSummary(result.summary);
      } catch (error) {
        console.error('Failed to get summary:', error);
        setSummary('Sorry, I couldn\'t generate a summary at this time.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary"/> AI Summary
            </DialogTitle>
          <DialogDescription>
            A quick, AI-powered summary of the note.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
