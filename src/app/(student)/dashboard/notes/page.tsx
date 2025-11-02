'use client';
import { useState } from 'react';
import PageTitle from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { placeholderNotes } from "@/lib/placeholder-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrainCircuit, Download, FileText, Search, Upload } from "lucide-react";
import NoteSummaryDialog from "@/components/notes/note-summary-dialog";
import { Note } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const NOTE_DUMMY_CONTENT = "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science. Classical physics, the description of physics that existed before the theory of relativity and quantum mechanics, describes nature at ordinary (macroscopic) scale. Most theories in classical physics can be derived from quantum mechanics as an approximation valid at large (macroscopic) scale.";

export default function NotesPage() {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isSummaryOpen, setSummaryOpen] = useState(false);

    const handleSummaryClick = (note: Note) => {
        setSelectedNote(note);
        setSummaryOpen(true);
    }
  
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
            <PageTitle title="Notes Hub" subtitle="Share, discover, and summarize study materials." className="mb-0" />
            <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Note
            </Button>
        </div>

        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search notes by title or subject..." className="pl-8 bg-background/50" />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Select>
                            <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                                <SelectValue placeholder="Filter by Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="calculus">Calculus</SelectItem>
                                <SelectItem value="history">History</SelectItem>
                                <SelectItem value="physics">Physics</SelectItem>
                                <SelectItem value="chemistry">Chemistry</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Most Recent</SelectItem>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="downloads">Downloads</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {placeholderNotes.map(note => (
            <Card key={note.id} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
              <CardContent className="p-4 flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-8 h-8 text-accent"/>
                  <div>
                    <h3 className="font-semibold leading-tight">{note.title}</h3>
                    <p className="text-sm text-muted-foreground">{note.subject}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={note.uploaderAvatar} data-ai-hint="woman portrait" />
                    <AvatarFallback>{note.uploader.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{note.uploader} &bull; {note.date}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {NOTE_DUMMY_CONTENT.substring(0,100)}...
                </p>
              </CardContent>
              <div className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleSummaryClick(note)}>
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    AI Summary
                </Button>
                <Button size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {selectedNote && (
            <NoteSummaryDialog 
                open={isSummaryOpen} 
                onOpenChange={setSummaryOpen}
                noteContent={NOTE_DUMMY_CONTENT}
            />
        )}
      </div>
    );
}
