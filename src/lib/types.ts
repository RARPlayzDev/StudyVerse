import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'admin';
  joinDate: string;
  lastActive: string;
  banned: boolean;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  startDate: string; // Storing as ISO string e.g. .toISOString()
  dueDate: string; // Storing as ISO string e.g. .toISOString()
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'done' | 'overdue';
  doneAt?: Timestamp | null;
};

export type Note = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  uploader: string;
  date: Timestamp;
  downloads: number;
  fileUrl: string;
  fileType: 'pdf' | 'md' | 'txt';
};

export type FocusSession = {
  id: string;
  userId: string;
  duration: number; // in minutes
  date: Timestamp;
  taskTag: string;
};

export type CollabRoom = {
  id: string;
  topic: string;
  description: string;
  type: 'public' | 'private';
  createdBy: string;
  members: string[]; // array of user UIDs
  inviteCode?: string;
};

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: Date | Timestamp;
};
