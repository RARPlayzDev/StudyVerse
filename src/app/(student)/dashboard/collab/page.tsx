'use client';
import PageTitle from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { placeholderRooms } from "@/lib/placeholder-data";
import { PlusCircle, Users } from "lucide-react";

export default function CollabPage() {
    // These will be replaced with real data from Firestore
    const publicRooms = placeholderRooms.slice(0, 2);
    const privateRooms = placeholderRooms.slice(2, 3);

    return (
        <div>
            <PageTitle title="Collaboration Space" subtitle="Join study rooms or create your own private group." />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Public Study Rooms</h2>
                    </div>
                     <div className="space-y-4">
                        {publicRooms.map(room => (
                            <Card key={room.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                                <CardHeader>
                                    <CardTitle>{room.topic}</CardTitle>
                                    <CardDescription>Created by {room.createdBy} | {room.memberCount} members</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button>Join Room</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Your Private Groups</h2>
                         <Button variant="outline">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Group
                        </Button>
                    </div>
                     <div className="space-y-4">
                        {privateRooms.map(room => (
                            <Card key={room.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                                <CardHeader>
                                    <CardTitle>{room.topic}</CardTitle>
                                    <CardDescription>Created by {room.createdBy} | {room.memberCount} members</CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-2">
                                    <Button>Enter Group</Button>
                                    <Button variant="ghost">Leave</Button>
                                </CardContent>
                            </Card>
                        ))}
                         {privateRooms.length === 0 && (
                             <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                <CardContent className="p-10 text-center text-muted-foreground">
                                    <p>You haven't joined or created any private groups.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
