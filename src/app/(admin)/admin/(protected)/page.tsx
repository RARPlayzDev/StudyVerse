import PageTitle from "@/components/common/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { adminContentStats, adminEngagementStats, adminUserStats, placeholderUsers, weeklyFocusData } from "@/lib/placeholder-data";
import { Archive, BarChart, Users, Timer, CheckCircle, Flame } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Bar as RechartsBar, ResponsiveContainer, XAxis, YAxis, BarChart as RechartsBarChart } from "recharts";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
    "This Week": { label: "This Week", color: "hsl(var(--primary))" },
};

const StatCard = ({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{change}</p>
        </CardContent>
    </Card>
)

export default function AdminPanel() {
    const topStudents = placeholderUsers.filter(u => u.role === 'student').slice(0, 5);
    return (
        <div>
            <PageTitle title="Admin Panel" subtitle="Overview of the StudyVerse ecosystem." />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-muted-foreground" /> User Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {adminUserStats.map(stat => <StatCard key={stat.metric} title={stat.metric} value={stat.value} change={stat.change} icon={null} />)}
                    </CardContent>
                </Card>
                <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Archive className="w-5 h-5 text-muted-foreground" /> Content Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {adminContentStats.map(stat => <StatCard key={stat.metric} title={stat.metric} value={stat.value} change={stat.change} icon={null} />)}
                    </CardContent>
                </Card>
                 <Card className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Flame className="w-5 h-5 text-muted-foreground" /> Engagement Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {adminEngagementStats.map(stat => <StatCard key={stat.metric} title={stat.metric} value={stat.value} change={stat.change} icon={null} />)}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle>Focus Hours Trend</CardTitle>
                        <CardDescription>Total student focus hours across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-72 w-full">
                            <ResponsiveContainer>
                                <RechartsBarChart data={weeklyFocusData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="h" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <RechartsBar dataKey="This Week" fill="var(--color-This Week)" radius={4} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                     <CardHeader>
                        <CardTitle>Top Students</CardTitle>
                        <CardDescription>Most active and engaged students this week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-right">Last Active</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topStudents.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait"/>
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-right">{user.lastActive}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
