'use client';
import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Timer,
  Users,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import PageTitle from "@/components/common/page-title"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit, where } from "firebase/firestore"
import type { Note as NoteType, CollabRoom } from "@/lib/types"

export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const notesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'notes'), orderBy('date', 'desc'), limit(3));
  }, [firestore, user]);

  const roomsQuery = useMemoFirebase(() => {
    if (!user) return null;
    // This query is incorrect for subcollections and will be fixed later.
    // For now, it will return no rooms.
    return query(collection(firestore, 'collabRooms'), where('members', 'array-contains', user.uid));
  }, [firestore, user]);

  const { data: recentNotes, isLoading: notesLoading } = useCollection<NoteType>(notesQuery);
  const { data: activeRooms, isLoading: roomsLoading } = useCollection<CollabRoom>(roomsQuery);

  return (
    <>
      <PageTitle title="Dashboard" subtitle="Here's a snapshot of your studyverse." />
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Focus Time Today
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h 0m</div>
            <p className="text-xs text-muted-foreground">
              Let's get a session in!
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Notes
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{recentNotes?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              in the last 7 days
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Collabs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRooms?.length ?? 0}</div>
             <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/collab" className="hover:underline">Join a study room</Link>
            </p>
          </CardContent>
        </Card>
         <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Planner
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">New!</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/planner" className="hover:underline">Start organizing your tasks</Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        <Card className="xl:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
           <CardHeader>
            <CardTitle>Welcome to StudyVerse</CardTitle>
            <CardDescription>
              Your all-in-one productivity hub. Use the navigation on the left to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-center py-10 text-muted-foreground">
                <p>Explore features like Focus Mode, the Notes Hub, and the AI Mentor!</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
            <CardDescription>
              Catch up on the latest shared knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {notesLoading ? (
                <p className="text-muted-foreground text-sm">Loading notes...</p>
            ) : (recentNotes && recentNotes.length > 0) ? (
                recentNotes.map((note) => (
                <div key={note.id} className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={'https://picsum.photos/seed/note-avatar/100/100'} alt="Avatar" data-ai-hint="person portrait" />
                        <AvatarFallback>{note.uploader.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{note.title}</p>
                    <p className="text-sm text-muted-foreground">
                        by {note.uploader} in {note.subject}
                    </p>
                    </div>
                    <div className="ml-auto font-medium text-sm">{note.date ? new Date(note.date.seconds * 1000).toLocaleDateString() : ''}</div>
                </div>
                ))
            ) : (
                 <div className="text-center py-10 text-muted-foreground">
                  <p>No recent notes found.</p>
                </div>
            )}
             <Button asChild size="sm" className="mt-2 gap-1 w-full">
              <Link href="/dashboard/notes">
                Explore Notes Hub
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
