import type { User, Task, Note, CollabRoom, FocusSession } from './types';

export const placeholderUsers: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatarUrl: 'https://picsum.photos/seed/user1/100/100', role: 'student', joinDate: '2023-09-01', lastActive: '2 hours ago', banned: false },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', avatarUrl: 'https://picsum.photos/seed/user2/100/100', role: 'student', joinDate: '2023-10-15', lastActive: '5 hours ago', banned: false },
  { id: '3', name: 'Admin User', email: 'admin@studyverse.com', avatarUrl: 'https://picsum.photos/seed/admin/100/100', role: 'admin', joinDate: '2023-01-01', lastActive: '10 minutes ago', banned: false },
  { id: '4', name: 'Ken Adams', email: 'ken@example.com', avatarUrl: 'https://picsum.photos/seed/user4/100/100', role: 'student', joinDate: '2023-11-20', lastActive: '1 day ago', banned: true },
];

export const placeholderTasks: Task[] = [
  { id: 't1', title: 'Complete Chapter 5 Reading', subject: 'History', dueDate: '2024-08-15', priority: 'high', status: 'inprogress' },
  { id: 't2', title: 'Solve Problem Set 3', subject: 'Calculus', dueDate: '2024-08-12', priority: 'high', status: 'todo' },
  { id: 't3', title: 'Prepare for Midterm', subject: 'Physics', dueDate: '2024-08-20', priority: 'medium', status: 'todo' },
  { id: 't4', title: 'Finish Lab Report', subject: 'Chemistry', dueDate: '2024-08-10', priority: 'low', status: 'done' },
  { id: 't5', title: 'Build React Component', subject: 'CS', dueDate: '2024-08-18', priority: 'high', status: 'inprogress' },
  { id: 't6', title: 'Write Essay Outline', subject: 'Literature', dueDate: '2024-08-14', priority: 'medium', status: 'done' },
];

export const placeholderNotes: Note[] = [
  { id: 'n1', title: 'Calculus Cheat Sheet', subject: 'Calculus', uploader: 'Maria Garcia', uploaderAvatar: 'https://picsum.photos/seed/user2/100/100', date: '2024-08-01', downloads: 152, fileUrl: '#', fileType: 'pdf' },
  { id: 'n2', title: 'WWII Key Events', subject: 'History', uploader: 'Alex Johnson', uploaderAvatar: 'https://picsum.photos/seed/user1/100/100', date: '2024-07-28', downloads: 89, fileUrl: '#', fileType: 'md' },
  { id: 'n3', title: 'Quantum Mechanics Intro', subject: 'Physics', uploader: 'Admin User', uploaderAvatar: 'https://picsum.photos/seed/admin/100/100', date: '2024-08-05', downloads: 210, fileUrl: '#', fileType: 'pdf' },
  { id: 'n4', title: 'Organic Chemistry Reactions', subject: 'Chemistry', uploader: 'Maria Garcia', uploaderAvatar: 'https://picsum.photos/seed/user2/100/100', date: '2024-07-30', downloads: 120, fileUrl: '#', fileType: 'pdf' },
];

export const placeholderRooms: CollabRoom[] = [
  {
    id: 'r1',
    topic: 'Finals Prep Group - CS101',
    createdBy: 'Alex Johnson',
    memberCount: 12,
    messages: [
      { id: 'm1', sender: 'Alex Johnson', senderAvatar: 'https://picsum.photos/seed/user1/100/100', text: 'Hey everyone, ready to grind for the finals?', timestamp: '10:30 AM' },
      { id: 'm2', sender: 'Maria Garcia', senderAvatar: 'https://picsum.photos/seed/user2/100/100', text: 'Born ready! Does anyone have notes for chapter 7?', timestamp: '10:31 AM' },
    ]
  },
  { id: 'r2', topic: 'History Buffs 🏛️', createdBy: 'Maria Garcia', memberCount: 8, messages: [] },
  { id: 'r3', topic: 'Physics Problems Help', createdBy: 'Ken Adams', memberCount: 23, messages: [] },
];

export const placeholderFocusSessions: FocusSession[] = [
    { id: 'fs1', userId: '1', duration: 50, date: '2024-08-01', taskTag: 'History' },
    { id: 'fs2', userId: '1', duration: 25, date: '2024-08-01', taskTag: 'Calculus' },
    { id: 'fs3', userId: '1', duration: 75, date: '2024-08-02', taskTag: 'Physics' },
    { id: 'fs4', userId: '1', duration: 50, date: '2024-08-03', taskTag: 'History' },
    { id: 'fs5', userId: '1', duration: 25, date: '2024-08-04', taskTag: 'CS' },
    { id: 'fs6', userId: '1', duration: 100, date: '2024-08-05', taskTag: 'Physics' },
    { id: 'fs7', userId: '1', duration: 50, date: '2024-08-06', taskTag: 'Calculus' },
    { id: 'fs8', userId: '1', duration: 25, date: '2024-08-07', taskTag: 'History' },
];

export const weeklyFocusData = [
  { date: "Mon", "This Week": 120, "Last Week": 90 },
  { date: "Tue", "This Week": 150, "Last Week": 110 },
  { date: "Wed", "This Week": 175, "Last Week": 160 },
  { date: "Thu", "This Week": 130, "Last Week": 140 },
  { date: "Fri", "This Week": 200, "Last Week": 150 },
  { date: "Sat", "This Week": 250, "Last Week": 180 },
  { date: "Sun", "This Week": 180, "Last Week": 220 },
];

export const taskCompletionData = [
    { date: 'Jul 29', completed: 5 },
    { date: 'Jul 30', completed: 7 },
    { date: 'Jul 31', completed: 6 },
    { date: 'Aug 01', completed: 9 },
    { date: 'Aug 02', completed: 8 },
    { date: 'Aug 03', completed: 10 },
    { date: 'Aug 04', completed: 7 },
]

export const adminUserStats = [
    { metric: "Total Users", value: "1,254", change: "+12%" },
    { metric: "Active Users (24h)", value: "302", change: "+5.2%" },
    { metric: "New Signups (7d)", value: "48", change: "-2.1%" },
];

export const adminContentStats = [
    { metric: "Total Notes", value: "4,821", change: "+50 this week" },
    { metric: "Total Downloads", value: "32,109", change: "+1.2k this week" },
    { metric: "Top Subject", value: "Computer Science", change: "" },
];

export const adminEngagementStats = [
    { metric: "Avg. Focus Time", value: "4.5h / week", change: "+0.5h" },
    { metric: "Tasks Completed", value: "12,934", change: "+890 this week" },
    { metric: "Active Rooms", value: "56", change: "+3" },
];
