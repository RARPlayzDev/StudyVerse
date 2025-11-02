import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  textClassName?: string;
};

export default function Logo({ className, textClassName }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <BrainCircuit className="h-7 w-7 text-primary" />
      <span className={cn('text-xl font-bold text-foreground', textClassName)}>
        StudyVerse
      </span>
    </Link>
  );
}
