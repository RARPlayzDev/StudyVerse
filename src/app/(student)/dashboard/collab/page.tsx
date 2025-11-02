'use client';
import { useState } from 'react';
import PageTitle from "@/components/common/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { placeholderRooms } from "@/lib/placeholder-data";
import { Button } from "@/components/ui/button";
import { Hash, PlusCircle, Users, Video } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function CollabPage() {
    // For demonstration, we'll split the placeholder rooms.
    const publicRooms = placeholderRooms.slice(0, 2);
    const yourRooms = [placeholderRooms[2]];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <PageTitle title="Collaboration Space" subtitle="Join study rooms and learn together." className="mb-0" />
                <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Room
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Public Study Rooms</CardTitle>
                            <CardDescription>Discover and join rooms created by other students.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {publicRooms.map(room => (
                                <Card key={room.id} className="bg-background/50 hover:bg-muted/50 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Hash className="w-4 h-4" />
                                            {room.topic}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>{room.memberCount} Members</span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="#">Join Room</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Your Study Rooms</CardTitle>
                            <CardDescription>Rooms you have created or joined.</CardDescription>
                        </CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {yourRooms.map(room => (
                                <Card key={room.id} className="bg-background/50 hover:bg-muted/50 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Hash className="w-4 h-4" />
                                            {room.topic}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex justify-between items-center">
                                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>{room.memberCount} Members</span>
                                        </div>
                                        <Button size="sm" asChild>
                                            <Link href="#">Enter Room</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                   <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Focus Music</CardTitle>
                            <CardDescription>Lofi beats to study to.</CardDescription>
                        </CardHeader>
                        <CardContent className="aspect-video">
                            <iframe 
                            className="w-full h-full rounded-md"
                            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&loop=1" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen>
                            </iframe>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col items-center justify-center text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                            Spotify Integration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Coming soon!</p>
                    </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col items-center justify-center text-center">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 justify-center">
                               <Video className="h-6 w-6 text-primary" />
                                Video Chat Rooms
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Coming soon!</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
