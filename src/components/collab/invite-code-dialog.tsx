'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface InviteCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string;
}

export default function InviteCodeDialog({
  open,
  onOpenChange,
  inviteCode,
}: InviteCodeDialogProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setHasCopied(true);
    toast({
      title: 'Copied to Clipboard!',
      description: 'The invite code has been copied.',
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle>Your Invite Code</DialogTitle>
          <DialogDescription>
            Share this code with others to invite them to your private group.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 my-4">
          <div className="grid flex-1 gap-2">
            <pre className="p-3 bg-muted rounded-md font-mono text-center text-lg tracking-widest">
              {inviteCode}
            </pre>
          </div>
          <Button type="submit" size="icon" onClick={handleCopy}>
            {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
