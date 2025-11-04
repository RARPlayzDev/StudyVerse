// Version 1.0 Final Push
import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'student' | 'admin';
  joinDate: string;
  lastActive: string;
  banned: boolean;
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
  // members array is removed
  inviteCode?: string;
};

export type CollabRoomMember = {
    id: string; // This will be the user's UID
    userId: string;
    joinedAt: Timestamp;
}

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: any;
};
