import PageTitle from "@/components/common/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { placeholderNotes } from "@/lib/placeholder-data";
import { MoreHorizontal, Search, FileText } from "lucide-react";

export default function AdminContentPage() {
    return (
        <div>
            <PageTitle title="Content Management" subtitle="Oversee and moderate all user-uploaded notes." />

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>All Notes</CardTitle>
                    <CardDescription>Total of {placeholderNotes.length} notes found.</CardDescription>
                    <div className="flex flex-col md:flex-row gap-4 items-center pt-4">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search notes by title, subject, or uploader..." className="pl-8 bg-background/50" />
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
                                    <SelectValue placeholder="Filter by File Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="md">Markdown</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Note Title</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Uploader</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Downloads</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {placeholderNotes.map(note => (
                                <TableRow key={note.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{note.title}</span>
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        {note.subject}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-7 w-7">
                                                <AvatarImage src={note.uploaderAvatar} alt={note.uploader} data-ai-hint="person portrait"/>
                                                <AvatarFallback>{note.uploader.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{note.uploader}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{note.date}</TableCell>
                                    <TableCell>{note.downloads}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>View File</DropdownMenuItem>
                                                <DropdownMenuItem>View Uploader Profile</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete File</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
