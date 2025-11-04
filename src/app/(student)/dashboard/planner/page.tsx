// Version 1.0 Final Push
'use client';
import PageTitle from "@/components/common/page-title";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function PlannerPage() {
    return (
        <div>
            <PageTitle title="Study Planner" subtitle="A new planner experience is coming soon." />

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <Construction className="w-16 h-16 text-primary mb-4" />
                    <h2 className="text-2xl font-bold">Under Construction</h2>
                    <p className="text-muted-foreground mt-2">
                        We're building a brand new, AI-powered planner to help you organize your studies more effectively.
                        <br />
                        Check back soon!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
