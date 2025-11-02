import { cn } from "@/lib/utils";

type PageTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function PageTitle({ title, subtitle, className }: PageTitleProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
