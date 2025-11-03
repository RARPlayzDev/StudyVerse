// Version 1.0 Final Push
'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LeaveRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  isCreator: boolean;
  onConfirm: () => void;
}

export default function LeaveRoomDialog({
  open,
  onOpenChange,
  roomName,
  isCreator,
  onConfirm,
}: LeaveRoomDialogProps) {
  const [countdown, setCountdown] = useState(10);
  const [isConfirming, setIsConfirming] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setIsConfirming(false);
      setCountdown(10);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [open]);

  const handleConfirm = () => {
    setIsConfirming(true);
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const actionText = isCreator ? 'delete' : 'leave';
  const titleText = isCreator ? 'Delete Room?' : 'Leave Room?';
  const descriptionText = isCreator
    ? `You are about to permanently delete the room "${roomName}". This action cannot be undone.`
    : `Are you sure you want to leave the room "${roomName}"?`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle>{titleText}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">
            This action will be confirmed in...
          </p>
          <p className="text-6xl font-bold text-destructive">{countdown}</p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={countdown > 0 || isConfirming}
          >
            {isConfirming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm {isCreator ? 'Deletion' : 'Leave'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
