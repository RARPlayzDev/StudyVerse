'use client';
import PageTitle from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { weeklyFocusData } from "@/lib/placeholder-data";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Play, Pause, SkipForward, SkipBack, Repeat, Shuffle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const chartConfig = {
  "This Week": {
    label: "This Week",
    color: "hsl(var(--primary))",
  },
  "Last Week": {
    label: "Last Week",
    color: "hsl(var(--secondary))",
  },
}

export default function FocusPage() {
  const pomodoroProgress = 60; // Example progress

  return (
    <div>
      <PageTitle title="Focus Mode" subtitle="Minimize distractions and maximize your productivity." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Weekly Focus Analytics</CardTitle>
              <CardDescription>Track your study hours and build consistent habits.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={weeklyFocusData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="h" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="This Week" fill="var(--color-This Week)" radius={4} />
                    <Bar dataKey="Last Week" fill="var(--color-Last Week)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Pomodoro Timer</CardTitle>
              <CardDescription>Work in focused 25-minute intervals.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative h-40 w-40">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-current text-muted"
                    strokeWidth="7"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="stroke-current text-primary"
                    strokeWidth="7"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * pomodoroProgress) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">15:32</span>
                  <span className="text-sm text-muted-foreground">Focusing</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>Start Focus</Button>
                <Button variant="ghost">Reset</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Focus Music</CardTitle>
              <CardDescription>Lofi beats to study to.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div data-ai-hint="album cover" className="h-20 w-20 bg-muted rounded-md bg-cover bg-center" style={{backgroundImage: 'url(https://picsum.photos/seed/album1/200/200)'}}></div>
                <div className="flex-1">
                  <p className="font-semibold">Astral Awakening</p>
                  <p className="text-sm text-muted-foreground">Cosmic Lofi</p>
                  <Progress value={33} className="h-2 mt-2" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button variant="ghost" size="icon"><Shuffle className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><SkipBack className="h-5 w-5" /></Button>
                <Button size="icon" className="h-12 w-12"><Play className="h-6 w-6" /></Button>
                <Button variant="ghost" size="icon"><SkipForward className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Repeat className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
