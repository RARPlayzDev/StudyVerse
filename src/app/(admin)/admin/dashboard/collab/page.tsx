
import PageTitle from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function AdminCollabPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <PageTitle title="Collaboration Rooms" subtitle="Manage all public study rooms." className="mb-0" />
                <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Room
                </Button>
            </div>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>Room Management</CardTitle>
                    <CardDescription>
                        Functionality to create and manage rooms will be built here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No rooms created yet.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
