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
  title: string;
  subject: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'done';
};

export type Note = {
  id: string;
  title: string;
  subject: string;
  uploader: string;
  uploaderAvatar: string;
  date: string;
  downloads: number;
  fileUrl: string;
  fileType: 'pdf' | 'md' | 'txt';
};

export type FocusSession = {
  id: string;
  userId: string;
  duration: number; // in minutes
  date: string;
  taskTag: string;
};

export type CollabRoom = {
  id: string;
  topic: string;
  createdBy: string;
  memberCount: number;
  messages: Message[];
};

export type Message = {
  id: string;
  sender: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
};
