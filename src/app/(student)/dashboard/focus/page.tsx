'use client';
import { useState, useEffect } from "react";
import PageTitle from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { weeklyFocusData } from "@/lib/placeholder-data";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Music4, Pause, Play, Repeat, Settings, SkipBack, SkipForward, Shuffle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [duration, setDuration] = useState(25 * 60); // Default 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [customDuration, setCustomDuration] = useState(25);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Add a notification or sound
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const pomodoroProgress = (timeLeft / duration) * 100;

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration * 60);
    setTimeLeft(newDuration * 60);
    setIsActive(false);
  };

  const handleCustomDurationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDurationChange(customDuration);
    setDialogOpen(false);
  }

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
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Pomodoro Timer</CardTitle>
                <CardDescription>Work in focused intervals.</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                       <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-slate-900/80 backdrop-blur-md border-slate-700">
                      <DialogHeader>
                          <DialogTitle>Set Focus Duration</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCustomDurationSubmit}>
                        <div className="grid gap-4 py-4">
                            <RadioGroup defaultValue={String(duration / 60)} onValueChange={(val) => handleDurationChange(Number(val))} className="grid grid-cols-3 gap-4">
                                <div>
                                    <RadioGroupItem value="25" id="r1" className="peer sr-only" />
                                    <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">25 min</Label>
                                </div>
                                 <div>
                                    <RadioGroupItem value="50" id="r2" className="peer sr-only" />
                                    <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">50 min</Label>
                                </div>
                                 <div>
                                    <RadioGroupItem value="75" id="r3" className="peer sr-only" />
                                    <Label htmlFor="r3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">75 min</Label>
                                </div>
                            </RadioGroup>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="custom-duration" className="text-right col-span-1">Custom</Label>
                                <Input
                                    id="custom-duration"
                                    type="number"
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                                    className="col-span-2"
                                />
                                <span className="col-span-1 text-muted-foreground">minutes</span>
                            </div>
                        </div>
                         <div className="flex justify-end">
                             <Button type="submit">Set Duration</Button>
                         </div>
                      </form>
                  </DialogContent>
              </Dialog>
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
                    strokeDashoffset={264 - (264 * (isActive ? (timeLeft / duration) * 100 : 100)) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{formatTime(timeLeft)}</span>
                  <span className="text-sm text-muted-foreground">{isActive ? "Focusing" : "Paused"}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={toggleTimer} className="w-24">
                  {isActive ? "Pause" : "Start Focus"}
                </Button>
                <Button variant="ghost" onClick={resetTimer}>Reset</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Focus Music</CardTitle>
              <CardDescription>Lofi beats to study to.</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground flex flex-col items-center justify-center h-48 gap-4">
              <Music4 className="w-10 h-10 text-muted-foreground/50" />
              <p className="text-sm">Music integration with Spotify and other services is coming soon!</p>
              <p className="text-xs">Let us know what service you'd like to see first.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
