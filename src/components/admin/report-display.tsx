'use client';

import { useState } from 'react';
import { generateAdminReport } from '@/ai/flows/generate-admin-report';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function ReportDisplay() {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await generateAdminReport();
      setReport(result.report);
    } catch (e) {
      console.error(e);
      setError('Failed to generate the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <CardTitle>Generate Monthly Report</CardTitle>
                <CardDescription>Use AI to get a summary of platform usage and student performance.</CardDescription>
            </div>
            <Button onClick={handleGenerateReport} disabled={loading}>
                <Bot className="mr-2 h-4 w-4" />
                {loading ? 'Generating...' : 'Generate Report'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <br/>
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {report && (
          <div className="prose prose-invert prose-sm max-w-none text-muted-foreground whitespace-pre-wrap rounded-md border border-border/50 p-4 bg-background/30">
            <h3 className="text-lg font-semibold text-foreground mt-0">Monthly Platform Insights</h3>
            {report.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}
        {!loading && !report && !error && (
            <div className="text-center py-10 text-muted-foreground">
                <p>Click the button to generate your monthly report.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
