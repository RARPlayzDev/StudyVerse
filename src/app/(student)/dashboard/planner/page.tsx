'use client';
import { useState } from 'react';
import PageTitle from '@/components/common/page-title';
import KanbanBoard from '@/components/planner/kanban-board';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Task, Completion } from '@/lib/types';
import { useMemo } from 'react';
import {
  subDays,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { Loader2 } from 'lucide-react';

const chartConfig = {
  completed: {
    label: 'Tasks Completed',
    color: 'hsl(var(--accent))',
  },
};

export default function PlannerPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const sevenDaysAgo = useMemo(() => startOfDay(subDays(new Date(), 6)), []);

  const completionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/completions`),
      where('completedAt', '>=', Timestamp.fromDate(sevenDaysAgo))
    );
  }, [firestore, user, sevenDaysAgo]);

  const { data: recentCompletions, isLoading: completionsLoading } = useCollection<Completion>(completionsQuery);

  const taskCompletionData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: sevenDaysAgo,
      end: new Date(),
    });

    return last7Days.map((day) => {
      const completionsOnDay =
        recentCompletions?.filter((completion) =>
          isSameDay(completion.completedAt.toDate(), day)
        ).length || 0;

      return {
        date: format(day, 'MMM d'),
        completed: completionsOnDay,
      };
    });
  }, [recentCompletions, sevenDaysAgo]);

  if (isUserLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Study Planner"
        subtitle="Organize your tasks and conquer your goals."
      />

      <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Completion Trends</CardTitle>
          <CardDescription>
            Your task completion rate over the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-60 w-full">
            <ResponsiveContainer>
              <AreaChart
                data={taskCompletionData}
                margin={{ left: -20, right: 20, top: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--color-completed)"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <KanbanBoard />
    </div>
  );
}
