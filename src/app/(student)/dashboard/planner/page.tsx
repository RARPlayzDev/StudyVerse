// Version 1.0 Final Push
'use client';
import PageTitle from "@/components/common/page-title";
import KanbanBoard from "@/components/planner/kanban-board";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, Timestamp } from "firebase/firestore";
import type { Task } from "@/lib/types";
import { useMemo } from "react";
import { subDays, eachDayOfInterval, format, isSameDay, startOfDay } from "date-fns";

const chartConfig = {
    completed: {
        label: "Tasks Completed",
        color: "hsl(var(--accent))",
    },
}

export default function PlannerPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const tasksQuery = useMemoFirebase(() => {
        if (!user) return null;
        const sevenDaysAgo = Timestamp.fromDate(startOfDay(subDays(new Date(), 6)));
        return query(
            collection(firestore, `users/${user.uid}/tasks`),
            where('status', '==', 'done'),
            where('doneAt', '>=', sevenDaysAgo)
        );
    }, [firestore, user]);

    const { data: completedTasks, isLoading } = useCollection<Task>(tasksQuery);

    const taskCompletionData = useMemo(() => {
        const last7Days = eachDayOfInterval({
            start: subDays(new Date(), 6),
            end: new Date(),
        });

        return last7Days.map(day => {
            const tasksOnDay = completedTasks?.filter(task => 
                task.doneAt && isSameDay(task.doneAt.toDate(), day)
            ).length || 0;

            return {
                date: format(day, 'MMM d'),
                completed: tasksOnDay
            };
        });

    }, [completedTasks]);


    return (
        <div>
            <PageTitle title="Study Planner" subtitle="Organize your tasks and conquer your goals." />

            <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>Completion Trends</CardTitle>
                    <CardDescription>Your task completion rate over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-60 w-full">
                        <ResponsiveContainer>
                            <AreaChart data={taskCompletionData} margin={{ left: -20, right: 20, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                                <Area type="monotone" dataKey="completed" stroke="var(--color-completed)" fillOpacity={1} fill="url(#colorCompleted)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <KanbanBoard />
        </div>
    );
}
